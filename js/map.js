$(document).ready(function(){


 //    $.ajax({
	//     url: 'http://sharp.weather.ou.edu/tbell/GOES16_07/Mesoscale-1/GOES16_07_Mesoscale-1.json?jsoncallback=?',
	//     dataType: 'JSONP',
	//     jsonpCallback: 'callback',
	//     type: 'GET',
	//     success: function (data) {
	//         console.log(data);
	//     }
	// });
	L_PREFER_CANVAS=true;
	var num_times = 15
	var preload_finished = false
	var preload_ongoing = false
	function takeScreenshot(){
		toggleUI()
		$('#img-container').fadeIn('fast')
		html2canvas(document.getElementById("mapid"), {
	        useCORS: true,
	        preferCanvas: true,
	        onrendered: function(canvas) {
	        	var img_width = $('#img-container').width()
	        	var img_height = $('#img-container').height()
                var extra_canvas = document.createElement("canvas");
                extra_canvas.setAttribute('width',img_width);
                extra_canvas.setAttribute('height',img_height);
                var ctx = extra_canvas.getContext('2d');
                ctx.drawImage(canvas,0,0,canvas.width, canvas.height,0,0,img_width,img_height);
                var dataURL = extra_canvas.toDataURL();
                var img = $('#screenshot');
                img.attr('src', dataURL);
                // insert the thumbnail at the top of the page
                $('#img-container').append(img);	      
                

		      }
	    });
	}

	function refreshLayers(){
		if (active_layer != false){
			var url = curr_layer._url
		    var layer_opacity  = parseFloat($( "#opacity_" +  active_layer).text().replace('%',''))/100.0 

			map.removeLayer(curr_layer)
			all_layers.shift()
			addMapLayer(url,prev_layerid,opacity=layer_opacity)
			console.log(all_layers)
		}
	}

	function addLoopLayer(layer, callback) {
		console.log(preload_ongoing)
		if(preload_ongoing != false){
			layer.on('load',function(){
				map.removeLayer(layer)
				callback();
			})	 
			map.addLayer(layer)	
		} 
	}
	var loopTimes = function(arr) {
	    addLoopLayer(arr[x],function(){
	        // set x to next item
	        x++;

	        // any more items in array? continue loop
	        if(x < arr.length ) {
	        	progressCircle.animate(x/arr.length);
	            loopTimes(arr);   
	        }
	        else{
	        	progressCircle.animate(1.0);
	        	preload_finished = true
	        	preload_ongoing = false
	        }
	    }); 
	}
	var x = 0;
	function preLoadLoop(){
		if (active_layer != false){
			preload_ongoing = true
			console.log('here')
			$('.handle').fadeOut()
			$('#play').hide()
			$('#time_spinner').show()

			if (num_times > active_times.length){
				num_times = active_times.length
			}
			
			load_layers = []
			for(i=0;i<num_times;i++){

				curr_time = active_times[i]
	            date_time = curr_time.split('.')
	            date = date_time[0]
	            time = date_time[1]

				load_layer = L.tileLayer('http://wms.ssec.wisc.edu/products/'+active_layer + '_' + date + '_' + time+'/{z}/{x}/{y}.png')
	 			load_layer.setOpacity(0.0); 
	 			load_layers.push(load_layer)
			}
			x=0
			loopTimes(load_layers)
		}
		else{
			console.log('no active layers')
		}

	}
	function startLoop(){
		tile_loop = false
		
		if (active_layer != false){
    		$('#time_spinner').hide()
    		$('#pause').show()

    		var tile_loop = setInterval(function(){ 
    			var curr_step = time_slider.getStep()[0]
    			if (curr_step == num_times){
    				clearInterval(tile_loop)

					time_slider.setStep(0,0,snap=false) 
					pauseLoop()

    			}
    			else{
    				time_slider.setStep(curr_step+1,0,snap=false)  
    			}	
			   
			}, loop_speed);
			
		}
		return tile_loop
	}
	function pauseLoop(){
		setTimeout(function(){
			if (tile_loop != false){
				tile_loop = startLoop()
			}
		},1000)

	}
	function stopLoop(loop){
		tile_loop = false
		preload_finished = false
		console.log(loop_move)
		if(loop_move == false){
			$('.handle').fadeIn()
			time_slider.setStep(times_length, 0, snap=false)
			$('#play').show()
    		$('#pause').hide()
		}
		else{
			$('#time_spinner').show()
			$('#pause').hide()
			$('#play').hide()
		}

    	 clearInterval(loop);
    	 setTimeout(function(){
			time_slider.callDragStopCallback(1);
		},200)
    	return false
	}

	var tile_loop = false
	var preload_test = false
    $('#play').on('click',function() {
    	preLoadLoop()
		preload_test = setInterval(function(){ 
			if(preload_finished == true){
				clearInterval(preload_test)
				tile_loop = startLoop()
				progressCircle.animate(0.0);
				preload_finished = false
			}
			else{

			}
		}, 200);
			
    })
    $('#pause').on('click',function() {
    	tile_loop = stopLoop(tile_loop)
	})
	$('#time_spinner').on('click',function() {
		preload_ongoing = false
		clearInterval(preload_test)
		clearInterval(preloading)
		console.log(tile_loop)
		tile_loop = stopLoop(tile_loop)
    	$('#time_spinner').hide()
    	progressCircle.animate(0.0);
	})
    $('.menu-link').on('click',function() {
    	if(tile_loop != false){
			tile_loop = stopLoop(tile_loop)
		}
    	clearInterval(preload_test)
    	clearInterval(preloading)
    	loop_move = false
    	if($('#time_spinner').is(":visible")){
			$('#time_spinner').hide()
    	}
    })
    $('body').keydown(function(e){
    	key = e.key || e.keyCode || e.which
    	if(key == ' '){
    		if(tile_loop != false){
    			tile_loop = stopLoop(tile_loop)
    		}
    		else{
    			preLoadLoop()
				preload_test = setInterval(function(){ 
					if(preload_finished == true){
						clearInterval(preload_test)
						tile_loop = startLoop()
						preload_finished = false
					}
					else{

					}
				}, 200);
    		}
    	}
    })


	//Function to add layer to map and perform required actions
	function addMapLayer(url,layerid,opacity=0.75,timelayer=false) {
    	curr_layer = L.tileLayer(url);

	    if(timelayer == false){

	        curr_layer.on('loading', function(){
	             $('#spinner').show()
	        })
	        curr_layer.on('load', function(){
                 $('#spinner').hide()
	        })
	        curr_layer.setOpacity(opacity);  
	        map.addLayer(curr_layer)
		    prev_layers.push(curr_layer);
		    all_layers.push(curr_layer);
		    active_layer = layerid
		   	$.getJSON("https://realearth.ssec.wisc.edu/api/products?products=" + active_layer, function( data ) {
	            active_times = data[0].times.slice(data[0].times.length-num_times, data[0].times.length)
	            times_length = active_times.length

	            time_slider.options.steps = times_length;
	            time_slider.stepRatios = time_slider.calculateStepRatios();
	            prev_scrub_tick = false
	            time_slider.setStep(times_length, 0, snap=false)
	        });
	    }
	    else{
	    	curr_layer.setOpacity(opacity);  
	        map.addLayer(curr_layer)
		    prev_layers.push(curr_layer);	    
		    active_layer = layerid
	    }

        return all_layers.length-1
	}
	function toggleUI(){
	  $('#scrubber_container').toggleClass('transform-active');
      $('#time_container').toggleClass('transform-active-left');
      $('#layers-link').toggleClass('transform-active-right');
      $('#sectors-link').toggleClass('transform-active-right');
      $('#options-link').toggleClass('transform-active-right');
      $('#fullscreen-link').toggleClass('transform-active-right');
      $('.leaflet-control-locate').toggleClass('transform-active-right');
      $('#time_control_container').toggleClass('transform-active');
      $('#options_container').toggleClass('transform-active-right');
     }

	//Things to do on page load
	var speedscrubber = new ScrubberView();
	speedscrubber.min(1).max(20).step(1).value(5);
	$('#speedscrubber').append(speedscrubber.elt);
	var loop_speed = loop_speed = 1000 * (1/(speedscrubber.value()))

	var framesscrubber = new ScrubberView();
	framesscrubber.min(5).max(30).step(1).value(15);
	$('#framesscrubber').append(framesscrubber.elt);

	var progressCircle = new ProgressBar.Circle(time_spinner_view, {
	  strokeWidth: 12,
	  easing: 'easeInOut',
	  duration: 100,
	  color: '#2074B6',
	  trailColor: '#eee',
	  trailWidth: 2,
	  svgStyle: null
	});
	

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

    speedscrubber.onValueChanged = function (value) {
        $('.speed-display').html(value + ' FPS');
        loop_speed = 1000 * (1/(value))
        console.log(loop_speed)
    }

    framesscrubber.onValueChanged = function (value) {
        $('.frames-display').html(value);
        num_times = value
        console.log(num_times)
    }


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
	    	map.fitBounds([
			    [43, -106],
			    [32, -90]
			]);
	    }
	    else if(sector=='Northern Great Plains'){
	    	map.fitBounds([
			    [50, -108],
			    [39, -90]
			]);
	    }
	    else if(sector=='Southern Great Plains'){
	    	map.fitBounds([
			    [25, -108],
			    [37, -89]
			]);
	    }
  		else if(sector=='North America'){
	    	map.fitBounds([
			    [70, -167],
			    [11, -46]
			]);
	    }
	    else if(sector=='CONUS'){
	    	map.fitBounds([
			    [49, -128],
			    [24, -65]
			]);
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
    	toggleUI()

      	menuIsOpen=false
    });

    $(".img-close").on('click',function() {
    	toggleUI()
    	$('#img-container').fadeOut('fast')
    	var img = $('#screenshot');
        img.attr('src', '');
    });

    $('.dropdown-header').click(function(){
        $(this).children('.layer-dropdown-arrow').toggleClass('rotated');
    });

    $('.dropdown-header').click(function(){

        $(this).next().slideToggle('fast')
    })


    $('#step-back').on('touchstart click',function() {
    	if (active_layer != false){
    		var curr_step = time_slider.getStep()[0]
  			if(curr_step != 0){
  				time_slider.setStep(curr_step-1,0)	
  				setTimeout(function(){
					time_slider.callDragStopCallback(1);
				},500)
  			}
    	}
    });
    $('#step-forward').on('touchstart click',function() {
    	if (active_layer != false){
    		var curr_step = time_slider.getStep()[0]
  			if(curr_step != 0){
  				time_slider.setStep(curr_step+1,0)	
  				setTimeout(function(){
					time_slider.callDragStopCallback(1);
				},500)
  			}
    	}
    });


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

    $('#options_container_close').on('touchstart click',function() {
   		var width = 190
   		if($(this).hasClass( 'rotated-y' )){
   			$("#options_container").css({'-webkit-transform': 'translate3d(' + width + 'px, 0px, 0px)', '-moz-transform': 'translate3d(' + width + 'px, 0px, 0px)'});
   			$(".leaflet-control-locate").css({'-webkit-transform': 'translate3d(' + width + 'px, 0px, 0px)', '-moz-transform': 'translate3d(' + width + 'px, 0px, 0px)'});
   		}
   		else{
   			$("#options_container").css({'-webkit-transform': 'translate3d(0px, 0px, 0px)', '-moz-transform': 'translate3d(0px, 0px, 0px)'});
   			$(".leaflet-control-locate").css({'-webkit-transform': 'translate3d(0px, 0px, 0px)', '-moz-transform': 'translate3d(0px, 0px, 0px)'});
   			$("#fullscreen-link").toggleClass('disabled')
   			$("#refresh-link").toggleClass('disabled')
   			$("#share-link").toggleClass('disabled')
   			$(".leaflet-control-locate").toggleClass('disabled')


			setTimeout(
			function() 
			{
				$("#fullscreen-link").toggleClass('disabled')
				$("#refresh-link").toggleClass('disabled')
   				$("#share-link").toggleClass('disabled')
				$(".leaflet-control-locate").toggleClass('disabled')

			}, 600);

   		}
   		$(this).toggleClass('rotated-y');
   });


   $('#time_container_close').on('touchstart click',function() {
   		var width = $("#time_container").width() + 10
   		if(!$(this).hasClass( 'rotated-y' )){
   			$("#time_container").css({'-webkit-transform': 'translate3d(-' + width + 'px, 0px, 0px)', '-moz-transform': 'translate3d(-' + width + 'px, 0px, 0px)'});
   		}
   		else{
   			$("#time_container").css({'-webkit-transform': 'translate3d(0px, 0px, 0px)', '-moz-transform': 'translate3d(0px, 0px, 0px)'});
   		}
   		$(this).toggleClass('rotated-y');
   });

  $('#time_container_close').on('updateWidth',function(){
  		var width = $("#time_container").width() + 10
		if($(this).hasClass( 'rotated-y' )){
			$("#time_container").css({'-webkit-transform': 'translate3d(-' + width + 'px, 0px, 0px)', '-moz-transform': 'translate3d(-' + width + 'px, 0px, 0px)'});
		}
		else{
			$("#time_container").css({'-webkit-transform': 'translate3d(0px, 0px, 0px)', '-moz-transform': 'translate3d(0px, 0px, 0px)'});
		}
  });



    //Initialize map
    var basemap = L.tileLayer.provider('CartoDB.Positron')
    var basemap_lines = L.tileLayer.provider('Stamen.TonerLines')
    var coastlines = L.tileLayer('http://map1.vis.earthdata.nasa.gov/wmts-webmerc/Coastlines/default/2014-08-20/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png')
    
    basemap_lines.setZIndex(999);
    basemap_lines.setOpacity(0.3);

    coastlines.setZIndex(998);
    coastlines.setOpacity(0.5);

    var test = L.tileLayer('test_dir/{z}/{x}/{-y}.png');
    
    var map = L.map('mapid', {
        zoomControl: false,
        center: [40.31304, -98.78906],
        zoom: 5,
        layers: [basemap,basemap_lines, coastlines],
        attributionControl: false,
        preferCanvas: true,
    });

	$('#fullscreen-link').on('click', function(){
		if(!$('#fullscreen-link').hasClass('disabled')){
			$(document).toggleFullScreen();
		}
	})

	$('#refresh-link').on('click', function(){
		if(!$('#refresh-link').hasClass('disabled')){
			refreshLayers()
		}
	})

	$('#share-link').on('click', function(){
		if(!$('#share-link').hasClass('disabled')){
			takeScreenshot()
		}
	})

    var all_layers = [basemap]
    var all_overlays = []
    var active_layer = false
    var active_times = false
    var prev_layerid = false
    var prev_div = false
    var prev_ndx = false
    var menuIsOpen = false


    var loop_move = false
    map.on('movestart',function(){
    	if(!$('#play').is(":visible")){
    		clearInterval(preload_test)
    		loop_move = true
    		$('#pause').trigger('click');
    		
    	}
    })
    preloading = false
    map.on('moveend',function(){
    	clearInterval(preloading)
		if(loop_move){
			if(preload_ongoing){
				preloading = setInterval(function(){ 
					console.log('preloading')
					if (preload_ongoing == false){
						console.log('loaded')
						clearInterval(preloading)
						loop_move = false
						$('#time_spinner').hide()
						$('#play').trigger('click');
					}
				}, 200);
			}
			else{
				console.log('no preloading')
				loop_move = false
				$('#time_spinner').hide()
				$('#play').trigger('click');
				
			}
		}
    })


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

        $('#time_container_close').trigger('updateWidth')

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
        snap: false,
        slide: false,
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
                if (prev_scrub_tick != false && menuIsOpen != true){
                    addMapLayer('http://wms.ssec.wisc.edu/products/'+active_layer + '_' + date + '_' + time+'/{z}/{x}/{y}.png', active_layer, 1,true)

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