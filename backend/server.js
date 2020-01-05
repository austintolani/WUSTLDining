/*
This file serves as the main code for the back end. The general structure of this file was taken from a tutorial by Jelo Rivera (https://medium.com/javascript-in-plain-english/full-stack-mongodb-react-node-js-express-js-in-one-simple-app-6cc8ed6de274), although all of the functions were changed to match the functionality of our website. 
*/


const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./data');
const User = require('./user');


const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

// this is our MongoDB database "wustl"
const dbRoute =
"mongodb://localhost:27017/wustl";

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// this is our get method
// this method fetches all available data in our database
// this is our get method
// this method fetches all available data in our database
router.get('/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });

    // Sort in descending order by average rating
    data.sort(function(a,b){
      return b.avgRating -a.avgRating;
    })
    return res.json({ success: true, data: data });
  });
});


// this is the method for ranking a dish
// this method inserts the user's rating into array and updates the average ranking variable for the whole dish
router.post('/rankDish', (req, res) => {
  const { id, loggedInUser, newRating } = req.body;
    const userKey = "ratings." + loggedInUser;
    // Append user's new rating to array of all ratings
  Data.update({_id:id}, {$set : {[userKey]: newRating}}, {upsert:true}, (err) => {
      if (err) return res.json({ success: false, error: err });
      // Find the dish that was just rated and calculate the average rating with the new rating
      Data.find({_id:id},(err, data) => {
        if (err) return res.json({ success: false, error: err });
        // Calculate average rating
        let ratings = data[0].ratings;
        let sum = 0;
        // Loop through all keys in the object and calculate the sum
        Object.keys(ratings).forEach(function(key,index) {

            sum = sum + ratings[key];

        });
        // Divide by the number of keys to get the average
        let average = sum / Object.keys(ratings).length;
        // Update the average rating of the dish
        console.log("New Average: " + average);
        Data.findByIdAndUpdate(id, {avgRating: average}, (err) => {
          if (err) return res.json({ success: false, error: err });
        });
      });
    });
  return res.json({ success: true });

});

// Method to delete a ranking
router.post('/deleteRank', (req, res) => {

  const { id, loggedInUser, oldRating } = req.body;
  const userKey = "ratings." + loggedInUser;
  Data.update({_id:id}, {$unset : {[userKey]: oldRating}}, (err) => {
    if (err) res.json({ success: false, error: err });
     // Find the dish that was just rated and calculate the average rating with the removal. 
     Data.find({_id:id},(err, data) => {
      if (err) return res.json({ success: false, error: err });
      // Calculate average rating
      let ratings = data[0].ratings;
      let sum = 0;

      // Loop through all keys in the object and calculate the sum
      Object.keys(ratings).forEach(function(key,index) {

          sum = sum + ratings[key];

      });

      // Divide by the number of keys to get the average, if there are no records, set the average to -1 (indicating there are no ratings)

      let average = sum / Object.keys(ratings).length;

      if (isNaN(average)){
        average = -1;
      }

      console.log("Average:" + average);
      // Update the average rating of the dish
      Data.findByIdAndUpdate(id, {avgRating: average}, (err) => {
        if (err) return res.json({ success: false, error: err });
      });  
    });
    return res.json({ success: true });
  });

});

// Method to add a comment to a dish
router.post('/addComment', (req, res) => {
  const { id, update } = req.body;
  Data.findByIdAndUpdate(id, {$push : update}, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// Method to delete a comment
router.post('/deleteComment', (req, res) => {
  const { id, commentToDelete } = req.body;
  Data.findByIdAndUpdate(id, {$pull : commentToDelete}, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is the method to create an account
router.post('/createAcct', (req, res) => {
  const { username, password } = req.body;
  //if username input is blank
  if (!username) {
    console.log("username can't be blank");
    return res.send({
      success: false,
      errorMsg: "Username can't be blank",
    });
  }
  //if username input already exists in database
  User.findOne({username:username}, function(err,user)  {
    if(err) {
      console.log(err);
    }
    if(!user) {
      //add entry to user collection
      let user = new User();
      user.username = username;
      user.password = user.generateHash(password);
      user.save((err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
      });
    }
    else {
      console.log("User already exists");
      return res.send({
        success: false,
        errorMsg: "Username already exists",
      });
    }
    
  });
  

});

//used general structure from Keith Weaver's login tutorial, but changed functions

//this is the method to login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  User.findOne({username:username}, function(err,user) {
    if(err) {
      console.log(err);
    }
    if(!user) {
      return res.send({
        success: false,
      });
    }
    if (!user.validPassword(password)) {
      return res.send({
        success: false,
      });
    }
    if (user.validPassword(password)) {
      return res.send({
        success: true,
        username: user.username,
        token: user._id
      });
    }
  });
});

// append /api for our http requests
app.use('/api', router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));

