CHROME ?= chrome
HTML2PDF ?= wkhtmltopdf

use_cases.md: main.go
	@echo 'go run main.go -token GITHUB_TOKEN > $@'
	@go run -mod=mod main.go -token $(GITHUB_TOKEN) > $@

use_cases.html: use_cases.md md2html.go
	cat use_cases.md | go run -mod=mod md2html.go > use_cases.html

use_cases.pdf: use_cases.html
	$(HTML2PDF) $< $@

.PHONY: clean
clean:
	rm use_cases.{md,html,pdf}
