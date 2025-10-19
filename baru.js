// Global Variables
let saldo = 750000;
let map;
let currentTheme = 'light';
let chart;

// Initialize on page load
window.onload = function() {
  initMap();
  initChart();
  showPromo();
  loadTheme();
};

// Saldo Management
function tambahSaldo() {
  saldo += 50000;
  updateSaldo();
  showNotification('Saldo berhasil ditambah Rp 50.000', 'success');
}

function kurangiSaldo() {
  if (saldo >= 50000) {
    saldo -= 50000;
    updateSaldo();
    showNotification('Saldo berhasil dikurangi Rp 50.000', 'info');
  } else {
    showNotification('Saldo tidak mencukupi', 'error');
  }
}

function updateSaldo() {
  const saldoElement = document.getElementById('saldo');
  if (saldoElement) {
    saldoElement.textContent = `Rp ${saldo.toLocaleString('id-ID')}`;
    
    // Add animation
    saldoElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
      saldoElement.style.transform = 'scale(1)';
    }, 200);
  }
}

// Theme Toggle
function toggleTheme() {
  const body = document.body;
  const themeBtn = document.querySelector('.toggle-theme i');
  
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    themeBtn.classList.remove('fa-moon');
    themeBtn.classList.add('fa-sun');
    currentTheme = 'dark';
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    themeBtn.classList.remove('fa-sun');
    themeBtn.classList.add('fa-moon');
    currentTheme = 'light';
  }
  
  saveTheme();
}

function saveTheme() {
  // Save to memory (not localStorage as per instructions)
  window.userTheme = currentTheme;
}

function loadTheme() {
  // Load from memory if available
  if (window.userTheme) {
    currentTheme = window.userTheme;
    const body = document.body;
    const themeBtn = document.querySelector('.toggle-theme i');
    
    if (currentTheme === 'dark') {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
      themeBtn.classList.remove('fa-moon');
      themeBtn.classList.add('fa-sun');
    }
  }
}

// Map Initialization
function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;
  
  // Coordinates for Parepare, Sulawesi Selatan
  const parepareCoords = [-4.0025, 119.6402];
  
  map = L.map('map').setView(parepareCoords, 14);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);
  
  // Define halte locations
  const halteLocations = [
    { 
      coords: [-4.0025, 119.6402], 
      name: 'Halte Utama - Kampus ITH',
      info: 'Halte utama dengan fasilitas lengkap'
    },
    { 
      coords: [-4.0050, 119.6350], 
      name: 'Halte Pasar Sentral',
      info: 'Dekat dengan pusat perbelanjaan'
    },
    { 
      coords: [-4.0100, 119.6450], 
      name: 'Halte Terminal Barat',
      info: 'Terminal angkutan antar kota'
    },
    { 
      coords: [-3.9980, 119.6380], 
      name: 'Halte Pelabuhan',
      info: 'Akses ke pelabuhan laut'
    },
    { 
      coords: [-4.0070, 119.6420], 
      name: 'Halte Rumah Sakit',
      info: 'Dekat RS Umum Parepare'
    }
  ];
  
  // Add markers for each halte
  halteLocations.forEach((halte, index) => {
    const marker = L.marker(halte.coords).addTo(map);
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>${halte.name}</strong><br>
        <small>${halte.info}</small><br>
        <button onclick="routeToHalte(${index})" style="margin-top: 8px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Rute ke sini
        </button>
      </div>
    `);
    
    // Store marker reference
    if (!window.halteMarkers) window.halteMarkers = [];
    window.halteMarkers.push(marker);
  });
  
  // Add user location marker
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const userCoords = [position.coords.latitude, position.coords.longitude];
      L.marker(userCoords, {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div style="background: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20]
        })
      }).addTo(map).bindPopup('Lokasi Anda');
      
      window.userLocation = userCoords;
    });
  }
}

function centerMap() {
  if (window.userLocation) {
    map.setView(window.userLocation, 15);
    showNotification('Peta dipusatkan ke lokasi Anda', 'info');
  } else {
    showNotification('Lokasi tidak tersedia', 'error');
  }
}

function showAllHalte() {
  const bounds = L.latLngBounds();
  if (window.halteMarkers) {
    window.halteMarkers.forEach(marker => {
      bounds.extend(marker.getLatLng());
    });
    map.fitBounds(bounds, { padding: [50, 50] });
    showNotification('Menampilkan semua halte', 'info');
  }
}

function routeToHalte(index) {
  showNotification(`Membuat rute ke halte ${index + 1}...`, 'success');
  // In a real app, this would integrate with routing API
}

function toggleFullscreen() {
  const mapElement = document.getElementById('map');
  if (mapElement.style.height === '600px') {
    mapElement.style.height = '400px';
    showNotification('Mode normal', 'info');
  } else {
    mapElement.style.height = '600px';
    showNotification('Mode layar penuh', 'info');
  }
  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

// Chart Initialization
function initChart() {
  const canvas = document.getElementById('chartSupir');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
      datasets: [{
        label: 'Pendapatan (Rp 1000)',
        data: [200, 300, 250, 400],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(255, 87, 108, 0.8)',
          'rgba(40, 167, 69, 0.8)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(255, 87, 108, 1)',
          'rgba(40, 167, 69, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Rp ' + (context.parsed.y * 1000).toLocaleString('id-ID');
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rp ' + (value * 1000).toLocaleString('id-ID');
            }
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart'
      }
    }
  });
}

function updateChart() {
  const month = document.getElementById('monthSelector').value;
  
  // Simulated data for different months
  const monthData = {
    '10': [200, 300, 250, 400],
    '9': [180, 280, 230, 350],
    '8': [220, 310, 270, 420]
  };
  
  if (chart) {
    chart.data.datasets[0].data = monthData[month];
    chart.update();
    
    // Update summary
    const total = monthData[month].reduce((a, b) => a + b, 0);
    document.getElementById('totalTrips').textContent = Math.floor(total / 3);
    document.getElementById('totalEarnings').textContent = 'Rp ' + total + 'K';
  }
  
  showNotification('Data diperbarui', 'info');
}

// Promo Popup
function showPromo() {
  const popup = document.getElementById('promoPopup');
  if (popup) {
    setTimeout(() => {
      popup.style.display = 'block';
    }, 2000);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      popup.style.display = 'none';
    }, 7000);
  }
}

function closePromo() {
  const popup = document.getElementById('promoPopup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// Navigation
function showNavigasi() {
  const mapSection = document.querySelector('.map-section');
  if (mapSection) {
    mapSection.scrollIntoView({ behavior: 'smooth' });
    showNotification('Menampilkan peta navigasi', 'info');
  }
}

// Notification System
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${getIconForType(type)}"></i>
    <span>${message}</span>
  `;
  
  // Style notification
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: getColorForType(type),
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    animation: 'slideInRight 0.3s ease',
    maxWidth: '300px'
  });
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function getIconForType(type) {
  const icons = {
    success: 'check-circle',
    error: 'exclamation-circle',
    info: 'info-circle',
    warning: 'exclamation-triangle'
  };
  return icons[type] || 'info-circle';
}

function getColorForType(type) {
  const colors = {
    success: '#28a745',
    error: '#dc3545',
    info: '#17a2b8',
    warning: '#ffc107'
  };
  return colors[type] || '#17a2b8';
}

// Search functionality
const searchBar = document.getElementById('searchBar');
if (searchBar) {
  searchBar.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    if (query.length > 2) {
      // In a real app, this would search through halte locations
      console.log('Searching for:', query);
    }
  });
  
  searchBar.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const query = e.target.value;
      if (query.trim()) {
        showNotification(`Mencari: ${query}`, 'info');
        // Implement search logic here
      }
    }
  });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Update stats periodically
setInterval(() => {
  // Simulate real-time updates
  const stats = {
    users: Math.floor(2500 + Math.random() * 100),
    routes: 12,
    halte: 45
  };
  
  const usersStat = document.querySelector('.stat-number');
  if (usersStat) {
    usersStat.textContent = stats.users.toLocaleString('id-ID');
  }
}, 30000); // Update every 30 seconds

// Handle offline/online status
window.addEventListener('online', () => {
  showNotification('Koneksi internet tersambung', 'success');
});

window.addEventListener('offline', () => {
  showNotification('Koneksi internet terputus', 'error');
});

console.log('PAAPET App initialized successfully!');