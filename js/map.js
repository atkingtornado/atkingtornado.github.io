$(document).ready(function(){


	$('#time_container').hide()
    $('.layer-dropdown-content').hide()


    $('.menu-link').bigSlide({
        side: 'right',
    });

    $('#UTC_toggle').on('change', function() {
    	if (active_times){
    		curr_time = active_times[value]
            date_time = curr_time.split('.')

            date = date_time[0]
            time = date_time[1]

            year = date.substring( 0, 4 )
            month = date.substring( 4, 6 )
            day = date.substring( 6, 8 )
            hh = time.substring( 0, 2 )
            mm = time.substring( 2, 4 )
            ss = time.substring( 4, 6 )

            date_time_string = year+'-'+month+'-'+day+' '+hh+':'+mm+':'+ss+ ' UTC'


            if (!$('#UTC_toggle').prop('checked')){
            	$('#time').text(date_time_string);
            }
            else{
            	var userdate = new Date(date_time_string);
				console.log(userdate.toString())
				timezone = userdate.toString().match(/\(([A-Za-z\s].*)\)/)[1]
				year =  userdate.getFullYear()
                month = ('0' + (parseInt(userdate.getMonth())+1).toString()).slice(-2)
                day = userdate.getDate()
				hh = ('0' + userdate.getHours()).slice(-2)
				mm = ('0' + userdate.getMinutes()).slice(-2)
				ss = ('0' + userdate.getSeconds()).slice(-2)

				date_time_string = year+'-'+month+'-'+day+' '+hh+':'+mm+':'+ss+ ' ' + timezone
				$('#time').text(date_time_string);
            }
    	}
    })

    $('input[type=checkbox]').removeAttr('checked');


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

    var all_layers = [basemap]
    var all_overlays = []
    var active_layer = false
    var active_times = false
    var prev_layerid = false
    var prev_div = false
    var prev_ndx = false
    var menuIsOpen = false

    $('.single_toggle').on('change', 'input.cmn-toggle', function() {

        $('.single_toggle input.cmn-toggle').not(this).prop('checked', false);         
        var layerid = $(this).parent()[0].id

        var opacityscrubber = new ScrubberView();
        opacityscrubber.min(0).max(100).step(1).value(75)


        if(prev_layerid==layerid || !prev_layerid){
            if(this.checked) {
            	curr_layer = L.tileLayer('http://wms.ssec.wisc.edu/products/'+layerid+'/{z}/{x}/{y}.png');
                map.addLayer(curr_layer)
                curr_layer.setOpacity(0.75);

                prev_layers.push(curr_layer);

                all_layers.push(curr_layer);
                prev_ndx = all_layers.length-1
 
                active_layer = layerid
                $.getJSON("https://realearth.ssec.wisc.edu/api/products?products=" + layerid, function( data ) {
                    active_times = data[0].times.slice(data[0].times.length-10, data[0].times.length)

                    times_length = active_times.length

                    time_slider.options.steps = times_length;
                    time_slider.stepRatios = time_slider.calculateStepRatios();
                    prev_scrub_tick = false
                    time_slider.setStep(times_length, 0, snap=false)

                });

                $('<div class="opacity-div" id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
                $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
                $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
                $('#time_container').show()
            }else{
                map.removeLayer(all_layers[prev_ndx])
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
        	curr_layer = L.tileLayer('http://wms.ssec.wisc.edu/products/'+layerid+'/{z}/{x}/{y}.png');
            map.addLayer(curr_layer)
            curr_layer.setOpacity(0.75);
            map.removeLayer(all_layers[prev_ndx])

            prev_layers.push(curr_layer);
            all_layers.push(curr_layer);
            prev_ndx = all_layers.length-1


            active_layer = layerid
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
        }

        prev_layerid = layerid
        prev_div = $(this).parent()[0].id     

        opacityscrubber.onValueChanged = function (value) {
            $('#opacity_display_' + prev_div).html(value+'%');
            all_layers[prev_ndx].setOpacity(value/100.0)
        }

    });
    
    $('.multi_toggle').on('change', 'input.cmn-toggle', function() {  
    	var layerid = $(this).parent()[0].id

        var opacityscrubber = new ScrubberView();
        opacityscrubber.min(0).max(100).step(1).value(60)

        var ndx = $(this).val()  
        if(this.checked) {
            curr_layer = L.tileLayer('http://wms.ssec.wisc.edu/products/'+layerid+'/{z}/{x}/{y}.png');
            map.addLayer(curr_layer)
          	curr_layer.setOpacity(0.75)
            all_overlays.push(curr_layer)

            $('<div id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
            $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
            $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
        }else{
        	for(i=0;i<all_overlays.length;i++){
        		if(all_overlays[i]._url == 'http://wms.ssec.wisc.edu/products/'+layerid+'/{z}/{x}/{y}.png')
        		map.removeLayer(all_overlays[i])
        	}
            
            $('#opacity_' + $(this).parent()[0].id).remove()
        }

        var div = $(this).parent()[0].id 

        opacityscrubber.onValueChanged = function (value) {
            $('#opacity_display_' + div).html(value+'%');
            for(i=0;i<all_overlays.length;i++){
        		if(all_overlays[i]._url == 'http://wms.ssec.wisc.edu/products/'+layerid +'/{z}/{x}/{y}.png'){
        			all_overlays[i].setOpacity(value/100.0)
        		}
        	}
            
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

                year = date.substring( 0, 4 )
                month = date.substring( 4, 6 )
                day = date.substring( 6, 8 )
                hh = time.substring( 0, 2 )
                mm = time.substring( 2, 4 )
                ss = time.substring( 4, 6 )

                date_time_string = year+'-'+month+'-'+day+' '+hh+':'+mm+':'+ss+ ' UTC'


                if (!$('#UTC_toggle').prop('checked')){
                	$('#time').text(date_time_string);
                }
                else{
                	var userdate = new Date(date_time_string);
					console.log(userdate.toString())
					timezone = userdate.toString().match(/\(([A-Za-z\s].*)\)/)[1]
					year =  userdate.getFullYear()
	                month = ('0' + (parseInt(userdate.getMonth())+1).toString()).slice(-2)
	                day = userdate.getDate()
					hh = ('0' + userdate.getHours()).slice(-2)
					mm = ('0' + userdate.getMinutes()).slice(-2)
					ss = ('0' + userdate.getSeconds()).slice(-2)

					date_time_string = year+'-'+month+'-'+day+' '+hh+':'+mm+':'+ss+ ' ' + timezone
					$('#time').text(date_time_string);
                }




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

                var ndx = prev_ndx
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
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');

      $('#options-content').hide()
      $('#layers-content').show()

      menuIsOpen=true
    });

    $("#options-link").on('touchstart',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');

      $('#options-content').show()
      $('#layers-content').hide()

      menuIsOpen=true
    });

    $("#layers-close").on('touchstart',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      menuIsOpen=false
    });

    $("#options-close").on('touchstart',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      menuIsOpen=false
    });

    $("#layers-link").on('click',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');

      $('#options-content').hide()
      $('#layers-content').show()


      menuIsOpen=true
    });

    $("#options-link").on('click',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');

      $('#options-content').show()
      $('#layers-content').hide()

      menuIsOpen=true
    });

    $("#layers-close").on('click',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      menuIsOpen=false
    });

    $("#options-close").on('click',function() {
      $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      menuIsOpen=false
    });



    $('.dropdown-header').click(function(){
        $(this).children('.layer-dropdown-arrow').toggleClass('rotated');
    });

    $('.dropdown-header').click(function(){

        $(this).next().slideToggle('fast')
    })

});