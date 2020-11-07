package sendgrid

import (
	"bytes"
	"encoding/json"
	"fmt"

	"github.com/sendgrid/sendgrid-go"
	sgmail "github.com/sendgrid/sendgrid-go/helpers/mail"

	"github.com/ucsdeventhub/EventHub/email"
)

type Provider struct {
	APIKey string

	client *sendgrid.Client
}

type ErrorResponse struct {
	Errors []Error `json:"errors"`
}

func (err *ErrorResponse) Error() string {
	s := bytes.NewBuffer(nil)

	for _, v := range err.Errors {
		s.Write([]byte(v.Message))
		s.Write([]byte("\n"))
	}

	return s.String()
}

type Error struct {
	Message string `json:"message"`
	Field   string `json:"field"`
	Help    string `json:"help"`
}

func (p *Provider) SendMail(msg email.Message) error {

	from := sgmail.NewEmail(msg.FromName, msg.FromAddr)
	to := sgmail.NewEmail(msg.ToName, msg.ToAddr)
	msg1 := sgmail.NewSingleEmail(from, msg.Subject, to, msg.Body, "")

	if p.client == nil {
		p.client = sendgrid.NewSendClient(p.APIKey)
	}

	res, err := p.client.Send(msg1)
	if err != nil {
		return err
	}

	if res.StatusCode >= 400 {
		ret := &ErrorResponse{}
		err := json.Unmarshal([]byte(res.Body), ret)
		if err != nil {
			return fmt.Errorf("error parsing error message: %w", err)
		}
		return ret
	}

	return nil
}
