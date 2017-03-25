import argparse
# TODO - Implement logging
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

    return fname, attrs

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('-i', action='store', dest='in_file', help='Input File')
    parser.add_argument('-o', action='store', dest='out_dir', help='Output directory')
    args = parser.parse_args()

    if 'partial' in args.in_file:
        print("Only a partial file, don't process this")
        sys.exit()
        
    # Get the directory containing the necessary gdal scripts
    bin_dir = '{exec_prefix}/bin/'.format(exec_prefix=sys.exec_prefix)

    # Make a temporary directory to store the tiff
    tmp_dir = tempfile.TemporaryDirectory()

    # Create the tiff
    tiff, info = nc_to_tiff(args.in_file, tmp_dir)

    # Make output directory if it doesn't exist
    band = str(info['channel_id']).zfill(2)
    date = datetime.strptime(info['start_date_time'], '%Y%j%H%M%S')

    out_dir = os.path.join(args.out_dir, 'GOES16_{band}/{time}'.format(band=band, time=date.strftime('%Y%m%d_%H%M')))
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    # TODO - Use subprocess, not os.system
    cmd = '{bin}/gdal2tiles.py -z {levels} --srcnodata=255,255,255 {tiff} {out_dir}'
    cmd = cmd.format(bin=bin_dir, levels=LEVELS, tiff=tiff, out_dir=out_dir)
    os.system(cmd)

    # Get rid of the temp stuff
    tmp_dir.cleanup()
