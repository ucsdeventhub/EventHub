import { Component } from "react";
import { Link } from "react-router-dom";
import libuser from "../lib/user";

import Event from "./Event";

import eventhub from "../lib/eventhub";

class Trending extends Component {
    constructor(props) {
        super(props)
    }

    async componentDidMount() {
        if (!this.state) {
            const events = await eventhub.getEventsTrending();
            this.setState({events});
        }
    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        console.log("trending state: ", this.state);

        const events = this.state.events.map((event, i) => {
            return (
                <li key={event.id} className="event-preview-wide no-scroll-item" >
                    <Event preview model={{event}} />
                </li>
            );
        });

        return (
            <>
                <h2>Trending Events</h2>
                <ol className="no-scroll-list">
                    {events}
                </ol>
            </>
        );

    }
}

class EventSideScroll extends Component {
    constructor(props) {
        super(props)
        if (this.props.events) {
            this.state = {
                events: this.props.events.map((event) => {return {event}}),
            };
        }
    }

    async componentDidMount() {
        if (!this.events && !this.props.eventIDs) {
            const events = (await eventhub.getEvents(this.props.orgIDs, this.props.tagIDs))
                .map((event) => {return {event}});

            this.setState({events});
        } else if (!this.events && this.props.eventIDs) {
            let events = [];
            for (let i = 0; i < this.props.eventIDs.length; i++) {
                console.log("event ID: ", this.props.eventIDs[i]);
                let event = await eventhub.getEvent(this.props.eventIDs[i]);
                events.push({event});
            }

            this.setState({events});
        }

        console.log("about to fetch orgs:", this.state.events);
        let events = this.state.events;
        for (let i = 0; i < events.length; i++) {
            if (!events[i].org) {
                events[i].org = await eventhub.getOrg(events[i].event.orgID);
            }
        }

        this.setState({events});

    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        const events = this.state.events.map((event, i) => {
            return (
                <li key={event.id} className="event-preview-square side-scroll-item">
                    <Event preview model={event} />
                </li>
            );
        });

        return (
            <ol className="side-scroll-list">
                {events}
            </ol>
        );
    }
}

class WelcomeBanner extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <h1>Welcome to Event Hub</h1>
            </div>
        )
    }
}



export default class Home extends Component {
    constructor(props) {
        super(props)
    }

    async componentDidMount() {
        //window.setDefaultUser();

        this.setState({
            user: await libuser.get(),
        });
    }

    userFavorites() {
        const user = this.state.user;
        return (
            <>
                { user && user.eventFavorites && user.eventFavorites.length > 0 && (
                    <>
                        <h2>Favorited Events</h2>
                        <EventSideScroll eventIDs={user.eventFavorites} />
                    </>
                )}
            </>
        );

        /*
                { user && ((user.tagFavorites && user.tagFavorites.length > 0)
                    || (user.orgFavorites && user.orgFavorites.length)) && (
                    <>
                        <h2>Favorited Events</h2>
                        <EventSideScroll
                            tagIDs={user.tagFavorites}
                            orgIDs={user.orgFavorites} />
                    </>
                )}
                */
    }


    render() {
        if (!this.state) {
            return <div/>
        }

        const {user} = this.state;


        let top;
        if (user && (user.eventFavorites || user.tagFavorites || user.orgFavorites)) {
            top = this.userFavorites();
        } else {
            top = (<WelcomeBanner/>);
        }

        return (
            <>
                {top}
                <Trending/>
            </>
        );
    }
}
