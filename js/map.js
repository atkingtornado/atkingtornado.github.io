$(document).ready(function(){


    $('#conus-goes').hide()
    $('#goes-16').hide()
    $('#radar').hide()


    L.Control.WMSLegend = L.Control.extend({
    options: {
        position: 'topleft',
        uri: ''
    },

    onAdd: function () {
        var controlClassName = 'leaflet-control-wms-legend',
            legendClassName = 'wms-legend',
            stop = L.DomEvent.stopPropagation;
        this.container = L.DomUtil.create('div', controlClassName);
        this.img = L.DomUtil.create('img', legendClassName, this.container);
        this.img.src = this.options.uri;
        this.img.alt = 'Legend';

        L.DomEvent
            .on(this.img, 'click', this._click, this)
            .on(this.container, 'click', this._click, this)
            .on(this.img, 'mousedown', stop)
            .on(this.img, 'dblclick', stop)
            .on(this.img, 'click', L.DomEvent.preventDefault)
            .on(this.img, 'click', stop);
        this.height = null;
        this.width = null;
        return this.container;
    },
    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        // toggle legend visibility
        var style = window.getComputedStyle(this.img);
        if (style.display === 'none') {
            this.container.style.height = this.height + 'px';
            this.container.style.width = this.width + 'px';
            this.img.style.display = this.displayStyle;
        }
        else {
            if (this.width === null && this.height === null) {
                // Only do inside the above check to prevent the container
                // growing on successive uses
                this.height = this.container.offsetHeight;
                this.width = this.container.offsetWidth;
            }
            this.displayStyle = this.img.style.display;
            this.img.style.display = 'none';
            this.container.style.height = '20px';
            this.container.style.width = '20px';
        }
    },
});

L.wmsLegend = function (uri) {
    var wmsLegendControl = new L.Control.WMSLegend;
    wmsLegendControl.options.uri = uri;
    map.addControl(wmsLegendControl);
    return wmsLegendControl;
};


    $('.menu-link').bigSlide({
        side: 'right',
    });

    var basemap = L.tileLayer.provider('CartoDB.Positron')
    var basemap_lines = L.tileLayer.provider('Stamen.TonerLines')
    basemap_lines.setZIndex(999);
    basemap_lines.setOpacity(0.3);

    var test = L.tileLayer('test_dir/{z}/{x}/{-y}.png');
    
    var map = L.map('mapid', {
        zoomControl: false,
        center: [40.31304, -98.78906],
        zoom: 5,
        layers: [basemap,basemap_lines],
        attributionControl: false,
    });

    var conus_vis = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-vis-1km-900913/{z}/{x}/{y}.png');
    var conus_ir = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-ir-4km-900913/{z}/{x}/{y}.png');
    var nexrad = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png');
    var temp2m = L.tileLayer.wms('https://nowcoast.noaa.gov/arcgis/services/nowcoast/analysis_meteohydro_sfc_rtma_time/MapServer/WMSServer?', {
        layers: '17',
        format: 'image/png',
        transparent: true,
        version: '1.3.0',
    });
    var dwpt2m = L.tileLayer.wms('https://nowcoast.noaa.gov/arcgis/services/nowcoast/analysis_meteohydro_sfc_rtma_time/MapServer/WMSServer?', {
        layers: '13',
        format: 'image/png',
        transparent: true,
        version: '1.3.0',
    });

    var goes16_band1 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND01/{z}/{x}/{y}.png');
    var goes16_band2 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND02/{z}/{x}/{y}.png');
    var goes16_band3 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND03/{z}/{x}/{y}.png');
    var goes16_band4 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND04/{z}/{x}/{y}.png');
    var goes16_band5 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND05/{z}/{x}/{y}.png');
    var goes16_band6 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND06/{z}/{x}/{y}.png');
    var goes16_band7 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND07/{z}/{x}/{y}.png');
    var goes16_band8 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND08/{z}/{x}/{y}.png');
    var goes16_band9 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND09/{z}/{x}/{y}.png');
    var goes16_band10 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND10/{z}/{x}/{y}.png');
    var goes16_band11 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND11/{z}/{x}/{y}.png');
    var goes16_band12 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND12/{z}/{x}/{y}.png');
    var goes16_band13 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND13/{z}/{x}/{y}.png');
    var goes16_band14 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND14/{z}/{x}/{y}.png');
    var goes16_band15 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND15/{z}/{x}/{y}.png');
    var goes16_band16 = L.tileLayer('http://wms.ssec.wisc.edu/products/G16-ABI-FD-BAND16/{z}/{x}/{y}.png');


    // uri = 'http://nowcoast.noaa.gov/arcgis/services/nowcoast/analysis_meteohydro_sfc_rtma_time/MapServer/WmsServer?REQUEST=GetLegendGraphic%26VERSION=1.3.0%26FORMAT=image/png%26LAYER=17%26TRANSPARENT=true%26LEGEND_OPTIONS=layout:3qa'
    // L.wmsLegend(uri);

    var all_layers = [basemap, conus_vis, conus_ir, goes16_band1, goes16_band2,goes16_band3, goes16_band4, goes16_band5, goes16_band6, goes16_band7, goes16_band8, goes16_band9, goes16_band10, goes16_band11, goes16_band12, goes16_band13, goes16_band14, goes16_band15, goes16_band16, nexrad]

    var prev_ndx = false
    var prev_div = false

    $('.single_toggle').on('change', 'input.cmn-toggle', function() {

        console.log('test')

        $('.single_toggle input.cmn-toggle').not(this).prop('checked', false);         
        var ndx = $(this).val()

        var opacityscrubber = new ScrubberView();
        opacityscrubber.min(0).max(100).step(1).value(60)

        all_layers[ndx].setOpacity(0.6);

        if(prev_ndx==ndx || !prev_ndx){
            if(this.checked) {
                map.addLayer(all_layers[ndx])
                $('<div id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
                $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
                $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
            }else{
                map.removeLayer(all_layers[ndx])
                $('#opacity_' + $(this).parent()[0].id).remove()
            }
        }else{
            map.addLayer(all_layers[ndx])
            $('<div id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
            $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
            $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
            
            $('#opacity_' + prev_div).remove()
            map.removeLayer(all_layers[prev_ndx])
        }

        prev_ndx = ndx
        prev_div = $(this).parent()[0].id     

        opacityscrubber.onValueChanged = function (value) {
            $('#opacity_display_' + prev_div).html(value+'%');
            all_layers[ndx].setOpacity(value/100.0)
        }

    });
    
    $('#multi_toggle').on('change', 'input.cmn-toggle', function() {  

        var opacityscrubber = new ScrubberView();
        opacityscrubber.min(0).max(100).step(1).value(60)

        var ndx = $(this).val()  
        if(this.checked) {
            map.addLayer(all_layers[ndx])
            $('<div id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
            $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
            $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
        }else{
            map.removeLayer(all_layers[ndx])
            $('#opacity_' + $(this).parent()[0].id).remove()
        }

        var div = $(this).parent()[0].id 

        opacityscrubber.onValueChanged = function (value) {
            $('#opacity_display_' + div).html(value+'%');
            all_layers[ndx].setOpacity(value/100.0)
        }


    });

    L.control.locate().addTo(map);

    for (i=0; i<all_layers.length; i++) {

        all_layers[i].on('loading', function(){
            $('#spinner').show()
        })
        all_layers[i].on('load', function(){
            setTimeout(
              function() 
              {
                 $('#spinner').hide()
              }, 500);
        })

    }

    
    
    var scrubber = new ScrubberView();
    scrubber.min(0).max(10).step(1).value(0)
    $('#scrubber_container').append(scrubber.elt);

    $("#layers-link").on('touchstart',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#layers-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
    });

    $("#layers-close").on('touchstart',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#layers-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
    });

    $("#layers-link").on('click',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#layers-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      
    });

    $("#layers-close").on('click',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#layers-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');

    });

    $('.layer-dropdown').click(function(){
        $(this).children('.layer-dropdown-arrow').toggleClass('rotated');
    });


    $('#conus-goes-dropdown').click(function(){
        console.log('test')
        $('#conus-goes').slideToggle('fast')
    })
    $('#goes-16-dropdown').click(function(){
        console.log('test')
        $('#goes-16').slideToggle('fast')
    })
    $('#radar-dropdown').click(function(){
        console.log('test')
        $('#radar').slideToggle('fast')
    })
});