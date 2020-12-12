import { Fragment, Component } from "react";
import { Link, withRouter } from "react-router-dom";
import eventhub from "../lib/eventhub";
import libuser from "../lib/user";

export default withRouter(class Event extends Component {
    constructor(props) {
        super(props);

        if (props.model) {
            this.state = props.model;
        }

        if (props.newForOrg) {
            this.state = {
                event: {
                    name: "New Event",
                    orgID: parseInt(props.newForOrg, 10),
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    location: "",
                    description: "",
                },
            };
        }

        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.toggleFavorite = this.toggleFavorite.bind(this);

        console.log("in cons: ", props);
    }

    async componentDidMount() {

        if (!this.state) {
            const event = await eventhub.getEvent(this.props.eventID);
            this.setState({
                event: {
                    ...event,
                    startTime: new Date(event.startTime),
                    endTime: new Date(event.endTime),
                },
            });
        }

        const favorites = await libuser.eventFavorites();
        if (favorites.includes(this.state.event.id)) {
            this.setState({
                favorited: true,
                ...this.state,
            });
        }

        if (!this.state.org) {
            const org = await eventhub.getOrg(this.state.event.orgID);

            this.setState({
                org,
                ...this.state,
            });

            const sorgs = await libuser.orgAdmins();
            if (sorgs.filter((org1) => org1.id == org.id).length) {
                this.setState({
                    editable: true,
                    ...this.state,
                });
            }
        }


        if (!this.props.preview && !this.props.newForOrg && !this.state.announcements) {
            const announcements = await eventhub.getEventAnnouncements(this.state.event.id);
            console.log("got announcements: ", announcements);
            this.setState({
                announcements,
                ...this.state,
            });
        }
    }

    preview(className) {
        return (
            <>
                <h2>
                    <Link to={`/events/${this.state.event.id}`}>{this.state.event.name}</Link>
                </h2>
                <table>
                    <tbody>
                        <tr>
                            <td className="event-detail-field">By: </td>
                            <td>
                                <Link to={`/orgs/${this.state.org.id}`}>{this.state.org.name}</Link>
                            </td>
                        </tr>
                        <tr>
                            <td className="event-detail-field">On: </td>
                            <td>{this.state.event.startTime}</td>
                        </tr>
                        <tr>
                            <td className="event-detail-field">At: </td>
                            <td>{this.state.event.location}</td>
                        </tr>
                        <tr>
                            <td className="event-detail-field">Tags: </td>
                            <td>{this.state.event.tags.join(", ")}</td>
                        </tr>
                    </tbody>
                </table>
            </>
        );
    }

    async handleEditSubmit(evt) {

        evt.preventDefault();
        this.state.event.startTime = new Date(this.state.event.endTime);
        this.state.event.endTime = new Date(this.state.event.startTime);

        let eventID;
        if (this.props.newForOrg) {
            const res = await eventhub.postOrgEvent(this.state.event);
            eventID = res.id;

        } else {
            await eventhub.putEvent(this.state.event);
            await eventhub.putEventAnnouncements(this.state.event.id, this.state.announcements);
            eventID = this.state.event.id
        }

        this.setState({});
        this.props.history.push(`/events/${eventID}`);
    }

    edit() {
        let announcements = null;
        if (this.state.announcements) {
            announcements = this.state.announcements.map((a, i) => (
                <Fragment key={i}>
                    <label
                        className="edit-field"
                        htmlFor={`announcement-${i}`}>{(new Date(a.created)).toString()}</label>

                    <textarea
                        form="event-edit-form"
                        name={`annoucement-${i}`}
                        value={a.announcement}
                        onChange={(evt) => {
                            this.state.announcements[i].announcement = evt.target.value;
                            console.log("on change", evt.target.value);

                            this.setState({
                                ...this.state,
                            })
                        }}/>

                </Fragment>
            ));
        }

            console.log(this.props);
            console.log(this.state);


        return (
            <>
                <h1>
                    Edit: {this.state.event.name}
                </h1>

                <form id="event-edit-form" onSubmit={this.handleEditSubmit}>
                    <label className="edit-field" >Event Name
                        <input
                            name="event-name"
                            type="text"
                            value={this.state.event.name}
                            onChange={(evt) => {
                                this.state.event.name = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}/>
                    </label>

                    <label className="edit-field">Starting at
                        {/*
                            datetime-local has a widget for all mobile browsers but only on
                            chrome for desktop
                        */}
                        <input
                            name="start-time"
                            type="datetime-local"
                            value={this.state.event.startTime}
                            onChange={(evt) => {
                                this.state.event.startTime = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}/>
                    </label>

                    <label className="edit-field">Until
                        {/*
                            datetime-local has a widget for all mobile browsers but only on
                            chrome for desktop
                        */}
                        <input
                            name="end-time"
                            type="datetime-local"
                            value={this.state.event.endTime}
                            onChange={(evt) => {
                                this.state.event.endTime = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}/>
                    </label>

                    <label className="edit-field">Located at
                        <input
                            name="location"
                            type="text"
                            value={this.state.event.location}
                            onChange={(evt) => {
                                this.state.event.location = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}/>
                    </label>

                    <label className="edit-field" htmlFor="description">Description</label>

                    <textarea
                        form="event-edit-form"
                        name="description"
                        value={this.state.event.description}
                        onChange={(evt) => {
                            this.state.event.description = evt.target.value;

                            this.setState({
                                ...this.state,
                            })
                        }}/>

                    {/*
                        this button is not part of the form, merely a way to interact
                        with the form, therefore it is not an input
                    */}

                    {!this.props.newForOrg && !this.state.hasNewAnnouncement && (<button className="edit-field"
                        type="button"
                        onClick={() => {
                            let a = this.state.announcements || [];

                            a.unshift({
                                created: new Date().toISOString(),
                                announcement: "New announcement",
                            });


                            this.setState({
                                announcements: a,
                                hasNewAnnouncement: true,
                            });

                        }}>New Announcement</button>)}
                    { !this.props.newForOrg && this.state.hasNewAnnouncement && (<input
                        className="button"
                        type="button"
                        onClick={() => {
                            let a = this.state.announcements;
                            a.shift();

                            this.setState({
                                ...this.state,
                                announcements: a,
                                hasNewAnnouncement: false,
                            });
                        }}>Cancel New Announcement</input>)}

                    {/* one of these per announcement */}

                    {announcements}

                    <input className="edit-field button" type="submit"/>

                </form>
            </>
        );
    }

    imgSrc() {
        return `/api/events/${this.state.event.id}/logo`
    }

    async toggleFavorite() {
        if (this.state.favorited) {
            console.log("removing favorite", await libuser.get());
            await libuser.removeEventFavorite(this.state.event.id);
            console.log("removed favorite", await libuser.get());
        } else {
            await libuser.addEventFavorite(this.state.event.id);
        }

        libuser.eventFavorites().then(favorites => {
            if (favorites.includes(this.state.event.id)) {
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

    render() {
        if (!this.state || !this.state.event || !this.state.org) {
            return <div/>;
        }

        console.log("state: ", this.state);

        if (this.props.preview) {
            return this.preview();
        }

        if (this.props.edit || this.props.newForOrg) {
            return this.edit()
        }

        var announcements = <div/>;
        if (this.state.announcements) {
            announcements = this.state.announcements.map((a, i) => (
                <li key={i}>
                    <h3>{(new Date(a.created)).toString()}</h3>
                    <p>{a.announcement}</p>
                </li>
            ));
        }

        let favoriteButton;
        if (this.state.favorited) {
            favoriteButton = (<button onClick={this.toggleFavorite}>Unfavorite 🔱</button>)
        } else {
            favoriteButton = (<button onClick={this.toggleFavorite}>Favorite 🔱</button>)
        }


        return (
            <div id="event-full">
                <img src={this.imgSrc()} className="event-logo" />
                <div id="event-meta">
                    <h1>
                        {this.state.event.name}
                    </h1>
                    <h2>Details</h2>
                    <table>
                        <tbody>
                            <tr>
                                <td className="event-detail-field">By: </td>
                                <td>
                                    <Link to={`/orgs/${this.state.event.orgID}`}>{this.state.org.name}</Link>
                                </td>
                            </tr>
                            <tr>
                                <td className="event-detail-field">On: </td>
                                <td>{this.state.event.startTime.toString()}</td>
                            </tr>
                            <tr>
                                <td className="event-detail-field">Until: </td>
                                <td>{this.state.event.endTime.toString()}</td>
                            </tr>
                            <tr>
                                <td className="event-detail-field">At: </td>
                                <td>{this.state.event.location}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div id="event-actions">
                    {favoriteButton}
                    {this.state.editable && (
                        <a className="button" href={`/events/${this.state.event.id}/edit`}>Edit</a>
                    )}
                </div>

                <h2>Description</h2>
                <p>{this.state.event.description}</p>

                <h2>Announcements</h2>
                <ol>
                    {announcements}
                </ol>
            </div>
        );
    }
});
