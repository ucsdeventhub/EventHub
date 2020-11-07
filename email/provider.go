package email


type Message struct {
	ToName, ToAddr, FromName, FromAddr, Subject, Body string
}

type Provider interface {
	SendMail(Message) error
}
