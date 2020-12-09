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
	// return info
        const eventsRoot = "https://www.facebook.com/events/"
        const descTrimL = "/events/"
        const descTrimR = "?acontext=%7B%22ref%22%3A51%2C%22source%22%3A5%2C%22action_history%22%3A[%7B%22surface%22%3A%22page%22%2C%22mechanism%22%3A%22main_list%22%2C%22extra_data%22%3A%22%5C%22[]%5C%22%22%7D]%2C%22has_source%22%3Atrue%7D"
        const eventNodesPath = `(//*[@id="upcoming_events_card"])//span[@class=" _50f7"]`

        var org string
        var name []string
        var timeInfo []string
        var description []string

        var eventNodes []*cdp.Node
        var linkNodes []*cdp.Node
        var tags [][]string

        var newURL string
        var attrib map[string]string

        // create context
        allocCtx, _ := chromedp.NewExecAllocator(
                context.Background(),
                ChromedpDebugOpts()...)

        ctx, cancel := chromedp.NewContext(allocCtx)
        defer cancel()

        //Navigate to the Org page containing all events
        err := chromedp.Run(ctx,
                chromedp.Navigate( url ),
        )

        //Error trying to navigate to specified url
        if err != nil {
                return err, org, "", "", ""
        }

	//Get org name and number of events
        err = chromedp.Run(ctx,
                chromedp.Nodes( eventNodesPath, &eventNodes),
                chromedp.Nodes( `//*[@class="_4dmk"]/a`, &linkNodes),
                chromedp.Text(`//*[@class="_64-f"]`, &org),
        )

        //Adjust the array sizes to the number of upcoming events
        name = make([]string, len( eventNodes ))
        timeInfo = make([]string, len( eventNodes ))
        description = make([]string, len( eventNodes ))
        tags = make([][]string, len( eventNodes ))

        //Get details for each event
        for i := 0; i < len( eventNodes ); i++ {
        
                //Get event name
                err = chromedp.Run(ctx,
                        chromedp.Text( eventNodes[i].FullXPath() , &name[i] ),
                )

                //Navigate to the specific event Facebook page
                err = chromedp.Run(ctx,
                        chromedp.Attributes( linkNodes[i].FullXPath() , &attrib ),
                )
                newURL =  attrib["href"]
                newURL = strings.TrimLeft( newURL, descTrimL )
                newURL = strings.TrimRight( newURL, descTrimR )
                newURL = eventsRoot + newURL

                var tagList []*cdp.Node

                //Get event description and time details        
                err = chromedp.Run(ctx,
                        chromedp.Navigate( newURL ),
                        chromedp.Text( `//*[@class="_63ew"]/span`, &description[i] ),
                        chromedp.AttributeValue( `//*[@class="_2ycp _5xhk"]`, "content", &timeInfo[i], nil ),
                        chromedp.Nodes(`//*[@class="_63ep _63eq"]/a`, &tagList),
                )
		
		//Get the tags for this event
                tags[i] = make([]string, len( tagList ))
                for j := 0; j < len( tagList ); j++ {
                        err = chromedp.Run(ctx,
                                chromedp.Text( tagList[j].FullXPath(), &tags[i][j] ),
                        )
                }
                err = chromedp.Run(ctx,
                        chromedp.Navigate( url ),
                )

        }

	return nil, nil
}

func main() {
	log.Println(GetEvents("https://www.facebook.com/pg/csesucsd/events/"))
}
