package sqlite

import (
	"database/sql"
	"fmt"
	"log"
	"strings"

	"github.com/ucsdeventhub/EventHub/database"
	"github.com/ucsdeventhub/EventHub/models"
)

// scanOrgs scans a models.Org from a sql.Rows object
// NOTE this this doesn't take rows from the orgs table, but actually the orgs joined with
// the tags table
func orgsFromRows(rows *sql.Rows) ([]models.Org, error) {
	id2idx := map[int]int{}
	ret := []models.Org{}

	var org models.Org
	for rows.Next() {
		var tag sql.NullString
		var desc sql.NullString

		err := rows.Scan(
			&org.ID,
			&org.Name,
			&tag,
			&desc,
			&org.TokenVersion)

		if err != nil {
			return nil, err
		}

		if desc.Valid {
			org.Description = desc.String
		}

		idx, ok := id2idx[*org.ID]
		if ok {
			ret[idx].Tags = append(ret[idx].Tags, tag.String)
		} else {
			if tag.Valid {
				org.Tags = []string{tag.String}
			}

			id2idx[*org.ID] = len(ret)
			ret = append(ret, org)
		}
	}

	return ret, nil
}

func sqlList(length int) string {
	if length <= 0 {
		return "()"
	}

	return "(?" + strings.Repeat(", ?", length-1) + " )"
}

func (q *querierFacade) GetOrgs(filter database.OrgFilter) ([]models.Org, error) {
	filterStr := ""
	args := []interface{}{}

	if len(filter.IDs) > 0 {
		filterStr += "o.id IN " + sqlList(len(filter.IDs))
		for _, v := range filter.IDs {
			args = append(args, v)
		}
	}

	if len(filter.Tags) > 0 {
		if len(filterStr) > 0 {
			filterStr += " AND "
		}

		filterStr += "tags.tag_id IN " + sqlList(len(filter.Tags))
		for _, v := range filter.Tags {
			args = append(args, v)
		}
	}

	if len(filterStr) == 0 {
		filterStr = "WHERE o.deleted IS NULL"
	} else {
		filterStr = "WHERE " + filterStr + " AND o.deleted IS NULL"
	}

	query := `SELECT
		o.id,
		o.name,
		tags.tag_id,
		o.description,
		o.token_version
	FROM orgs AS o
	LEFT JOIN org_tags AS tags
	ON tags.org_id = o.id
	%s;
	`

	rows, err := q.Query(fmt.Sprintf(query, filterStr), args...)
	if err != nil {
		return nil, err
	}

	return orgsFromRows(rows)
}

func (q *querierFacade) GetOrgByID(orgID int) (*models.Org, error) {
	query := `SELECT
		o.id,
		o.name,
		tags.tag_id,
		o.description,
		o.token_version
	FROM orgs AS o
	LEFT JOIN org_tags AS tags
	ON tags.org_id = o.id
	WHERE
		o.id = ?
	AND
		o.deleted IS NULL;
	`

	rows, err := q.Query(query, orgID)
	if err != nil {
		return nil, err
	}

	ret, err := orgsFromRows(rows)
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

func (q *querierFacade) GetOrgByName(orgName string) (*models.Org, error) {
	query := `SELECT
		o.id,
		o.name,
		tags.tag_id,
		o.description,
		o.token_version
	FROM orgs AS o
	LEFT JOIN org_tags AS tags
	ON tags.org_id = o.id
	WHERE
		o.name = ?
	AND
		o.deleted IS NULL;
	`

	rows, err := q.Query(query, orgName)
	if err != nil {
		return nil, err
	}

	ret, err := orgsFromRows(rows)
	if err != nil {
		return nil, err
	}

	if len(ret) == 0 {
		return nil, database.ErrNoRows
	}

	if len(ret) > 1 {
		log.Println("NAME SHOULD BE THE UNIQUE!!")
	}

	return &ret[0], nil
}

func (q *querierFacade) GetOrgsForEmail(email string) ([]models.Org, error) {
	query := `SELECT
		o.id,
		o.name,
		tags.tag_id,
		o.description,
		o.token_version
	FROM orgs AS o
	LEFT JOIN org_tags AS tags
	ON tags.org_id = o.id
	INNER JOIN org_emails AS emails
	ON emails.org_id = o.id
	WHERE
		emails.email = ?
	AND
		o.deleted IS NULL;
	`

	rows, err := q.Query(query, email)
	if err != nil {
		return nil, err
	}

	return orgsFromRows(rows)
}

func (q *querierFacade) UpsertOrg(org *models.Org) (orgID int, err error) {
	query := `INSERT INTO orgs
		(
			id,
			name,
			description
			-- token_version leaving this out for now
		)
		VALUES (?, ?, ?)
		ON CONFLICT (id)
		DO UPDATE SET
			name = excluded.name,
			description = excluded.description;
		`

	res, err := q.Exec(query, org.ID, org.Name, org.Description)
	if err != nil {
		return 0, err
	}

	if org.ID == nil {
		orgID64, err := res.LastInsertId()
		if err != nil {
			return 0, err
		}

		orgID = int(orgID64)
	} else {
		orgID = *org.ID
	}

	args := []interface{}{}

	_, err = q.Exec(`DELETE FROM org_tags WHERE org_id = ?;`, orgID)
	if err != nil {
		return 0, err
	}

	if len(org.Tags) == 0 {
		return 0, nil
	}

	query = `INSERT INTO org_tags (org_id, tag_id)
		VALUES (?, ?)`

	args = append(args, orgID, org.Tags[0])

	for _, v := range org.Tags {
		query += `, (?, ?)`
		args = append(args, orgID, v)
	}
	query += ";"

	log.Println(query)
	log.Println(args)

	_, err = q.Exec(query, args...)
	return orgID, err
}
