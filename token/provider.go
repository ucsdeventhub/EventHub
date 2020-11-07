package token

import "github.com/ucsdeventhub/EventHub/models"

// NOTE: the token should only store the IDs and TokenVersions of user and orgs
// and thus, the models returned from Verify will only have valid data in the
// IDs and TokenVersions
// TODO: maybe create a different type to communicate this (probably the jwt.Resource)
type Provider interface {
	IssueToken(user *models.User, orgs []models.Org) (string, error)
	Verify(string) (*models.User, []models.Org, error)
}
