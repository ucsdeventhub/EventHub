BEGIN;

DROP TABLE event_tags;

CREATE TABLE event_tags (
	tag_id REFERENCES tags(id) NOT NULL,
	event_id REFERENCES events(id) NOT NULL,
	UNIQUE (tag_id, event_id)
);

END;
