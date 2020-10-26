package main

import (
	"io/ioutil"
	"os"

	markdown "github.com/shurcooL/github_flavored_markdown"
)

func main() {
	byt, err := ioutil.ReadAll(os.Stdin)
	if err != nil {
		panic(err)
	}

	byt = markdown.Markdown(byt)

	n, err := os.Stdout.Write(byt)
	if err != nil {
		panic(err)
	}

	if n != len(byt) {
		panic("incomplete write")
	}
}
