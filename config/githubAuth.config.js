const passport = require('passport');
const githubStrategy = require('passport-github2').Strategy;
require('dotenv').config();

passport.use(new githubStrategy({
	clientID: process.env.GITHUB_CLIENT_ID, // Your Credentials here.
	clientSecret:process.env.GITHUB_CLIENT_SECRET,
	callbackURL:"http://localhost:3000/auth/github/callback",
	passReqToCallback:true
},
async function(request, accessToken, refreshToken, profile, done) {
    console.log("profileee",profile);
	const userExists = await userModel.findOne({email : profile._json.email})
	if(!userExists){
		const user = {
			username : profile._json.login,
			email : profile._json.email,
			profile : profile._json.avatar_url,
			logged_in : true,
			createdAt : new Date(),
			updatedAt : new Date()
		}
		var userData = await userModel.create(user)
		return done(null, userData._id);
	}
	return done(null, userExists._id);
}
));

module.exports = passport;