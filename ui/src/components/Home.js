import { Component } from "react";
import { Link } from "react-router-dom";
import libuser from "../lib/user";

import Event from "./Event";

import eventhub from "../lib/eventhub";

class Trending extends Component {
    constructor(props) {
        super(props)

        this.state = {
            events: []
        }
    }

    async componentDidMount() {
        /*if (!this.state) {
            const events = await eventhub.getEventsTrending();
            this.setState({events});
        }*/

        let tempEvents = [];
        const events = await eventhub.getEventsTrending();
        console.log("Trending events: ", events);
        for (let i = 0; i < events.length;  i++) {
            tempEvents.push({
                event: events[i]
            });
            this.setState({
                events: tempEvents
            });
        }
        
    }

    render() {
        if (this.state.events.length === 0) {
            return <div/>;
        }

        console.log("trending state: ", this.state);

        const events = this.state.events.map((element, i) => {
            return (
                <div className="col-sm-12">
                     <Event preview model={element}/>
                    {/*<div className="event-preview">
                       
            </div>*/}
                </div>
            );
        });

        return (
            <>
                <h2 className="heading">Trending Events</h2>
                <div className="row">
                    {events}
                </div>
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

        // TODO: before fetching orgs, sort the events based on the start date and time in ascending order.
        // Then retain only the 4 "earliest" events inside the state object. 

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
                <div className="col-sm-12 col-md-6">
                    <Event previewFav model={event}/>
                    {/*<div className="event-preview">
                        <Event previewFav model={event}/>
            </div>*/}
                </div>
                /*
                <li key={i} className="event-preview-square side-scroll-item">
                    <Event preview model={event} />
                </li>*/
            );
        });

        return (
            <div className="row">
                {events}
            </div>

            /*
            <ol className="side-scroll-list">
                {events}
            </ol>*/
        );
    }
}

class WelcomeBanner extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="jumbotron">
                <div className="container">
                    <img src="https://revelle.ucsd.edu/_images/about/prospective-students.jpg" className="img-fluid"/>
                    <div>Welcome to EventHub!</div> 
                </div>   
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
                { user && user.eventFavorites.length && (
                    <>
                        <h2 id="favorited-heading">Favorited Events</h2>
                        <EventSideScroll eventIDs={user.eventFavorites} />
                    </>
                )}

                { user && ((user.tagFavorites &&user.tagFavorites.length)
                    || (user.orgFavorites && user.orgFavorites.length)) && (
                    <>
                        <h2 className="heading">Events from favorited Orgs and Tags</h2>
                        <EventSideScroll
                            tagIDs={user.tagFavorites}
                            orgIDs={user.orgFavorites} />
                    </>
                )}
            </>
        );
    }


    render() {
        if (!this.state) {
            return <div/>
        }

        const {user} = this.state;


        let top = <div/>;
        if (user && (user.eventFavorites || user.tagFavorites || user.orgFavorites)) {
            top = this.userFavorites();
        } 
        //else {
        //    top = (<WelcomeBanner/>);
        //}

        return (
            <>
                <WelcomeBanner/>
                <div className="container-fluid">
                    <div id="new-btn-container">
                        <button className="btn btn-primary" id="new-org-btn">
                            New Org
                        </button>
                    </div> 
                    {top}
                    <Trending/>
                </div>
            </>
        );
    }
}
