package api

import (
	"errors"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/ucsdeventhub/EventHub/database"
)

func (srv *Provider) GetOrgs(w http.ResponseWriter, r *http.Request) {
	query, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		Error(w, err, "invalid query", http.StatusBadRequest)
		return
	}

	validParams := []string{"id", "tags"}
L:
	for k := range query {
		for _, v := range validParams {
			if k == v {
				continue L
			}
		}

		// normally it doesn't matter, but since this endpoint has a lot of paramters
		// this error is helpful for debugging
		Error(w, err, "unknown query param "+k, http.StatusBadRequest)
		return
	}

	filter := database.OrgFilter{}

	if idsStr := query.Get("id"); idsStr != "" {
		idsStrArr := strings.Split(idsStr, ",")

		ids := make([]int, len(idsStrArr))
		for i, v := range idsStrArr {
			ids[i], err = strconv.Atoi(v)
			if err != nil {
				Error(w, err, "invalid query, ids must be ints", http.StatusBadRequest)
				return
			}
		}

		filter.IDs = ids
	}

	if tagsStr := query.Get("tags"); tagsStr != "" {
		filter.Tags = strings.Split(tagsStr, ",")
	}

	orgs, err := srv.DB.NonTx(r.Context()).GetOrgs(filter)
	if err != nil {
		Error(w, err, "error getting orgs from database", http.StatusInternalServerError)
		return
	}

	OkJSON(w, orgs)
}

func (srv *Provider) GetOrgsID(w http.ResponseWriter, r *http.Request) {
	orgID, err := OrgIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get org id from path", http.StatusBadRequest)
		return
	}

	org, err := srv.DB.NonTx(r.Context()).GetOrgByID(orgID)
	if err != nil {
		if errors.Is(err, database.ErrNoRows) {
			Error(w, nil, "org not found", http.StatusNotFound)
			return
		}

		Error(w, err, "error getting org from database", http.StatusInternalServerError)
		return
	}

	OkJSON(w, org)
}
