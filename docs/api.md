# API Endpoints

The AI Travel Planner uses an Express backend to manage the SQLite database. Here are the available endpoints:

## `GET /api/health`
Checks the health of the Express server.
- **Response**: `{"status": "ok"}`

## `GET /api/itineraries`
Retrieves all saved itineraries from the database, ordered by creation date (newest first).
- **Response**: Array of itinerary objects.

## `GET /api/itineraries/:id`
Retrieves a specific itinerary by its ID, including all associated places.
- **Parameters**: `id` (The ID of the itinerary)
- **Response**: An itinerary object with an additional `places` array containing all places associated with that itinerary.

## `POST /api/itineraries`
Saves a new itinerary and its associated places to the database.
- **Request Body**:
  ```json
  {
    "name": "My Trip to Paris",
    "city": "Paris, France",
    "date": "2024-05-15",
    "places": [
      {
        "name": "Eiffel Tower",
        "address": "Champ de Mars, 5 Av. Anatole France",
        "rating": 4.6,
        "price_level": 3,
        "photo_url": "https://...",
        "category": "tourist_attraction",
        "section": "Morning",
        "order_index": 0,
        "time_estimate": "09:00 AM - 11:00 AM",
        "lat": 48.8584,
        "lng": 2.2945,
        "place_id": "ChIJLU7jZClu5kcR4PcOOO6p3I0",
        "notes": "Buy tickets online beforehand."
      }
    ]
  }
  ```
- **Response**: `{"id": 1}` (The ID of the newly created itinerary)

## `PUT /api/places/:id/notes`
Updates the custom notes for a specific place in the database.
- **Parameters**: `id` (The ID of the place in the database, NOT the Google Maps `place_id`)
- **Request Body**:
  ```json
  {
    "notes": "Updated notes for this place."
  }
  ```
- **Response**: `{"success": true}`
