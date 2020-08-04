const Event = require("../models/event");
const Review = require("../models/review");

//all the middleware goes here
const middlewareObj = {};

middlewareObj.checkEventOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Event.findById(req.params.id, function(err, foundEvent){
			if(err || !foundEvent){
				req.flash("error", "Event not found");
				res.redirect("back");
			}else{
				//does user own ?
				if(foundEvent.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");//takes user back to page it was on
	}
};

middlewareObj.checkReviewOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Review.findById(req.params.review_id, function(err, foundReview){
			if(err || !foundReview){
				req.flash("error", "Review not found");
				res.redirect("back");
			}else{
				//does user own review?
				if(foundReview.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "Please login first");
		res.redirect("back");
	}
};

middlewareObj.checkReviewExistence = function(req, res, next){
	if(req.isAuthenticated()){
		Event.findById(req.params.id).populate("reviews").exec(function(err, foundEvent){
			if(err || !foundEvent){
				req.flash("error", "Event not found");
				res.redirect("back");
			}else{
				//check if user id exists in foundEvent.reviews
				let foundUserReview = foundEvent.reviews.some(function(review){ //some array returns ture if any element of array matches the check we implement in callback -- logged in user was found, otherwise false and user didn't previously review Event
					return review.author.id.equals(req.user._id);
				});
				if(foundUserReview){
					req.flash("error", "You have already written a review");
					return res.redirect("/events/" + foundEvent._id);
				}
				next();
			}
		});
	}else{
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please login first"); //("keyName", "messageToDisplay")
	res.redirect("/login");
}

module.exports = middlewareObj;