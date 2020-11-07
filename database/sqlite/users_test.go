package sqlite_test

import (
	"context"
	"testing"

	"github.com/ucsdeventhub/EventHub/models"
)

func TestGetUserByID(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetUserByID(1))
	t.Log(db.GetUserByID(2))
	t.Log(db.GetUserByID(3))
}

func TestGetUserByEmail(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetUserByEmail("alice@ucsd.edu"))
	t.Log(db.GetUserByEmail("stevie@ucsd.edu"))
	t.Log(db.GetUserByEmail("bob@ucsd.edu"))
}

func TestUpsertUser(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.UpsertUser(&models.User{Email: "alice@ucsd.edu"}))
	t.Log(db.UpsertUser(&models.User{Email: "alice2@ucsd.edu"}))
}

func TestUserFavoriteTag(t *testing.T) {
	db := getTestFactory(t).NonTx(context.Background())

	t.Log(db.GetUserByID(1))
	t.Log(db.AddUserTagFavorite(1, "sports"))
	t.Log(db.GetUserByID(1))
	t.Log(db.DeleteUserTagFavorite(1, "sports"))
	t.Log(db.GetUserByID(1))
}

