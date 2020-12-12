BEGIN;

DROP TABLE events;

CREATE TABLE events (
	id integer PRIMARY KEY,
	org_id REFERENCES orgs(id) NOT NULL,
	name text NOT NULL,
	description text,
	start_time datetime NOT NULL,
	end_time datetime NOT NULL,
	created datetime DEFAULT (datetime('now')),
	updated datetime DEFAULT (datetime('now')),
	-- deleting is hard with a foreign key so we do a soft delete
	-- iso datetime
	deleted datetime,
	UNIQUE(name, org_id, start_time)
);

END;
