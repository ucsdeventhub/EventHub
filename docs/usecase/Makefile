CHROME ?= chrome
HTML2PDF ?= wkhtmltopdf

use_cases.html: main.go use_cases.html.tmpl assets/logo-html.svg
	go run -mod=mod main.go \
		-tokenEnv GITHUB_TOKEN \
		-tmpl use_cases.html.tmpl \
		-logo assets/logo-html.svg > $@

use_cases.pdf: use_cases.html
	$(HTML2PDF) $< $@

.PHONY: clean
clean:
	rm use_cases.{html,pdf}
