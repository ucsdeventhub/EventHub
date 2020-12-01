package sqlite_test

import (
	"context"
	"testing"

	"github.com/ucsdeventhub/EventHub/database"
)

func TestGetEvents(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetEvents(database.EventFilter{
		Limit: 10,
	}))

	t.Log(db.GetEvents(database.EventFilter{
		Limit: 10,
		Orgs: []int{2},
	}))

	t.Log(db.GetEvents(database.EventFilter{
		Limit: 10,
		Tags: []string{"greek"},
	}))
}

func TestGetTrendingEvents(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetTrendingEvents())
}

func TestGetEventAnnouncements (t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetAnnouncementsByEventID(3))
}
