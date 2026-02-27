import express from "express";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get all itineraries
  app.get("/api/itineraries", (req, res) => {
    try {
      const itineraries = db.prepare("SELECT * FROM itineraries ORDER BY created_at DESC").all();
      res.json(itineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      res.status(500).json({ error: "Failed to fetch itineraries" });
    }
  });

  // Get a specific itinerary
  app.get("/api/itineraries/:id", (req, res) => {
    try {
      const { id } = req.params;
      const itinerary = db.prepare("SELECT * FROM itineraries WHERE id = ?").get(id);
      
      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }
      
      const places = db.prepare("SELECT * FROM places WHERE itinerary_id = ? ORDER BY section, order_index").all();
      
      res.json({ ...(itinerary as any), places });
    } catch (error) {
      console.error("Error fetching itinerary:", error);
      res.status(500).json({ error: "Failed to fetch itinerary" });
    }
  });

  // Create a new itinerary
  app.post("/api/itineraries", (req, res) => {
    try {
      const { name, city, date, places } = req.body;
      
      const insertItinerary = db.prepare("INSERT INTO itineraries (name, city, date) VALUES (?, ?, ?)");
      const result = insertItinerary.run(name, city, date || null);
      const itineraryId = result.lastInsertRowid;
      
      const insertPlace = db.prepare(
        "INSERT INTO places (itinerary_id, name, address, rating, price_level, photo_url, category, section, order_index, time_estimate, lat, lng, place_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      
      const insertMany = db.transaction((places) => {
        for (const place of places) {
          insertPlace.run(
            itineraryId,
            place.name,
            place.address,
            place.rating || null,
            place.price_level || null,
            place.photo_url || null,
            place.category || null,
            place.section,
            place.order_index,
            place.time_estimate || null,
            place.lat,
            place.lng,
            place.place_id,
            place.notes || null
          );
        }
      });
      
      insertMany(places);
      
      res.status(201).json({ id: itineraryId, name, city, date });
    } catch (error) {
      console.error("Error creating itinerary:", error);
      res.status(500).json({ error: "Failed to create itinerary" });
    }
  });

  // Delete an itinerary
  app.delete("/api/itineraries/:id", (req, res) => {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM itineraries WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      res.status(500).json({ error: "Failed to delete itinerary" });
    }
  });

  // Update notes for a place
  app.put("/api/places/:id/notes", (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      db.prepare("UPDATE places SET notes = ? WHERE id = ?").run(notes, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating notes:", error);
      res.status(500).json({ error: "Failed to update notes" });
    }
  });

  // Generate itinerary using Gemini
  app.post("/api/generate-itinerary", async (req, res) => {
    try {
      const { city, categories, places } = req.body;
      
      const prompt = `
        Create a daily itinerary for ${city} using the following places selected by the user:
        ${JSON.stringify(places, null, 2)}
        
        Organize these places into three sections: "Morning", "Afternoon", and "Evening".
        Provide a logical order and a time estimate for each place (e.g., "09:00 AM - 11:00 AM").
        Make sure to include all the provided places.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                place_id: { type: Type.STRING, description: "The place_id from the input list" },
                section: { type: Type.STRING, description: "Must be 'Morning', 'Afternoon', or 'Evening'" },
                order_index: { type: Type.INTEGER, description: "The order index within the section (0, 1, 2...)" },
                time_estimate: { type: Type.STRING, description: "Estimated time, e.g., '09:00 AM - 11:00 AM'" }
              },
              required: ["place_id", "section", "order_index", "time_estimate"]
            }
          }
        }
      });

      const generatedPlan = JSON.parse(response.text || "[]");
      
      // Merge the generated plan with the original place data
      const organizedPlaces = generatedPlan.map((planItem: any) => {
        const placeDetails = places.find((p: any) => p.place_id === planItem.place_id);
        return {
          ...placeDetails,
          section: planItem.section,
          order_index: planItem.order_index,
          time_estimate: planItem.time_estimate
        };
      });

      res.json(organizedPlaces);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
