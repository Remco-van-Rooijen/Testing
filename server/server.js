/**
 * Remco van Rooijen Consulting - Backend Server
 * Simple Express server for managing bookings and services
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data file paths
const BOOKINGS_FILE = path.join(__dirname, '..', 'data', 'bookings.json');
const SERVICES_FILE = path.join(__dirname, '..', 'data', 'services.json');
const SETTINGS_FILE = path.join(__dirname, '..', 'data', 'settings.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create default files if they don't exist
    if (!fs.existsSync(BOOKINGS_FILE)) {
        fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(SERVICES_FILE)) {
        const defaultServices = [
            {
                id: "1",
                name: "SAFe Implementation Consultation",
                description: "Comprehensive assessment and planning for SAFe 6.0 implementation",
                duration: "60",
                price: "€250",
                color: "#2563eb"
            },
            {
                id: "2",
                name: "Agile Coaching Session",
                description: "One-on-one or team coaching on Agile practices",
                duration: "45",
                price: "€200",
                color: "#7c3aed"
            },
            {
                id: "3",
                name: "PI Planning Workshop",
                description: "Facilitation of Program Increment Planning event",
                duration: "120",
                price: "€500",
                color: "#10b981"
            },
            {
                id: "4",
                name: "Transformation Strategy Session",
                description: "Develop a customized roadmap for your Agile transformation",
                duration: "90",
                price: "€350",
                color: "#f59e0b"
            },
            {
                id: "5",
                name: "Leadership Alignment Workshop",
                description: "Align leadership teams with Agile transformation goals",
                duration: "120",
                price: "€600",
                color: "#ef4444"
            }
        ];
        fs.writeFileSync(SERVICES_FILE, JSON.stringify(defaultServices, null, 2));
    }
    if (!fs.existsSync(SETTINGS_FILE)) {
        const defaultSettings = {
            businessName: "Remco van Rooijen Consulting",
            businessEmail: "remco.vanrooijen@email.com",
            timeZone: "Europe/Amsterdam",
            defaultDuration: 60,
            bufferTime: 15,
            maxBookingsPerDay: 8,
            startTime: "09:00",
            endTime: "17:00",
            workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        };
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    }
};

// Helper function to read JSON file
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

// Helper function to write JSON file
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
};

// Initialize data directory
ensureDataDirectory();

// ===== API Routes =====

// Get all bookings
app.get('/api/bookings', (req, res) => {
    const bookings = readJsonFile(BOOKINGS_FILE);
    res.json(bookings);
});

// Get single booking
app.get('/api/bookings/:id', (req, res) => {
    const bookings = readJsonFile(BOOKINGS_FILE);
    const booking = bookings.find(b => b.id === req.params.id);
    if (booking) {
        res.json(booking);
    } else {
        res.status(404).json({ error: 'Booking not found' });
    }
});

// Create new booking
app.post('/api/bookings', (req, res) => {
    const bookings = readJsonFile(BOOKINGS_FILE);
    const newBooking = req.body;
    
    // Generate ID if not provided
    if (!newBooking.id) {
        newBooking.id = Date.now().toString();
    }
    
    // Set default values
    newBooking.status = newBooking.status || 'confirmed';
    newBooking.createdAt = newBooking.createdAt || new Date().toISOString();
    newBooking.icsSent = newBooking.icsSent || false;
    
    bookings.push(newBooking);
    
    if (writeJsonFile(BOOKINGS_FILE, bookings)) {
        res.status(201).json(newBooking);
    } else {
        res.status(500).json({ error: 'Failed to save booking' });
    }
});

// Update booking
app.put('/api/bookings/:id', (req, res) => {
    const bookings = readJsonFile(BOOKINGS_FILE);
    const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
    
    if (bookingIndex === -1) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    
    const updatedBooking = { ...bookings[bookingIndex], ...req.body };
    bookings[bookingIndex] = updatedBooking;
    
    if (writeJsonFile(BOOKINGS_FILE, bookings)) {
        res.json(updatedBooking);
    } else {
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// Delete booking
app.delete('/api/bookings/:id', (req, res) => {
    const bookings = readJsonFile(BOOKINGS_FILE);
    const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
    
    if (bookingIndex === -1) {
        return res.status(404).json({ error: 'Booking not found' });
    }
    
    bookings.splice(bookingIndex, 1);
    
    if (writeJsonFile(BOOKINGS_FILE, bookings)) {
        res.json({ message: 'Booking deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

// Get all services
app.get('/api/services', (req, res) => {
    const services = readJsonFile(SERVICES_FILE);
    res.json(services);
});

// Get single service
app.get('/api/services/:id', (req, res) => {
    const services = readJsonFile(SERVICES_FILE);
    const service = services.find(s => s.id === req.params.id);
    if (service) {
        res.json(service);
    } else {
        res.status(404).json({ error: 'Service not found' });
    }
});

// Create new service
app.post('/api/services', (req, res) => {
    const services = readJsonFile(SERVICES_FILE);
    const newService = req.body;
    
    // Generate ID if not provided
    if (!newService.id) {
        newService.id = Date.now().toString();
    }
    
    services.push(newService);
    
    if (writeJsonFile(SERVICES_FILE, services)) {
        res.status(201).json(newService);
    } else {
        res.status(500).json({ error: 'Failed to save service' });
    }
});

// Update service
app.put('/api/services/:id', (req, res) => {
    const services = readJsonFile(SERVICES_FILE);
    const serviceIndex = services.findIndex(s => s.id === req.params.id);
    
    if (serviceIndex === -1) {
        return res.status(404).json({ error: 'Service not found' });
    }
    
    const updatedService = { ...services[serviceIndex], ...req.body };
    services[serviceIndex] = updatedService;
    
    if (writeJsonFile(SERVICES_FILE, updatedService)) {
        res.json(updatedService);
    } else {
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// Delete service
app.delete('/api/services/:id', (req, res) => {
    const services = readJsonFile(SERVICES_FILE);
    const serviceIndex = services.findIndex(s => s.id === req.params.id);
    
    if (serviceIndex === -1) {
        return res.status(404).json({ error: 'Service not found' });
    }
    
    services.splice(serviceIndex, 1);
    
    if (writeJsonFile(SERVICES_FILE, services)) {
        res.json({ message: 'Service deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

// Get settings
app.get('/api/settings', (req, res) => {
    const settings = readJsonFile(SETTINGS_FILE);
    res.json(settings);
});

// Update settings
app.put('/api/settings', (req, res) => {
    const settings = { ...readJsonFile(SETTINGS_FILE), ...req.body };
    
    if (writeJsonFile(SETTINGS_FILE, settings)) {
        res.json(settings);
    } else {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// ===== Static Files =====
// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// ===== Start Server =====
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Endpoints:`);
    console.log(`  GET  /api/bookings    - Get all bookings`);
    console.log(`  GET  /api/bookings/:id - Get single booking`);
    console.log(`  POST /api/bookings    - Create new booking`);
    console.log(`  PUT  /api/bookings/:id - Update booking`);
    console.log(`  DEL  /api/bookings/:id - Delete booking`);
    console.log(`  GET  /api/services    - Get all services`);
    console.log(`  GET  /api/services/:id - Get single service`);
    console.log(`  POST /api/services    - Create new service`);
    console.log(`  PUT  /api/services/:id - Update service`);
    console.log(`  DEL  /api/services/:id - Delete service`);
    console.log(`  GET  /api/settings    - Get settings`);
    console.log(`  PUT  /api/settings    - Update settings`);
});
