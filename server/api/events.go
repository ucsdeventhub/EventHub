package api

import (
	"errors"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/ucsdeventhub/EventHub/database"
)

func (srv *Provider) GetEvents(w http.ResponseWriter, r *http.Request) {
	query, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		Error(w, err, "invalid query", http.StatusBadRequest)
		return
	}

	validParams := []string{"orgs", "tags", "before", "after", "limit", "offset"}
L:
	for k := range query {
		for _, v := range validParams {
			if k == v {
				continue L
			}
		}

		// normally it doesn't matter, but since this endpoint has a lot of paramters
		// this error is helpful for debugging
		Error(w, err, "unknown query param " + k, http.StatusBadRequest)
		return
	}

	now := time.Now()
	filter := database.EventFilter{
		After: &now,
		Limit:  10,
		Offset: 0,
	}

	orgsStr := query.Get("orgs")
	if orgsStr != "" {
		orgsArr := strings.Split(orgsStr, ",")
		filter.Orgs = make([]int, len(orgsArr))

		for i, v := range orgsArr {
			filter.Orgs[i], err = strconv.Atoi(v)
			if err != nil {
				Error(w, err, "invalid query, orgs must be ints", http.StatusBadRequest)
				return
			}
		}
	}

	tagsStr := query.Get("tags")
	if tagsStr != "" {
		filter.Tags = strings.Split(tagsStr, ",")
	}

	limitStr := query.Get("limit")
	if limitStr != "" {
		filter.Limit, err = strconv.Atoi(limitStr)
		if err != nil || filter.Limit < 0 || filter.Limit > 100 {
			Error(w, err, "invalid query, limit must be int in [0, 100]", http.StatusBadRequest)
			return
		}
	}

	offsetStr := query.Get("offset")
	if offsetStr != "" {
		filter.Offset, err = strconv.Atoi(offsetStr)
		if err != nil || filter.Offset < 0 {
			Error(w, err, "invalid query, offset must be positive int", http.StatusBadRequest)
			return
		}
	}

	afterStr := query.Get("after")
	if afterStr != "" {
		after, err := time.Parse("2006-01-02", afterStr)
		if err != nil {
			Error(w, err, "invalid query, after must be in yyyy-mm-dd format", http.StatusBadRequest)
			return
		}
		filter.After = &after
	}

	beforeStr := query.Get("before")
	if beforeStr != "" {
		before, err := time.Parse("2006-01-02", beforeStr)
		if err != nil {
			Error(w, err, "invalid query, before must be in yyyy-mm-dd format", http.StatusBadRequest)
			return
		}
		filter.Before = &before
	}

	events, err := srv.DB.NonTx(r.Context()).GetEvents(filter)
	if err != nil {
		Error(w, err, "error getting events from database", http.StatusInternalServerError)
		return
	}

	OkJSON(w, events)
}

func (srv *Provider) GetEventsTrending(w http.ResponseWriter, r *http.Request) {
	events, err := srv.DB.NonTx(r.Context()).GetTrendingEvents()
	if err != nil {
		Error(w, err, "error getting events from database", http.StatusInternalServerError)
		return
	}

	OkJSON(w, events)
}

func (srv *Provider) GetEventsID(w http.ResponseWriter, r *http.Request) {
	eventID, err := EventIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get event id from path", http.StatusBadRequest)
		return
	}

	event, err := srv.DB.NonTx(r.Context()).GetEventByID(eventID)
	if err != nil {
		if errors.Is(err, database.ErrNoRows) {
			Error(w, err, "event does not exist", http.StatusNotFound)
			return
		}

		Error(w, err, "error getting event from database", http.StatusInternalServerError)
		return
	}

	OkJSON(w, event)
}

func (srv *Provider) GetEventsIDAnnouncements(w http.ResponseWriter, r *http.Request) {
	eventID, err := EventIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get event id from path", http.StatusBadRequest)
		return
	}

	event, err := srv.DB.NonTx(r.Context()).GetAnnouncementsByEventID(eventID)
	if err != nil {
		if errors.Is(err, database.ErrNoRows) {
			Error(w, err, "event does not exist", http.StatusNotFound)
			return
		}

		Error(w, err, "error getting event announcements from database", http.StatusInternalServerError)
		return
	}

	OkJSON(w, event)
}
