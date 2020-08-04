const express 			= require("express"),
	  app 				= express(),
	  bodyParser 		= require("body-parser"),
	  mongoose 			= require("mongoose"),
	  flash				= require("connect-flash"),
	  passport 			= require("passport"),
	  localStrategy		= require("passport-local"),
	  methodOverride 	= require("method-override"),
	  Event 		= require("./models/event"),
	  User 				= require("./models/user");

require('dotenv').config();

//requiring routes
const reviewRoutes 		= require("./routes/reviews"),
	  eventRoutes 	= require("./routes/events"),
	  indexRoutes 		= require("./routes/index"); //still need an app.use down below

const url = process.env.MONGOATLAS_URI || "mongodb://localhost:27017/event_fondue";

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set('useFindAndModify', false);
mongoose.connect(url,{
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() =>{
	console.log("Connected to DB!");
}).catch(err => {
	console.log("ERROR: ", err.message);
});

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname +"/public"));//dirname is the directory it is running in to provide safety in the right folder
app.use(methodOverride("_method")); 
app.use(flash());
app.locals.moment = require("moment");

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Fruits make the best snacks",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user; 
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next(); 
});

app.use("/", indexRoutes);
app.use("/events", eventRoutes);
app.use("/events/:id/reviews", reviewRoutes);

app.listen(process.env.PORT || 3000, function(){
	console.log("EventFondue has started");
});