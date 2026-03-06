# Screens Description

This document outlines all the main screens (pages) in the AI Travel Planner application and their primary functions.

## Core Flow Screens

### 1. Home (`/`)
The landing page of the application. It features a welcoming hero section with a search bar where users can type in a destination city to start planning their trip. It also includes quick-access chips for popular destinations to inspire users.

### 2. City Search / Generation (`/search`)
Once a user selects a city, they are taken to this screen to finalize their trip details (like selecting a date). Upon confirming, this screen displays a loading state while the application communicates with the Gemini AI to generate the itinerary.

### 3. Generated Itinerary (`/itinerary`)
This is the core output screen. It displays the AI-generated itinerary broken down into chronological sections: **Morning**, **Afternoon**, and **Evening**. 
- Each section lists the suggested places, complete with photos, ratings, and a brief AI-generated context.
- Users can click on any place to view more details.
- Users can add custom notes to any place using the message icon.
- A floating "Save Trip" button allows users to persist this itinerary to the database.

### 4. Place Detail (`/place/:id`)
A deep-dive screen for a specific location, utilizing the Google Maps Places API.
- **Header**: Displays a large cover photo, the place name, rating, and price level.
- **Actions**: A heart icon in the top right allows users to add the place to their Favorites.
- **Information**: Shows the address, opening hours (and current open/closed status), phone number, and website.
- **Directions**: A button that opens Google Maps with directions to the place.
- **Reviews**: Displays the top 3 most helpful reviews from Google users.

## Navigation & Management Screens

### 5. Saved Trips (`/saved`)
Accessible via the bottom navigation bar. This screen lists all the itineraries the user has previously generated and saved. It fetches data from the SQLite database and displays each trip as a card with the city name, date, and a summary of the places included.

### 6. Saved Itinerary Detail (`/saved/:id`)
When a user clicks on a saved trip, they are taken here. It looks similar to the "Generated Itinerary" screen but represents a persisted state. Users can review their plan, click into places, and add or edit their custom notes (which are instantly saved to the database).

### 7. Favorites (`/favorites`)
Accessible via the bottom navigation bar. This screen displays a grid/list of all the individual places the user has "hearted" (favorited) across the app. It reads from the browser's `localStorage` and provides quick access to the user's most loved locations.

### 8. Map View (`/map`)
A visual representation of the itinerary. It renders a full-screen Google Map with markers for every place in the current itinerary, allowing users to understand the geographical spread and travel distances between their planned stops.

## Stub / Future Screens
The application also includes several placeholder screens intended for future development:
- **Profile (`/profile`)**: User account management.
- **Preferences (`/preferences`)**: Travel style settings (e.g., budget, dietary restrictions).
- **History (`/history`)**: A log of past trips.
- **Authentication (`/signin`, `/signup`)**: User login and registration flows.
