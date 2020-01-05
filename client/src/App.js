
// client/src/App.js
import React, { Component } from 'react';
import axios from 'axios';
import Dish from "./Dish";
import Rate from "./Rate";
import Best from "./Best";
import UserRates from "./UserRates";
import './App.css'

class App extends Component {
  // initialize our state
  state = {
    data: [],
    intervalIsSet: false,
    idToUpdate: null,
    objectToUpdate: null,
    showLunch: true,
    token : "",
    username: "",
  };

  // >>>>>The following functions were taken from a tutorial by Jelo Rivera (https://medium.com/javascript-in-plain-english/full-stack-mongodb-react-node-js-express-js-in-one-simple-app-6cc8ed6de274)>>>>>


  // when component mounts, first thing it does is fetch all existing data in our db
  // then we incorporate a polling logic so that we can easily see if our db has
  // changed and implement those changes into our UI
  componentDidMount() {
    if(JSON.parse(localStorage.getItem('wustldining'))) {
      console.log("logged in");
      this.setState({
        token: JSON.parse(localStorage.getItem('wustldining')).token,
        username: JSON.parse(localStorage.getItem('wustldining')).username,
      });
      document.getElementsByClassName("createAcct")[0].style.display = "none";
      document.getElementsByClassName("login")[0].style.display = "none";
    }
    if(!JSON.parse(localStorage.getItem('wustldining'))) {
      console.log("logged out");
      document.getElementsByClassName("logout")[0].style.display = "none";
      document.getElementsByClassName("loggedIn")[0].style.display = "none";
    }
    document.getElementById("errorUsername").style.display="none";
    document.getElementById("incorrectLogin").style.display="none";
    document.getElementById("successfulSignup").style.display="none";
    this.getDataFromDb();
    if (!this.state.intervalIsSet) {
      let interval = setInterval(this.getDataFromDb, 1000);
      this.setState({ intervalIsSet: interval });
    }
  }

  // never let a process live forever
  // always kill a process everytime we are done using it
  componentWillUnmount() {
    if (this.state.intervalIsSet) {
      clearInterval(this.state.intervalIsSet);
      this.setState({ intervalIsSet: null });
    }
  }

  // This method uses the backend API to get data from the database
  getDataFromDb = () => {
    fetch('http://ec2-18-188-161-77.us-east-2.compute.amazonaws.com:3001/api/getData')
      .then((data) => data.json())
      .then((res) => this.setState({ data: res.data }));

  };

  // ^^^^End section taken from tutorial by Jelo Rivera^^^^

  //This method creates an account by adding the inputted username and password to the MongoDB
  createAccount() {
    const username = document.getElementById("username").value; // Get the username from the form
    const password = document.getElementById("password").value; // Get the password from the form 
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    fetch('http://ec2-18-188-161-77.us-east-2.compute.amazonaws.com:3001/api/createAcct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    }).then(res => res.json())
      .then(json => {
        if(json.success) {
          document.getElementById("successfulSignup").style.display="block";
          document.getElementById("errorUsername").style.display="none";
        } else{
          var errorUsername = document.getElementById("errorUsername")
          errorUsername.innerText = json.errorMsg;
          errorUsername.style.display="block";
        }
      });
  }

  //This method allows the user to login to their account
  login() {
    const username = document.getElementById("usernameS").value; // Get the username from the form
    const password = document.getElementById("passwordS").value; // Get the password from the form 
    document.getElementById("usernameS").value = "";
    document.getElementById("passwordS").value = "";
    fetch('http://ec2-18-188-161-77.us-east-2.compute.amazonaws.com:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    }).then(res => res.json())
      .then(json => {
        if(json.success) {
          const storage = {
            token: json.token,
            username: json.username,
          }
          localStorage.setItem('wustldining',JSON.stringify(storage));
          this.setState({
            token: json.token,
            username: json.username,
          });
          document.getElementsByClassName("logout")[0].style.display = "block";
          document.getElementsByClassName("createAcct")[0].style.display = "none";
          document.getElementsByClassName("login")[0].style.display = "none";
          document.getElementsByClassName("loggedIn")[0].style.display = "block";
          document.getElementById("incorrectLogin").style.display="none";
          document.getElementById("successfulSignup").style.display="none";
        } else{
          document.getElementById("incorrectLogin").style.display="block";
        }
      });
  }

  //This method will log the user out of their account
  logout() {
    localStorage.clear();
    this.setState({
      token: "",
      username: "",
    });
    document.getElementsByClassName("logout")[0].style.display = "none";
    document.getElementsByClassName("createAcct")[0].style.display = "block";
    document.getElementsByClassName("login")[0].style.display = "block";
    document.getElementsByClassName("loggedIn")[0].style.display = "none";
  }

  // Helper function that will return lunch or dinner items based on the current state of the showLunch variable
  // It is called when the "Show Lunch Items" or "Show Dinner Items" button is pressed
  // The function also filters out only the dishes on the current day. 
  renderLunchorDinner(dat,showLunch){
    var d = new Date();
    var currentDate = d.toLocaleDateString();
    if (showLunch){
      if (dat.mealType == "Lunch" && dat.date == currentDate){
        return (
        <Dish dishData = {dat} loggedInUser = {this.state.username} displayRate = {true}>
          <Rate />
        </Dish>
        )
      }
      return "";
    }

    if (dat.mealType == "Dinner" && dat.date == currentDate){
      return (
      <Dish dishData = {dat} loggedInUser = {this.state.username} displayRate = {true}>
        <Rate />
      </Dish>
      )
    }
    return "";
  }



  // This is our main user interface
  render() {
    const { data, showLunch } = this.state;
    return (
      <div className= "container">
        <h1>WUSTL Dining</h1>
        <div className="explanation">
          <p>Tired of getting disappointed by your decision to try something new at WUrld Fusion? Can't decide whether to go to Tikka Tuesday at BD or try the new Village Comfort? Well, the answer is here.</p>
          <p>WUSTL Dining is the one-stop-shop to see what others think about all the new dishes on campus. If you've tried something, share what you think about it by rating or commenting. If you're browsing what food to eat, see what others are saying about the food on the day's menu.</p>
        </div>
        <div className = "userDetails">
          <div className= "createAcct">
            <p>Create Account</p>
            <input id="username"type="text" placeholder="username" />
            <input id="password"type="password" placeholder="password" />
            <button onClick={() =>this.createAccount()}>Create Account</button>
            <p id="successfulSignup">Account created!</p>
            <p id="errorUsername"></p>
          </div>
          <div className= "login">
            <p>Sign In to Account</p>
            <input id="usernameS"type="text" placeholder="username" />
            <input id="passwordS"type="password" placeholder="password" />
            <button onClick={() =>this.login()}>Login</button>
            <p id="incorrectLogin">Username/password is incorrect!</p>
          </div>
          <div className= "loggedIn">
            <p>Welcome {this.state.username}!</p>
          </div>
          <div className= "logout">
            <button onClick={() =>this.logout()}>Logout</button>
        </div>
        </div>
        
      <div className="dishes">
      <h2>Today's Dishes</h2>
      <button id="mealToggle"onClick={() => this.setState({showLunch : !showLunch})}>{showLunch ? "Show Dinner Items": "Show Lunch Items"}</button>
        {data.map((dat) => (
          this.renderLunchorDinner(dat,showLunch)
        ))}
      </div>
      <div className = "bestdishes">
      <h2>All Dishes Ranked by Popularity</h2>
      {data.map((dat) => (
            <Dish dishData = {dat} loggedInUser = {this.state.username} displayRate = {false} >
              <Best/>
            </Dish>
        ))}
      </div>
      <div className = "yourRanks">
      <h2>Your Comment History</h2>
      {data.map((dat) => (
            <UserRates dishData = {dat} loggedInUser = {this.state.username} displayRate = {false} >
            </UserRates>
        ))}
      </div>
      </div>
    );
  }
}

export default App;
