document.addEventListener('DOMContentLoaded', function() {
    // Feature data with prices (in IDR)
    const features = {
        custom_music: {
            name: 'Musik Kustom',
            price: 99000,
            type: 'undangan'
        },
        dress_code: {
            name: 'Kode Busana Kustom',
            price: 49000,
            type: 'undangan'
        },
        gift_registry: {
            name: 'Daftar Hadiah',
            price: 149000,
            type: 'undangan'
        },
        live_stream: {
            name: 'Live Streaming',
            price: 199000,
            type: 'acara'
        },
        photo_gallery: {
            name: 'Galeri Foto',
            price: 129000,
            type: 'undangan'
        },
        rsvp_management: {
            name: 'Manajemen RSVP',
            price: 79000,
            type: 'undangan'
        },
        custom_domain: {
            name: 'Domain Kustom',
            price: 299000,
            type: 'tahun'
        }
    };

    // Base package price
    const BASE_PRICE = 299000;
    let totalAmount = BASE_PRICE;
    let selectedFeatures = [];

    // DOM Elements
    const form = document.getElementById('featuresForm');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const selectedFeaturesContainer = document.getElementById('selectedFeatures');
    const totalAmountElement = document.getElementById('totalAmount');
    const backBtn = document.getElementById('backBtn');
    const editPackageBtn = document.getElementById('editPackage');

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }


    // Update selected features and total amount
    function updateSelectedFeatures() {
        selectedFeaturesContainer.innerHTML = '';
        let featuresTotal = 0;
        
        // Add each selected feature to the summary
        selectedFeatures.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-summary-item';
            featureItem.innerHTML = `
                <span>${feature.name}</span>
                <span>${formatCurrency(feature.price)}</span>
            `;
            selectedFeaturesContainer.appendChild(featureItem);
            featuresTotal += feature.price;
        });
        
        // Update total amount
        totalAmount = BASE_PRICE + featuresTotal;
        totalAmountElement.textContent = formatCurrency(totalAmount);
    }


    // Handle checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const featureId = this.name;
            const feature = features[featureId];
            
            if (this.checked) {
                // Add to selected features
                selectedFeatures.push({
                    id: featureId,
                    name: feature.name,
                    price: feature.price,
                    type: feature.type
                });
            } else {
                // Remove from selected features
                selectedFeatures = selectedFeatures.filter(f => f.id !== featureId);
            }
            
            updateSelectedFeatures();
        });
    });


    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Save selected features to localStorage or send to server
        const formData = {
            selectedFeatures: selectedFeatures,
            totalAmount: totalAmount
        };
        
        console.log('Form submitted:', formData);
        
        // For demo purposes, just show an alert
        alert('Fitur berhasil dipilih! Total biaya: ' + formatCurrency(totalAmount));
        
        // In a real app, you would redirect to the payment page
        // window.location.href = 'checkout.html';
    });

    // Handle back button click
    backBtn.addEventListener('click', function() {
        // Go back to the previous page
        window.history.back();
    });

    // Handle edit package button
    editPackageBtn.addEventListener('click', function() {
        // Scroll to the top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initialize the summary
    updateSelectedFeatures();

    // Add animation class when scrolling to features
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
});
