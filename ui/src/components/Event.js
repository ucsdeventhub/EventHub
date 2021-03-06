import { Fragment, Component } from "react";
import { Link, withRouter } from "react-router-dom";
import eventhub from "../lib/eventhub";

export default withRouter(class Event extends Component {
    constructor(props) {
        super(props);

        if (props.model) {
            this.state = props.model;
        }

        console.log("in cons: ", props);
    }

    async componentDidMount() {
        if (!this.state) {
            const event = await eventhub.getEvent(this.props.eventID);
            this.setState({ event });
        }

        if (!this.state.org) {
            const org = await eventhub.getOrg(this.state.event.orgID);
            this.setState({
                org,
                ...this.state,
            });
        }

        if (!this.props.preview && !this.state.announcements) {
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
                    </tbody>
                </table>
            </>
        );
    }

    edit() {
        const announcements = this.state.announcements.map((a, i) => (
            <Fragment key={i}>
                <label className="event-edit-field" htmlFor={`announcement-${i}`}>{a.date}</label>

                <textarea
                    form="event-edit-form"
                    name={`annoucement-${i}`}
                    value={a.body}
                    onChange={(evt) => {
                        this.state.announcements[i].body = evt.target.value;

                        this.setState({
                            ...this.state,
                        })
                    }}/>

            </Fragment>
        ));

            console.log(this.props);
            console.log(this.state);

        const submitForm = (evt) => {
            evt.preventDefault();
            // TODO: send to api

            this.props.history.push(`/events/${this.props.eventID}`);
        }


        return (
            <div>
                <h1>
                    Edit: {this.state.event.name}
                </h1>

                <form id="event-edit-form" onSubmit={submitForm}>
                    <label className="event-edit-field" >Event Name
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

                    <label className="event-edit-field">Starting at
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

                    <label className="event-edit-field">Until
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

                    <label className="event-edit-field">Located at
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

                    <label className="event-edit-field" htmlFor="description">Description</label>

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

                    {!this.state.hasNewAnnouncement && (<button className="event-edit-field"
                        type="button"
                        onClick={() => {
                            let a = this.state.announcements;

                            a.unshift({
                                date: new Date().toISOString(),
                                body: "New announcement",
                            });


                            this.setState({
                                ...this.state,
                                announcements: a,
                                hasNewAnnouncement: true,
                            });

                        }}>New Announcement</button>)}
                    { this.state.hasNewAnnouncement && (<button className="event-edit-field"
                        type="button"
                        onClick={() => {
                            let a = this.state.announcements;
                            a.shift();

                            this.setState({
                                ...this.state,
                                announcements: a,
                                hasNewAnnouncement: false,
                            });
                        }}>Cancel New Announcement</button>)}

                    {/* one of these per announcement */}

                    {announcements}

                    <input className="event-edit-field" type="submit"/>

                </form>
            </div>
        );
    }

    render() {
        if (!this.state || !this.state.event || !this.state.org) {
            return <div/>;
        }

        console.log("state: ", this.state);

        if (this.props.preview) {
            return this.preview();
        }

        if (this.props.edit) {
            return this.edit()
        }

        var announcements = <div/>;
        if (this.state.announcements) {
            announcements = this.state.announcements.map((a, i) => (
                <li key={i}>
                    <h3>{a.created}</h3>
                    <p>{a.announcement}</p>
                </li>
            ));
        }

        return (
            <div>
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
                            <td>{this.state.event.startTime}</td>
                        </tr>
                        <tr>
                            <td className="event-detail-field">Until: </td>
                            <td>{this.state.event.endTime}</td>
                        </tr>
                        <tr>
                            <td className="event-detail-field">At: </td>
                            <td>{this.state.event.location}</td>
                        </tr>
                    </tbody>
                </table>

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
