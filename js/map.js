$(document).ready(function(){
    
    var basemap = L.tileLayer.provider('OpenStreetMap.Mapnik')
    var conus_vis = L.tileLayer.wms("https://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_vis.cgi?", {
        layers: 'conus_vis_1km_900913',
        format: 'image/png',
        transparent: true,
        attribution: "Weather data © 2012 IEM Nexrad"
    });
    var conus_ir = L.tileLayer.wms("https://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_ir.cgi?", {
        layers: 'conus_ir_4km_900913',
        format: 'image/png',
        transparent: true,
        attribution: "Weather data © 2012 IEM Nexrad"
    });
    var nexrad = L.tileLayer.wms("https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
        layers: 'nexrad-n0r-900913',
        format: 'image/png',
        transparent: true,
        attribution: "Weather data © 2012 IEM Nexrad"
    });
    var all_layers = [basemap, conus_vis, conus_ir, nexrad]
    
    var mymap = L.map('mapid', {
        zoomControl: false,
        center: [40.31304, -98.78906],
        zoom: 5,
        layers: [basemap]
    });

    var prev_ndx = false

    $('#single_toggle').on('change', 'input.cmn-toggle', function() {
        $('input.cmn-toggle').not(this).prop('checked', false);         
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
   
    var sidebar = L.control.sidebar('sidebar').addTo(mymap);
    
    var opacitySlider = new L.Control.opacitySlider();
    mymap.addControl(opacitySlider);
    
    // You only need to call it once. 
    //opacitySlider.setOpacityLayer(vis_sat);
    
    // Set initial opacity to 0.5 (Optional)
    conus_vis.setOpacity(0.6);
    conus_ir.setOpacity(0.6);
    nexrad.setOpacity(0.6);
    
    
    var scrubber = new ScrubberView();
    $('#scrubber_container').append(scrubber.elt);
    
});