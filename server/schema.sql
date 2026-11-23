CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  tagline     TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  stack       TEXT[] NOT NULL DEFAULT '{}',
  featured    BOOLEAN NOT NULL DEFAULT false,
  github_url  TEXT,
  live_url    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skill_groups (
  id         SERIAL PRIMARY KEY,
  category   TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id         SERIAL PRIMARY KEY,
  group_id   INTEGER NOT NULL REFERENCES skill_groups(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  level      INTEGER NOT NULL CHECK (level BETWEEN 0 AND 100),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  ip         TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_group ON skills(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Editable site content (profile, education, experience) stored as JSON per key
CREATE TABLE IF NOT EXISTS site_content (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uploaded files (profile photo, resume) stored in the database so deployment needs no disk
CREATE TABLE IF NOT EXISTS uploads (
  name       TEXT PRIMARY KEY,
  mime       TEXT NOT NULL,
  data       BYTEA NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
