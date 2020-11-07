BEGIN;

PRAGMA foreign_keys = ON;

DROP TABLE org_token_requests;
DROP TABLE user_token_requests;

CREATE TABLE token_requests (
	email text UNIQUE NOT NULL,
	secret text NOT NULL,
	-- iso datetime
	created text NOT NULL DEFAULT (datetime('now'))
);

END;

