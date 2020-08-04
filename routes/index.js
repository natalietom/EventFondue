const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

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
	const newUser = new User({username: req.body.username});
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


module.exports = router;