package models

import "time"

// TODO: the *int IDs are a leaky abstraction from the server for
// performing upserts. Coming from the db, the ID is guarateed,
// but that is not the case coming from the server.
// This **could** be solved by having two methods, one for inserting
// and one for updating, in the inserting method we know to
// ignore the ID

type Event struct {
	ID          *int      `json:"id"`
	OrgID       int       `json:"orgID"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"startTime"`
	EndTime     time.Time `json:"endTime"`
	Created     time.Time `json:"created"`
	Updated     time.Time `json:"updated"`
	Tags        []string  `json:"tags"`
}

type Announcement struct {
	EventID int `json:"id"`
	Announcement string `json:"announcement"`
	Created time.Time `json:"created"`
}

type Org struct {
	ID           *int     `json:"id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Email        string   `json:"email"`
	Tags         []string `json:"tags"`
	TokenVersion int      `json:"tokenVersion"`
}

type User struct {
	ID             *int     `json:"id"`
	Email          string   `json:"email"`
	TokenVersion   int      `json:"tokenVersion"`
	TagFavorites   []string `json:"tagFavorites"`
	OrgFavorites   []int    `json:"orgFavorites"`   // foreign key ref to Org.ID
	EventFavorites []int    `json:"eventFavorites"` // eve
}
