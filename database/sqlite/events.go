package sqlite

import (
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/ucsdeventhub/EventHub/database"
	"github.com/ucsdeventhub/EventHub/models"
)

func eventsFromRows(rows *sql.Rows) ([]models.Event, error) {
	id2idx := map[int]int{}
	ret := []models.Event{}

	var event models.Event
	for rows.Next() {
		var tag sql.NullString

		err := rows.Scan(
			&event.ID,
			&event.OrgID,
			&event.Name,
			&event.Description,
			&event.StartTime,
			&event.EndTime,
			&event.Created,
			&event.Updated,
			&tag)

		if err != nil {
			return nil, err
		}

		idx, ok := id2idx[*event.ID]
		if ok && tag.Valid {
			for _, v := range ret[idx].Tags {
				if v == tag.String {
					goto L
				}
			}
			ret[idx].Tags = append(ret[idx].Tags, tag.String)
			L:
		} else {
			if tag.Valid {
				event.Tags = []string{tag.String}
			}

			id2idx[*event.ID] = len(ret)
			ret = append(ret, event)
		}
	}

	return ret, nil
}

// TODO: due to the way the query structured, and my laziness, if the tags filter is present
// then only those tags get returned byt this function. To fix this, we'll probably have to
// put the tags outside of the query
func (q querierFacade) GetEvents(filter database.EventFilter) ([]models.Event, error) {
	var where []string
	var args []interface{}

	addWhere := func(where1 string, args1 ...interface{}) {
		where = append(where, where1)
		args = append(args, args1...)
	}

	addWhere("e.deleted IS NULL")

	if filter.After != nil {
		log.Println("after: ", *filter.After)
		addWhere("e.start_time > ?", *filter.After)
	}

	if filter.Before != nil {
		addWhere("e.end_time < ?", *filter.Before)
	}

	if tags := filter.Tags; len(tags) > 0 {
		args1 := make([]interface{}, len(tags))
		for i, v := range tags {
			args1[i] = v
		}
		addWhere("tag.tag_id in "+sqlList(len(tags)), args1...)
	}

	if orgs := filter.Orgs; len(orgs) > 0 {
		args1 := make([]interface{}, len(orgs))
		for i, v := range orgs {
			args1[i] = v
		}
		addWhere("e.org_id in "+sqlList(len(orgs)), args1...)
	}

	if filter.Name != nil {
		names := strings.Split(*filter.Name, " ")
		if len(names) > 4 {
			names = names[:4]
		}

		for _, v := range names {
			v = strings.Replace(v, "%", "", -1)
			addWhere("e.name LIKE ?", "%" + v + "%")
		}
	}

	query := fmt.Sprintf(`
	WITH tag AS (
		SELECT org_id, NULL as event_id, tag_id FROM org_tags
		UNION
		SELECT NULL as org_id, event_id, tag_id FROM event_tags
	)
	SELECT
		e.id,
		e.org_id,
		e.name,
		e.description,
		e.start_time,
		e.end_time,
		e.created,
		e.updated,
		tag.tag_id
	FROM
		events AS e
	JOIN (
		SELECT
			e.id,
			e.name,
			e.org_id,
			e.deleted,
			e.start_time,
			e.end_time
		FROM
			events AS e
		LEFT JOIN
			tag
		ON
			tag.event_id = e.id OR tag.org_id = e.org_id
		WHERE
			%s
		GROUP BY e.id
		ORDER BY
			e.start_time, e.id
		LIMIT %d
		OFFSET %d
	) AS result
	ON
		e.id = result.id
	LEFT JOIN
		tag
	ON
		tag.event_id = e.id OR tag.org_id = e.org_id
	ORDER BY
		e.start_time, e.id;
	`, strings.Join(where, " AND "), filter.Limit, filter.Offset)

	log.Println(query)

	rows, err := q.Query(query, args...)
	if err != nil {
		return nil, err
	}

	return eventsFromRows(rows)
}

func (q querierFacade) GetTrendingEvents() ([]models.Event, error) {

	query := `
	WITH tag AS (
		SELECT org_id, NULL as event_id, tag_id FROM org_tags
		UNION
		SELECT NULL as org_id, event_id, tag_id FROM event_tags
	)
	SELECT
		e.id,
		e.org_id,
		e.name,
		e.description,
		e.start_time,
		e.end_time,
		e.created,
		e.updated,
		tag.tag_id
	FROM
		events AS e
	JOIN (
		SELECT
			e.id,
			count(*) AS c
		FROM events AS e
		JOIN
			user_event_favorites AS fav
		ON
			fav.event_id = e.id
		WHERE
			e.deleted IS NULL AND e.created > ?  AND e.start_time > ?
		GROUP BY e.id
		ORDER BY c DESC
		LIMIT 10
	) AS result
	ON
		result.id = e.id
	LEFT JOIN
		tag
	ON
		tag.event_id = e.id OR tag.org_id = e.org_id
	ORDER BY result.c DESC, e.id;
	`

	rows, err := q.Query(query,
		time.Now().Add(-7*24*time.Hour), // created in the last week
		time.Now())                      // and has not started
	if err != nil {
		return nil, err
	}

	return eventsFromRows(rows)
}

func (q querierFacade) GetEventByID(eventID int) (*models.Event, error) {
	query := `
	WITH tag AS (
		SELECT org_id, NULL as event_id, tag_id FROM org_tags
		UNION
		SELECT NULL as org_id, event_id, tag_id FROM event_tags
	)
	SELECT
		e.id,
		e.org_id,
		e.name,
		e.description,
		e.start_time,
		e.end_time,
		e.created,
		e.updated,
		tag.tag_id
	FROM
		events AS e
	LEFT JOIN
		tag
	ON
		tag.event_id = e.id OR tag.org_id = e.org_id
	WHERE
		e.deleted IS NULL
	AND
		e.id = ?;
	`
	rows, err := q.Query(query, eventID)
	if err != nil {
		return nil, err
	}

	ret, err := eventsFromRows(rows)
	if err != nil {
		return nil, err
	}

	if len(ret) == 0 {
		return nil, database.ErrNoRows
	}

	if len(ret) > 1 {
		log.Println("ID SHOULD BE THE PRIMARY KEY!!")
	}

	return &ret[0], nil
}

func (q querierFacade) UpsertEvent(event *models.Event) (eventID int, err error) {
	query := `INSERT INTO events (
		id,
		org_id,
		name,
		description,
		start_time,
		end_time
	) VALUES
	(?, ?, ?, ?, ?, ?)
	ON CONFLICT (id) DO UPDATE SET
		name = excluded.name,
		description = excluded.description,
		start_time = excluded.start_time,
		end_time = excluded.end_time;
	`


	res, err := q.Exec(query,
		event.ID,
		event.OrgID,
		event.Name,
		event.Description,
		event.StartTime,
		event.EndTime,
	)
	if err != nil {
		return 0, err
	}
	if event.ID != nil {
		eventID = *event.ID
	} else {
		eventID64, err := res.LastInsertId()
		if err != nil {
			return 0, err
		}
		eventID = int(eventID64)
	}

	if len(event.Tags) == 0 {
		return eventID, nil
	}

	tags := "(" + strconv.Itoa(eventID) + ", ?)"
	tags = tags +
		strings.Repeat(",\n"+tags, len(event.Tags) - 1)

	query = fmt.Sprintf(`INSERT INTO event_tags (event_id, tag_id)
	VALUES
		%s
	ON CONFLICT (event_id, tag_id) DO NOTHING
	;`, tags)

	varr := make([]interface{}, len(event.Tags))
	for i, v := range event.Tags {
		varr[i] = v
	}

	log.Println(query)

	_, err = q.Exec(query, varr...)
	return eventID, err

}

func (q querierFacade) DeleteEvent(eventID int) error {
	query := `UPDATE events (deleted)
	VALUES (datetime('now'))
	WHERE events.id = ?;
	`

	_, err := q.Exec(query, eventID)
	return err
}

func (q querierFacade) GetAnnouncementsByEventID(eventID int) ([]models.Announcement, error) {
	query := `SELECT
		a.event_id,
		a.announcement,
		a.created
	FROM
		event_announcements AS a
	JOIN
		events AS e
	ON
		a.event_id = e.id
	WHERE
		a.event_id = ?
	AND
		a.deleted IS NULL
	ORDER BY
		a.created DESC;
	`

	rows, err := q.Query(query, eventID)
	if err != nil {
		return nil, err
	}

	var ret []models.Announcement

	for rows.Next() {
		var a models.Announcement

		err := rows.Scan(
			&a.EventID,
			&a.Announcement,
			&a.Created,
		)
		if err != nil {
			return nil, err
		}

		ret = append(ret, a)
	}

	return ret, nil
}

func (q querierFacade) UpsertAnnouncements(anns []models.Announcement) error {
	if len(anns) == 0 {
		return nil
	}

	args := make([]interface{}, 0, 3 * len(anns))
	vals := make([]string, 0, len(anns))
	for  _, v := range anns {
		args = append(args, v.EventID, v.Announcement, v.Created)
		vals = append(vals, "(?, ?, ?)")
	}

	valsStr := strings.Join(vals, ",\n")

	query := fmt.Sprintf(`INSERT INTO event_announcements (event_id, announcement, created)
	VALUES
		%s
	ON CONFLICT (event_id, created) DO UPDATE SET
		announcement=excluded.announcement;`, valsStr)

		log.Println(query)

	_, err := q.Exec(query, args...)
	return err
}

func (q querierFacade) DeleteAnnouncement(eventID int, created time.Time) error {
	query := `UPDATE event_announcements (deleted)
	VALUES (datetime('now'))
	WHERE
		event_id = ?
	AND
		created = ?;
	`

	_, err := q.Exec(query, eventID, created)
	return err
}
