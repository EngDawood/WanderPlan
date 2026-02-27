# Architecture & Tech Stack

The AI Travel Planner is a full-stack application built with modern web technologies.

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router (`react-router-dom`)
- **Icons**: Lucide React
- **State Management**: React Context API (`TripContext`)
- **Maps Integration**: Google Maps JavaScript API (Places Library)

### Backend
- **Server**: Node.js with Express
- **Database**: SQLite (via `better-sqlite3`)
- **AI Integration**: Google GenAI SDK (`@google/genai`)

## System Architecture

### 1. The Frontend (Client)
The frontend is a Single Page Application (SPA) that communicates with both the internal Express backend and external Google APIs.
- **TripContext**: Manages the global state of the user's current trip generation, selected places, and itinerary data.
- **Google Maps JS API**: Used directly on the client to fetch rich place details (photos, reviews, opening hours) based on the `place_id` returned by the AI.

### 2. The Backend (Server)
The backend is an Express server running on port 3000. It serves two main purposes:
- **API Endpoints**: Handles CRUD operations for saving and retrieving itineraries and custom notes.
- **Database Management**: Manages the local SQLite database (`data/app.db`).

### 3. The Database Schema
The application uses a relational SQLite database with two primary tables:

#### `itineraries`
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `city` (TEXT)
- `date` (TEXT)
- `created_at` (DATETIME)

#### `places`
- `id` (INTEGER PRIMARY KEY)
- `itinerary_id` (INTEGER, FOREIGN KEY)
- `name` (TEXT)
- `address` (TEXT)
- `rating` (REAL)
- `price_level` (INTEGER)
- `photo_url` (TEXT)
- `category` (TEXT)
- `section` (TEXT) - 'Morning', 'Afternoon', 'Evening'
- `order_index` (INTEGER)
- `time_estimate` (TEXT)
- `lat` (REAL)
- `lng` (REAL)
- `place_id` (TEXT)
- `notes` (TEXT) - User's custom notes for the place

### 4. AI Integration (Gemini)
The application uses the `gemini-3-flash-preview` model to generate structured JSON itineraries. The prompt asks the AI to act as a local travel guide, returning a list of places with their names, descriptions, and Google Maps Place IDs, categorized by time of day.
