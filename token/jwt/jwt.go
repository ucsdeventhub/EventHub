package jwt

import (
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/dgrijalva/jwt-go"

	"github.com/ucsdeventhub/EventHub/models"
	"github.com/ucsdeventhub/EventHub/token"
)

var _ token.Provider = &Provider{}

type Provider struct {
	Secret   []byte
	Lifetime time.Duration
}

type Claims struct {
	User Resource `json:"user"`
	Orgs []Resource `json:"orgs"`
	jwt.StandardClaims
}

// this is some kind of resouce
type Resource struct {
	ID      int `json:"id"`
	Version int `json:"version"`
}

func (p *Provider) IssueToken(user *models.User, orgs []models.Org) (string, error) {

	userResource := Resource{
		ID:      *user.ID,
		Version: user.TokenVersion,
	}

	orgsResources := make([]Resource, len(orgs))
	for i, v := range orgs {
		orgsResources[i] = Resource{
			ID:      *v.ID,
			Version: v.TokenVersion,
		}
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
		User: userResource,
		Orgs: orgsResources,
		StandardClaims: jwt.StandardClaims{
			IssuedAt: time.Now().Unix(),
		},
	})

	return token.SignedString(p.Secret)
}

// NOTE: the returned models will only have the ID and TokenVersion fields present
func (p *Provider) Verify(s string) (*models.User, []models.Org, error) {

	token, err := jwt.ParseWithClaims(s, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v",
				token.Header["alg"])
		}

		return p.Secret, nil
	})
	if err != nil {
		return nil, nil, err
	}

	claims := token.Claims.(*Claims)

	if time.Now().Sub(time.Unix(claims.IssuedAt, 0)) > p.Lifetime {
		log.Println("token expired")
		return nil, nil, errors.New("invalid token")
	}

	if !token.Valid {
		return nil, nil, errors.New("invalid token")
	}

	user := &models.User{
		ID:           &claims.User.ID,
		TokenVersion: claims.User.Version,
	}

	orgs := make([]models.Org, len(claims.Orgs))
	for i, v := range claims.Orgs {
		orgs[i] = models.Org{
			ID:           &v.ID,
			TokenVersion: v.Version,
		}
	}

	return user, orgs, nil

}
