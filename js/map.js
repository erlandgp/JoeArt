document.addEventListener('DOMContentLoaded', function() {
    // Default center (Jakarta)
    const defaultCenter = [106.8456, -6.2088];
    let map, marker, markerLayer;

    // Initialize the map
    function initMap() {
        // Create a vector layer for the marker
        markerLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });

        // Create the map
        map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
                markerLayer
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat(defaultCenter),
                zoom: 10,
                minZoom: 2,
                maxZoom: 18
            }),
            controls: ol.control.defaults({
                attributionOptions: {
                    collapsible: false
                }
            })
        });

        // Add click event to place marker
        map.on('click', function(evt) {
            const coordinate = evt.coordinate;
            updateMarker(coordinate);
            updateCoordinates(coordinate);
        });

        // Add double-click zoom
        map.on('dblclick', function(evt) {
            const view = map.getView();
            const zoom = view.getZoom();
            view.animate({
                zoom: zoom + 1,
                duration: 250
            });
        });

        // Add mouse wheel zoom
        map.getViewport().addEventListener('wheel', function(e) {
            e.preventDefault();
        });

        // Initialize marker at default position
        updateMarker(ol.proj.fromLonLat(defaultCenter));
    }


    // Update marker position
    function updateMarker(coordinate) {
        // Clear existing features
        markerLayer.getSource().clear();

        // Create a new marker feature
        const marker = new ol.Feature({
            geometry: new ol.geom.Point(coordinate)
        });

        // Style the marker
        marker.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-red.png',
                scale: 0.5
            })
        }));

        // Add marker to the layer
        markerLayer.getSource().addFeature(marker);

        // Update coordinates in the form
        updateCoordinates(coordinate);
    }


    // Update coordinate form fields
    function updateCoordinates(coordinate) {
        const lonLat = ol.proj.toLonLat(coordinate);
        document.getElementById('eventLongitude').value = lonLat[0].toFixed(6);
        document.getElementById('eventLatitude').value = lonLat[1].toFixed(6);
    }


    // Initialize the map when the page loads
    initMap();

    // Add search functionality
    const searchButton = document.createElement('button');
    searchButton.innerHTML = '🔍 Cari Lokasi';
    searchButton.className = 'btn btn-outline';
    searchButton.style.marginTop = '10px';
    searchButton.onclick = function() {
        const address = document.getElementById('eventVenue').value + 
                      ', ' + document.getElementById('eventCity').value + 
                      ', ' + document.getElementById('eventProvince').value;
        
        if (address.length < 5) {
            alert('Silakan isi alamat terlebih dahulu');
            return;
        }

        // Use Nominatim for geocoding
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data[0]) {
                    const lon = parseFloat(data[0].lon);
                    const lat = parseFloat(data[0].lat);
                    const view = map.getView();
                    view.setCenter(ol.proj.fromLonLat([lon, lat]));
                    view.setZoom(16);
                    updateMarker(ol.proj.fromLonLat([lon, lat]));
                } else {
                    alert('Lokasi tidak ditemukan');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat mencari lokasi');
            });
    };

    // Add search button after the map container
    document.querySelector('#map').parentNode.insertBefore(searchButton, document.querySelector('#map').nextSibling);
});
