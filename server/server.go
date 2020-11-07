package server

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"

	"github.com/ucsdeventhub/EventHub/server/api"
)

type Provider struct {
	BuildNumber string
	StaticDir   string
	API         *api.Provider
}

type StatusResponse struct {
	BuildNumber string `json:"buildNumber"`
	IsProduction bool  `json:"isProduction"`
	Status      string `json:"status"`
	Time        string `json:"time"`
}

func (p *Provider) StatusHandler(w http.ResponseWriter, r *http.Request) {
	err := json.NewEncoder(w).Encode(StatusResponse{
		BuildNumber: p.BuildNumber,
		IsProduction: p.API.IsProduction,
		Status:      "OK",
		Time:        time.Now().Format(time.RFC3339),
	})

	if err != nil {
		log.Println(err)
	}
}

func (p *Provider) IntoHandler() http.Handler {
	router := chi.NewRouter()

	router.Use(
		middleware.Logger,
	)

	router.Get("/status", p.StatusHandler)
	router.Get("/api/status", p.StatusHandler)
	router.Route("/api/", func(r chi.Router) {
		api.New(r, p.API)
	})
	router.Get("/", http.FileServer(http.Dir(p.StaticDir)).ServeHTTP)

	return router
}
