import React, { Component } from "react";
import axios from 'axios';

class Best extends Component {	


	constructor(props) {
		super(props);
		this.state = {
			newComment: "",
		};
	}

	render() {
		var { dishData} = this.props;
		return (
		<div className = "ratingSection">
			<div className = "details">
			<strong>Location: </strong>{dishData.location}<br></br>
			<strong>Meal Type: </strong>{dishData.mealType}<br></br>
			<strong>Meal Description: </strong>{dishData.description}<br></br>
            <strong>Last Seen On:</strong> {dishData.date}
			</div>
			
			<p>Comments:</p>
			<ul>
				{dishData.comments.map((comment) =>
				<div className="comment"><strong>{comment.commentAuthor}: </strong>{comment.commentText}
				
				</div>
				)}
            </ul> 

		</div>
		);
	}
}

export default Best;