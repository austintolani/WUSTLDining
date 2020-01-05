import React, { Component } from "react";
import axios from 'axios';

class UserRates extends Component {	


	constructor(props) {
		super(props);
		this.state = {
			
		};
    }
    

	render() {
        var { dishData , loggedInUser, displayRate } = this.props;
        return (
            <div className = "ratingSection">
                {dishData.comments.map((comment) =>
                <div className="userrate">
                    {comment.commentAuthor == loggedInUser ? <div className="dishName2">{dishData.name}</div> : "" }
                    {comment.commentAuthor == loggedInUser ? <div className="comment">{comment.commentText}</div> : "" }
                </div>
				
				)}
            </div>
        );   
        
	}
}

export default UserRates;