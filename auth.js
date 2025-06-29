const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const employee = require('./models/employee');

passport.use(new LocalStrategy(async(USERNAME, PASSWORD, done) => {
    try {
        const user = await employee.findOne({userName: USERNAME});
        if(!user) {
            return done(null, false, { message: 'Not found' } )
        }
        const isMatchPasswordMatch = await user.comparedPassword(PASSWORD);
        // const isMatchPasswordMatch = user.password == PASSWORD ? true : false;

        if(isMatchPasswordMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Password not match'});
        }
    } catch (err) {
        return done(err);
    }
}))


module.exports = passport;
