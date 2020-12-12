BEGIN;

PRAGMA foreign_keys = ON;

ALTER TABLE events ADD COLUMN location text;

END;
