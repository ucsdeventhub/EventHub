package accesscontrol

import "github.com/ucsdeventhub/EventHub/models"

type Provider interface {
	TokenOrgsCanEditEvent(orgs []models.Org, event *models.Event) bool
	TokenOrgsCanAddEventForOrg(orgs []models.Org, orgID int) bool
    TokenOrgsCanEditOrg(orgs []models.Org, orgID int) bool
}

var _ = Provider(DefaultProvider{})

type DefaultProvider struct{}

func (_ DefaultProvider) TokenOrgsCanEditOrg(orgs []models.Org, orgID int) bool {
	for _, v := range orgs {
		if *v.ID == orgID {
			return true
		}
	}

    return false
}

func (_ DefaultProvider) TokenOrgsCanAddEventForOrg(orgs []models.Org, orgID int) bool {
	for _, v := range orgs {
		if *v.ID == orgID {
			return true
		}
	}

    return false
}

func (_ DefaultProvider) TokenOrgsCanEditEvent(orgs []models.Org, event *models.Event) bool {
	for _, v := range orgs {
		if *v.ID == event.OrgID {
			return true
		}
	}

    return false
}
