const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/userModel');
require('dotenv').config();
const slugify = require('slugify');
const { date } = require('joi');


passport.serializeUser((user , done) => {
	done(null , user);
})
passport.deserializeUser((user, done) => {
	done(null, user);
});

passport.use(new googleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID, // Your Credentials here.
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL:"http://localhost:3000/auth/google/callback",
	passReqToCallback:true
},
async function(request, accessToken, refreshToken, profile, done) {
	const userExists = await userModel.findOne({email : profile.emails[0].value})
	if(!userExists){
		const user = {
			username : slugify(profile.displayName),
			first_name : profile.name.givenName,
			last_name : profile.name.familyName,
			email : profile.emails[0].value,
			profile : profile._json.picture,
			logged_in : true,
			createdAt  : new Date(),
			updatedAt : new Date()
		}
		const userData = await userModel.create(user)
		return done(null, userData._id);
	}
	return done(null, userExists._id);
}
));

module.exports = passport;