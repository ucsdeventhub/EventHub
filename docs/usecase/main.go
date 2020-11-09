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
	"path/filepath"
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
	Logo     template.HTML
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
	Labels   []*github.Label
	Sections []*Section // map[string]template.HTML
}

func (uc *UseCase) IsDesign() bool {
	ret := false
	designSections := []string{
		"Dependent Design Use Cases", "Design Workflow",
		"Design Alternative Workflow",
	}

	for _, v := range designSections {
		ret = ret || uc.GetSection(v) != nil
	}

	return ret
}

func (uc *UseCase) GetSection(name string) *Section {
	for i, v := range uc.Sections {
		if v.Name == name {
			return uc.Sections[i]
		}
	}

	return nil
}

func (uc *UseCase) AddSection(name string, isDesign bool) *Section {
	for i, v := range uc.Sections {
		if v.Name == name {
			log.Printf("duplicate section in %s: %s", uc.Number, name)
			return uc.Sections[i]
		}
	}

	uc.Sections = append(uc.Sections, &Section{
		Name:     name,
		IsDesign: isDesign,
		Body:     "",
	})

	return uc.Sections[len(uc.Sections)-1]
}

type Section struct {
	Name     string
	IsDesign bool
	Body     template.HTML
}

func (s *Section) Append(text string) {
	s.Body += template.HTML(text)
}

func (uc *UseCase) FromIssue(issue *github.Issue) *UseCase {
	uc.Title = strings.Title(
		strings.TrimSpace(
			strings.Replace(*issue.Title, "use case:", "", -1)))
	uc.Number = strconv.Itoa(*issue.Number)

	uc.Labels = make([]*github.Label, 0, len(issue.Labels)-1)
	for _, v := range issue.Labels {
		if *v.Name != "use case" {
			uc.Labels = append(uc.Labels, v)
		}
	}

	validSections := []string{
		"Description", "User Goal", "Desired Outcome", "Actor",
		"Dependent Use Cases", "Requirements", "Pre-Conditions",
		"Post-Conditions", "Trigger", "Workflow", "Alternative Workflow",
		"Dependent Design Use Cases", "Design Workflow",
		"Design Alternative Workflow",
	}

	designSections := []string{
		"Description", "User Goal", "Desired Outcome", "Actor",
		"Dependent Use Cases", "Requirements", "Pre-Conditions",
		"Post-Conditions", "Trigger",
		"Dependent Design Use Cases", "Design Workflow",
		"Design Alternative Workflow",
	}

	//uc.Sections = make(map[string]template.HTML)
	section := (*Section)(nil)
	lines := bufio.NewScanner(strings.NewReader(*issue.Body))

	for lines.Scan() {
		line := bytes.TrimSpace(lines.Bytes())

		if bytes.HasPrefix(line, []byte("##")) {
			sectionName := bytes.Title(
				bytes.TrimSpace(
					bytes.Replace(line, []byte("##"), nil, -1)))

			var isValid, isDesign bool
			for _, v := range validSections {
				if string(sectionName) == v {
					isValid = true
				}
			}

			for _, v := range designSections {
				if string(sectionName) == v {
					isDesign = true
				}
			}

			if isValid {
				section = uc.AddSection(string(sectionName), isDesign)
			} else {
				section = nil
				log.Printf("unknown section name in #%d: %s",
					*issue.Number, sectionName)
			}

		} else if section != nil {
			section.Append("\n" + string(line))
		}
	}

	var docPrefix string
	{
		_, fname := filepath.Split(*flagTmpl)
		switch fname {
		case "use_cases.html.tmpl":
			docPrefix = "UC"
		case "design_use_cases.html.tmpl":
			docPrefix = "DUC"
		case "requirements.html.tmpl":
			docPrefix = "REQ"
		}
	}

	for i, v := range uc.Sections {
		uc.Sections[i].Body = template.HTML(
			markdown.Markdown(
				githubIssueLinks(docPrefix, []byte(v.Body))))
	}

L:
	for _, v := range validSections {
		for _, vv := range uc.Sections {
			if vv.Name == v {
				continue L
			}
		}

		log.Printf("missing section in %d: %v", *issue.Number, v)
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

func githubIssueLinks(docPrefix string, body []byte) []byte {
	return githubIssueLinksRegex.ReplaceAllFunc(body,
		func(in []byte) []byte {
			number := in[1:]
			le := ""

			if bytes.HasSuffix(number, []byte("\n")) {
				le = "<br />"
				number = number[:len(number)-1]
			}

			return []byte(fmt.Sprintf(`<a href="#%s">%s%s</a>%s`,
				number, docPrefix, number, le))
		})
}
