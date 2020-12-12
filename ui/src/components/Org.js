import { Component } from "react";
import { Link, withRouter } from "react-router-dom";

import Event from "./Event";
import eventhub from "../lib/eventhub";
import libuser from "../lib/user";

class OrgEventList extends Component {
    constructor(props) {
        super(props)

        if (this.props.model) {
            this.state = {
                org: this.props.model
            };
        }
    }

    async componentDidMount() {
        console.log("state: ", this.state);
        console.log("props: ", this.props);
        if (!this.state) {
            const org = await eventhub.getOrg(this.props.orgID);
            this.setState({org});
        }

        if (!this.state.events) {
            const events = (await eventhub.getOrgsEvents(this.state.org.id))
                .map((evt) => {
                    return {
                        event: evt,
                        org: this.props.model,
                    };
                });
            this.setState({events, ...this.state});
        }
    }

    render() {
        if (!this.state || !this.state.events) {
            return <div/>;
        }

        const events = this.state.events.map((evt, i) => {
            console.log("event model", evt);
            return (
                <li key={i} className="event-preview-wide no-scroll-item">
                    <Event preview="wide" model={evt}/>
                </li>
            )
        });

        console.log(events);

        return (
            <ol className="no-scroll-list">
                {events}
            </ol>
        );
    }
};

export default withRouter(class Org extends Component {
    constructor(props) {
        super(props);

        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.toggleFavorite = this.toggleFavorite.bind(this);
    }

    async componentDidMount() {
        console.log("eventhub: ", eventhub);
        const org = await eventhub.getOrg(this.props.orgID);
        this.setState(org);

        const favorites = await libuser.orgFavorites();
        if (favorites.includes(this.state.id)) {
            this.setState({
                favorited: true,
                ...this.state,
            });
        }


        const sorgs = await libuser.orgAdmins();
        if (sorgs.filter((org1) => org1.id == org.id).length) {
            this.setState({
                editable: true,
                ...this.state,
            });
        }
    }

    handleEditSubmit(evt) {
        evt.preventDefault();

        eventhub.putOrg(this.state);

        this.setState({});
        this.props.history.push(`/orgs/${this.state.id}`);
    }

    edit() {
        return (
            <>
                <h1>
                    Edit: {this.state.name}
                </h1>
                <form id="org-edit-form" onSubmit={this.handleEditSubmit}>
                    <label className="edit-field">Org Name
                        <input
                            name="org-name"
                            type="text"
                            value={this.state.name}
                            onChange={(evt) => {
                                this.state.name = evt.target.value;
                                this.setState({...this.state});
                            }}/>
                    </label>
                    <label className="edit-field">Org Description
                        <input
                            name="org-description"
                            type="text"
                            value={this.state.description}
                            onChange={(evt) => {
                                this.state.description = evt.target.value;
                                this.setState({...this.state});
                            }}/>
                    </label>

                    <input type="submit"/>
                </form>
            </>
        )
    }

    async toggleFavorite() {
        if (this.state.favorited) {
            console.log("removing favorite", await libuser.get());
            await libuser.removeOrgFavorite(this.state.id);
            console.log("removed favorite", await libuser.get());
        } else {
            await libuser.addOrgFavorite(this.state.id);
        }

        libuser.orgFavorites().then(favorites => {
            if (favorites.includes(this.state.id)) {
                this.setState({
                    favorited: true,
                    ...this.state,
                });
            } else {
                console.log("removing state favorite");
                this.setState({
                    ...this.state,
                    favorited: false,
                });
                console.log("removed state favorite", this.state);
            }
        });
    }

    imgSrc() {
        return `/api/orgs/${this.state.id}/logo`
    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        if (this.props.edit) {
            return this.edit()
        }

        if (this.props.newEvent) {
            return
        }

        let favoriteButton;
        if (this.state.favorited) {
            favoriteButton = (<button onClick={this.toggleFavorite}>Unfavorite 🔱</button>)
        } else {
            favoriteButton = (<button onClick={this.toggleFavorite}>Favorite 🔱</button>)
        }

        return (
            <div>
                <img src={this.imgSrc()} className="org-logo" />
                <div id="org-meta">
                    <h1>{this.state.name}</h1>
                    <p>{this.state.description}</p>
                </div>
                <div id="org-actions">
                    {favoriteButton}
                    {this.state.editable && (
                        <Link className="button" to={`/orgs/${this.state.id}/edit`}>Edit</Link>
                    )}
                    {this.state.editable && (
                        <Link className="button" to={`/orgs/${this.state.id}/new-event`}>New Event</Link>
                    )}
                </div>
                <OrgEventList model={this.state} />
            </div>
        );
    }
});
