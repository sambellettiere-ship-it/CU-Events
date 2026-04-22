ALTER TABLE events ADD COLUMN is_recurring INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE events ADD COLUMN recurrence_type TEXT;
--> statement-breakpoint
ALTER TABLE events ADD COLUMN recurrence_end_date TEXT;
--> statement-breakpoint
ALTER TABLE events ADD COLUMN recurrence_days_of_week TEXT;
--> statement-breakpoint
CREATE TABLE itinerary_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, event_id)
);
--> statement-breakpoint
CREATE TABLE sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'garage',
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Champaign',
  start_datetime TEXT NOT NULL,
  end_datetime TEXT,
  latitude REAL,
  longitude REAL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  image_url TEXT,
  is_approved INTEGER NOT NULL DEFAULT 1,
  submitted_by_user_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
