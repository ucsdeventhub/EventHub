import { Component } from "react";
import { Link } from "react-router-dom";
import libuser from "../lib/user";
import eventhub from "../lib/eventhub";


class FavoriteItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isFavorite: true,
        }
    }

    render() {

        let favorite;
        if (this.props.isFavorite) {
            favorite = (<button onClick={this.props.onToggle}>Unfavorite</button>);
        } else {
            favorite = (<button onClick={this.props.onToggle}>Favorite</button>);
        }

        return (<>
            <h3>
                <Link to={this.props.href}>{this.props.name}</Link>
            </h3>
            {favorite}
        </>);
    }
}

export default class Settings extends Component {
    constructor(props) {
        super(props)
    }


    async componentDidMount() {
        //window.setDefaultUser();

        this.setState({
            user: await libuser.get(),
        });


        const eventFavorites = [];
        for (let i in this.state.user.eventFavorites) {
            const event = await eventhub.getEvent(this.state.user.eventFavorites[i]);
            eventFavorites.push({
                ...event,
                favorite: true,
            });
        }

        this.setState({
            ...this.state,
            eventFavorites,
        });

        const orgFavorites = [];
        for (let i in this.state.user.orgFavorites) {
            const org = await eventhub.getOrg(this.state.user.orgFavorites[i]);
            orgFavorites.push({
                ...org,
                favorite: true,
            });
        }

        console.log("org favorites", orgFavorites);

        this.setState({
            ...this.state,
            orgFavorites,
        });
    }


    render() {
        if (!this.state) {
            return <div/>
        }

        const {user} = this.state;
        console.log(this.state);

        let eventFavorites;
        if (this.state.eventFavorites) {
            eventFavorites = this.state.eventFavorites.map((event, idx) => {
                return (<li className="settings-item no-scroll-item" key={idx}>
                    <FavoriteItem
                        name={event.name}
                        href={`/events/${event.id}`}
                        isFavorite={event.favorite}
                        onToggle={() => {
                            const event = this.state.eventFavorites[idx]
                            let promise;
                            if (event.favorite) {
                                promise = libuser.removeEventFavorite(event.id);
                            } else {
                                promise = libuser.addEventFavorite(event.id);
                            }

                            promise.then(() => {
                                this.state.eventFavorites[idx].favorite = event.favorite != true;
                                this.setState(this.state);
                            });
                        }} />
                </li>);
            });
        }

        let orgFavorites;
        if (this.state.orgFavorites) {
            orgFavorites = this.state.orgFavorites.map((org, idx) => {
                return (<li className="settings-item no-scroll-item" key={idx}>
                    <FavoriteItem
                        name={org.name}
                        href={`/orgs/${org.id}`}
                        isFavorite={org.favorite}
                        onToggle={() => {
                            const org = this.state.orgFavorites[idx]
                            let promise;
                            if (org.favorite) {
                                promise = libuser.removeOrgFavorite(org.id);
                            } else {
                                promise = libuser.addOrgFavorite(org.id);
                            }

                            promise.then(() => {
                                this.state.orgFavorites[idx].favorite = org.favorite != true;
                                this.setState(this.state);
                            });
                        }} />
                </li>);
            });
        }

        return (
            <>
                <h1>Settings</h1>
                <label>Email: </label>
                <input readOnly value={user.email}/>

                {eventFavorites && (<>
                    <h2>Favorited Events</h2>
                    <ul className="no-scroll-list">
                        {eventFavorites}
                    </ul>
                </>)}

                {orgFavorites && (<>
                    <h2>Favorited Orgs</h2>
                    <ul className="no-scroll-list">
                        {orgFavorites}
                    </ul>
                </>)}
            </>
        );
    }
}
