import React, { Component } from 'react';
import { withRouter } from "react-router-dom";
//import { render } from 'react-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import libuser from "../lib/user"
import eventhub from "../lib/eventhub"

const localizer = momentLocalizer(moment);

export default withRouter(class extends Component{
  constructor(props){
    super(props);

    this.state = {
        events: [],
    };
  }

  async componentDidMount() {
    const eventIDs = await libuser.eventFavorites();
    eventIDs.forEach(id => {
        eventhub.getEvent(id)
        .then(event => {
            console.log(event);
            this.setState({
                events: this.state.events.concat([event]),
            });
        });
    });
  }


  render() {
    return (
        <div style={{
            height: '500pt',
            marginTop: '10px',
        }}>
          <Calendar
            events={this.state.events}
            titleAccessor="name"
            startAccessor={ (event) => new Date(event.startTime) }
            endAccessor={ (event) => new Date(event.endTime) }
            defaultDate={moment().toDate()}
            onDoubleClickEvent={(o, e) => {
                this.props.history.push(`/events/${o.id}`);
            }}
            localizer={localizer}
          />
        </div>
    );
  }
});

