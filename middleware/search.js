const Event = require("../models/event");
const Review = require("../models/review");

const searchObj = {};

searchObj.escapeRegex = function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = searchObj;