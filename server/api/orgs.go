package api

import (
	"encoding/json"
	"errors"
	"image"
	"image/png"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/ucsdeventhub/EventHub/database"
	"github.com/ucsdeventhub/EventHub/models"
	"github.com/ucsdeventhub/EventHub/utils"
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

func (srv *Provider) PutOrgs(w http.ResponseWriter, r *http.Request) {
	orgID, err := OrgIDToken.GetInt(r)
	if err != nil {
		Error(w, err, "could not get org id from path", http.StatusBadRequest)
		return
	}

	{
		// access control check
		tokenOrgs, ok := r.Context().Value(ctxKeyOrg).([]models.Org)
		if !ok {
			Error(w, nil, "error getting token value", http.StatusBadRequest)
			return
		}

		if !srv.AC.TokenOrgsCanEditOrg(tokenOrgs, orgID) {
			Error(w, nil, "token not valid for org", http.StatusForbidden)
			return
		}
	}

	org := models.Org{}
	err = json.NewDecoder(r.Body).Decode(&org)
	r.Body.Close()
	if err != nil {
		Error(w, err, "couldn't parse request", http.StatusBadRequest)
		return
	}

	org.ID = &orgID

	_, err = srv.DB.NonTx(r.Context()).UpsertOrg(&org)
	if err != nil {
		Error(w, err, "error adding org to database", http.StatusInternalServerError)
		return
	}

	OkJSON(w, org)
}

func (srv *Provider) GetOrgsSelf(w http.ResponseWriter, r *http.Request) {
	// access control check
	tokenOrgs, ok := r.Context().Value(ctxKeyOrg).([]models.Org)
	if !ok {

		OkJSON(w, []int{})
		//Error(w, nil, "error getting token value", http.StatusBadRequest)
		return
	}

	OkJSON(w, tokenOrgs)
}

func (srv *Provider) GetOrgsLogo(w http.ResponseWriter, r *http.Request) {
	orgID := OrgIDToken.GetString(r)

	img := utils.StringHashImage("org:"+orgID, image.Rect(0, 0, 200, 200))

	w.Header().Set("Content-Type", "image/png")
	png.Encode(w, img)
}
