package sqlite

import (
	"database/sql"
	"errors"
	"log"

	"github.com/ucsdeventhub/EventHub/database"
	"github.com/ucsdeventhub/EventHub/models"
)

func userFromRows(rows *sql.Rows) (*models.User, error) {
	var ret models.User
	if !rows.Next() {
		return nil, database.ErrNoRows
	}

	var tagID *string
	var orgID *int
	var eventID *int

	err := rows.Scan(
		&ret.ID,
		&ret.Email,
		&ret.TokenVersion,
		&tagID,
		&orgID,
		&eventID,
	)

	if err != nil {
		return nil, err
	}

	if tagID != nil {
		ret.TagFavorites = append(ret.TagFavorites, *tagID)
	}

	if orgID != nil {
		ret.OrgFavorites = append(ret.OrgFavorites, *orgID)
	}

	if eventID != nil {
		ret.EventFavorites = append(ret.EventFavorites, *eventID)
	}

	for rows.Next() {
		var id int
		err := rows.Scan(
			&id,
			&sql.RawBytes{},
			&sql.RawBytes{},
			&tagID,
			&orgID,
			&eventID,
		)
		if id != *ret.ID {
			return nil, errors.New("IDs NOT UNIQUE!")
		}

		if err != nil {
			return nil, err
		}

		if tagID != nil {
			for _, v := range ret.TagFavorites {
				if v == *tagID {
					goto L1
				}
			}
			ret.TagFavorites = append(ret.TagFavorites, *tagID)
		}
	L1:

		if orgID != nil {
			for _, v := range ret.OrgFavorites {
				if v == *orgID {
					goto L2
				}
			}
			ret.OrgFavorites = append(ret.OrgFavorites, *orgID)
		}
	L2:

		if eventID != nil {
			for _, v := range ret.EventFavorites {
				if v == *eventID {
					goto L3
				}
			}
			ret.EventFavorites = append(ret.EventFavorites, *eventID)
		}
	L3:
	}

	return &ret, nil
}

func (q *querierFacade) GetUserByID(userID int) (*models.User, error) {
	query := `SELECT
		u.id,
		u.email,
		u.token_version,
		tag.tag_id,
		org.org_id,
		event.event_id
	FROM users as u
	LEFT JOIN user_tag_favorites as tag ON tag.user_id = u.id
	LEFT JOIN user_org_favorites as org ON org.user_id = u.id
	LEFT JOIN user_event_favorites as event ON event.user_id = u.id
	WHERE u.id = ?;`

	rows, err := q.Query(query, userID)
	if err != nil {
		return nil, err
	}

	return userFromRows(rows)
}

func (q *querierFacade) GetUserByEmail(email string) (*models.User, error) {
	query := `SELECT
		u.id,
		u.email,
		u.token_version,
		tag.tag_id,
		org.org_id,
		event.event_id
	FROM users as u
	LEFT JOIN user_tag_favorites as tag ON tag.user_id = u.id
	LEFT JOIN user_org_favorites as org ON org.user_id = u.id
	LEFT JOIN user_event_favorites as event ON event.user_id = u.id
	WHERE u.email = ?;`

	rows, err := q.Query(query, email)
	if err != nil {
		return nil, err
	}

	return userFromRows(rows)
}

func (q *querierFacade) UpsertUser(user *models.User) (userID int, err error) {
	query := `INSERT INTO users (email)
	VALUES
		(?)
	ON CONFLICT(email) DO NOTHING;
	`
	res, err := q.Exec(query, user.Email)
	if err != nil {
		return 0, err
	}
	id , err := res.LastInsertId()
	log.Println("upsert: ", id, err)

	query = `SELECT id FROM users WHERE email = ?;`
	err = q.QueryRow(query, user.Email).Scan(&userID)
	if err != nil {
		return 0, err
	}

	return userID, nil
}

func (q *querierFacade) UpsertUserTagFavorite(userID int, tagID string) (err error) {
	// TODO: add a unique constriaint to the table?
	_, err = q.Exec(`INSERT INTO
		user_tag_favorites (user_id, tag_id)
	VALUES
		(?, ?);`,
		userID, tagID)

	return err
}

func (q *querierFacade) UpsertUserOrgFavorite(userID int, orgID int) (err error) {
	// TODO: add a unique constriaint to the table?
	_, err = q.Exec(`INSERT INTO
		user_org_favorites (user_id, org_id)
	VALUES
		(?, ?);`,
		userID, orgID)

	return err
}

func (q *querierFacade) UpsertUserEventFavorite(userID int, eventID int) (err error) {
	// TODO: add a unique constriaint to the table?
	_, err = q.Exec(`INSERT INTO
		user_event_favorites (user_id, event_id)
	VALUES
		(?, ?);`,
		userID, eventID)

	return err
}

func (q *querierFacade) DeleteUserTagFavorite(userID int, tagID string) (err error) {
	_, err = q.Exec(`DELETE FROM
		user_tag_favorites
	WHERE
		user_id = ?
	AND
		tag_id = ?;`,
		userID, tagID)

	return err
}

func (q *querierFacade) DeleteUserOrgFavorite(userID int, orgID int) (err error) {
	_, err = q.Exec(`DELETE FROM
		user_org_favorites
	WHERE
		user_id = ?
	AND
		org_id = ?;`,
		userID, orgID)

	return err
}

func (q *querierFacade) DeleteUserEventFavorite(userID int, eventID int) (err error) {
	_, err = q.Exec(`DELETE FROM
		user_event_favorites
	WHERE
		user_id = ?
	AND
		event_id = ?;`,
		userID, eventID)

	return err
}
