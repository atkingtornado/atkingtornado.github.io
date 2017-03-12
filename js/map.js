$(document).ready(function(){

    $('.menu-link').bigSlide({
        side: 'right',
    });

    var basemap = L.tileLayer.provider('OpenStreetMap.Mapnik')
    var states =  L.tileLayer.provider('Stamen.TonerLines')

    var conus_vis = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-vis-1km-900913/{z}/{x}/{y}.png');
    var conus_ir = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-ir-4km-900913/{z}/{x}/{y}.png');
    var nexrad = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png');

    var test = L.tileLayer('test_dir/{z}/{x}/{-y}.png');

    var all_layers = [basemap, conus_vis, conus_ir, nexrad, test]
    
    var mymap = L.map('mapid', {
        zoomControl: false,
        center: [40.31304, -98.78906],
        zoom: 5,
        layers: [basemap],
        attributionControl: false
    });


    var prev_ndx = false
    var prev_div = false

    $('#single_toggle').on('change', 'input.cmn-toggle', function() {
        $('#single_toggle input.cmn-toggle').not(this).prop('checked', false);         
        var ndx = $(this).val()

        var opacityscrubber = new ScrubberView();
        opacityscrubber.min(0).max(100).step(1).value(60)

        all_layers[ndx].setOpacity(0.6);

        if(prev_ndx==ndx || !prev_ndx){
            if(this.checked) {
                mymap.addLayer(all_layers[ndx])
                $('<div id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
                $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
                $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
            }else{
                mymap.removeLayer(all_layers[ndx])
                $('#opacity_' + $(this).parent()[0].id).remove()
            }
        }else{
            mymap.addLayer(all_layers[ndx])
            $('<div id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
            $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
            $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
            
            $('#opacity_' + prev_div).remove()
            mymap.removeLayer(all_layers[prev_ndx])
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
        $('#spinner').show()
        if(this.checked) {
            mymap.addLayer(all_layers[ndx])
            $('<div id=opacity_' + $(this).parent()[0].id + '></div>').insertAfter($(this).parent()[0]);
            $('#opacity_' + $(this).parent()[0].id).html('<p class=opacity-display id=opacity_display_' + $(this).parent()[0].id + '>60%</p>');
            $('#opacity_' + $(this).parent()[0].id).append(opacityscrubber.elt);
        }else{
            mymap.removeLayer(all_layers[ndx])
            $('#opacity_' + $(this).parent()[0].id).remove()
        }

        opacityscrubber.onValueChanged = function (value) {
            $('#opacity_display_' + prev_div).html(value+'%');
            all_layers[ndx].setOpacity(value/100.0)
        }


    });

    L.control.locate().addTo(mymap);

    for (i=0;i<all_layers.length;i++) {

        all_layers[i].on('loading', function(){
            $('#spinner').show()
        })
        all_layers[i].on('load', function(){
            $('#spinner').hide()
        })

    }

    
    
    var scrubber = new ScrubberView();
    scrubber.min(0).max(10).step(1).value(0)
    $('#scrubber_container').append(scrubber.elt);

    $("#layers-link").click(function() {
      $('#scrubber_container').toggleClass('transform-active');
    });

    $("#layers-close").click(function() {
      $('#scrubber_container').toggleClass('transform-active');
    });


});