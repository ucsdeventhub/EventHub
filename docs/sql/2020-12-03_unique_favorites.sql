BEGIN;

PRAGMA foreign_keys = ON;

DROP TABLE user_tag_favorites;
DROP TABLE user_event_favorites;
DROP TABLE user_org_favorites;

CREATE TABLE user_tag_favorites (
	user_id int REFERENCES users(id) NOT NULL,
	tag_id int REFERENCES tags(id) NOT NULL,
	UNIQUE(user_id, tag_id) ON CONFLICT IGNORE
);

CREATE TABLE user_event_favorites (
	user_id int REFERENCES users(id) NOT NULL,
	event_id int REFERENCES events(id) NOT NULL,
	UNIQUE(user_id, event_id) ON CONFLICT IGNORE
);

CREATE TABLE user_org_favorites (
	user_id int REFERENCES users(id) NOT NULL,
	org_id int REFERENCES orgs(id) NOT NULL,
	UNIQUE(user_id, org_id) ON CONFLICT IGNORE
);

END;

