CHROME=chrome

use_cases.md: main.go
	@echo 'go run main.go -token GITHUB_TOKEN > $@'
	@go run main.go -token $(GITHUB_TOKEN) > $@

use_cases.html: use_cases.md
	pandoc -f gfm -o use_cases.html use_cases.md

use_cases.pdf: use_cases.html
	$(CHROME) --headless --no-margins --print-to-pdf=$@ file://$(shell pwd)/$<
