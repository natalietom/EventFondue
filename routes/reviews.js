const express = require("express");
const router = express.Router({mergeParams: true});
const Event = require("../models/event");
const Review = require("../models/review");
const middleware = require("../middleware");

//REVIEW INDEX ROUTE
router.get("/", function(req, res){
	Event.findById(req.params.id).populate({
		path: "reviews",
		options: {sort: {createdOn: -1}}
	}).exec(function(err, event){
		if(err || !event){
			req.flash("error", "Event not found");
			return res.redirect("back");
		}
		res.render("reviews/index", {event: event})
	});
});

//REVIEW NEW ROUTE
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res){
	Event.findById(req.params.id, function(err, event){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		res.render("reviews/new", {event: event});
	});
});

//REVIEW CREATE ROUTE
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res){
	Event.findById(req.params.id).populate("reviews").exec(function(err, event){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Review.create(req.body.review, function(err, review){
			if(err){
				req.flash("error", err.message);
				return res.redirect("back");
			}
			review.author.id = req.user._id;
			review.author.username = req.user.username;
			review.event = event;
			review.save();
			event.reviews.push(review);
			event.rating = calculateAverage(event.reviews);
			event.save();
			req.flash("success", "Review created");
			res.redirect("/events/" + event._id);
		});
	});
});

//REVIEW EDIT ROUTE
router.get("/:review_id/edit", middleware.checkReviewOwnership, function(req, res){
	Event.findById(req.params.id, function(err, foundEvent){
		if(err || !foundEvent){
			req.flash("error", "Event not found");
			return res.redirect("back");
		}
		Review.findById(req.params.review_id, function(err, foundReview){
			if(err){
				req.flash("error", err.message);
				return res.redirect("back");
			}
			res.render("reviews/edit", {event_id: req.params.id, review: foundReview});
		});
	});
});

//REVIEW UPDATE ROUTE
router.put("/:review_id/", middleware.checkReviewOwnership, function(req, res){
	Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function(err,updatedReview){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Event.findById(req.params.id).populate("reviews").exec(function(err, event){
			if(err){
				req.flash("error", err.message);
				return res.redirect("back");
			}
			event.rating = calculateAverage(event.reviews);
			event.save();
			req.flash("success", "Review edited");
			res.redirect("/events/" + event._id);
		});
	});
});

//REVIEW DESTROY ROUTE
router.delete("/:review_id", middleware.checkReviewOwnership, function(req, res){
	Review.findByIdAndRemove(req.params.review_id, function(err){
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Event.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function(err, event){
			if(err){
				req.flash("error", err.message);
				return res.redirect("back");
			}
			event.rating = calculateAverage(event.reviews); //recalculate average
			event.save();
			req.flash("success", "Review deleted");
			res.redirect("/events/" + req.params.id);
		});
	});
});

function calculateAverage(reviews){
	if(reviews.length === 0){
		return 0;
	}
	let sum = 0;
	reviews.forEach(function(val){
		sum+=val.rating;
	});
	return sum/reviews.length;
}

module.exports = router;