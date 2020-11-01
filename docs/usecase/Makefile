CHROME ?= chrome
HTML2PDF ?= wkhtmltopdf

DOCUMENTS = requirements.pdf use_cases.pdf
.PRECIOUS: %.html

all: $(DOCUMENTS)

%.html: %.html.tmpl main.go assets/logo-html.svg
	go run -mod=mod main.go \
		-tokenEnv GITHUB_TOKEN \
		-tmpl $< \
		-logo assets/logo-html.svg > $@


%.pdf: %.html
	$(HTML2PDF) $< $@

.PHONY: clean
clean:
	rm -f use_cases.{html,pdf} requirements.{html,pdf}
