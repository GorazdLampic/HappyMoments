-- HappyMoments D1 Database Schema

CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    premium_until INTEGER,
    stripe_customer_id TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    user_id TEXT,
    action TEXT NOT NULL,
    data TEXT,
    country TEXT,
    device_id TEXT,
    platform TEXT,
    app_version TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_action ON events(action);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_device ON events(device_id);
CREATE INDEX IF NOT EXISTS idx_events_platform ON events(platform);

-- For an EXISTING database, apply these once (additive, safe on a live table):
--   ALTER TABLE events ADD COLUMN device_id TEXT;
--   ALTER TABLE events ADD COLUMN platform TEXT;
--   ALTER TABLE events ADD COLUMN app_version TEXT;
--   CREATE INDEX IF NOT EXISTS idx_events_device ON events(device_id);
--   CREATE INDEX IF NOT EXISTS idx_events_platform ON events(platform);
