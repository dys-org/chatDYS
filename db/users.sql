DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sub TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the sub column for faster lookups
CREATE INDEX idx_users_sub ON Users (sub);
