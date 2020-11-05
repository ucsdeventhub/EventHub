BEGIN;

PRAGMA foreign_keys = ON;

CREATE TABLE events (
	id integer PRIMARY KEY,
	org_id REFERENCES orgs(id) NOT NULL,
	name text NOT NULL,
	description text,
	start_time text NOT NULL,
	end_time text NOT NULL,
	created text DEFAULT (datetime('now')),
	updated text DEFAULT (datetime('now')),
	-- deleting is hard with a foreign key so we do a soft delete
	-- iso datetime
	deleted text
);

CREATE TRIGGER events_update_updated AFTER UPDATE ON events
BEGIN
	UPDATE events SET updated = datetime('now') WHERE id = new.id;
END;


CREATE TABLE event_announcements (
	event_id REFERENCES events(id) NOT NULL,
	announcement text NOT NULL,
	created text DEFAULT (datetime('now')),
	deleted text
);

CREATE TRIGGER events_announcements_update_updated
AFTER INSERT ON event_announcements
BEGIN
	UPDATE events SET updated = datetime('now') WHERE id = new.event_id;
END;

CREATE TABLE tags (
	id text PRIMARY KEY NOT NULL,
	name text
);

INSERT INTO tags (id, name)
VALUES
	('greek', 'Greek'),
	('sports', 'Sports'),
	('cultural', 'Cultural'),
	('gaming', 'Gaming');

CREATE TABLE event_tags (
	tag_id REFERENCES tags(id) NOT NULL,
	event_id REFERENCES events(id) NOT NULL
);

CREATE TABLE org_tags (
	tag_id REFERENCES tags(id) NOT NULL,
	org_id REFERENCES orgs(id) NOT NULL
);


CREATE TABLE orgs (
	id integer PRIMARY KEY,
	name text UNIQUE NOT NULL,
	description text,

	-- every time the user wants to log out of all accounts
	-- this gets incremented
	token_version int NOT NULL DEFAULT 0,

	-- deleting is hard with a foreign key so we do a soft delete
	-- iso datetime
	deleted text
);

CREATE TABLE org_emails (
	org_id REFERENCES orgs(id) NOT NULL,
	email text NOT NULL
);

CREATE TABLE users (
	id integer PRIMARY KEY,
	email text UNIQUE NOT NULL,
	-- every time the user wants to log out of all accounts
	-- this gets incremented
	token_version int NOT NULL DEFAULT 0
);

CREATE TABLE user_tag_favorites (
	user_id int REFERENCES users(id) NOT NULL,
	tag_id int REFERENCES tags(id) NOT NULL
);

CREATE TABLE user_event_favorites (
	user_id int REFERENCES users(id) NOT NULL,
	event_id int REFERENCES events(id) NOT NULL
);

CREATE TABLE user_org_favorites (
	user_id int REFERENCES users(id) NOT NULL,
	org_id int REFERENCES orgs(id) NOT NULL
);

CREATE TABLE user_token_requests (
	user_id REFERENCES users(id) NOT NULL,
	secret text,
	-- iso datetime
	created text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE org_token_requests (
	org_id REFERENCES orgs(id) NOT NULL,
	secret text,
	-- iso datetime
	created text NOT NULL DEFAULT (datetime('now'))
);

END;
