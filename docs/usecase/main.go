package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"path"
	"strconv"
	"strings"

	"golang.org/x/oauth2"

	"github.com/google/go-github/v32/github"
)

var token = flag.String("token", "", "github auth token")
var dir = flag.String("dir", "", "output directory")

func main() {
	flag.Parse()

	if len(*token) == 0 {
		fmt.Fprintln(os.Stderr, "token not provided")
		flag.Usage()
		os.Exit(1)
	}

	if len(*dir) != 0 {
		err := os.MkdirAll(*dir, 0755)
		if err != nil {
			panic(err)
		}
	}


	ctx := context.Background()

	client := github.NewClient(
		oauth2.NewClient(ctx,
			oauth2.StaticTokenSource(
				&oauth2.Token{AccessToken: *token})))

	issues, _, err := client.Issues.ListByRepo(context.Background(),
		"ucsdeventhub",
		"EventHub",
		&github.IssueListByRepoOptions{
			Labels:      []string{"use case"},
			ListOptions: github.ListOptions{PerPage: 100},
		})

	if err != nil {
		panic(err)
	}

	for _, v := range issues {
		f := os.Stdout
		if len(*dir) != 0 {
			fname := path.Join(*dir, strconv.Itoa(*v.Number)+".md")
			f, err = os.OpenFile(fname,
				os.O_CREATE|os.O_WRONLY|os.O_TRUNC,
				0644)
			if err != nil {
				panic(err)
			}
		}

		title := strings.Replace(*v.Title, "use case:", "", -1)
		title = strings.Title(strings.TrimSpace(title))

		fmt.Fprintf(f, "# `#%d` %s\n\n",
			*v.Number,
			title)

		fmt.Fprintln(f, *v.Body)
		fmt.Fprint(f,
			"\n\n"+
			`<hr>`+
			"\n\n"+
			`<div style="page-break-after: always;"></div>`+
			"\n\n")

		if len(*dir) != 0 {
			f.Sync()
			f.Close()
		}
	}
}
