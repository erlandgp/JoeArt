document.addEventListener('DOMContentLoaded', function() {
    // Complete city data by province for Indonesia
    const citiesByProvince = {
        'DKI Jakarta': [
            'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Selatan', 
            'Jakarta Timur', 'Jakarta Utara', 'Kepulauan Seribu'
        ],
        'Jawa Barat': [
            'Bandung', 'Bekasi', 'Bogor', 'Cimahi', 'Cirebon', 'Depok',
            'Sukabumi', 'Tasikmalaya', 'Banjar', 'Bekasi', 'Bogor',
            'Ciamis', 'Cianjur', 'Cirebon', 'Garut', 'Indramayu',
            'Karawang', 'Kuningan', 'Majalengka', 'Pangandaran', 'Purwakarta',
            'Subang', 'Sukabumi', 'Sumedang', 'Tasikmalaya'
        ],
        'Jawa Tengah': [
            'Semarang', 'Surakarta', 'Magelang', 'Pekalongan', 'Salatiga',
            'Tegal', 'Banjarnegara', 'Banyumas', 'Batang', 'Blora',
            'Boyolali', 'Brebes', 'Cilacap', 'Demak', 'Grobogan',
            'Jepara', 'Karanganyar', 'Kebumen', 'Kendal', 'Klaten',
            'Kudus', 'Pati', 'Pekalongan', 'Pemalang', 'Purbalingga',
            'Purworejo', 'Rembang', 'Semarang', 'Sragen', 'Sukoharjo',
            'Tegal', 'Temanggung', 'Wonogiri', 'Wonosobo'
        ],
        'Jawa Timur': [
            'Surabaya', 'Malang', 'Batu', 'Blitar', 'Kediri',
            'Madiun', 'Mojokerto', 'Pasuruan', 'Probolinggo', 'Bangkalan',
            'Banyuwangi', 'Bojonegoro', 'Bondowoso', 'Gresik', 'Jember',
            'Jombang', 'Kediri', 'Lamongan', 'Lumajang', 'Madiun',
            'Magetan', 'Mojokerto', 'Nganjuk', 'Ngawi', 'Pacitan',
            'Pamekasan', 'Pasuruan', 'Ponorogo', 'Probolinggo', 'Sampang',
            'Sidoarjo', 'Situbondo', 'Sumenep', 'Trenggalek', 'Tuban',
            'Tulungagung'
        ],
        'Bali': [
            'Denpasar', 'Badung', 'Bangli', 'Buleleng', 'Gianyar',
            'Jembrana', 'Karangasem', 'Klungkung', 'Tabanan'
        ],
        'Yogyakarta': [
            'Yogyakarta', 'Bantul', 'Gunung Kidul', 'Kulon Progo', 'Sleman'
        ]
        // Add more provinces and their cities as needed
    };

    // Get DOM elements
    const provinceSelect = document.getElementById('eventProvince');
    const citySelect = document.getElementById('eventCity');
    
    // Function to update city dropdown based on selected province
    function updateCityDropdown() {
        const selectedProvince = provinceSelect.value;
        const cities = citiesByProvince[selectedProvince] || [];
        
        // Clear existing options except the first one (placeholder)
        while (citySelect.options.length > 1) {
            citySelect.remove(1);
        }
        
        // Add new city options
        if (cities.length > 0) {
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
        } else {
            // If no cities found for the province
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Pilih Kota/Kabupaten';
            option.disabled = true;
            option.selected = true;
            citySelect.appendChild(option);
            citySelect.disabled = true;
        }
    }


    // Initialize city dropdown on page load if a province is already selected
    if (provinceSelect.value) {
        updateCityDropdown();
    } else {
        // Disable city select by default
        citySelect.disabled = true;
    }

    // Update city dropdown when province changes
    provinceSelect.addEventListener('change', updateCityDropdown);
});
