// Location Map Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map variables
    let map;
    let marker;
    let geocoder;
    let placesService;
    let autocomplete;
    let directionsService;
    let directionsRenderer;
    let infoWindow;
    let currentLocation = { lat: -6.2088, lng: 106.8456 }; // Default to Jakarta

    // Initialize the map
    function initMap() {
        // Create map
        map = new google.maps.Map(document.getElementById('locationMap'), {
            center: currentLocation,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                // Add your preferred map styles here
            ]
        });


        // Initialize services
        geocoder = new google.maps.Geocoder();
        placesService = new google.maps.places.PlacesService(map);
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: null,
            panel: document.getElementById('directionsContainer'),
            suppressMarkers: true
        });

        // Add marker
        marker = new google.maps.Marker({
            map: map,
            position: currentLocation,
            draggable: true,
            animation: google.maps.Animation.DROP,
            title: 'Lokasi Acara',
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(40, 40)
            }
        });

        // Initialize info window
        infoWindow = new google.maps.InfoWindow({
            content: 'Geser pin ke lokasi yang diinginkan',
            maxWidth: 200
        });

        // Show info window when marker is clicked
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

        // Close info window when clicking on the map
        map.addListener('click', () => {
            infoWindow.close();
        });

        // Update marker position when map is clicked
        map.addListener('click', (e) => {
            updateMarkerPosition(e.latLng);
            updateAddressFromLatLng(e.latLng);
        });

        // Update address when marker is dragged
        marker.addListener('dragend', () => {
            updateAddressFromLatLng(marker.getPosition());
        });

        // Initialize search functionality
        initSearch();

        // Initialize controls
        initControls();

        // Try to get user's current location
        locateUser();
    }


    // Initialize search functionality
    function initSearch() {
        const searchInput = document.getElementById('locationSearch');
        const searchButton = document.getElementById('searchLocationBtn');
        const searchResults = document.getElementById('searchResults');
        let searchBox;

        // Create search box
        searchBox = new google.maps.places.SearchBox(searchInput, {
            types: ['geocode', 'establishment'],
            componentRestrictions: { country: 'id' }
        });

        // Listen for the event fired when the user selects a prediction
        searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();

            if (places.length === 0) {
                return;
            }


            // Clear out the old markers
            marker.setMap(null);


            // For each place, get the icon, name and location
            const bounds = new google.maps.LatLngBounds();
            places.forEach(place => {
                if (!place.geometry || !place.geometry.location) {
                    console.log("Returned place contains no geometry");
                    return;
                }


                // Create a marker for each place
                marker = new google.maps.Marker({
                    map: map,
                    title: place.name,
                    position: place.geometry.location,
                    draggable: true
                });


                if (place.geometry.viewport) {
                    // Only geocodes have viewport
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }


                // Update address fields
                updateAddressFromPlace(place);
            });


            map.fitBounds(bounds);
            searchResults.classList.remove('active');
        });


        // Handle search button click
        searchButton.addEventListener('click', () => {
            if (searchInput.value.trim() !== '') {
                searchPlaces(searchInput.value);
            }
        });


        // Handle Enter key in search input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                searchPlaces(searchInput.value);
            }
        });


        // Show search results when input is focused
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() !== '') {
                searchPlaces(searchInput.value);
            }
        });
    }


    // Search for places
    function searchPlaces(query) {
        const service = new google.maps.places.PlacesService(map);
        const searchResults = document.getElementById('searchResults');

        const request = {
            query: query,
            fields: ['name', 'formatted_address', 'geometry'],
            location: map.getCenter(),
            radius: 50000 // 50km radius
        };

        service.textSearch(request, (results, status) => {
            searchResults.innerHTML = '';

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.slice(0, 5).forEach(place => {
                    const item = document.createElement('div');
                    item.className = 'search-result-item';
                    item.innerHTML = `
                        <i class="fas fa-map-marker-alt"></i>
                        <div>
                            <div class="place-name">${place.name}</div>
                            <div class="place-address">${place.formatted_address || ''}</div>
                        </div>
                    `;


                    item.addEventListener('click', () => {
                        map.setCenter(place.geometry.location);
                        map.setZoom(17);
                        updateMarkerPosition(place.geometry.location);
                        updateAddressFromPlace(place);
                        searchResults.classList.remove('active');
                        document.getElementById('locationSearch').value = place.name;
                    });


                    searchResults.appendChild(item);
                });


                searchResults.classList.add('active');
            }
        });
    }


    // Initialize map controls
    function initControls() {
        // Locate me button
        document.getElementById('locateMeBtn').addEventListener('click', locateUser);

        // Map type button
        document.getElementById('mapTypeBtn').addEventListener('click', () => {
            const currentMapType = map.getMapTypeId();
            const newMapType = currentMapType === google.maps.MapTypeId.ROADMAP ?
                google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP;
            map.setMapTypeId(newMapType);
        });

        // Satellite view button
        document.getElementById('satelliteViewBtn').addEventListener('click', () => {
            map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        });

        // Fullscreen button
        document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

        // Copy coordinates button
        document.getElementById('copyCoordsBtn').addEventListener('click', copyCoordinates);

        // Directions button
        document.getElementById('getDirectionsBtn').addEventListener('click', showDirections);
        
        // Close directions button
        document.getElementById('closeDirections').addEventListener('click', () => {
            document.getElementById('directionsPanel').style.display = 'none';
            directionsRenderer.setMap(null);
        });
    }


    // Toggle fullscreen mode
    function toggleFullscreen() {
        const mapContainer = document.querySelector('.map-container');
        
        if (!document.fullscreenElement) {
            if (mapContainer.requestFullscreen) {
                mapContainer.requestFullscreen();
                mapContainer.classList.add('fullscreen');
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                mapContainer.classList.remove('fullscreen');
            }
        }
    }


    // Copy coordinates to clipboard
    function copyCoordinates() {
        const coords = `${marker.getPosition().lat().toFixed(6)}, ${marker.getPosition().lng().toFixed(6)}`;
        navigator.clipboard.writeText(coords).then(() => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = 'Koordinat disalin!';
            document.body.appendChild(tooltip);
            
            setTimeout(() => {
                tooltip.remove();
            }, 2000);
        }).catch(err => {
            console.error('Gagal menyalin koordinat:', err);
        });
    }


    // Show directions to the selected location
    function showDirections() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const origin = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    const destination = {
                        lat: marker.getPosition().lat(),
                        lng: marker.getPosition().lng()
                    };
                    
                    calculateAndDisplayRoute(origin, destination);
                    document.getElementById('directionsPanel').style.display = 'block';
                },
                (error) => {
                    alert('Tidak dapat menemukan lokasi Anda. Pastikan izin lokasi diaktifkan.');
                },
                { enableHighAccuracy: true }
            );
        } else {
            alert('Browser Anda tidak mendukung geolokasi');
        }
    }


    // Calculate and display route
    function calculateAndDisplayRoute(origin, destination) {
        directionsService.route(
            {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            },
            (response, status) => {
                if (status === 'OK') {
                    directionsRenderer.setMap(map);
                    directionsRenderer.setDirections(response);
                } else {
                    alert('Tidak dapat menghitung rute: ' + status);
                }
            }
        );
    }


    // Update marker position
    function updateMarkerPosition(latLng) {
        marker.setPosition(latLng);
        map.panTo(latLng);
        updateCoordinates(latLng);
    }


    // Update coordinates display
    function updateCoordinates(latLng) {
        const coordsElement = document.getElementById('mapCoordinates');
        coordsElement.textContent = `${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`;
    }


    // Update address from latitude/longitude
    function updateAddressFromLatLng(latLng) {
        geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK') {
                if (results[0]) {
                    updateAddressFromPlace(results[0]);
                }
            }
        });
    }


    // Update address from place
    function updateAddressFromPlace(place) {
        // You can update any address fields here if needed
        console.log('Place:', place);
    }


    // Locate user's current position
    function locateUser() {
        const btn = document.getElementById('locateMeBtn');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...';
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Update map view
                    map.setCenter(pos);
                    map.setZoom(16);
                    
                    // Update marker position
                    updateMarkerPosition(new google.maps.LatLng(pos.lat, pos.lng));
                    
                    // Update address
                    updateAddressFromLatLng(pos);
                    
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Tidak dapat menemukan lokasi Anda. Pastikan izin lokasi diaktifkan.');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                },
                { 
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0 
                }
            );
        } else {
            alert('Browser Anda tidak mendukung geolokasi');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }


    // Initialize the map when the page loads
    initMap();
});
