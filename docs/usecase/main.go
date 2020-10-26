package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"path"
	"regexp"
	"sort"
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

	sort.Slice(issues, func(i, j int) bool {
		return *issues[i].Number < *issues[j].Number
	})

	if err != nil {
		panic(err)
	}

	anchors := table(issues)

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


		fmt.Fprintf(f,
			useCaseTitle(v)+
			"\n\n")

		body := githubIssueLinks(anchors, *v.Body)

		fmt.Fprintln(f, body)
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


var githubIssueLinksRegex = regexp.MustCompile("#[0-9]+")

func githubIssueLinks(anchors map[int]string, body string) string {
	body = strings.Replace(body, "\x0d", "", -1)
	return githubIssueLinksRegex.ReplaceAllStringFunc(body,
		func(in string) string {
			number, _ := strconv.Atoi(in[1:])
			if number == 0 {
				return in
			}

			return fmt.Sprintf(`<a href="#%s">%s</a>`,
				anchors[number],
				in)
		})
}

func useCaseName(v *github.Issue) string {
	title := strings.Replace(*v.Title, "use case:", "", -1)
	title = strings.Title(strings.TrimSpace(title))

	return fmt.Sprintf(`<code>#%d</code> %s`,
		*v.Number,
		title)
}

func useCaseAnchor(v *github.Issue) string {
	name := strings.Replace(*v.Title, "use case:", "", -1)
	name = strings.Title(strings.TrimSpace(name))
	name = strings.ToLower(name)
	return strings.Replace(name, " ", "-", -1)
}

func useCaseTitle(v *github.Issue) string {
	return fmt.Sprintf(`<h1><a name="%s">%s</a></h1>`,
		useCaseAnchor(v),
		useCaseName(v))
}

func table(issues []*github.Issue) map[int]string {
	anchors := make(map[int]string)

	f := os.Stdout
	if len(*dir) != 0 {
		fname := path.Join(*dir, "toc.md")
		var err error
		f, err = os.OpenFile(fname,
			os.O_CREATE|os.O_WRONLY|os.O_TRUNC,
			0644)
		if err != nil {
			panic(err)
		}
	}

	fmt.Fprint(f,
		`<h1>Table of Contents</h1>`+
		"\n"+
		`<ul>`+
		"\n\n")

	for _, v := range issues {
		anchors[*v.Number] = useCaseAnchor(v)

		fmt.Fprintf(f,
			`<li><a href="#%s">%s</a></li>`+"\n",
			useCaseAnchor(v),
			useCaseName(v))
	}

	fmt.Fprint(f,
		`</ul>`+
		"\n\n")

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

	return anchors
}
