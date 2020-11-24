// Command text is a chromedp example demonstrating how to extract text from a
// specific element.
package main

import (
	"context"
	"log"

	"github.com/chromedp/chromedp"
	"github.com/ucsdeventhub/EventHub/models"
)

const UserAgentStr = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"

func ChromedpDebugOpts() []func(*chromedp.ExecAllocator) {
	return append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("auto-open-devtools-for-tabs", true),
		chromedp.Flag("headless", false),
		chromedp.WindowSize(1024, 900),
		chromedp.UserAgent(UserAgentStr),
		chromedp.Flag("disable-background-networking", false),
	)
}

func GetEvents(url string) ([]models.Event, error) {
	// create context
	allocCtx, _ := chromedp.NewExecAllocator(
		context.Background(),
		ChromedpDebugOpts()...)

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	// run task list
	var res string
	err := chromedp.Run(ctx,
		chromedp.Navigate(`https://www.facebook.com/pg/csesucsd/events/`),
	)

	if err != nil {
		return nil, err
	}

	err = chromedp.Run(ctx,
		chromedp.Text(`//*[@class="_2l3f _2pic"]`, &res),
	)

	return nil, nil
}

func main() {
	log.Println(GetEvents("https://www.facebook.com/pg/csesucsd/events/"))
}
