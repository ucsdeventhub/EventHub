package sqlite_test

import (
	"context"
	"testing"

	"github.com/arolek/p"

	"github.com/ucsdeventhub/EventHub/database"
	"github.com/ucsdeventhub/EventHub/database/sqlite"
	"github.com/ucsdeventhub/EventHub/models"
)

func getTestFactory(t *testing.T) *sqlite.Factory {
	factory, err := sqlite.NewFactory("testdata/test.sqlite3")
	if err != nil {
		t.Fatal(err)
	}

	return factory
}

func TestGetOrgsForEmail(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetOrgsForEmail("coolorg@ucsd.edu"))
	t.Log(db.GetOrgsForEmail("lameorg@ucsd.edu"))
}

func TestGetOrgByID(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetOrgByID(1))
	t.Log(db.GetOrgByID(2))
}

func TestGetOrgs(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetOrgs(database.OrgFilter{
		IDs: []int{1, 2},
	}))

	t.Log(db.GetOrgs(database.OrgFilter{
		IDs: []int{2},
	}))

	t.Log(db.GetOrgs(database.OrgFilter{
		IDs:  []int{1, 2},
		Tags: []string{"greek"},
	}))

	t.Log(db.GetOrgs(database.OrgFilter{
		Tags: []string{"gaming", "greek"},
	}))
}

func TestUpsertOrg(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.UpsertOrg(&models.Org{
		ID:          p.Int(1),
		Name:        "cool org v2",
		Description: "a cooler org",
	}))

	t.Log(db.UpsertOrg(&models.Org{
		Name:        "medium org",
		Description: "an org",
	}))
}
