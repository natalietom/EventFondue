const express = require("express");
const router = express.Router(); 
const Event = require("../models/event");
const Review = require("../models/review");
const middleware = require("../middleware"); //if require the folder then it'll automatically look for a file named "index.js"

//INDEX - show all events
router.get("/", function(req, res){
	//console.log(req.user); //can show logged in username and id
	//Get all events from DB
	Event.find({}, function(err, allEvents){
		if(err){
			console.log(err);
		}else{
			res.render("events/index", {events:allEvents, page: "events"}); 
		}
	});
});

//CREATE - add new event to DB
//logic of making a new event and redirecting it back
router.post("/", middleware.isLoggedIn, function(req, res){
	//get data from form and add to events array
	let name = req.body.name;
	let price = req.body.price;
	let image = req.body.image;
	let desc = req.body.description; //as named in new.ejs
	const author = {
		id: req.user._id,
		username: req.user.username
	};
	const newEvent = {name: name, price: price, image: image, description: desc, author: author};
	//create a new event and save to DB
	Event.create(newEvent, function(err, newlyCreated){
		if(err){
			console.log(err);
		}else{
			//redirect back to events page. default is a get request
			console.log(newlyCreated);
			res.redirect("/events");
		}
	});
});

//NEW - show form to create new event 
//shows the form submits a post request to events template
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("events/new");
});

//SHOW - shows more info about one event
//this order is important to put after /events/new as "new" could be an id
router.get("/:id", function(req, res){
	//find the event with provided ID
	Event.findById(req.params.id).populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}
	}).exec(function(err, foundEvent){
		if(err || !foundEvent){
			req.flash("error", "Event not found");
			res.redirect("back");
		}else{
			// console.log(foundEvent);
			//render show template with that event
			res.render("events/show", {event: foundEvent});
		}
	});
});

//EDIT EVENT ROUTE
router.get("/:id/edit", middleware.checkEventOwnership, function(req, res){
	Event.findById(req.params.id, function(err, foundEvent){
		res.render("events/edit", {event: foundEvent});
	});
});

//UPDATE EVENT ROUTE
router.put("/:id", middleware.checkEventOwnership, function(req, res){
	delete req.body.event.rating;
	//find and update the correct event
	//const data = {name: req.body.name, image: req.body.image} //one option is to obtain the data together or group them in name of form via edit.ejs file
	Event.findByIdAndUpdate(req.params.id, req.body.event, function(err, updatedEvent){
		if(err){
			res.redirect("/events");
		}else{
			//redirect somewhere(show page)
			res.redirect("/events/" + req.params.id);
		}
	});
});

//DESTORY EVENT ROUTE
router.delete("/:id", middleware.checkEventOwnership, function(req, res){
	Event.findById(req.params.id, function(err, eventRemoved){
		if(err){
			res.redirect("/events");
		}else{
			Review.deleteMany({"_id": { $in: eventRemoved.reviews} } ,function(err){ //$in operator finds all reviews and looks at database entries with ids in campgound and deletes them along with associated event that's getting removed
				if(err){
					console.log(err);
					res.redirect("/events");
				}
				Review.deleteMany({"_id": {$in: eventRemoved.reviews}}, function(err){
					if(err){
						console.log(err);
						res.redirect("/events");
					}
					//delete event
					eventRemoved.remove();
					req.flash("success", "Event deleted successfully!");
					res.redirect("/events");
				});
			});
		}
	});		 
});


module.exports = router;