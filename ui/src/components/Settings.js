import { Component } from "react";
import { Link } from "react-router-dom";
import libuser from "../lib/user";
import eventhub from "../lib/eventhub";
import Event from "./Event";
import Org from "./Org";

class Favorited extends Component {
    constructor(props) {
        super(props);

        //this.state = {};
    }

    async componentDidMount() {
        if (this.props.eventIDs) {
            let events = [];
            for (let i = 0; i < this.props.eventIDs.length; i++) {
                //console.log("event ID: ", this.props.eventIDs[i]);
                let event = await eventhub.getEvent(this.props.eventIDs[i]);
                events.push({event});
            }

            this.setState({events});

            console.log("about to fetch orgs:", this.state.events);
            let tempEvents = this.state.events;
            for (let i = 0; i < tempEvents.length; i++) {
                if (!tempEvents[i].org) {
                    tempEvents[i].org = await eventhub.getOrg(tempEvents[i].event.orgID);
                }
            }
        
            this.setState({tempEvents});
        }

        if (this.props.orgIDs) {
            let orgs = []
            for (let i = 0; i < this.props.orgIDs.length; i++) {
                let org = await eventhub.getOrg(this.props.orgIDs[i]);
                orgs.push({org});
            }

            this.setState({orgs});
        }
            
    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        let favorited;
        if (this.state.events) {
            favorited = this.state.events.map((event, i) => {
                return (
                    <div className="col-sm-12">
                        <Event preview model={event}/>
                    </div>
                );
            });
        }
        else if (this.state.orgs) {
            console.log("Loggin this.state.orgs inside settings", this.state.orgs);
            favorited = this.state.orgs.map((element, i) => {
                return (
                    <div className="col-sm-12">
                        <Org preview model={element.org}/>
                    </div>
                );
            });
        }
        

        return (
            <div className="row">
                {favorited}
            </div>
        );
    }
}

export default class Settings extends Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        // get the user - we need it to get favorited events and orgs
        const user = await libuser.get();
        this.setState({
            user
        });
    }

    favoritedEvents() {
        const user = this.state.user;
        console.log("user inside favoritedEvents(): ", user)

        return (
            <>
                <h2 className="heading">Favorited Events</h2>
                <Favorited eventIDs={user.eventFavorites}/>
            </>
        );
    }

    favoritedOrgs() {
        const user = this.state.user;

        return (
            <>
                <h2 className="heading">Favorited Orgs</h2>
                <Favorited orgIDs={user.orgFavorites}/>
            </>
        );
    }

    render() {

        if (!this.state) {
            return <div/>;
        }

        const {user} = this.state;
        console.log("user/state object inside settings: ", user);


        let favoritedEvents = <div/>
        let favoritedOrgs = <div/>
        if (user.eventFavorites && user.eventFavorites.length) {
            // call function to return the favorited events
            favoritedEvents = this.favoritedEvents();
        }
        if (user.orgFavorites && user.orgFavorites.length){
            // call function to return the favorited orgs
            favoritedOrgs = this.favoritedOrgs();
        }
        
        return (
            <div className="container-fluid" id="main-content">
                <div className="row">
                    <div className="col">
                        <h2 id="profile-heading">Profile Settings</h2>
                        <form className="form-inline col-sm-12">
                            <label>Email:</label>
                            <input type="email" className="form-control" value={user.email} readOnly/>
                            <button type="submit" className="btn btn-primary ml-2 change-btn">Change</button>
                        </form>
                    </div>
                </div>
                {favoritedEvents}
                {favoritedOrgs}
            </div>
        );
    }
}