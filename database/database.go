package database

import (
	"context"
	"errors"
	"time"

	"github.com/ucsdeventhub/EventHub/models"
)

// TODO: this is hack, there should be an actual error mapping layer in the
// sqlite provider
var ErrNoRows = errors.New("no rows")           // sql.ErrNoRows
var ErrFK = errors.New("foreign key violation") // sqlite3.ErrConstraintForeignKey

type Factory interface {
	NonTx(context.Context) Provider
	// p.Rollback() is called after the function is invoked
	// meaning, if p.Commit is not called then the changes are
	// not committed to the database
	WithTx(context.Context, func(p TxProvider) error) error
}

type TxProvider interface {
	Provider
	Commit() error
	Rollback() error
}

type Provider interface {
	// Event queries
	GetEvents(filter EventFilter) ([]models.Event, error)
	GetEventByID(eventID int) (*models.Event, error)
	GetTrendingEvents() ([]models.Event, error)
	UpsertEvent(event *models.Event) (eventID int, err error)

	GetAnnouncementsByEventID(eventID int) ([]models.Announcement, error)

	// Org queries
	GetOrgs(filter OrgFilter) ([]models.Org, error)
	GetOrgByID(orgID int) (*models.Org, error)
	GetOrgsForEmail(email string) ([]models.Org, error)
	UpsertOrg(org *models.Org) (orgID int, error error)

	// User queries
	GetUserByID(userID int) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)

	// This method only modifies the finite items of user
	// that is, not the user's favorites
	UpsertUser(user *models.User) (userID int, err error)

	AddUserTagFavorite(userID int, tagID string) (err error)
	AddUserOrgFavorite(userID int, orgID int) (err error)
	AddUserEventFavorite(userID int, eventID int) (err error)
	DeleteUserTagFavorite(userID int, tagID string) (err error)
	DeleteUserOrgFavorite(userID int, orgID int) (err error)
	DeleteUserEventFavorite(userID int, eventID int) (err error)

	// Token request
	GetTokenRequestByEmail(email string) (string, error)
	DeleteTokenRequestByEmail(email string) error
	AddTokenRequestForEmail(email string, secret string) error
}

type EventFilter struct {
	After  *time.Time
	Before *time.Time
	Limit  int
	Offset int
	Tags   []string
	Orgs   []int
}

type OrgFilter struct {
	IDs  []int
	Tags []string
}
