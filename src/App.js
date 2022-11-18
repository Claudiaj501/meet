import React, { Component } from 'react';
import './App.css';
import EventList from './EventList';
import CitySearch from './CitySearch';
import NumberOfEvents from './NumberOfEvents';
import WelcomeScreen from './WelcomeScreen';
import { getEvents, extractLocations, checkToken, getAccessToken } from
'./api';
import './nprogress.css';
import { WarningAlert } from "./Alert";


class App extends Component {

    state = {
        events: [],
        locations: [],
        locationSelected: 'all',
        numberOfEvents: 32,
        showWelcomeScreen: undefined
    }

    async componentDidMount() {
        this.mounted = true;
        const accessToken = localStorage.getItem("access_token");
    const isTokenValid = (await checkToken(accessToken)).error ? false : true;
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    this.setState({ showWelcomeScreen: !(code || isTokenValid) });
    if ((code || isTokenValid) && this.mounted)
      getEvents().then((events) => {
        if (this.mounted) {
          this.setState({
            events: events.slice(0, this.state.numberOfEvents),
            locations: extractLocations(events),
          });
        }
      });

        getEvents().then((events) => {
          if (this.mounted) {
              this.setState({ 
                  events: events.slice(0, this.state.numberOfEvents), 
                  locations: extractLocations(events)
              });
          }
      });
  }
    componentWillUnmount(){
        this.mounted = false;
    }
    updateEvents = (location, maxNumEvents) => {
        if (maxNumEvents === undefined) {
            maxNumEvents = this.state.numberOfEvents;
        } else(
            this.setState({ numberOfEvents: maxNumEvents })
        )
        if (location === undefined) {
            location = this.state.locationSelected;
        }
        getEvents().then((events) => {
            let locationEvents = (location === 'all') 
                ? events 
                : events.filter((event) => event.location === location);
            const isOffline = navigator.onLine ? false : true;
            this.setState({
                events: locationEvents.slice(0, maxNumEvents),
                numberOfEvents: maxNumEvents,
                locationSelected: location,
                offlineInfo: isOffline
                    ? "No internet connection. Data is loaded from cache."
                    : null
            });
        });
    }

    render() {
      if (this.state.showWelcomeScreen === undefined) return <div
          className="App" />;
        return (
            <div className="App">

                <CitySearch 
                    locations={this.state.locations}  
                    updateEvents={this.updateEvents} />
                <NumberOfEvents 
                    events={this.state.events}
                    updateEvents={this.updateEvents}/>
                <div className="warningAlert">
                    <WarningAlert text={this.state.offlineInfo} />
                </div>
                <EventList 
                    events={this.state.events}/>  
                <WelcomeScreen
          showWelcomeScreen={this.state.showWelcomeScreen}
          getAccessToken={() => {
            getAccessToken();
          }}
        />

            </div>
        );
    }
}
export default App;