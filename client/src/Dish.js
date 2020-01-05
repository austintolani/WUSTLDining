import React, { Component } from "react";
import Rate from "./Rate";
import Best from "./Best";

class Dish extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			opened: false,
		};
		this.showRateSection = this.showRateSection.bind(this);
	}
  
	showRateSection() {
		const { opened } = this.state;
		this.setState({
			opened: !opened,
		});
	}

	// Function for setting the color of the rating div based on the value. Green values correspond to higher scores, yellow for medium, etc.
	getRatingColor(avgRating){
		if (avgRating < 0){
			return {backgroundColor: 'lightgrey'}
		}
		if (avgRating > 3.5){
			return {backgroundColor: 'green'}
		}
		if (avgRating < 1.8){
			return {backgroundColor: 'red'}
		}
		return {backgroundColor: 'yellow'}
	}
  
	render() {
		var { dishData , loggedInUser, displayRate } = this.props;
		const { opened } = this.state;

		return (
			<div className="dish">
				<div className="dishHeading" onClick={this.showRateSection}>
					<div className = "dishName">{dishData.name}</div>
					<div className = "dishRating" style = {this.getRatingColor(dishData.avgRating)}>{dishData.avgRating < 0 ? "N/A": Math.round(dishData.avgRating * 10) / 10}</div>
				</div>
				{opened && (					
					<div className="rateSection">
						{displayRate ?<Rate dishData = {dishData} showRateSection = {this.showRateSection} loggedInUser = {loggedInUser}/>: <Best dishData = {dishData}/>}
					</div>
				)}
			</div>
		);
	}
}

export default Dish;