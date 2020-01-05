import React, { Component } from "react";
import axios from 'axios';

class Rate extends Component {	


	constructor(props) {
		super(props);
		this.state = {
			newComment: "",
		};
	}
	
	  // Method to update average rating
	rankDish = (idToUpdate, newRating,loggedInUser) => {

		axios.post('http://ec2-18-188-161-77.us-east-2.compute.amazonaws.com:3001/api/rankDish', {
		id: idToUpdate,
		loggedInUser: loggedInUser,
		newRating: parseInt(newRating)
		});
	// Make sure to hide the div as the order will be changed 
		this.props.showRateSection();
	};

	// Method to delete a ranking

	deleteRank = (idToUpdate, loggedInUser,rating) =>{

	axios.post('http://ec2-18-188-161-77.us-east-2.compute.amazonaws.com:3001/api/deleteRank', {
		id: idToUpdate,
		loggedInUser: loggedInUser,
		oldRating: rating,
		});
		
	}

	// Method to comment on a dish
	comment = (idToUpdate, newComment,loggedInUser) => {
		// Check to make sure a comment was submitted
		console.log("success");
		if (newComment == ""){
			alert("You must enter a comment");
			return;
		}
		console.log(newComment);
		axios.post('http://ec2-18-188-161-77.us-east-2.compute.amazonaws.com:3001/api/addComment', {
			id: idToUpdate,
			update: {comments : {commentAuthor : loggedInUser, commentText :newComment}},
		});

		// Clear comment form
		this.state.newComment = "";
	};

	// Method to delete a comment

	deleteComment = (dishData, comment) => {

		axios.post('http://ec2-18-188-161-77.us-east-2.compute.amazonaws.com:3001/api/deleteComment',{ // does not exist yet
			id : dishData._id,
			commentToDelete: {comments : {commentAuthor : comment.commentAuthor, commentText :comment.commentText}} // Add username to this 

		});

	}

	render() {
		var { dishData , loggedInUser } = this.props;
		return (
		<div className = "ratingSection">
			<div className = "details">
			<strong>Location: </strong>{dishData.location}<br></br>
			<strong>Meal Type: </strong>{dishData.mealType}<br></br>
			<strong>Meal Description: </strong>{dishData.description}
			</div>
			<p>Give this dish a rating:</p>
			{loggedInUser != "" ?
			<div>
			<button className = {dishData.hasOwnProperty('ratings') && dishData.ratings[loggedInUser] == 0 ? "ratedButton": "ratingButton"} onClick={dishData.hasOwnProperty('ratings') &&dishData.ratings[loggedInUser] == 0 ? ()=> this.deleteRank(dishData._id,loggedInUser,0): () =>this.rankDish(dishData._id, 0, loggedInUser)}>0</button>

			<button className = {dishData.hasOwnProperty('ratings') && dishData.ratings[loggedInUser] == 1 ? "ratedButton": "ratingButton"} onClick={dishData.hasOwnProperty('ratings') &&dishData.ratings[loggedInUser] == 1 ? ()=> this.deleteRank(dishData._id,loggedInUser,1): () =>this.rankDish(dishData._id, 1, loggedInUser)}>1</button>
			
			<button className = {dishData.hasOwnProperty('ratings') && dishData.ratings[loggedInUser] == 2 ? "ratedButton": "ratingButton"} onClick={dishData.hasOwnProperty('ratings') &&dishData.ratings[loggedInUser] == 2 ? ()=> this.deleteRank(dishData._id,loggedInUser,2): () =>this.rankDish(dishData._id, 2, loggedInUser)}>2</button>

			<button className = {dishData.hasOwnProperty('ratings') && dishData.ratings[loggedInUser] == 3 ? "ratedButton": "ratingButton"} onClick={dishData.hasOwnProperty('ratings') &&dishData.ratings[loggedInUser] == 3 ? ()=> this.deleteRank(dishData._id,loggedInUser,3): () =>this.rankDish(dishData._id, 3, loggedInUser)}>3</button>

			<button className = {dishData.hasOwnProperty('ratings') && dishData.ratings[loggedInUser] == 4 ? "ratedButton": "ratingButton"} onClick={dishData.hasOwnProperty('ratings') &&dishData.ratings[loggedInUser] == 4 ? ()=> this.deleteRank(dishData._id,loggedInUser,4): () =>this.rankDish(dishData._id, 4, loggedInUser)}>4</button>

			<button className = {dishData.hasOwnProperty('ratings') && dishData.ratings[loggedInUser] == 5 ? "ratedButton": "ratingButton"} onClick={dishData.hasOwnProperty('ratings') &&dishData.ratings[loggedInUser] == 5 ? ()=> this.deleteRank(dishData._id,loggedInUser,5): () =>this.rankDish(dishData._id, 5, loggedInUser)}>5</button>

			</div> : <div className = "warning">You must be logged in to leave a rating.</div>}
			<p>Comments:</p>
			<ul>
				{dishData.comments.map((comment) =>
				<div className="comment"><strong>{comment.commentAuthor}: </strong>{comment.commentText}
				{comment.commentAuthor == loggedInUser ? <button onClick={() =>this.deleteComment(dishData,comment)}>Delete</button> : "" }
				
				</div>
				)}
            </ul> 

			{loggedInUser != "" ?
			<div>

			<input type="text"style={{ width: '200px' }} value = {this.state.newComment} onChange={(e) => this.setState({ newComment: e.target.value })} placeholder="Leave a comment"/>
			<button onClick={() =>this.comment(dishData._id, this.state.newComment,loggedInUser)}>Comment</button> 
			</div>
			: <div className = "warning">You must be logged in to leave a comment.</div>
			
		
			}

		</div>
		);
	}
}

export default Rate;