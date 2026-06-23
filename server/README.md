# Remco van Rooijen Consulting - Backend Server

This is a simple Node.js/Express backend server for managing bookings, services, and settings for the Remco van Rooijen Consulting website.

## Features

- RESTful API for bookings management
- Services management
- Settings configuration
- JSON file-based data storage
- CORS support for development
- Static file serving

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the server directory:
   ```bash
   cd /workspace/Remco-van-Rooijen__Testing/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   or with yarn:
   ```bash
   yarn install
   ```

## Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Production Mode
```bash
npm start
```

The server will start on port 3000 by default.

## Configuration

### Environment Variables

You can configure the server port using the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### Data Files

The server uses JSON files for data storage:
- `../data/bookings.json` - All bookings
- `../data/services.json` - All services
- `../data/settings.json` - Application settings

These files are automatically created if they don't exist.

## API Endpoints

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get a single booking by ID |
| POST | `/api/bookings` | Create a new booking |
| PUT | `/api/bookings/:id` | Update a booking |
| DELETE | `/api/bookings/:id` | Delete a booking |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/:id` | Get a single service by ID |
| POST | `/api/services` | Create a new service |
| PUT | `/api/services/:id` | Update a service |
| DELETE | `/api/services/:id` | Delete a service |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings |
| PUT | `/api/settings` | Update settings |

## Request/Response Examples

### Create a Booking

**Request:**
```http
POST /api/bookings
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "service": "SAFe Implementation Consultation",
  "date": "2024-07-20",
  "time": "10:00",
  "duration": "60",
  "notes": "Initial consultation"
}
```

**Response:**
```json
{
  "id": "123456789",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "service": "SAFe Implementation Consultation",
  "date": "2024-07-20",
  "time": "10:00",
  "duration": "60",
  "status": "confirmed",
  "notes": "Initial consultation",
  "createdAt": "2024-06-25T12:00:00.000Z",
  "icsSent": false
}
```

### Get All Services

**Request:**
```http
GET /api/services
```

**Response:**
```json
[
  {
    "id": "1",
    "name": "SAFe Implementation Consultation",
    "description": "Comprehensive assessment and planning for SAFe 6.0 implementation",
    "duration": "60",
    "price": "€250",
    "color": "#2563eb"
  },
  {
    "id": "2",
    "name": "Agile Coaching Session",
    "description": "One-on-one or team coaching on Agile practices",
    "duration": "45",
    "price": "€200",
    "color": "#7c3aed"
  }
]
```

### Update Settings

**Request:**
```http
PUT /api/settings
Content-Type: application/json

{
  "businessName": "Remco van Rooijen Consulting",
  "businessEmail": "remco@email.com",
  "timeZone": "Europe/Amsterdam",
  "defaultDuration": 60,
  "bufferTime": 15,
  "maxBookingsPerDay": 8,
  "startTime": "09:00",
  "endTime": "17:00",
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
}
```

**Response:**
```json
{
  "businessName": "Remco van Rooijen Consulting",
  "businessEmail": "remco@email.com",
  "timeZone": "Europe/Amsterdam",
  "defaultDuration": 60,
  "bufferTime": 15,
  "maxBookingsPerDay": 8,
  "startTime": "09:00",
  "endTime": "17:00",
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
}
```

## Accessing the Website

When the server is running, you can access:

- **Main Website:** http://localhost:3000
- **Booking Page:** http://localhost:3000/pages/booking.html
- **Admin Dashboard:** http://localhost:3000/pages/admin.html

## Deployment

### Option 1: Deploy to Heroku

1. Create a new Heroku app
2. Add Node.js buildpack
3. Push to Heroku:
   ```bash
   git push heroku main
   ```

### Option 2: Deploy to Vercel/Netlify

For static hosting with serverless functions:

1. Move the server code to the API directory (e.g., `/api`)
2. Configure serverless functions
3. Deploy as usual

### Option 3: Traditional Hosting

1. Upload to a hosting provider with Node.js support
2. Set the `PORT` environment variable
3. Start the server using `npm start`

## Troubleshooting

### Server won't start
- Make sure Node.js is installed
- Check that all dependencies are installed (`npm install`)
- Verify no other service is using the port

### Data not saving
- Check file permissions for the `data` directory
- Verify the server has write access to the files
- Check the server logs for errors

### CORS issues
- The server has CORS enabled by default
- If you're accessing from a different origin, make sure it's configured correctly

## License

This software is provided as-is for use with the Remco van Rooijen Consulting website.
