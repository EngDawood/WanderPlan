import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "app.db");
export const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itinerary_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    rating REAL,
    price_level INTEGER,
    photo_url TEXT,
    category TEXT,
    section TEXT NOT NULL, -- 'Morning', 'Afternoon', 'Evening'
    order_index INTEGER NOT NULL,
    time_estimate TEXT,
    lat REAL,
    lng REAL,
    place_id TEXT,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries (id) ON DELETE CASCADE
  );
`);

// Add new columns if they don't exist
try {
  db.exec("ALTER TABLE itineraries ADD COLUMN date TEXT;");
} catch (e) {
  // Column might already exist
}

try {
  db.exec("ALTER TABLE places ADD COLUMN notes TEXT;");
} catch (e) {
  // Column might already exist
}

// Enable foreign keys
db.pragma("foreign_keys = ON");
