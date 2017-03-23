$(document).ready(function(){


	$('#time_container').hide()
    $('#conus-goes').hide()
    $('#goes-16').hide()
    $('#radar').hide()


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

    var goes16_band1 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND01/{z}/{x}/{y}.png');
    var goes16_band2 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND02/{z}/{x}/{y}.png');
    var goes16_band3 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND03/{z}/{x}/{y}.png');
    var goes16_band4 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND04/{z}/{x}/{y}.png');
    var goes16_band5 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND05/{z}/{x}/{y}.png');
    var goes16_band6 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND06/{z}/{x}/{y}.png');
    var goes16_band7 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND07/{z}/{x}/{y}.png');
    var goes16_band8 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND08/{z}/{x}/{y}.png');
    var goes16_band9 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND09/{z}/{x}/{y}.png');
    var goes16_band10 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND10/{z}/{x}/{y}.png');
    var goes16_band11 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND11/{z}/{x}/{y}.png');
    var goes16_band12 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND12/{z}/{x}/{y}.png');
    var goes16_band13 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND13/{z}/{x}/{y}.png');
    var goes16_band14 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND14/{z}/{x}/{y}.png');
    var goes16_band15 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND15/{z}/{x}/{y}.png');
    var goes16_band16 = L.tileLayer('https://realearth.ssec.wisc.edu/products/G16-ABI-FD-BAND16/{z}/{x}/{y}.png');


    // uri = 'http://nowcoast.noaa.gov/arcgis/services/nowcoast/analysis_meteohydro_sfc_rtma_time/MapServer/WmsServer?REQUEST=GetLegendGraphic%26VERSION=1.3.0%26FORMAT=image/png%26LAYER=17%26TRANSPARENT=true%26LEGEND_OPTIONS=layout:3qa'
    // L.wmsLegend(uri);

    var all_layers = [basemap, conus_vis, conus_ir, goes16_band1, goes16_band2,goes16_band3, goes16_band4, goes16_band5, goes16_band6, goes16_band7, goes16_band8, goes16_band9, goes16_band10, goes16_band11, goes16_band12, goes16_band13, goes16_band14, goes16_band15, goes16_band16, nexrad,test]
    var active_layer = false
    var active_times = false
    var prev_ndx = false
    var prev_div = false
    var menuIsOpen = false

    $('.single_toggle').on('change', 'input.cmn-toggle', function() {

        $('.single_toggle input.cmn-toggle').not(this).prop('checked', false);         
        var ndx = $(this).val()

        var opacityscrubber = new ScrubberView();
        opacityscrubber.min(0).max(100).step(1).value(60)

        all_layers[ndx].setOpacity(0.7);

        if(prev_ndx==ndx || !prev_ndx){
            if(this.checked) {
                map.addLayer(all_layers[ndx])

                prev_layers.push(all_layers[ndx]);
 
                active_layer = $(this).parent()[0].id
                $.getJSON("https://realearth.ssec.wisc.edu/api/products?products=" + active_layer, function( data ) {
                    active_times = data[0].times.slice(data[0].times.length-10, data[0].times.length)

                    times_length = active_times.length

                    time_slider.options.steps = times_length;
                    time_slider.stepRatios = time_slider.calculateStepRatios();
                    prev_scrub_tick = false
                    time_slider.setStep(times_length, 0, snap=false)

                });

                $('<div id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
                $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
                $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
                $('#time_container').show()
            }else{
                map.removeLayer(all_layers[ndx])
                active_layer = false
                active_times = false

                time_slider.options.steps = 1;
                time_slider.stepRatios = time_slider.calculateStepRatios();
                prev_scrub_tick = false
                time_slider.setStep(0, 0, snap=false)

                $('#time_container').hide()

                $('#opacity_' + $(this).parent()[0].id).remove()
            }
        }else{
            map.addLayer(all_layers[ndx])
            prev_layers.push(all_layers[ndx]);


            active_layer = $(this).parent()[0].id
            $.getJSON("https://realearth.ssec.wisc.edu/api/products?products=" + active_layer, function( data ) {
                active_times = data[0].times.slice(data[0].times.length-10, data[0].times.length)
                times_length = active_times.length

                time_slider.options.steps = times_length;
                time_slider.stepRatios = time_slider.calculateStepRatios();
                prev_scrub_tick = false
                time_slider.setStep(times_length, 0, snap=false)
            });

            $('<div id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
            $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
            $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
            
            $('#opacity_' + prev_div).remove()
            $('#time_container').show()
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

    prev_layers = []
    prev_scrub_tick = false

    
    var time_slider = new Dragdealer('scrubber_container',{
        snap: true,
        animationCallback: function(x, y) {

            value = Math.round(this.getStep()[0] - 1)
            times_length = active_times.length
            if (times_length > 1 && prev_scrub_tick != value){
                console.log('dragging')

                prev_scrub_tick = value

                curr_time = active_times[value]
                date_time = curr_time.split('.')

                date = date_time[0]
                time = date_time[1]

                $('#time').text(curr_time);



                if (prev_scrub_tick != false && menuIsOpen != true){
                    var curr_time_product = active_layer + '_' + date + '_' + time
                    var curr_time_layer = L.tileLayer('http://wms.ssec.wisc.edu/products/'+curr_time_product+'/{z}/{x}/{y}.png');

                    curr_time_layer.on('loading', function(){
			            $('#spinner').show()
			        })
			        curr_time_layer.on('load', function(){
			            setTimeout(
			              function() 
			              {
			                 $('#spinner').hide()
			              }, 500);
			        })

                    map.addLayer(curr_time_layer)



                    prev_layers.push(curr_time_layer);
                    if (prev_layers.length > 5){
                        map.removeLayer(prev_layers[0])
                        prev_layers.shift()
                    }
                }

            }
        },
        dragStopCallback: function(x, y){
            console.log('dragstop')
            if (prev_layers.length > 0) {
                while(prev_layers.length > 1){
                    map.removeLayer(prev_layers[0])
                    prev_layers.shift()
                    console.log('in loop')
                }
                var layer_opacity  = parseFloat($( "#opacity_" +  active_layer).text().replace('%',''))/100.0 
                prev_layers[0].setOpacity(layer_opacity) 

                var ndx = $('#' + active_layer + ' :input').val()
                all_layers[ndx] = prev_layers[0]

                all_layers[ndx].on('loading', function(){
            		$('#spinner').show()
		        })
		        all_layers[ndx].on('load', function(){
		            setTimeout(
		              function() 
		              {
		                 $('#spinner').hide()
		              }, 500);
		        })

            }
        }
    });





    $("#layers-link").on('touchstart',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active');
      $('#layers-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      menuIsOpen=true
    });

    $("#layers-close").on('touchstart',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active');
      $('#layers-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      menuIsOpen=false
    });

    $("#layers-link").on('click',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active');
      $('#layers-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      menuIsOpen=true
    });

    $("#layers-close").on('click',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active');
      $('#layers-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      menuIsOpen=false
    });

    $('.layer-dropdown').click(function(){
        $(this).children('.layer-dropdown-arrow').toggleClass('rotated');
    });


    $('#conus-goes-dropdown').click(function(){
        $('#conus-goes').slideToggle('fast')
    })
    $('#goes-16-dropdown').click(function(){
        $('#goes-16').slideToggle('fast')
    })
    $('#radar-dropdown').click(function(){
        $('#radar').slideToggle('fast')
    })
});