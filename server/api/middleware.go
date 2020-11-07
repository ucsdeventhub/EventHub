package api

import (
	"context"
	"net/http"
	"log"
	"strings"

	"github.com/ucsdeventhub/EventHub/database"
	"github.com/ucsdeventhub/EventHub/token"
)

var ctxKeyUser = struct{}{}
var ctxKeyOrg = struct{}{}

func NewUserJWTMiddleware(db database.Factory,
	token token.Provider) func(http.Handler) http.Handler {

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")

			if !strings.HasPrefix(header, "Bearer") {
				http.Error(w, "Authorization header must have a bearer token", http.StatusBadRequest)
				return
			}

			log.Printf("checking token: %q", header[len("Bearer "):])

			tokenUser, _, err := token.Verify(header[len("Bearer "):])
			if err != nil {
				Error(w, err, "--invalid token", http.StatusUnauthorized)
				return
			}

			user, err := db.NonTx(r.Context()).GetUserByID(*tokenUser.ID)

			if err != nil {
				log.Println(err)
			}
			if err != nil {
				log.Println(err)
				http.Error(w,
					"error getting user from database",
					http.StatusInternalServerError)
				return
			}

			if user.TokenVersion != tokenUser.TokenVersion {
				log.Println("token version out of date")
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			newCtx := context.WithValue(r.Context(), ctxKeyUser, user)
			r = r.WithContext(newCtx)

			next.ServeHTTP(w, r)
		})
	}
}

func NewOrgJWTMiddleware(db database.Factory,
	token token.Provider) func(http.Handler) http.Handler {

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")

			_, tokenOrgs, err := token.Verify(header[len("Bearer "):])
			if err != nil {
				log.Println(err)
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			if len(tokenOrgs) == 0 {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			orgIDs := make([]int, len(tokenOrgs))
			for i, v := range tokenOrgs {
				orgIDs[i] = *v.ID
			}


			orgs, err := db.NonTx(r.Context()).GetOrgs(database.OrgFilter{IDs: orgIDs })

			if err != nil {
				log.Println(err)
			}
			if err != nil {
				log.Println(err)
				http.Error(w,
					"error getting orgs from database",
					http.StatusInternalServerError)
				return
			}

		L:
			for _, v := range orgs {
				for _, vv := range tokenOrgs {
					if v.ID == vv.ID {
						if v.TokenVersion != vv.TokenVersion {
							log.Println("token version out of date")
							http.Error(w, "invalid token", http.StatusUnauthorized)
							return
						}

						continue L
					}

					http.Error(w, "invalid token", http.StatusUnauthorized)
				}
			}

			newCtx := context.WithValue(r.Context(), ctxKeyOrg, orgs)
			r = r.WithContext(newCtx)

			next.ServeHTTP(w, r)
		})
	}
}
