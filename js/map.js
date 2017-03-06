$(document).ready(function(){

     $('.menu-link').bigSlide();

    var basemap = L.tileLayer.provider('OpenStreetMap.Mapnik')


    var conus_vis = L.tileLayer('http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-vis-1km-900913/{z}/{x}/{y}.png');
    var conus_ir = L.tileLayer('http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-ir-4km-900913/{z}/{x}/{y}.png');
    var nexrad = L.tileLayer('http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png');

    var all_layers = [basemap, conus_vis, conus_ir, nexrad]
    
    var mymap = L.map('mapid', {
        zoomControl: false,
        center: [40.31304, -98.78906],
        zoom: 5,
        layers: [basemap]
    });



    var prev_ndx = false

    $('#single_toggle').on('change', 'input.cmn-toggle', function() {
        $('#single_toggle input.cmn-toggle').not(this).prop('checked', false);         
        var ndx = $(this).val()
        opacitySlider.setOpacityLayer(all_layers[ndx]);
        if(prev_ndx==ndx || !prev_ndx){
            if(this.checked) {
                mymap.addLayer(all_layers[ndx])
            }else{
                mymap.removeLayer(all_layers[ndx])
            }
        }else{
            mymap.addLayer(all_layers[ndx])
            mymap.removeLayer(all_layers[prev_ndx])
        }
        prev_ndx = ndx     
    });
    
    $('#multi_toggle').on('change', 'input.cmn-toggle', function() {  
        var ndx = $(this).val()  
        if(this.checked) {
            mymap.addLayer(all_layers[ndx])
        }else{
            mymap.removeLayer(all_layers[ndx])
        }

    });

    
    L.control.zoom({
         position:'topright'
    }).addTo(mymap);

    L.control.locate().addTo(mymap);
   
    // var sidebar = L.control.sidebar('sidebar').addTo(mymap);
    
    var opacitySlider = new L.Control.opacitySlider();
    mymap.addControl(opacitySlider);
    
    // You only need to call it once. 
    //opacitySlider.setOpacityLayer(vis_sat);
    
    // Set initial opacity to 0.5 (Optional)
    conus_vis.setOpacity(0.6);
    conus_ir.setOpacity(0.6);
    nexrad.setOpacity(0.6);
    
    
    var scrubber = new ScrubberView();
    scrubber.min(0).max(10).step(1).value(0)
    $('#scrubber_container').append(scrubber.elt);


});