package sendgrid_test

import (
	"os"
	"testing"

	"github.com/ucsdeventhub/EventHub/email"
	"github.com/ucsdeventhub/EventHub/email/sendgrid"
)

func TestSendgrid(t *testing.T) {

	p := sendgrid.Provider{
		APIKey: os.Getenv("EVENTHUB_SENDGRID_API_KEY"),
	}

	err := p.SendMail(email.Message{
		ToName:   "Julio",
		ToAddr:   "julio.grillo98@gmail.com",
		FromName: "Julio",
		FromAddr: "jcgrillo@ucsd.edu",
		Subject:  "this is a subject",
		Body:     "hello!",
	})

	if err != nil {
		t.Fatal(err)
	}

}
