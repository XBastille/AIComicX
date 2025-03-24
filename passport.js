const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const User = require('./model/schema');

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({ _id: profile.id });
            if (!user) {
                const newuser = User.create({
                    userName: profile.displayName,
                    email: profile.emails[0].value,
                    password: null,

                })
            }
            return done(null, user);
        } catch (error) {
            return done(error, null)
        }
    }
));


//______________________________GITHUB AUTH___________________________________________-
passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
},
    async function (request, accessToken, refreshToken, profile, done) {
        try {
            let user = await User.findOne({ github_id: profile.id });
            if (!user) {
                const newuser = await User.create({
                    githubId: profile.id,
                    userName: profile.displayName,
                    email: profile.emails[0].value,
                    password: null,
                    provider: 'github'

                })
            }
            return done(null, user);
        } catch (error) {
            return done(error, null)
        }
    }
))