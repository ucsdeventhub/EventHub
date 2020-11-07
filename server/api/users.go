package api

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/ucsdeventhub/EventHub/database"
)

func (srv *Provider) GetUsersID(w http.ResponseWriter, r *http.Request) {
	userID, err := UserIDToken.GetInt(r)
	if err != nil {
		http.Error(w, "could not get user id from path", http.StatusBadRequest)
		return
	}

	user, err := srv.DB.NonTx(r.Context()).GetUserByID(userID)
	if err != nil {
		log.Println(err)
		http.Error(w,
			"error getting user from database",
			http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(user)
	if err != nil {
		log.Println(err)
	}
}

//
// Orgs
//

func (srv *Provider) PostUsersOrgs(w http.ResponseWriter, r *http.Request) {
	userID, err := UserIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get user id from path", http.StatusBadRequest)
		return
	}

	orgID, err := OrgIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get org id from path", http.StatusBadRequest)
		return
	}

	err = srv.DB.NonTx(r.Context()).AddUserOrgFavorite(userID, orgID)
	if err != nil {
		if errors.Is(err, database.ErrFK) {
			// there is a chance that this could actually be triggered by an
			// invalid user, if the user was deleted between the token middleware
			// verificcation and now
			Error(w, nil, "invalid tag", http.StatusBadRequest)
			return
		}
		Error(w, err, "error adding favorite to database", http.StatusInternalServerError)
		return
	}

	NoContent(w)
}

func (srv *Provider) DeleteUsersOrgs(w http.ResponseWriter, r *http.Request) {
	userID, err := UserIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get user id from path", http.StatusBadRequest)
		return
	}

	orgID, err := OrgIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get org id from path", http.StatusBadRequest)
		return
	}

	err = srv.DB.NonTx(r.Context()).DeleteUserOrgFavorite(userID, orgID)
	if err != nil {
		Error(w, err, "error adding favorite to database", http.StatusInternalServerError)
		return
	}

	NoContent(w)
}

//
// Events
//

func (srv *Provider) PostUsersEvents(w http.ResponseWriter, r *http.Request) {
	userID, err := UserIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get user id from path", http.StatusBadRequest)
		return
	}

	eventID, err := EventIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get event id from path", http.StatusBadRequest)
		return
	}

	err = srv.DB.NonTx(r.Context()).AddUserEventFavorite(userID, eventID)
	if err != nil {
		if errors.Is(err, database.ErrFK) {
			// there is a chance that this could actually be triggered by an
			// invalid user, if the user was deleted between the token middleware
			// verificcation and now
			Error(w, nil, "invalid event", http.StatusBadRequest)
			return
		}
		Error(w, err, "error adding favorite to database", http.StatusInternalServerError)
		return
	}

	NoContent(w)
}

func (srv *Provider) DeleteUsersEvents(w http.ResponseWriter, r *http.Request) {
	userID, err := UserIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get user id from path", http.StatusBadRequest)
		return
	}

	eventID, err := EventIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get event id from path", http.StatusBadRequest)
		return
	}

	err = srv.DB.NonTx(r.Context()).DeleteUserEventFavorite(userID, eventID)
	if err != nil {
		Error(w, err, "error adding favorite to database", http.StatusInternalServerError)
		return
	}

	NoContent(w)
}

//
// Tags
//

func (srv *Provider) PostUsersTags(w http.ResponseWriter, r *http.Request) {
	userID, err := UserIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get user id from path", http.StatusBadRequest)
		return
	}

	tagID := TagIDToken.GetString(r)
	if err != nil {
		Error(w, err, "could not get tag id from path", http.StatusBadRequest)
		return
	}

	err = srv.DB.NonTx(r.Context()).AddUserTagFavorite(userID, tagID)
	if err != nil {
		if errors.Is(err, database.ErrFK) {
			// there is a chance that this could actually be triggered by an
			// invalid user, if the user was deleted between the token middleware
			// verificcation and now
			Error(w, nil, "invalid tag", http.StatusBadRequest)
			return
		}
		Error(w, err, "error adding favorite to database", http.StatusInternalServerError)
		return
	}

	NoContent(w)
}

func (srv *Provider) DeleteUsersTags(w http.ResponseWriter, r *http.Request) {
	userID, err := UserIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get user id from path", http.StatusBadRequest)
		return
	}

	tagID := TagIDToken.GetString(r)
	if err != nil {
		Error(w, err, "could not get tag id from path", http.StatusBadRequest)
		return
	}

	err = srv.DB.NonTx(r.Context()).DeleteUserTagFavorite(userID, tagID)
	if err != nil {
		Error(w, err, "error adding favorite to database", http.StatusInternalServerError)
		return
	}

	NoContent(w)
}
