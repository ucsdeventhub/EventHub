package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/ucsdeventhub/EventHub/database/sqlite"
	"github.com/ucsdeventhub/EventHub/email/sendgrid"
	"github.com/ucsdeventhub/EventHub/server"
	"github.com/ucsdeventhub/EventHub/server/api"
	"github.com/ucsdeventhub/EventHub/token/jwt"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	db, err := sqlite.NewFactory("db.sqlite3")
	if err != nil {
		panic(err)
	}

	log.Println("database created")

	server := server.Provider{
		BuildNumber: "local",
		StaticDir:   "static",
		API: &api.Provider{
			IsProduction: false,
			Email: &sendgrid.Provider{
				APIKey: os.Getenv("EVENTHUB_SENDGRID_API_KEY"),
			},
			DB: db,
			Token: &jwt.Provider{
				Lifetime: 180 * 24 * time.Hour,
				Secret:   []byte("asd"),
			},
		},
	}

	handler := server.IntoHandler()
	log.Println("running server on :8080")
	http.ListenAndServe(":8080", handler)
}
