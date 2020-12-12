package main

import (
	"context"
	"log"

	"github.com/ucsdeventhub/EventHub/database/sqlite"
	"github.com/ucsdeventhub/EventHub/orgproxy"
)

var org2url = [][2]string{
	{
		"TritonSE",
		"https://www.facebook.com/pg/TritonSE/events/",
	},
	{
		"Gary Society",
		"https://www.facebook.com/GarySocietyUCSD/events/",
	},
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	db, err := sqlite.NewFactory("db.sqlite3")
	if err != nil {
		panic(err)
	}

	ctx := context.Background()

	for _, v := range org2url {
		log.Println("scraping: ", v[0])

		org, err := db.NonTx(ctx).GetOrgByName(v[0])
		if err != nil {
			log.Println("error getting org by name: ", err)
			continue
		}

		events, err := orgproxy.GetEvents(v[1])
		if err != nil {
			log.Println("error scraping events: ", err)
			continue
		}

		for _, v := range events {
			v.OrgID = *org.ID

			// If you get a cryptic foreign key violation it is likely
			// caused by an unknwon tag...
			log.Println("upserting: ", v)
			_, err := db.NonTx(ctx).UpsertEventWithoutID(&v)
			if err != nil {
				log.Println("error: ", err)
				continue
			}
		}
	}
}
