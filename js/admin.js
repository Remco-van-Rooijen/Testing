/**
 * Admin Dashboard JavaScript
 * Handles booking management, services, settings, and statistics
 */

// ===== Global Variables =====
let bookings = [];
let services = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentBookingId = null;
let charts = {};

// ===== DOM Content Loaded =====
document.addEventListener('DOMContentLoaded', function() {
    initAdminNavigation();
    initBookingsSection();
    initServicesSection();
    initSettingsSection();
    initStatisticsSection();
    initModals();
    initToast();
    loadData();
});

// ===== Load Data =====
async function loadData() {
    try {
        // Load bookings
        const bookingsResponse = await fetch('../data/bookings.json');
        if (bookingsResponse.ok) {
            bookings = await bookingsResponse.json();
        }
        
        // Load services
        const servicesResponse = await fetch('../data/services.json');
        if (servicesResponse.ok) {
            services = await servicesResponse.json();
        }
        
        // Initialize sections with loaded data
        renderBookings();
        renderServices();
        renderStatistics();
        populateServiceFilter();
        updateBookingStats();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data. Please refresh the page.', 'error');
    }
}

// ===== Admin Navigation =====
function initAdminNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked
            this.parentElement.classList.add('active');
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
            
            // Load section-specific data if needed
            if (targetId === 'bookings') {
                renderBookings();
            } else if (targetId === 'services') {
                renderServices();
            } else if (targetId === 'statistics') {
                renderStatistics();
            }
        });
    });
}

// ===== Bookings Section =====
function initBookingsSection() {
    // Filter handlers
    document.getElementById('statusFilter').addEventListener('change', renderBookings);
    document.getElementById('serviceFilter').addEventListener('change', renderBookings);
    document.getElementById('dateFilter').addEventListener('change', renderBookings);
    document.getElementById('searchBookings').addEventListener('input', renderBookings);
    
    // Refresh button
    document.getElementById('refreshBookings').addEventListener('click', function() {
        loadData();
        showToast('Bookings refreshed successfully!', 'success');
    });
    
    // Export button
    document.getElementById('exportBookings').addEventListener('click', exportBookingsToCSV);
    
    // Pagination buttons
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderBookings();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', function() {
        const totalPages = Math.ceil(getFilteredBookings().length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderBookings();
        }
    });
}

function populateServiceFilter() {
    const serviceFilter = document.getElementById('serviceFilter');
    const currentValue = serviceFilter.value;
    
    // Clear existing options (except first)
    while (serviceFilter.options.length > 1) {
        serviceFilter.remove(1);
    }
    
    // Add service options
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.name.toLowerCase().replace(/\s+/g, '-');
        option.textContent = service.name;
        serviceFilter.appendChild(option);
    });
    
    // Restore selected value
    serviceFilter.value = currentValue;
}

function getFilteredBookings() {
    const statusFilter = document.getElementById('statusFilter').value;
    const serviceFilter = document.getElementById('serviceFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchQuery = document.getElementById('searchBookings').value.toLowerCase();
    
    return bookings.filter(booking => {
        // Status filter
        if (statusFilter !== 'all' && booking.status !== statusFilter) {
            return false;
        }
        
        // Service filter
        if (serviceFilter !== 'all') {
            const serviceName = services.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === serviceFilter)?.name;
            if (serviceName && booking.service !== serviceName) {
                return false;
            }
        }
        
        // Date filter
        if (dateFilter && booking.date !== dateFilter) {
            return false;
        }
        
        // Search filter
        if (searchQuery) {
            const searchableText = [
                booking.customerName,
                booking.customerEmail,
                booking.service,
                booking.notes
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchQuery)) {
                return false;
            }
        }
        
        return true;
    });
}

function renderBookings() {
    const filteredBookings = getFilteredBookings();
    const tableBody = document.getElementById('bookingsTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    if (paginatedBookings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="9" class="loading-message">
                <i class="fas fa-inbox"></i> No bookings found
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        paginatedBookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.customerName}</td>
                <td>${booking.customerEmail}</td>
                <td>${booking.service}</td>
                <td>${formatDate(booking.date)}</td>
                <td>${booking.time}</td>
                <td>${booking.duration} min</td>
                <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-button view" title="View" onclick="viewBooking('${booking.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-button edit" title="Edit" onclick="editBooking('${booking.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-button delete" title="Delete" onclick="deleteBooking('${booking.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-button resend" title="Resend ICS" onclick="resendICS('${booking.id}')">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Update pagination
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
    
    // Update stats
    updateBookingStats();
}

function updateBookingStats() {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    document.getElementById('totalBookings').textContent = total;
    document.getElementById('confirmedBookings').textContent = confirmed;
    document.getElementById('pendingBookings').textContent = pending;
    document.getElementById('cancelledBookings').textContent = cancelled;
}

function viewBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    currentBookingId = bookingId;
    const modal = document.getElementById('bookingModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Booking #${booking.id}`;
    
    modalBody.innerHTML = `
        <div class="booking-details">
            <div class="detail-row">
                <span class="detail-label">Customer Name:</span>
                <span class="detail-value">${booking.customerName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${booking.customerEmail}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${booking.service}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formatDate(booking.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${booking.time} (${booking.duration} min)</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge ${booking.status}">${booking.status}</span></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Created:</span>
                <span class="detail-value">${formatDateTime(booking.createdAt)}</span>
            </div>
            <div class="detail-row full-width">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${booking.notes || 'No notes'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">ICS Sent:</span>
                <span class="detail-value">${booking.icsSent ? 'Yes' : 'No'}</span>
            </div>
        </div>
    `;
    
    // Hide save button for view mode
    document.getElementById('saveModal').style.display = 'none';
    document.getElementById('cancelModal').textContent = 'Close';
    
    modal.classList.add('active');
}

function editBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    currentBookingId = bookingId;
    const modal = document.getElementById('bookingModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Edit Booking #${booking.id}`;
    
    modalBody.innerHTML = `
        <div class="booking-details">
            <div class="edit-field">
                <label for="editCustomerName">Customer Name</label>
                <input type="text" id="editCustomerName" value="${booking.customerName}">
            </div>
            <div class="edit-field">
                <label for="editCustomerEmail">Email</label>
                <input type="email" id="editCustomerEmail" value="${booking.customerEmail}">
            </div>
            <div class="edit-field">
                <label for="editService">Service</label>
                <select id="editService">
                    ${services.map(service => 
                        `<option value="${service.name}" ${service.name === booking.service ? 'selected' : ''}>${service.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="edit-field">
                <label for="editDate">Date</label>
                <input type="date" id="editDate" value="${booking.date}">
            </div>
            <div class="edit-field">
                <label for="editTime">Time</label>
                <input type="time" id="editTime" value="${booking.time}">
            </div>
            <div class="edit-field">
                <label for="editDuration">Duration (minutes)</label>
                <input type="number" id="editDuration" value="${booking.duration}" min="15" step="15">
            </div>
            <div class="edit-field">
                <label for="editStatus">Status</label>
                <select id="editStatus">
                    <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div class="edit-field">
                <label for="editNotes">Notes</label>
                <textarea id="editNotes" rows="3">${booking.notes || ''}</textarea>
            </div>
        </div>
    `;
    
    // Show save button for edit mode
    document.getElementById('saveModal').style.display = 'inline-flex';
    document.getElementById('cancelModal').textContent = 'Cancel';
    
    modal.classList.add('active');
}

function saveBooking() {
    if (!currentBookingId) return;
    
    const bookingIndex = bookings.findIndex(b => b.id === currentBookingId);
    if (bookingIndex === -1) return;
    
    const updatedBooking = {
        ...bookings[bookingIndex],
        customerName: document.getElementById('editCustomerName').value,
        customerEmail: document.getElementById('editCustomerEmail').value,
        service: document.getElementById('editService').value,
        date: document.getElementById('editDate').value,
        time: document.getElementById('editTime').value,
        duration: document.getElementById('editDuration').value,
        status: document.getElementById('editStatus').value,
        notes: document.getElementById('editNotes').value
    };
    
    bookings[bookingIndex] = updatedBooking;
    
    // Save to file
    saveBookingsToFile();
    
    // Close modal
    closeModal();
    
    // Refresh table
    renderBookings();
    
    showToast('Booking updated successfully!', 'success');
}

function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        return;
    }
    
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return;
    
    bookings.splice(bookingIndex, 1);
    
    // Save to file
    saveBookingsToFile();
    
    // Refresh table
    renderBookings();
    
    showToast('Booking deleted successfully!', 'success');
}

function resendICS(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    
    // Mark as sent
    booking.icsSent = true;
    saveBookingsToFile();
    
    // Generate and download ICS file
    generateICSFile(booking);
    
    showToast('ICS file generated! Check your downloads.', 'success');
}

// ===== Services Section =====
function initServicesSection() {
    document.getElementById('addServiceBtn').addEventListener('click', function() {
        currentBookingId = null;
        document.getElementById('serviceModalTitle').textContent = 'Add Service';
        document.getElementById('serviceId').value = '';
        document.getElementById('serviceName').value = '';
        document.getElementById('serviceDescription').value = '';
        document.getElementById('serviceDuration').value = '60';
        document.getElementById('servicePrice').value = '€0.00';
        document.getElementById('serviceColor').value = '#2563eb';
        document.getElementById('serviceModal').classList.add('active');
    });
    
    document.getElementById('serviceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveService();
    });
    
    document.getElementById('cancelServiceModal').addEventListener('click', function() {
        document.getElementById('serviceModal').classList.remove('active');
    });
}

function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" style="border-left-color: ${service.color}">
            <div class="service-card-header">
                <h3>${service.name}</h3>
                <span class="service-price">${service.price}</span>
            </div>
            <p class="service-description">${service.description}</p>
            <div class="service-meta">
                <span><i class="fas fa-clock"></i> ${service.duration} min</span>
                <span><i class="fas fa-palette"></i> ${service.color}</span>
            </div>
            <div class="service-actions">
                <button class="secondary-button" onclick="editService('${service.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="secondary-button" onclick="deleteService('${service.id}')" style="background: #fee2e2; color: #991b1b;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function editService(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    currentBookingId = serviceId;
    document.getElementById('serviceModalTitle').textContent = 'Edit Service';
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceDescription').value = service.description;
    document.getElementById('serviceDuration').value = service.duration;
    document.getElementById('servicePrice').value = service.price;
    document.getElementById('serviceColor').value = service.color;
    document.getElementById('serviceModal').classList.add('active');
}

function saveService() {
    const serviceId = document.getElementById('serviceId').value;
    const serviceData = {
        id: serviceId || Date.now().toString(),
        name: document.getElementById('serviceName').value,
        description: document.getElementById('serviceDescription').value,
        duration: document.getElementById('serviceDuration').value,
        price: document.getElementById('servicePrice').value,
        color: document.getElementById('serviceColor').value
    };
    
    if (serviceId) {
        // Update existing service
        const serviceIndex = services.findIndex(s => s.id === serviceId);
        if (serviceIndex !== -1) {
            services[serviceIndex] = serviceData;
        }
    } else {
        // Add new service
        services.push(serviceData);
    }
    
    // Save to file
    saveServicesToFile();
    
    // Close modal
    document.getElementById('serviceModal').classList.remove('active');
    
    // Refresh services
    renderServices();
    populateServiceFilter();
    
    showToast(`Service ${serviceId ? 'updated' : 'added'} successfully!`, 'success');
}

function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service? This will affect existing bookings.')) {
        return;
    }
    
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    if (serviceIndex === -1) return;
    
    services.splice(serviceIndex, 1);
    
    // Save to file
    saveServicesToFile();
    
    // Refresh services
    renderServices();
    populateServiceFilter();
    
    showToast('Service deleted successfully!', 'success');
}

// ===== Settings Section =====
function initSettingsSection() {
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
}

function saveSettings() {
    const settings = {
        businessName: document.getElementById('businessName').value,
        businessEmail: document.getElementById('businessEmail').value,
        timeZone: document.getElementById('timeZone').value,
        defaultDuration: document.getElementById('defaultDuration').value,
        bufferTime: document.getElementById('bufferTime').value,
        maxBookingsPerDay: document.getElementById('maxBookingsPerDay').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        workingDays: Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked'))
            .map(cb => cb.nextElementSibling.textContent.trim())
    };
    
    // Save to localStorage
    localStorage.setItem('consultingSettings', JSON.stringify(settings));
    
    showToast('Settings saved successfully!', 'success');
}

// ===== Statistics Section =====
function initStatisticsSection() {
    document.getElementById('statsDateRange').addEventListener('change', renderStatistics);
}

function renderStatistics() {
    const dateRange = document.getElementById('statsDateRange').value;
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
    }
    
    const filteredBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= startDate;
    });
    
    // Calculate statistics
    const serviceCounts = {};
    const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let totalRevenue = 0;
    const servicePrices = {};
    
    services.forEach(s => {
        servicePrices[s.name] = parseFloat(s.price.replace(/[^\d.]/g, ''));
    });
    
    filteredBookings.forEach(b => {
        // Service counts
        serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1;
        
        // Day counts
        const bookingDate = new Date(b.date);
        const dayOfWeek = bookingDate.getDay();
        dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
        
        // Revenue
        const price = servicePrices[b.service] || 0;
        totalRevenue += price;
    });
    
    // Update revenue stats
    document.getElementById('totalRevenue').textContent = `€${totalRevenue.toFixed(2)}`;
    
    const avgBookingValue = filteredBookings.length > 0 ? totalRevenue / filteredBookings.length : 0;
    document.getElementById('avgBookingValue').textContent = `€${avgBookingValue.toFixed(2)}`;
    
    // Find most popular service
    const popularService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    document.getElementById('popularService').textContent = popularService;
    
    // Render charts
    renderServiceChart(serviceCounts);
    renderDayChart(dayCounts);
}

function renderServiceChart(serviceCounts) {
    const ctx = document.getElementById('serviceChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.serviceChart) {
        charts.serviceChart.destroy();
    }
    
    const labels = Object.keys(serviceCounts);
    const data = Object.values(serviceCounts);
    
    charts.serviceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#2563eb',
                    '#7c3aed',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#06b6d4',
                    '#8b5cf6'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderDayChart(dayCounts) {
    const ctx = document.getElementById('dayChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.dayChart) {
        charts.dayChart.destroy();
    }
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const data = days.map((day, index) => dayCounts[index] || 0);
    
    charts.dayChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Bookings',
                data: data,
                backgroundColor: '#2563eb',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ===== Modals =====
function initModals() {
    // Booking modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    document.getElementById('saveModal').addEventListener('click', saveBooking);
    
    // Close modal when clicking outside
    document.getElementById('bookingModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Service modal
    document.getElementById('closeServiceModal').addEventListener('click', function() {
        document.getElementById('serviceModal').classList.remove('active');
    });
    document.getElementById('cancelServiceModal').addEventListener('click', function() {
        document.getElementById('serviceModal').classList.remove('active');
    });
    
    // Close service modal when clicking outside
    document.getElementById('serviceModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
}

function closeModal() {
    document.getElementById('bookingModal').classList.remove('active');
    currentBookingId = null;
}

// ===== Toast Notifications =====
function initToast() {
    // Toast is already in HTML
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    // Update icon based on type
    if (type === 'error') {
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
    } else {
        toastIcon.className = 'toast-icon fas fa-check-circle';
    }
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== File Operations =====
async function saveBookingsToFile() {
    try {
        // In a real application, you would send this to a server
        // For this demo, we'll use localStorage as a fallback
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Also try to save to file (works in some environments)
        const blob = new Blob([JSON.stringify(bookings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bookings.json';
        a.click();
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error saving bookings:', error);
    }
}

async function saveServicesToFile() {
    try {
        localStorage.setItem('services', JSON.stringify(services));
        
        // Also try to save to file
        const blob = new Blob([JSON.stringify(services, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'services.json';
        a.click();
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error saving services:', error);
    }
}

// ===== Export Functions =====
function exportBookingsToCSV() {
    const headers = ['ID', 'Customer Name', 'Email', 'Service', 'Date', 'Time', 'Duration', 'Status', 'Notes', 'Created At'];
    
    const csvContent = [
        headers.join(','),
        ...bookings.map(booking => [
            booking.id,
            `"${booking.customerName}"`,
            `"${booking.customerEmail}"`,
            `"${booking.service}"`,
            booking.date,
            booking.time,
            booking.duration,
            booking.status,
            `"${booking.notes || ''}"`,
            booking.createdAt
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Bookings exported to CSV successfully!', 'success');
}

// ===== ICS File Generation =====
function generateICSFile(booking) {
    const startDate = new Date(`${booking.date}T${booking.time}`);
    const endDate = new Date(startDate.getTime() + booking.duration * 60000);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Remco van Rooijen Consulting//SAFe Consultation//EN
BEGIN:VEVENT
UID:${booking.id}@remcovarrooijen-consulting.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\./g, '')}
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').replace(/\./g, '')}
DTEND:${endDate.toISOString().replace(/[-:]/g, '').replace(/\./g, '')}
SUMMARY:${booking.service} - ${booking.customerName}
DESCRIPTION:Consultation with Remco van Rooijen\n\nService: ${booking.service}\nDuration: ${booking.duration} minutes\nNotes: ${booking.notes || 'None'}
LOCATION:Online / Amsterdam, Netherlands
ORGANIZER:mailto:remco.vanrooijen@email.com
ATTENDEE:mailto:${booking.customerEmail}
STATUS:${booking.status.toUpperCase()}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation_${booking.id}_${booking.date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}

// ===== Utility Functions =====
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatDateTime(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// ===== Make functions globally available =====
window.viewBooking = viewBooking;
window.editBooking = editBooking;
window.deleteBooking = deleteBooking;
window.resendICS = resendICS;
window.editService = editService;
window.deleteService = deleteService;
