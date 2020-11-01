package main

import (
	"bufio"
	"bytes"
	"context"
	"flag"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"golang.org/x/oauth2"

	"github.com/google/go-github/v32/github"
	markdown "github.com/shurcooL/github_flavored_markdown"
)

var flagToken = flag.String("token", "", "github auth token")
var flagTokenEnv = flag.String("tokenEnv", "", "environment var for github auth token, takes precedence over -token")
var flagTmpl = flag.String("tmpl", "", "template file")
var flagLogo = flag.String("logo", "", "logo file")

type UseCaseDoc struct {
	Intro    string
	Logo template.HTML
	UseCases []*UseCase
}

func (doc *UseCaseDoc) FromIssues(issues []*github.Issue) *UseCaseDoc {
	doc.Intro = "hello!!"
	doc.UseCases = make([]*UseCase, len(issues))
	for i, v := range issues {
		doc.UseCases[i] = new(UseCase).FromIssue(v)
	}

	return doc
}

type UseCase struct {
	Title,
	Number string
	Labels []*github.Label
	Sections map[string]template.HTML
}

func (uc *UseCase) FromIssue(issue *github.Issue) *UseCase {
	uc.Title = strings.Title(
		strings.TrimSpace(
			strings.Replace(*issue.Title, "use case:", "", -1)))
	uc.Number = strconv.Itoa(*issue.Number)

	uc.Labels = make([]*github.Label, 0, len(issue.Labels) -1)
	for _, v := range issue.Labels {
		if *v.Name != "use case" {
			uc.Labels = append(uc.Labels, v)
		}
	}

	validSections := []string{
		"Description", "User Goal", "Desired Outcome", "Actor",
		"Dependent Use Cases", "Requirements", "Pre-Conditions",
		"Post-Conditions", "Trigger", "Workflow", "Alternative Workflow",
	}

	uc.Sections = make(map[string]template.HTML)
	section := ""
	lines := bufio.NewScanner(strings.NewReader(*issue.Body))
ScanLoop:
	for lines.Scan() {
		line := bytes.TrimSpace(lines.Bytes())

		if bytes.HasPrefix(line, []byte("##")) {
			sectionName := bytes.Title(
				bytes.TrimSpace(
					bytes.Replace(line, []byte("##"), nil, -1)))
			for _, v := range validSections {
				if string(sectionName) == v {
					section = string(sectionName)
					continue ScanLoop
				}
			}

			section = ""
			log.Printf("unknown section name: %s", sectionName)
		} else if section != "" {
			uc.Sections[section] = uc.Sections[section] +
				template.HTML("\n") +
				template.HTML(line)
		}
	}

	for k, v := range uc.Sections {
		uc.Sections[k] = template.HTML(
			markdown.Markdown(
				githubIssueLinks([]byte(v))))
	}

	for _, v := range validSections {
		_, ok := uc.Sections[v]

		if !ok {
			log.Printf("missing section %v for %v",
				v, uc.Title)
		}
	}

	return uc
}

func main() {
	flag.Parse()
	log.SetOutput(os.Stderr)

	if len(*flagTokenEnv) != 0 {
		*flagToken = os.Getenv(*flagTokenEnv)
	}

	if len(*flagToken) == 0 {
		fmt.Fprintln(os.Stderr, "token not provided")
		flag.Usage()
		os.Exit(1)
	}

	if len(*flagTmpl) == 0 {
		fmt.Fprintln(os.Stderr, "tmpl not provided")
		flag.Usage()
		os.Exit(1)
	}

	ctx := context.Background()


	client := github.NewClient(
		oauth2.NewClient(ctx,
			oauth2.StaticTokenSource(
				&oauth2.Token{AccessToken: *flagToken})))

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

	log.Println(new(UseCase).FromIssue(issues[0]))
	doc := new(UseCaseDoc).FromIssues(issues)

	{
		byt, err := ioutil.ReadFile(*flagLogo)
		if err != nil {
			log.Fatal(err)
		}

		doc.Logo = template.HTML(byt)
	}

	byt, err := ioutil.ReadFile(*flagTmpl)
	if err != nil {
		log.Fatal(err)
	}

	tmpl, err := template.New("use-case-documents").Parse(string(byt))
	if err != nil {
		log.Fatal(err)
	}

	err = tmpl.Execute(os.Stdout, doc)
	if err != nil {
		log.Fatal(err)
	}
}

var githubIssueLinksRegex = regexp.MustCompile("#[0-9]+\n?")

func githubIssueLinks(body []byte) []byte {
	return githubIssueLinksRegex.ReplaceAllFunc(body,
		func(in []byte) []byte {
			number := in[1:]
			le := ""

			if bytes.HasSuffix(number, []byte("\n")) {
				le = "<br />"
				number = number[:len(number)-1]
			}

			return []byte(fmt.Sprintf(`<a href="#%s">UC%s</a>%s`, number, number, le))
		})
}
