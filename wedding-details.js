document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let map;
    let marker;
    let geocoder;
    let placesService;
    let directionsService;
    let directionsRenderer;
    let autocomplete;
    let streetViewService;
    let streetViewPanorama;
    let isFullscreen = false;
    let currentPlace = null;
    
    // Initialize the map
    function initMap() {
        // Default to Jakarta coordinates
        const defaultLocation = { lat: -6.2088, lng: 106.8456 };
        
        // Create map with more controls
        map = new google.maps.Map(document.getElementById('map'), {
            center: defaultLocation,
            zoom: 15,
            mapTypeControl: false, // We'll use custom map type control
            streetViewControl: false, // We'll use custom street view control
            fullscreenControl: false, // We'll use custom fullscreen control
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                    "featureType": "water",
                    "elementType": "geometry.fill",
                    "stylers": [
                        { "color": "#d3d3d3" }
                    ]
                },
                {
                    "featureType": "transit",
                    "stylers": [
                        { "color": "#808080" },
                        { "visibility": "off" }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        { "visibility": "on" },
                        { "color": "#b3b3b3" }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry.fill",
                    "stylers": [
                        { "color": "#ffffff" }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "geometry.fill",
                    "stylers": [
                        { "visibility": "on" },
                        { "color": "#ffffff" },
                        { "weight": 1.8 }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        { "color": "#d7d7d7" }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry.fill",
                    "stylers": [
                        { "visibility": "on" },
                        { "color": "#ebebeb" }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry",
                    "stylers": [
                        { "color": "#a7a7a7" }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry.fill",
                    "stylers": [
                        { "color": "#ffffff" }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry.fill",
                    "stylers": [
                        { "color": "#ffffff" }
                    ]
                },
                {
                    "featureType": "landscape",
                    "elementType": "geometry.fill",
                    "stylers": [
                        { "visibility": "on" },
                        { "color": "#efefef" }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        { "color": "#696969" }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        { "visibility": "on" },
                        { "color": "#737272" }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.icon",
                    "stylers": [
                        { "visibility": "off" }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels",
                    "stylers": [
                        { "visibility": "off" }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        { "color": "#d6d6d6" }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.icon",
                    "stylers": [
                        { "visibility": "off" }
                    ]
                }
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
        streetViewService = new google.maps.StreetViewService();
        streetViewPanorama = map.getStreetView();

        // Add custom map type control
        const mapTypeControlDiv = document.createElement('div');
        mapTypeControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(mapTypeControlDiv);

        // Add event listeners for custom controls
        setupMapControls();
        setupSearchBox();
        setupDirections();
        setupFullscreenToggle();

        // Add marker
        marker = new google.maps.Marker({
            position: defaultLocation,
            map: map,
            draggable: true,
            title: 'Lokasi Acara',
            animation: google.maps.Animation.DROP
        });

        // Initialize autocomplete for venue name
        const venueInput = document.getElementById('venueName');
        autocomplete = new google.maps.places.Autocomplete(venueInput, {
            fields: ['name', 'formatted_address', 'geometry', 'address_components'],
            types: ['establishment']
        });

        // When a place is selected from autocomplete
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.log('No details available for input: ' + place.name);
                return;
            }

            // Update map and marker
            updateMap(place.geometry.location.lat(), place.geometry.location.lng());

            // Fill address fields
            updateAddressComponents(place);
        });

        // When marker is dragged
        marker.addListener('dragend', function() {
            updateLocationInfo(marker.getPosition());
        });

        // Locate me button
        document.getElementById('locateMeBtn').addEventListener('click', locateUser);
    }

    // Update map center and marker position
    function updateMap(lat, lng) {
        const newLocation = new google.maps.LatLng(lat, lng);
        map.setCenter(newLocation);
        marker.setPosition(newLocation);
        updateLocationInfo(newLocation);
    }

    // Update address components based on location
    function updateLocationInfo(location) {
        geocoder.geocode({ location: location }, (results, status) => {
            if (status === 'OK' && results[0]) {
                updateAddressComponents(results[0]);
            }
        });
    }

    // Update address fields based on geocoding result
    function updateAddressComponents(place) {
        let streetNumber = '';
        let route = '';
        let sublocality = '';
        let city = '';
        let province = '';
        let postalCode = '';

        // Extract address components
        place.address_components.forEach(component => {
            const types = component.types;

            if (types.includes('street_number')) {
                streetNumber = component.long_name;
            } else if (types.includes('route')) {
                route = component.long_name;
            } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
                sublocality = component.long_name;
            } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                province = component.long_name;
                document.getElementById('province').value = province;
            } else if (types.includes('postal_code')) {
                postalCode = component.long_name;
                document.getElementById('postalCode').value = postalCode;
            }
        });

        // Build full address
        const fullAddress = [];
        if (streetNumber) fullAddress.push(streetNumber);
        if (route) fullAddress.push(route);
        if (sublocality) fullAddress.push(sublocality);
        if (city) fullAddress.push(city);
        if (province) fullAddress.push(province);
        if (postalCode) fullAddress.push(postalCode);

        
        // Update address fields
        document.getElementById('fullAddress').value = fullAddress.join(', ');
        document.getElementById('district').value = sublocality || '';
        
        // Enable city select if province is selected
        if (province) {
            document.getElementById('city').disabled = false;
            // In a real app, you would fetch cities based on the selected province
            // For demo, we'll just set the value if it matches
            if (city) {
                document.getElementById('city').value = city;
            }
        }
    }
    
    // Set up map controls
    function setupMapControls() {
        // Map type button
        document.getElementById('mapTypeBtn').addEventListener('click', function() {
            const currentMapType = map.getMapTypeId();
            const newMapType = currentMapType === google.maps.MapTypeId.ROADMAP ? 
                google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP;
            map.setMapTypeId(newMapType);
            this.querySelector('i').classList.toggle('fa-map');
            this.querySelector('i').classList.toggle('fa-satellite-dish');
            this.setAttribute('title', newMapType === google.maps.MapTypeId.ROADMAP ? 'Peta' : 'Satelit');
        });
        
        // Fullscreen button
        document.getElementById('fullscreenBtn').addEventListener('click', function() {
            toggleFullscreen();
        });
    }
    
    // Set up search box
    function setupSearchBox() {
        const searchBox = document.getElementById('searchBox');
        const searchButton = document.getElementById('searchButton');
        
        // Add search functionality
        searchButton.addEventListener('click', function() {
            const query = searchBox.value.trim();
            if (query) {
                searchPlaces(query);
            }
        });
        
        // Search on Enter key
        searchBox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchBox.value.trim();
                if (query) {
                    searchPlaces(query);
                }
            }
        });
    }
    
    // Set up directions functionality
    function setupDirections() {
        const getDirectionsBtn = document.getElementById('getDirectionsBtn');
        const closeDirectionsBtn = document.getElementById('closeDirections');
        const directionsPanel = document.getElementById('directionsPanel');
        
        getDirectionsBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const origin = new google.maps.LatLng(
                            position.coords.latitude, 
                            position.coords.longitude
                        );
                        const destination = marker.getPosition();
                        
                        calculateAndDisplayRoute(origin, destination);
                        directionsPanel.style.display = 'block';
                        directionsPanel.scrollIntoView({ behavior: 'smooth' });
                    },
                    (error) => {
                        alert('Tidak dapat menemukan lokasi Anda. Pastikan izin lokasi diaktifkan.');
                    },
                    { enableHighAccuracy: true }
                );
            } else {
                alert('Browser Anda tidak mendukung geolokasi');
            }
        });
        
        closeDirectionsBtn.addEventListener('click', function() {
            directionsPanel.style.display = 'none';
            directionsRenderer.setMap(null);
        });
    }
    
    // Set up fullscreen toggle
    function setupFullscreenToggle() {
        document.addEventListener('fullscreenchange', function() {
            isFullscreen = !isFullscreen;
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            fullscreenBtn.querySelector('i').classList.toggle('fa-compress', isFullscreen);
            fullscreenBtn.querySelector('i').classList.toggle('fa-expand', !isFullscreen);
            fullscreenBtn.setAttribute('title', isFullscreen ? 'Keluar dari layar penuh' : 'Layar penuh');
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
    
    // Search for places
    function searchPlaces(query) {
        const request = {
            query: query,
            fields: ['name', 'geometry', 'formatted_address', 'photos', 'rating', 'formatted_phone_number', 'website'],
            location: map.getCenter(),
            radius: 50000 // 50km radius
        };
        
        placesService.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
                const place = results[0];
                currentPlace = place;
                
                // Update map view
                map.setCenter(place.geometry.location);
                map.setZoom(16);
                
                // Update marker position
                updateMarkerPosition(place.geometry.location);
                
                // Update form fields
                updateFormFields(place);
            } else {
                console.error('No results found');
                alert('Tidak dapat menemukan lokasi yang dicari.');
            }
        });
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
    
    // Locate user's current position
    function locateUser() {
        const btn = document.getElementById('locateMeBtn');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari lokasi...';
        
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
                    updateMarkerPosition(pos);
                    
                    // Update address fields
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
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            alert('Browser Anda tidak mendukung geolokasi');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    
    // Form submission
    document.getElementById('weddingDetailsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        
        // Get form data
        const formData = {
            eventName: form.eventName.value,
            venueName: form.venueName.value,
            eventDate: form.eventDate.value,
            eventTime: form.eventTime.value,
            fullAddress: form.fullAddress.value,
            province: form.province.value,
            city: form.city.value,
            district: form.district.value,
            postalCode: form.postalCode.value,
            estimatedGuests: form.estimatedGuests.value,
            dressCode: form.dressCode.value,
            additionalNotes: form.additionalNotes.value,
            location: {
                lat: marker.getPosition().lat(),
                lng: marker.getPosition().lng()
            }
        };
        
        console.log('Form data:', formData);
        
        // Simulate API call
        setTimeout(() => {
            // Show success message
            const successHtml = `
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    <h3>Data Berhasil Disimpan!</h3>
                    <p>Detail acara pernikahan Anda telah berhasil disimpan.</p>
                </div>
            `;
            
            form.insertAdjacentHTML('beforebegin', successHtml);
            
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
            // Scroll to success message
            document.querySelector('.success-message').scrollIntoView({ behavior: 'smooth' });
            
            // Redirect to next page after 2 seconds
            setTimeout(() => {
                // window.location.href = 'guest-list.html';
            }, 2000);
            
        }, 1500);
    });
    
    // Save draft button
    document.getElementById('saveDraftBtn').addEventListener('click', function() {
        // Similar to form submission but with draft flag
        const form = document.getElementById('weddingDetailsForm');
        const formData = {
            // Same as above
        };
        
        console.log('Saving draft:', formData);
        showToast('Draft berhasil disimpan');
    });
    
    // Show toast notification
    function showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.className = 'toast show';
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Initialize date picker with min date as tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateInput = document.getElementById('eventDate');
    dateInput.min = tomorrow.toISOString().split('T')[0];
    
    // Set default time to 10:00
    document.getElementById('eventTime').value = '10:00';
    
    // Initialize the map when the window loads
    window.initMap = initMap;
});
