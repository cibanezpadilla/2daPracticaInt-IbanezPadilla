import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { usersModel } from "./db/models/users.model.js";
import { uManager } from "./dao/managersMongo/usersManager.js";
import { hashData, compareData } from "./utils.js";




passport.use('signup', new LocalStrategy({
  usernameField: 'email',
  //como necesito el objeto request pongo el passReqToCallback en true
  passReqToCallback: true
  //y ya a la funcion async le paso tambien el objeto req
}, async(req, email, password, done)=>{  
  const {first_name, last_name, age, role} = req.body
  if (!first_name || !last_name || !age || !role || !email || !password){
      return done(null, false)
  }
  try{
      const hashedPassword = await hashData(password);
      const createdUser = await uManager.createUser({
        ...req.body,
        password: hashedPassword,
      });
      done(null, createdUser);
  }catch (error){
      done(error)
  }
}))



passport.use('login', new LocalStrategy({
  usernameField: 'email',
  /* failureFlash: true, */     
}, async(email, password, done)=>{
  //y aca creo mi estrategia de login    
  if (!email || !password){      
      return done(null, false, {message: 'All fields are required'})
  }
  try{
      const user = await uManager.findUserByEmail(email)
      //lo que me intentamos con nico
      // if (!user) {
      //   console.log('user error', user);      
      // return done(null, false, req.flash('signUpMessage', 'That email is already taken.'));
      //}
      //asi tenia farid
      if(!user){
          return done(null, false, {message: 'You need to sign up first'})
      }
      const isPassValid = await compareData(password, user.password)
      if(!isPassValid){
          return done(null, false, {message: 'Incorrect username or password'})
      }      
      done(null, user)      
  }catch (error){
      done(error)
  }
}))



const fromCookies = (req) => {
  return req.cookies.token;
};// esta funcion va al req.cookies y va a sacar token de ahi


passport.use(
  "jwt",
  new JWTStrategy(
    {
      //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookies]),
      secretOrKey: "secretJWT",
    },
    async function (jwt_payload, done) {
      done(null, jwt_payload);
    }
  )
);




passport.serializeUser((user, done) => {
  // _id
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await uManager.findUserByID(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});