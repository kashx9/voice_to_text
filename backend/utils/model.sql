CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE logs(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category VARCHAR NOT NULL CHECK(category IN ('food','workout','other')),
    item VARCHAR,
    quantity VARCHAR,
    workout_sets INTEGER,
    reps INTEGER, 
    duration_minutes INTEGER,
    meal_type VARCHAR CHECK(meal_type IN ('breakfast','lunch','dinner')),
    notes VARCHAR,
    raw_transcript VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE embeddings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  raw_text VARCHAR NOT NULL,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT now()
);