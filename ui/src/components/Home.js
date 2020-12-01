import { Component } from "react";
import { Link } from "react-router-dom";
import libuser from "../lib/user";

import Event from "./Event";

class Trending extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.setState({
            events: [
                {
                    event: {
                        id: 1,
                        name: "event name 1",
                        orgID: 2,
                        description: "event description",
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        tags: ["gaming", "greek"],
                        location: "price center",
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                    },
                    org: {
                        id: 2,
                        name: "org name",
                    },
                },
                {
                    event: {
                        id: 1,
                        name: "event name 2",
                        orgID: 2,
                        description: "event description",
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        tags: ["gaming", "greek"],
                        location: "price center",
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                    },
                    org: {
                        id: 2,
                        name: "org name",
                    },
                },
            ]
        });
    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        const events = this.state.events.map((event, i) => {
            return (
                <li key={i} className="event-preview-wide no-scroll-item" >
                    <Event preview model={event} />
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
    }

    componentDidMount() {
        this.setState({
            events: [
                {
                    event: {
                        id: 1,
                        name: "event name 1",
                        orgID: 2,
                        description: "event description",
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        tags: ["gaming", "greek"],
                        location: "price center",
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                    },
                    org: {
                        id: 2,
                        name: "org name",
                    },
                },
                {
                    event: {
                        id: 1,
                        name: "event name 2",
                        orgID: 2,
                        description: "event description",
                        startTime: new Date().toISOString(),
                        endTime: new Date().toISOString(),
                        tags: ["gaming", "greek"],
                        location: "price center",
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                    },
                    org: {
                        id: 2,
                        name: "org name",
                    },
                },
            ]
        });
    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        const events = this.state.events.map((event, i) => {
            return (
                <li key={i} className="event-preview-square side-scroll-item">
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
        return <div/>
    }
}



export default class Home extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        window.setDefaultUser();

        this.setState({
            user: libuser.get(),
        });
    }

    userFavorites() {
        return (
            <>
                <h2>Favorited Events</h2>
                <EventSideScroll events={[]} />

                <h2>Upcoming events from favorited Orgs and Tags</h2>
                <EventSideScroll events={[]} />
            </>
        );
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
