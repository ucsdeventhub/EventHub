package api

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

func Error(w http.ResponseWriter, err error, msg string, code int) {

	if err != nil {
		log.Output(2, err.Error())
	}
	log.Output(2, msg)
	http.Error(w, msg, code)
}

func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

func Ok(w http.ResponseWriter, body io.Reader) {
	w.WriteHeader(http.StatusOK)
	_, err := io.Copy(w, body)
	if err != nil {
		log.Println(err)
	}
}

func OkJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8");
	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(v)
	if err != nil {
		log.Println(err)
	}
}
