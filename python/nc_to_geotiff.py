import argparse
# TODO - Implement logging
import logging
import os
import sys

import gdal
import numpy as np
import cartopy.crs as ccrs
import osr

from datetime import datetime
from glob import glob
from netCDF4 import Dataset

LEVELS = '4-8'


def nc_to_tiff(nc_file, out_dir):
    nc = Dataset(nc_file)

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

    nx = data.shape[0]
    ny = data.shape[1]
    xmin, ymin, xmax, ymax = [min(x), min(y), max(x), max(y)]

    xres = (xmax - xmin) / float(nx)
    yres = (ymax - ymin) / float(ny)
    geotransform = (xmin, xres, 0, ymax, 0, -yres)

    # Get the filename figured out
    fname = nc_file.split('/')[-1].replace('.nc', '.tiff')
    fname = os.path.join(out_dir, fname)

    # create the 3-band raster file
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

    return fname

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('-i', action='store', dest='in_dir', help='Data Directory ')
    parser.add_argument('-o', action='store', dest='out_dir', help='Output directory')
    parser.add_argument('-b', action='store', dest='band', type=int, help='Band to process')
    parser.add_argument('--reprocess', action='store_true', default=False,)
    parser.add_argument('-f', action='store', dest='files', type=str, nargs='*', help='Files to reprocess')
    args = parser.parse_args()

    # Get the directory containing the necessary gdal scripts
    bin_dir = '{exec_prefix}/bin/'.format(exec_prefix=sys.exec_prefix)

    if args.reprocess:
        out_dir = args.out_dir  # Use the dir straight from the command line
        if not os.path.exists(out_dir):
            os.makedirs(out_dir)

        tiffs = []
        for f in args.files:
            tif = nc_to_tiff(f, out_dir)
            tiffs.append(tif)
    else:
        # TODO - Implement live stuff
        print('Can only reprocess right now. Exiting')
        sys.exit()



    # TODO - Use subprocess, not os.system
    cmd = '{bin}/gdal_merge.py -o {out_tiff} {tiffs}'
    cmd = cmd.format(bin=bin_dir, out_tiff=os.path.join(out_dir, 'tmp.tiff'), tiffs=' '.join(tiffs))
    os.system(cmd)

    cmd = '{bin}/gdal2tiles.py -z {levels} --srcnodata=255,255,255 {tiff} {out_dir}'
    cmd = cmd.format(bin=bin_dir, levels=LEVELS, tiff=os.path.join(out_dir, 'tmp.tiff'), out_dir=out_dir)
    os.system(cmd)
    '''

    files = glob("/Users/tbupper90/Data/goes16/*.nc")
    tiffs = []
    for f in files:
        tif = nc_to_tiff(f)

        tiffs.append(tif)

    os.system('/Users/tbupper90/anaconda/envs/satwx/bin/gdal_merge.py -o test.tif {}'.format(' '.join(tiffs)))
    '''