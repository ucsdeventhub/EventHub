package api

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi"

	"github.com/ucsdeventhub/EventHub/accesscontrol"
	"github.com/ucsdeventhub/EventHub/database"
	"github.com/ucsdeventhub/EventHub/email"
	"github.com/ucsdeventhub/EventHub/models"
	"github.com/ucsdeventhub/EventHub/token"
)

const (
	UserIDToken  = RouteToken("user_id")
	OrgIDToken   = RouteToken("org_id")
	EventIDToken = RouteToken("event_id")
	TagIDToken   = RouteToken("tag_id")
)

type RouteToken string

func (token RouteToken) GetInt(r *http.Request) (int, error) {
	tokenVal := chi.URLParam(r, string(token))

	if token == UserIDToken && tokenVal == "self" {
		user, ok := r.Context().Value(ctxKeyUser).(*models.User)
		if ok {
			return *user.ID, nil
		}
	}

	return strconv.Atoi(tokenVal)
}

func (token RouteToken) GetString(r *http.Request) string {
	tokenVal := chi.URLParam(r, string(token))

	if token == UserIDToken && tokenVal == "self" {
		user, ok := r.Context().Value(ctxKeyUser).(*models.User)
		if ok {
			return strconv.Itoa(*user.ID)
		}
	}

	return tokenVal
}

func BuildRoute(xs ...interface{}) string {
	ys := make([]string, 1, len(xs)+1)
	for _, x := range xs {
		switch y := x.(type) {
		case RouteToken:
			ys = append(ys, "{"+string(y)+"}")
		case string:
			ys = append(ys, y)
		default:
			panic(fmt.Sprintf("invalid route element %T", x))
		}
	}

	return strings.Join(ys, "/")
}

type Provider struct {
	IsProduction bool
	Email        email.Provider
	DB           database.Factory
	Token        token.Provider
	AC           accesscontrol.Provider
}

func (srv *Provider) Unimplemented(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "not implemented", http.StatusNotImplemented)
	return
}

func New(router chi.Router, srv *Provider) {

	// unauthenticated routes
	router.Post(BuildRoute("login"), srv.Login)

	router.Get(BuildRoute("events"), srv.GetEvents)
	router.Get(BuildRoute("events", "trending"), srv.GetEventsTrending)
	router.Get(BuildRoute("events", EventIDToken), srv.GetEventsID)
	router.Get(BuildRoute("events", EventIDToken, "announcements"), srv.GetEventsAnnouncements)
	router.Get(BuildRoute("events", EventIDToken, "logo"), srv.GetEventsLogo)

	router.Get(BuildRoute("orgs"), srv.GetOrgs)
	router.Get(BuildRoute("orgs", OrgIDToken), srv.GetOrgsID)
	router.Get(BuildRoute("orgs", OrgIDToken, "logo"), srv.GetOrgsLogo)

	// kinda hacky
	router.Get(BuildRoute("orgs", "self"), srv.GetOrgsSelf)

	// user authenticated routes
	router.Group(func(router chi.Router) {
		router.Use(
			NewUserJWTMiddleware(srv.DB, srv.Token),
		)

		router.Get(BuildRoute("users", UserIDToken), srv.GetUsersID)

		router.Put(BuildRoute("users", UserIDToken, "orgs", OrgIDToken), srv.PutUsersOrgs)
		router.Delete(BuildRoute("users", UserIDToken, "orgs", OrgIDToken), srv.DeleteUsersOrgs)

		router.Put(BuildRoute("users", UserIDToken, "events", EventIDToken), srv.PutUsersEvents)
		router.Delete(BuildRoute("users", UserIDToken, "events", EventIDToken), srv.DeleteUsersEvents)

		router.Put(BuildRoute("users", UserIDToken, "tags", TagIDToken), srv.PutUsersTags)
		router.Delete(BuildRoute("users", UserIDToken, "tags", TagIDToken), srv.DeleteUsersTags)
	})

	// org authenticated routes
	router.Group(func(router chi.Router) {
		router.Use(
			NewOrgJWTMiddleware(srv.DB, srv.Token),
		)


		router.Put(BuildRoute("orgs", OrgIDToken), srv.PutOrgs)

		router.Post(BuildRoute("org", OrgIDToken, "events"), srv.PostOrgsEvents)
		router.Put(BuildRoute("events", EventIDToken), srv.PutEvents)
		router.Delete(BuildRoute("events", EventIDToken), srv.DeleteEvents)
		router.Put(BuildRoute("events", EventIDToken, "announcements" ), srv.PutEventsAnnouncements)
	})
}
