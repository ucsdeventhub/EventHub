package sqlite_test
import ( "context"
	"testing"
	"time"

	"github.com/arolek/p"

	"github.com/ucsdeventhub/EventHub/database"
	"github.com/ucsdeventhub/EventHub/models"
)

func TestGetEvents(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetEvents(database.EventFilter{
		Limit: 10,
	}))

	t.Log(db.GetEvents(database.EventFilter{
		Limit: 10,
		Orgs:  []int{2},
	}))

	t.Log(db.GetEvents(database.EventFilter{
		Limit: 10,
		Tags:  []string{"greek"},
	}))
}

func TestGetTrendingEvents(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetTrendingEvents())
}

func TestGetEventAnnouncements(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetAnnouncementsByEventID(3))
}

func TestUpsertEvents(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	atime, err := time.Parse("2006-02-01", "2020-12-03")
	if err != nil {
		t.Fatal(err)
	}

	event := models.Event{
		ID: p.Int(7),
		OrgID: 2,
		Name: "Bro-out",
		Description: "Just broin' out",
		StartTime: atime,
		EndTime: atime.Add(3 * time.Hour),
		Tags: []string{"greek", "cultural"},
	}

	t.Log(db.UpsertEvent(&event))
	t.Log(db.GetEventByID(*event.ID))
}

func TestUpsertEventAnnouncements(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	atime, err := time.Parse("2006-02-01", "2020-12-03")
	if err != nil {
		t.Fatal(err)
	}

	a := []models.Announcement{
		{
			EventID:      2,
			Announcement: "hello 2",
			Created:      atime.Add(1 * time.Hour),
		},
		{
			EventID:      2,
			Announcement: "hello 1",
			Created:      atime,
		},
	}

	t.Log(db.UpsertAnnouncements(a))
	t.Log(db.GetAnnouncementsByEventID(2))
}
