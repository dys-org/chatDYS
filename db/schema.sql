DROP TABLE IF EXISTS Users;

CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO
  Users (email, first_name, last_name)
VALUES
  ('david@example.com', 'David', 'Soards'),
  ('gretel@example.com', 'Gretel', 'Soards'),
  ('sebby@example.com', 'Gretel', 'Soards');
