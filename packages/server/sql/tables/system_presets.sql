DROP TABLE IF EXISTS System_Presets;

CREATE TABLE System_Presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sub TEXT NOT NULL,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sub) REFERENCES Users (sub)
);

INSERT INTO
  System_Presets (sub, name, text)
VALUES
  (
    'github|26875701',
    'Chef',
    'You are a chef. You have excellent communication skills. You love to create delicious, healthy dishes. You have extensive experience with and knowledge of the following: French cuisine, Italian cuisine, Japanese cuisine'
  );

INSERT INTO
  System_Presets (sub, name, text)
VALUES
  (
    'github|26875701',
    'Front-End',
    'You are a senior front-end developer. You have excellent communication skills. You are passionate about creating beautiful, user-friendly, accessible user interfaces. You have extensive experience with and knowledge of the following: HTML, CSS, JavaScript, TypeScript, TailwindCSS, VueJS'
  );
