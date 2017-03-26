$(document).ready(function(){

	//Function to add layer to map and perform required actions
	function addMapLayer(url,layerid) {
		console.log('add layer', layerid, url)
        curr_layer = L.tileLayer(url);
        curr_layer.on('loading', function(){
            $('#spinner').show()
        })
        curr_layer.on('load', function(){
            setTimeout(
              function() 
              {
                 $('#spinner').hide()
              }, 800);
        })

        map.addLayer(curr_layer)
        curr_layer.setOpacity(0.75);  

	    prev_layers.push(curr_layer);
	    all_layers.push(curr_layer);
	    active_layer = layerid


        $.getJSON("https://realearth.ssec.wisc.edu/api/products?products=" + active_layer, function( data ) {
            active_times = data[0].times.slice(data[0].times.length-10, data[0].times.length)
            times_length = active_times.length

            time_slider.options.steps = times_length;
            time_slider.stepRatios = time_slider.calculateStepRatios();
            prev_scrub_tick = false
            time_slider.setStep(times_length, 0, snap=false)
        });
        return all_layers.length-1
	}
	function toggleUI(){
	  $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#sectors-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
	}

	//Things to do on page load
	$('#time_container').hide()
    $('.layer-dropdown-content').hide()
    $('.menu-link').bigSlide({
        side: 'right',
    });
    $('input[type=checkbox] .layer-dropdown').each(function () {
      $(this).prop('checked', false);
    });
    $('#haptic_toggle').prop('checked', true);


    $(".vibrate").vibrate({
	    duration: 20,
	    trigger: "touchstart"
	});
	$(".vibrate-light").vibrate({
	    duration: 20,
	    trigger: "touchstart"
	});
	$(".vibrate-toggle").vibrate({
		pattern:[5,200,20]
	});


	$('#haptic_toggle').on('change', function() {
		if (!$('#haptic_toggle').prop('checked')){
			$(".vibrate").vibrate({
			    duration: 0,
			    trigger: "touchstart"
			});
			$(".vibrate-light").vibrate({
			    duration: 0,
			    trigger: "touchstart"
			});
			$(".vibrate-toggle").vibrate({
				duration: 0
			});
		}
		else{
			$(".vibrate").vibrate({
			    duration: 20,
			    trigger: "touchstart"
			});
			$(".vibrate-light").vibrate({
			    duration: 20,
			    trigger: "touchstart"
			});
			$(".vibrate-toggle").vibrate({
				pattern:[5,200,20]
			});
		}
	});

    //Instantly change time display if user changes preference
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


    var $goes_sector = $('.goes-sector-select').on('touchstart click',function() {
	    $goes_sector.removeClass('sector-selected');
	    $(this).addClass('sector-selected');
	});
	var $zoom_sector = $('.sector-zoom').on('touchstart click',function() {
	    $zoom_sector.removeClass('sector-selected');
	    $(this).addClass('sector-selected');

	    var sector = $(this).find('.zoom-label')[0].innerHTML

	    if(sector=='Central Great Plains'){
	    	map.setView([40, -100], 5);
	    }
	    else if(sector=='Northern Great Plains'){
	    	map.setView([47, -100], 5);
	    }
	    else if(sector=='Southern Great Plains'){
	    	map.setView([32, -100], 5);
	    }
  		else if(sector=='North America'){
	    	map.setView([50, -103], 3);
	    }
	    else if(sector=='CONUS'){
	    	map.setView([40, -103], 4);
	    }


	    //map.setView([lat, lng], zoom);
	});





    //UI animations
    $("#layers-link").on('touchstart click',function() {
      toggleUI()
      $('#options-content').hide()
      $('#sectors-content').hide()
      $('#layers-content').show()

      menuIsOpen=true
    });

    $("#options-link").on('touchstart click',function() {
      toggleUI()
      $('#options-content').show()
      $('#sectors-content').hide()
      $('#layers-content').hide()

      menuIsOpen=true
    });

    $("#sectors-link").on('touchstart click',function() {
      toggleUI()
      $('#options-content').hide()
      $('#sectors-content').show()
      $('#layers-content').hide()

      menuIsOpen=true
    });


    $(".close").on('touchstart click',function() {
    	console.log('test')
    	toggleUI()
      	menuIsOpen=false
    });

    $('.dropdown-header').click(function(){
        $(this).children('.layer-dropdown-arrow').toggleClass('rotated');
    });

    $('.dropdown-header').click(function(){

        $(this).next().slideToggle('fast')
    })


    //Keyboard looping controls
    $('body').keydown(function(e){
      key = e.key || e.keyCode || e.which
    	if (active_layer != false){
    		var curr_step = time_slider.getStep()[0]
  			if(key==',' || key==188){
  				if(curr_step != 0){
  					time_slider.setStep(curr_step-1,0)	
  				}
  			}
  			else if(key=='.' || key==190){
  				if(curr_step != times_length){
  					time_slider.setStep(curr_step+1,0)				
  				}
  			}
    	}
    });
    $('body').keyup(function(e){
      key = e.key || e.keyCode || e.which
    	if (active_layer != false){
			if(key==',' || key=='.' || key == 188 || key == 190){
				setTimeout(function(){
					time_slider.callDragStopCallback(1);
				},500)

    		}
    	}
    });


    //Initialize map
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


    //Add layer to map and remove previous layer
    $('.single_toggle').on('change', 'input.cmn-toggle', function() {

        $('.single_toggle input.cmn-toggle').not(this).prop('checked', false);         
        var layerid = $(this).parent()[0].id

        var opacityscrubber = new ScrubberView();
        opacityscrubber.min(0).max(100).step(1).value(75)

        var layer_info = $(this).data("layer-info")
        if (typeof layer_info != 'undefined'){
          $('#layer-info').text(layer_info)
        }
        else{
          $('#layer-info').text('')
        }

        if(prev_layerid==layerid || !prev_layerid){
            if(this.checked) {
            	
            	prev_ndx = addMapLayer('http://wms.ssec.wisc.edu/products/'+layerid+'/{z}/{x}/{y}.png',layerid)

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
        	prev_ndx = addMapLayer('http://wms.ssec.wisc.edu/products/'+layerid+'/{z}/{x}/{y}.png',layerid)
            map.removeLayer(all_layers[prev_ndx-1])

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

    prev_layers = []
    prev_scrub_tick = false

    //Initialize time slider and looping functions
    var time_slider = new Dragdealer('scrubber_container',{
        snap: true,
        animationCallback: function(x, y) {

            value = Math.round(this.getStep()[0] - 1)
            times_length = active_times.length
            if (times_length > 1 && prev_scrub_tick != value){

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

                $('#layer-info').text()




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
			              }, 800);
			        })

                    map.addLayer(curr_time_layer)



                    prev_layers.push(curr_time_layer);
                    if (prev_layers.length > 5){
                        map.removeLayer(prev_layers[0])
                        prev_layers.shift()
                    }
                    if (prev_layers.length > 2){
                    	prev_layers[prev_layers.length-2].on('load', function(){
                    		$('#spinner').show()
                    	})
                    }
                }

            }
        },
        dragStopCallback: function(x, y){
            if (prev_layers.length > 0) {
                while(prev_layers.length > 1){
                    map.removeLayer(prev_layers[0])
                    prev_layers.shift()
                }
                var layer_opacity  = parseFloat($( "#opacity_" +  active_layer).text().replace('%',''))/100.0 
                prev_layers[0].setOpacity(layer_opacity) 

                var ndx = prev_ndx
                all_layers[ndx] = prev_layers[0]

		        all_layers[ndx].on('load', function(){
		        	setTimeout(
		              function() 
		              {
		                 $('#spinner').hide()
		              }, 800);
		        })

            }
        }
    });







});