import argparse
import json
# TODO - Implement logging1
import logging
import os
import sys
import tempfile

import gdal
import numpy as np
import cartopy.crs as ccrs
import osr

from datetime import datetime
from glob import glob
from netCDF4 import Dataset
from shutil import rmtree
from time import sleep

LEVELS = '0-9'

def nc_to_tiff(nc_file, out_dir):

    nc = Dataset(nc_file)

    # Get the netcdf attributes
    attrs = {}
    for key in nc.ncattrs():
        attrs.update({key: nc.getncattr(key)})

    # Turn the data in geoTiffs
    x = nc.variables['x'][:]
    y = nc.variables['y'][:]

    data_tmp = nc.variables['Sectorized_CMI'][:]
    data = np.zeros((data_tmp.shape[0], data_tmp.shape[1]), dtype=np.float32)
    data[:, :] = data_tmp[:]

    proj = nc.variables['lambert_projection']

    map_proj = ccrs.LambertConformal(central_longitude=proj.longitude_of_central_meridian,
                                     central_latitude=proj.latitude_of_projection_origin,
                                     false_easting=proj.false_easting, false_northing=proj.false_northing,
                                     secant_latitudes=None, standard_parallels=[proj.standard_parallel])

    # Get some stuff for the geotiff
    nx = data.shape[0]
    ny = data.shape[1]
    xres = attrs['pixel_x_size'] * 1e3
    yres = attrs['pixel_y_size'] * 1e3

    # If all the tiles weren't written to nc, then the arrays will be masked
    # Need to make sure we have the minx and max y; if the arrays are masked, that's not guarenteed
    # So we need to calculate min x and max y from the data we have and the resolution
    try:
        for i in range(0, np.size(x)):
            if ~x.mask[i]:
                value = x[i]
                xmin = value - i*xres
                break

        for i in range(0, np.size(y)):
            if ~y.mask[i]:
                value = x[i]
                ymax = value + i*yres
                break
    except AttributeError:  # This means the data is all there!
        xmin, ymin, xmax, ymax = [np.min(x), np.min(y), np.max(x), np.max(y)]

    geotransform = (xmin, xres, 0, ymax, 0, -yres)

    # Get the filename figured out
    fname = nc_file.split('/')[-1].replace('.nc4', '.tiff')
    fname = os.path.join(out_dir, fname)

    # create the  raster file
    dst_ds = gdal.GetDriverByName('GTiff').Create(fname, ny, nx, 1, gdal.GDT_Byte)
    dst_ds.SetGeoTransform(geotransform)  # specify coords
    srs = osr.SpatialReference()  # establish encoding
    srs.ImportFromProj4(map_proj.proj4_init)
    dst_ds.SetProjection(srs.ExportToWkt())  # export coords to file
    dst_ds.GetRasterBand(1).WriteArray(data * 255)  # write r-band to the raster
    # dst_ds.GetRasterBand(2).WriteArray(g_pixels)   # write g-band to the raster
    # dst_ds.GetRasterBand(3).WriteArray(b_pixels)   # write b-band to the raster
    dst_ds.FlushCache()  # write to disk

    del dst_ds
    nc.close()

    return fname


def make_json(name, root_dir, date, scour_hours):
    # Get the directory names, should be of format %Y%m%d_%H%M
    dirs = os.listdir(root_dir)

    # Go through each directory and see if it's still needed
    avail_dates = []
    for dir in dirs:
        print(dir)
        if '.json' in dir:
            print('made it here')
            continue
        dt = datetime.strptime(dir, '%Y%m%d_%H%M')

        # If this directory's valid time out of the keeper range, delete it
        if (datetime.now()-dt).total_seconds() > scour_hours*3600:
            rmtree(os.path.join(root_dir, dir))
        elif dt > date:
            # Must be another process kicked off after this one, so don't add it
            pass
        else:  # If not add it to the json
            avail_dates.append(dt.strftime('%Y%m%d.%H%M00'))

    # Write out the json
    j = {'times': avail_dates}
    with open(os.path.join(root_dir, name), 'w') as f:
        f.write('func({text})'.format(text=json.dumps(j)))


def get_nc_info(in_file):
    nc = Dataset(in_file)

    # Get the netcdf attributes
    attrs = {}
    for key in nc.ncattrs():
        attrs.update({key: nc.getncattr(key)})

    nc.close()
    return attrs


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('-i', action='store', dest='in_dir', help='Directory to look for new files in')
    parser.add_argument('-o', action='store', dest='out_dir', help='Output directory')
    parser.add_argument('-s', action='store', dest='scour', type=int, help='Number of hours to keep')
    args = parser.parse_args()

    files = glob(os.path.join(args.in_dir, '*.nc4'))

    files.sort()
    print(files)
    in_file = files[-1]

    while 'partial' in in_file:
        sleep(20)

    # Get the directory containing the necessary gdal scripts
    bin_dir = '{exec_prefix}/bin/'.format(exec_prefix=sys.exec_prefix)

    # Get info from the netcdf so we can check if it's already processed
    info = get_nc_info(in_file)

    band = str(info['channel_id']).zfill(2)
    date = datetime.strptime(info['start_date_time'], '%Y%j%H%M%S')
    domain = info['source_scene']

    # Make output directory if it doesn't exist
    out_dir = os.path.join(args.out_dir, 'GOES16_{band}/{domain}/{time}/ '.format(band=band,
                                                                                  time=date.strftime('%Y%m%d_%H%M'),
                                                                                  domain=domain))
    if os.path.exists(out_dir):
        sys.exit()  # File already processed
    else:
        os.makedirs(out_dir)

    # Make a temporary directory to store the tiff
    tmp_dir = tempfile.TemporaryDirectory()

    try:


        # Create the tiff
        tiff = nc_to_tiff(in_file, tmp_dir.name)

        # TODO - Use subprocess, not os.system
        cmd = '{bin}/gdal2tiles.py -z {levels} --srcnodata=255,255,255 {tiff} {out_dir}'
        cmd = cmd.format(bin=bin_dir, levels=LEVELS, tiff=tiff, out_dir=out_dir)
        os.system(cmd)


        # Scour directory and create a json file from what's left
        directory = os.path.join(args.out_dir, 'GOES16_{band}/{domain}/'.format(band=band,
                                                                                domain=domain))
        json_fn = 'GOES16_{band}_{domain}.json'.format(band=band, domain=domain)
        make_json(json_fn, directory, date, args.scour)
    except Exception as e:
        # Get rid of the temp stuff
        tmp_dir.cleanup()

        # Want to get rid of the output directory so it is able to try again
        rmtree(out_dir)

    # Clean up the temporary stuff
    tmp_dir.cleanup()
