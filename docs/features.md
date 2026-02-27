# Features

## 1. AI-Powered Itinerary Generation
Users can search for any city in the world. The application uses the Google Gemini API to generate a structured, realistic 1-day itinerary. The AI is instructed to return a JSON array of places, categorized into "Morning", "Afternoon", and "Evening" sections, complete with Google Maps `place_id`s.

## 2. Rich Place Details
When a user clicks on a place in their itinerary, the application uses the Google Maps JavaScript API (Places Library) to fetch real-time data about the location. This includes:
- High-quality photos
- User ratings and total reviews
- Formatted address and phone number
- Opening hours (and whether it's currently open)
- Website link
- Price level ($ to $$$$)
- Top 3 recent reviews

## 3. Saving Itineraries
Once an itinerary is generated, users can review the places and click "Save Trip". This sends the structured data to the Express backend, which saves the itinerary and all its associated places into the SQLite database (`data/app.db`).

## 4. Custom Notes
Users can add personal notes to any place in their itinerary.
- **During Generation**: Before saving a trip, users can click the message icon next to a place to add notes.
- **After Saving**: When viewing a saved trip, users can add or edit notes for any place. These changes are instantly saved to the database via a `PUT` request.

## 5. Favorites
Users can mark individual places as "Favorites".
- **Toggle**: A heart icon on the Place Detail page allows users to toggle the favorite status.
- **Storage**: Favorites are stored locally in the browser using `localStorage`.
- **Viewing**: The "Favorites" tab in the bottom navigation displays a list of all favorited places, complete with photos, ratings, and addresses.

## 6. Map View
The application includes a Map View that plots all the places in the current itinerary on a Google Map, allowing users to see the geographical spread of their planned day.
