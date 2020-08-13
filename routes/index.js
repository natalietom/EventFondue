const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Event = require("../models/event");
const Review = require("../models/review");

//route rout
router.get("/", function(req, res){
	res.render("landing");
});

//show register form
router.get("/register", function(req, res){
	res.render("register", {page: "register"});
});

//handle sign up logic
router.post("/register", function(req, res){
	const newUser = new User({
			username: req.body.username,
			email: req.body.email,
			avatar: req.body.avatar
		});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			//console.log(err);
			req.flash("error", err.message);
			return res.redirect("/register");
			//return res.render("register", {"error": err.message});
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Successfully signed up! Welcome to EventFondue " + user.username);
			res.redirect("/events");
		});
	});
});

//show login form
router.get("/login", function(req, res){
	res.render("login", {page: "login"});
});

//handling login logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/events",
		failureRedirect: "login"
	}), function(req, res){
	
});

//logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/events");
});

//USER PROFILES
router.get("/users/:id", function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err || !foundUser){
			req.flash("error", "User not found");
			return res.redirect("/");
		}
		Event.find().where("author.id").equals(foundUser._id).exec(function(err, events){
			if(err){
				req.flash("error", "Something went wrong");
				return res.redirect("/");
			}else{
				Review.find().where('author.id').equals(foundUser._id).exec(function(err,reviews){
					if(err){
						req.flash("error", err.message);
						res.redirect("back");
					}else{
						res.render("users/show", {
							user: foundUser,
							events: events,
							reviews: reviews
						});	
					}
				});
			}
			//res.render("users/show", {user:foundUser, events: events});
		});
	});
});

module.exports = router;