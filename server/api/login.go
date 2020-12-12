package api

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/ucsdeventhub/EventHub/database"
	"github.com/ucsdeventhub/EventHub/email"
	"github.com/ucsdeventhub/EventHub/models"
	"github.com/ucsdeventhub/EventHub/utils"
)

func (srv *Provider) Login(w http.ResponseWriter, r *http.Request) {

	if srv.IsProduction {
		// deter automated login attacks
		// to have something really effective we'd need to also need to
		// rate limit users by IP or somthing
		time.Sleep(1 * time.Second)
	}

	query, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		Error(w, err, "invalid query params", http.StatusBadRequest)
		return
	}

	qcreate := query.Get("create")
	qemail := query.Get("email")
	if len(qemail) == 0 {
		Error(w, nil, "email not provided", http.StatusBadRequest)
		return
	}

	qcode := query.Get("code")

	srv.DB.WithTx(r.Context(), func(db database.TxProvider) error {
		if len(qcode) == 0 { // step 1, send email

			var newEmail bool
			{
				_, err = db.GetUserByEmail(qemail)
				if errors.Is(err, database.ErrNoRows) {
					newEmail = true
				} else if err != nil {
					Error(w, err, "internal server error", http.StatusInternalServerError)
					return nil
				}
			}

			if len(qcreate) != 0 {
				create, err := strconv.ParseBool(qcreate)
				if err != nil {
					Error(w, err, "create parameter not a bool", http.StatusBadRequest)
					return nil
				}

				_, err = db.GetUserByEmail(qemail)
				if create != newEmail {
					if create {
						Error(w, nil, "account already created", http.StatusConflict)
						return nil
					}
					Error(w, nil, "account does not exist", http.StatusConflict)
					return nil
				}

				if create {
					_, err = db.UpsertUser(&models.User{Email: qemail})
					if err != nil {
						Error(w, err, "internal server error", http.StatusInternalServerError)
						return nil
					}
				}

			} else {
				_, err = db.UpsertUser(&models.User{Email: qemail})
				if err != nil {
					Error(w, err, "internal server error", http.StatusInternalServerError)
					return nil
				}
			}

			code, err := utils.SecretCode(10)
			if err != nil {
				Error(w, err, "internal server error", http.StatusInternalServerError)
				return nil
			}

			err = db.AddTokenRequestForEmail(qemail, code)
			if err != nil {
				Error(w, err, "internal server error", http.StatusInternalServerError)
				return nil
			}
			err = db.Commit()
			if err != nil {
				Error(w, err, "internal server error", http.StatusInternalServerError)
				return nil
			}

			if !srv.IsProduction && (qemail == "test-org@ucsd.edu" || qemail == "test-user@ucsd.edu") {
				NoContent(w)
				return nil
			}

			var msg string

			if newEmail {
				msg = `Welcome to Event Hub!

Here's your verification code:

%s

For future reference, we don't use passwords, you'll always get an email
when a new log in is requested. Don't worry thought, we use tokens saved to
your device so you don't have to go throught this process when you come back.`
			} else {
				msg = `Wecome back!

Here's your verification code:

%s`
			}

			srv.Email.SendMail(email.Message{
				FromName: "Event Hub",
				FromAddr: "jcgrillo@ucsd.edu",
				ToName:   "",
				ToAddr:   qemail,
				Subject:  "Event Hub Login",
				Body:     fmt.Sprintf(msg, code),
			})

			NoContent(w)
			return nil

		} else { // step 2
			code, err := db.GetTokenRequestByEmail(qemail)
			if err != nil {
				Error(w, err, "incorrect code", http.StatusBadRequest)
				return nil
			}

			// dev backdoor
			log.Println("code: ", qcode)
			if srv.IsProduction || !(qemail == "test-org@ucsd.edu" || qemail == "test-user@ucsd.edu") {
				if code != qcode {
					Error(w, err, "incorrect code", http.StatusBadRequest)
					return nil
				}

				err := db.DeleteTokenRequestByEmail(qemail)
				if err != nil {
					Error(w, err, "internal server error", http.StatusInternalServerError)
					return nil
				}
			} else {
				// !prod and qemail is test account
				if qcode != "1010" {
					Error(w, err, "incorrect code", http.StatusBadRequest)
					return nil
				}
			}

			user, err := db.GetUserByEmail(qemail)
			if err != nil {
				Error(w, err, "internal server error", http.StatusInternalServerError)
				return nil
			}

			orgs, err := db.GetOrgsForEmail(qemail)
			if err != nil {
				Error(w, err, "internal server error", http.StatusInternalServerError)
				return nil
			}

			token, err := srv.Token.IssueToken(user, orgs)
			if err != nil {
				Error(w, err, "internal server error", http.StatusInternalServerError)
				return nil
			}
			log.Println("token: ", token)

			OkJSON(w, token)
			return nil
		}
	})
}
