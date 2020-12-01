BEGIN;

DROP TABLE event_announcements;

CREATE TABLE event_announcements (
	event_id REFERENCES events(id) NOT NULL,
	announcement text NOT NULL,
	created datetime DEFAULT (datetime('now')),
	deleted datetime
);

END;
