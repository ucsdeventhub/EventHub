PRAGMA foreign_keys = ON;

INSERT INTO orgs (name, description)
VALUES
	('cool org', 'a cool org'),
	('lame org', 'a lame org');


INSERT INTO org_emails (org_id, email)
VALUES
	(1, 'coolorg@ucsd.edu'),
	(2, 'lameorg@ucsd.edu');

INSERT INTO org_tags (tag_id, org_id)
VALUES
	('gaming', 1),
	('greek', 2);

INSERT INTO events (org_id, name, description, start_time, end_time)
VALUES
	(
		1,
		'Game Night 1',
		'Playing games at night',
		datetime('2020-01-01 20:00:00'),
		datetime('2020-01-01 22:00:00')
	),
	(
		1,
		'Game Night 2',
		'Playing games at night',
		datetime('2020-02-01 20:00:00'),
		datetime('2020-02-01 22:00:00')
	),
	(
		2,
		'Play Frisbee On Library Walk',
		'Everyone has to see our muscles if we''re in the way',
		datetime('2020-02-01 20:00:00'),
		datetime('2020-02-01 22:00:00')
	);

INSERT INTO event_announcements (event_id, announcement)
VALUES
	(3, 'Change of plans bros, we''ll have to do it *next* to library walk');


INSERT INTO event_tags (tag_id, event_id)
VALUES
	('sports', 3);

INSERT INTO users (email)
VALUES
	('alice@ucsd.edu'),
	('stevie@ucsd.edu'),
	('bob@ucsd.edu');

INSERT INTO user_tag_favorites (user_id, tag_id)
VALUES
	(3, 'greek'),

INSERT INTO user_event_favorites (user_id, event_id)
VALUES
	(1, 1),
	(1, 2),
	(2, 1),
	(3, 3);

INSERT INTO user_org_favorites (user_id, org_id)
VALUES
	(1, 1),
	(3, 2);

