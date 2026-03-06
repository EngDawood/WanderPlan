import express from "express";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import dotenv from "dotenv";

dotenv.config();

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
      
      const places = db.prepare("SELECT * FROM places WHERE itinerary_id = ? ORDER BY section, order_index").all(id);
      
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
      const result = insertItinerary.run(name, city ?? 'Unknown City', date || null);
      const itineraryId = Number(result.lastInsertRowid);
      
      const insertPlace = db.prepare(
        "INSERT INTO places (itinerary_id, name, address, rating, price_level, photo_url, category, section, order_index, time_estimate, lat, lng, place_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      );
      
      const insertMany = db.transaction((places) => {
        for (const place of places) {
          insertPlace.run(
            itineraryId,
            place.name ?? 'Unknown Place',
            place.address ?? null,
            place.rating ?? null,
            place.price_level ?? null,
            place.photo_url ?? null,
            place.category ?? null,
            place.section ?? 'Morning',
            place.order_index ?? 0,
            place.time_estimate ?? null,
            place.lat ?? null,
            place.lng ?? null,
            place.place_id ?? null,
            place.notes ?? null
          );
        }
      });
      
      insertMany(places);
      
      res.status(201).json({ id: itineraryId, name, city, date });
    } catch (error) {
      console.error("Error creating itinerary:", error);
      res.status(500).json({ error: "Failed to create itinerary", details: error instanceof Error ? error.message : String(error) });
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
