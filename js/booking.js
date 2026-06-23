/**
 * Booking System JavaScript
 * Handles service selection, calendar, time slots, and booking submission
 */

// ===== Global Variables =====
let services = [];
let bookings = [];
let selectedService = null;
let selectedDate = null;
let selectedTime = null;
let currentMonth = new Date();
let currentYear = new Date().getFullYear();
let settings = {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '17:00',
    bufferTime: 15,
    timeZone: 'Europe/Amsterdam'
};

// ===== DOM Content Loaded =====
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initCalendar();
    initTimeSlots();
    initBookingForm();
    initModals();
    initBackToTop();
});

async function loadData() {
    try {
        // Load services
        const servicesResponse = await fetch('../data/services.json');
        if (servicesResponse.ok) {
            services = await servicesResponse.json();
            renderServices();
        }
        
        // Load bookings
        const bookingsResponse = await fetch('../data/bookings.json');
        if (bookingsResponse.ok) {
            bookings = await bookingsResponse.json();
            renderCalendar();
            updateTimeSlots();
        }
        
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('consultingSettings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const savedServices = localStorage.getItem('services');
        if (savedServices) {
            services = JSON.parse(savedServices);
            renderServices();
        }
        const savedBookings = localStorage.getItem('bookings');
        if (savedBookings) {
            bookings = JSON.parse(savedBookings);
            renderCalendar();
            updateTimeSlots();
        }
    }
}
=======
// ===== Load Data =====
async function loadData() {
    try {
        // Try to load from API first
        const servicesResponse = await fetch('/api/services');
        if (servicesResponse.ok) {
            services = await servicesResponse.json();
            renderServices();
        }
        
        const bookingsResponse = await fetch('/api/bookings');
        if (bookingsResponse.ok) {
            bookings = await bookingsResponse.json();
            renderCalendar();
            updateTimeSlots();
        }
        
        const settingsResponse = await fetch('/api/settings');
        if (settingsResponse.ok) {
            const apiSettings = await settingsResponse.json();
            settings = { ...settings, ...apiSettings };
        }
        
    } catch (error) {
        console.error('Error loading data from API:', error);
        // Fallback to local files (for development without server)
        try {
            const servicesResponse = await fetch('../data/services.json');
            if (servicesResponse.ok) {
                services = await servicesResponse.json();
                renderServices();
            }
            
            const bookingsResponse = await fetch('../data/bookings.json');
            if (bookingsResponse.ok) {
                bookings = await bookingsResponse.json();
                renderCalendar();
                updateTimeSlots();
            }
            
            const savedSettings = localStorage.getItem('consultingSettings');
            if (savedSettings) {
                settings = { ...settings, ...JSON.parse(savedSettings) };
            }
        } catch (fallbackError) {
            console.error('Error loading fallback data:', fallbackError);
        }
    }
}=====
async function loadData() {
    try {
        // Load services
        const servicesResponse = await fetch('../data/services.json');
        if (servicesResponse.ok) {
            services = await servicesResponse.json();
            renderServices();
        }
        
        // Load bookings
        const bookingsResponse = await fetch('../data/bookings.json');
        if (bookingsResponse.ok) {
            bookings = await bookingsResponse.json();
            renderCalendar();
            updateTimeSlots();
        }
        
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('consultingSettings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const savedServices = localStorage.getItem('services');
        if (savedServices) {
            services = JSON.parse(savedServices);
            renderServices();
        }
        const savedBookings = localStorage.getItem('bookings');
        if (savedBookings) {
            bookings = JSON.parse(savedBookings);
            renderCalendar();
            updateTimeSlots();
        }
    }
}

// ===== Service Selection =====
function renderServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" data-service-id="${service.id}" onclick="selectService('${service.id}')">
            <div class="service-card-header">
                <h3>${service.name}</h3>
                <span class="service-price">${service.price}</span>
            </div>
            <p class="service-description">${service.description}</p>
            <div class="service-meta">
                <span><i class="fas fa-clock"></i> ${service.duration} min</span>
            </div>
            <div class="service-check">
                <i class="fas fa-${selectedService === service.id ? 'check-circle' : 'circle'}"></i>
                <span>${selectedService === service.id ? 'Selected' : 'Select'}</span>
            </div>
        </div>
    `).join('');
}

function selectService(serviceId) {
    selectedService = serviceId;
    const service = services.find(s => s.id === serviceId);
    
    // Update UI
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.toggle('selected', card.getAttribute('data-service-id') === serviceId);
    });
    
    // Update summary
    updateBookingSummary();
    
    // Enable/disable submit button
    updateSubmitButton();
}

// ===== Calendar =====
function initCalendar() {
    document.getElementById('prevMonth').addEventListener('click', function() {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', function() {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });
    
    renderCalendar();
}

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    currentYear = currentMonth.getFullYear();
    const monthName = monthNames[currentMonth.getMonth()];
    
    document.getElementById('currentMonthYear').textContent = `${monthName} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth.getMonth(), 1);
    const lastDay = new Date(currentYear, currentMonth.getMonth() + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let calendarHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        calendarHTML += '<div class="calendar-day empty other-month"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentYear, currentMonth.getMonth(), day);
        const dateString = formatDateForComparison(date);
        const isToday = date.getTime() === today.getTime();
        const isPast = date < today;
        const isSelected = selectedDate === dateString;
        
        // Check if date is in working days
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const isWorkingDay = settings.workingDays.includes(dayName);
        
        // Check if date has bookings
        const hasBooking = bookings.some(b => b.date === dateString);
        
        let classes = 'calendar-day';
        if (isPast) classes += ' disabled';
        if (!isWorkingDay) classes += ' disabled';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        if (hasBooking) classes += ' has-booking';
        
        calendarHTML += `
            <div class="${classes}" data-date="${dateString}" onclick="selectDate('${dateString}', ${isPast || !isWorkingDay})">
                <div class="calendar-day-number">${day}</div>
            </div>
        `;
    }
    
    // Add empty cells for days after the last day of the month
    const totalCells = startingDay + totalDays;
    const remainingCells = 42 - totalCells; // 6 rows x 7 days
    for (let i = 0; i < remainingCells; i++) {
        calendarHTML += '<div class="calendar-day empty other-month"></div>';
    }
    
    document.getElementById('calendarDays').innerHTML = calendarHTML;
}

function selectDate(dateString, isDisabled) {
    if (isDisabled) return;
    
    selectedDate = dateString;
    selectedTime = null; // Reset time when date changes
    
    // Update calendar UI
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.toggle('selected', day.getAttribute('data-date') === dateString);
    });
    
    // Update date display
    document.getElementById('selectedDate').textContent = formatDateForDisplay(dateString);
    
    // Update time slots
    updateTimeSlots();
    
    // Update summary
    updateBookingSummary();
    
    // Enable/disable submit button
    updateSubmitButton();
}

function formatDateForComparison(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForDisplay(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// ===== Time Slots =====
function initTimeSlots() {
    // Time slots will be updated when date is selected
}

function updateTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    
    if (!selectedDate) {
        timeSlotsContainer.innerHTML = '<p class="no-date-selected">Please select a date first to see available time slots.</p>';
        return;
    }
    
    // Parse settings times
    const [startHours, startMinutes] = settings.startTime.split(':');
    const [endHours, endMinutes] = settings.endTime.split(':');
    
    const startTime = new Date();
    startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
    
    // Generate time slots (every 30 minutes)
    const timeSlots = [];
    const currentTime = new Date();
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === currentTime.toDateString();
    
    for (let time = new Date(startTime); time <= endTime; time.setMinutes(time.getMinutes() + 30)) {
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        
        // Check if time slot is in the past (for today)
        const isPast = isToday && time <= currentTime;
        
        // Check if time slot is booked
        const isBooked = bookings.some(b => 
            b.date === selectedDate && b.time === timeString
        );
        
        // Check if time slot is within buffer time of another booking
        const service = services.find(s => s.id === selectedService);
        const duration = service ? parseInt(service.duration) : 60;
        const bufferTime = parseInt(settings.bufferTime);
        
        let isBufferTime = false;
        if (service) {
            const slotEndTime = new Date(time.getTime() + duration * 60000);
            
            for (const booking of bookings) {
                if (booking.date !== selectedDate) continue;
                
                const bookingTime = new Date(`${booking.date}T${booking.time}`);
                const bookingEndTime = new Date(bookingTime.getTime() + parseInt(booking.duration) * 60000);
                
                // Check for overlap with buffer
                const bufferStart = new Date(bookingTime.getTime() - bufferTime * 60000);
                const bufferEnd = new Date(bookingEndTime.getTime() + bufferTime * 60000);
                
                if ((time >= bufferStart && time < bufferEnd) || 
                    (slotEndTime > bufferStart && slotEndTime <= bufferEnd)) {
                    isBufferTime = true;
                    break;
                }
            }
        }
        
        const isDisabled = isPast || isBooked || isBufferTime;
        const isSelected = selectedTime === timeString;
        
        let classes = 'time-slot';
        if (isDisabled) classes += isBooked ? ' booked' : ' disabled';
        if (isSelected) classes += ' selected';
        
        timeSlots.push(`
            <div class="${classes}" data-time="${timeString}" 
                 onclick="selectTime('${timeString}', ${isDisabled})">
                ${timeString}
            </div>
        `);
    }
    
    timeSlotsContainer.innerHTML = timeSlots.join('');
}

function selectTime(timeString, isDisabled) {
    if (isDisabled) return;
    
    selectedTime = timeString;
    
    // Update UI
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.toggle('selected', slot.getAttribute('data-time') === timeString);
    });
    
    // Update summary
    updateBookingSummary();
    
    // Enable/disable submit button
    updateSubmitButton();
}

// ===== Booking Summary =====
function updateBookingSummary() {
    const summaryContainer = document.getElementById('bookingSummary');
    
    if (!selectedService || !selectedDate || !selectedTime) {
        summaryContainer.innerHTML = '<p>No service or time selected. Please select a service and time slot above.</p>';
        return;
    }
    
    const service = services.find(s => s.id === selectedService);
    
    summaryContainer.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Service:</span>
            <span class="summary-value">${service.name}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Date:</span>
            <span class="summary-value">${formatDateForDisplay(selectedDate)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Time:</span>
            <span class="summary-value">${selectedTime}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Duration:</span>
            <span class="summary-value">${service.duration} minutes</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Price:</span>
            <span class="summary-value">${service.price}</span>
        </div>
    `;
}

// ===== Submit Button State =====
function updateSubmitButton() {
    const submitButton = document.getElementById('submitBooking');
    const isFormValid = selectedService && selectedDate && selectedTime;
    
    submitButton.disabled = !isFormValid;
}

// ===== Booking Form =====
function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitBooking();
    });
    
    document.getElementById('cancelBooking').addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? Your selections will be lost.')) {
            resetBookingForm();
        }
    });
}

function submitBooking() {
    // Validate form
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    
    if (!customerName || !customerEmail) {
        alert('Please fill in all required fields (name and email).');
        return;
    }
    
    if (!validateEmail(customerEmail)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Show loading overlay
    document.getElementById('loadingOverlay').classList.add('active');
    
    // Simulate API call delay
    setTimeout(() => {
        // Create new booking
        const service = services.find(s => s.id === selectedService);
        const newBooking = {
            id: Date.now().toString(),
            customerName,
            customerEmail: customerEmail,
            customerPhone: document.getElementById('customerPhone').value.trim(),
            customerCompany: document.getElementById('customerCompany').value.trim(),
            service: service.name,
            date: selectedDate,
            time: selectedTime,
            duration: service.duration,
            price: service.price,
            notes: document.getElementById('customerNotes').value.trim(),
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            icsSent: false
        };
        
        // Add to bookings (local state)
        bookings.push(newBooking);
        
        // Save to server
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBooking)
            });
            
            if (response.ok) {
                const savedBooking = await response.json();
                // Update local state with server response (including generated ID)
                newBooking.id = savedBooking.id;
            } else {
                console.error('Failed to save booking to server');
                // Fallback to localStorage
                localStorage.setItem('bookings', JSON.stringify(bookings));
            }
        } catch (error) {
            console.error('Error saving to server:', error);
            // Fallback to localStorage
            localStorage.setItem('bookings', JSON.stringify(bookings));
        }
        
        // Generate ICS file
        const icsContent = generateICSContent(newBooking);
        
        // Hide loading overlay
        document.getElementById('loadingOverlay').classList.remove('active');
        
        // Show success modal
        showSuccessModal(newBooking, icsContent);
        
        // Reset form
        resetBookingForm();
        
    }, 1500);
}

function generateICSContent(booking) {
    const startDate = new Date(`${booking.date}T${booking.time}`);
    const endDate = new Date(startDate.getTime() + booking.duration * 60000);
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Remco van Rooijen Consulting//SAFe Consultation//EN
BEGIN:VEVENT
UID:${booking.id}@remcovarrooijen-consulting.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\./g, '')}
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').replace(/\./g, '')}
DTEND:${endDate.toISOString().replace(/[-:]/g, '').replace(/\./g, '')}
SUMMARY:${booking.service} - Consultation with Remco van Rooijen
DESCRIPTION:Consultation with Remco van Rooijen\n\nService: ${booking.service}\nDuration: ${booking.duration} minutes\nPrice: ${booking.price}\n\n${booking.notes ? 'Notes: ' + booking.notes : ''}
LOCATION:Online / Amsterdam, Netherlands
ORGANIZER:mailto:remco.vanrooijen@email.com
ATTENDEE:mailto:${booking.customerEmail}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

function showSuccessModal(booking, icsContent) {
    const modal = document.getElementById('successModal');
    const successDetails = document.getElementById('successDetails');
    
    // Format date and time
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(booking.date).toLocaleDateString('en-US', dateOptions);
    
    successDetails.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Service:</span>
            <span class="detail-value">${booking.service}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${booking.time} (${booking.duration} min)</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Price:</span>
            <span class="detail-value">${booking.price}</span>
        </div>
    `;
    
    // Store icsContent for download
    modal.dataset.icsContent = icsContent;
    modal.dataset.bookingId = booking.id;
    
    modal.classList.add('active');
}

function resetBookingForm() {
    // Reset selections
    selectedService = null;
    selectedDate = null;
    selectedTime = null;
    
    // Reset UI
    document.querySelectorAll('.service-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Reset form fields
    document.getElementById('bookingForm').reset();
    
    // Update UI
    document.getElementById('selectedDate').textContent = 'No date selected';
    updateTimeSlots();
    updateBookingSummary();
    updateSubmitButton();
    
    // Re-render calendar to update has-booking indicators
    renderCalendar();
}

// ===== Modals =====
function initModals() {
    // Success modal
    document.getElementById('closeSuccessModal').addEventListener('click', function() {
        window.location.href = '../index.html';
    });
    
    document.getElementById('downloadICS').addEventListener('click', function() {
        const modal = document.getElementById('successModal');
        const icsContent = modal.dataset.icsContent;
        const bookingId = modal.dataset.bookingId;
        
        if (icsContent) {
            downloadICSFile(icsContent, bookingId);
        }
    });
    
    // Close modal when clicking outside
    document.getElementById('successModal').addEventListener('click', function(e) {
        if (e.target === this) {
            window.location.href = '../index.html';
        }
    });
}

function downloadICSFile(icsContent, bookingId) {
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation_${bookingId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}

// ===== Back to Top Button =====
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===== Utility Functions =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== Make functions globally available =====
window.selectService = selectService;
window.selectDate = selectDate;
window.selectTime = selectTime;
