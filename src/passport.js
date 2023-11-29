import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { usersModel } from "./db/models/users.model.js";
import { uManager } from "./dao/managersMongo/usersManager.js";
import { hashData, compareData } from "./utils.js";
import flash from 'express-flash';



passport.use('signup', new LocalStrategy({
  usernameField: 'email',
  //como necesito el objeto request pongo el passReqToCallback en true
  passReqToCallback: true
  //y ya a la funcion async le paso tambien el objeto req
}, async(req, email, password, done)=>{
  //y aca creo mi estrategia de signup
  //hago un try catch y pongo si existe o no existe ese usuario
  //si existe ese usuario, vas a loggearte no a hacer signup
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


//ahora creo mi estrategia de login
passport.use('login', new LocalStrategy({
  usernameField: 'email',
  failureFlash: true,
  //para el login no necesito al objeto request    
}, async(email, password, done)=>{
  //y aca creo mi estrategia de login
  //hago un try catch y pongo si existe o no existe ese usuario
  //si existe ese usuario, vas a loggearte no a hacer signup
  // const {name} = req.body //creo que esto no va  
  if (!email || !password){
      //en los done(null, false) puedo pasarle un mensaje personalizado del error
      return done(null, false, {message: 'All fields are required'})
  }
  try{
      const user = await uManager.findUserByEmail(email)
      if(!user){
          return done(null, false, {message: 'You need to sign up first'})
      }
      const isPassValid = await compareData(password, user.password)
      if(!isPassValid){
          return done(null, false, {message: 'Incorrect username or password'})
      }      
      done(null, user)
      console.log('user de mongo', user)
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








//TODO LO DEL DESAFIO 7
/* // local
passport.use(
  "signup",
  new LocalStrategy(
    { passReqToCallback: true, usernameField: "email" },
    async (req, email, password, done) => {
      const { first_name, last_name } = req.body;
      if (!first_name || !last_name || !email || !password) {
        return done(null, false);      
      }
      try {
        let isAdmin
        if (email === "adminCoder@coder.com"){
          isAdmin = true
        }else{
          isAdmin = false
        }
        const hashedPassword = await hashData(password);
        const createdUser = await uManager.createUser({
          ...req.body,
          password: hashedPassword, isAdmin
        });
        done(null, createdUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      if (!email || !password) {
        done(null, false);
      }
      try {
        const user = await uManager.findUserByEmail(email);
        if (!user) {
          done(null, false);
        }
        const isPasswordValid = await compareData(password, user.password);
        if (!isPasswordValid) {
          return done(null, false);
        }         
        done(null, user);
        console.log(user)
      } catch (error) {
        done(error);
      }
    }
  )
);

// github
passport.use(
  "github",
  new GithubStrategy(
    {
      clientID: "Iv1.056daf57e629e2ed",
      clientSecret: "08795fc34594aacb35c5844298546f6c1405f6f8",
      callbackURL: "http://localhost:8080/api/sessions/callback",
      scope: ["user:email"]
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userDB = await uManager.findUserByEmail(profile.emails[0].value);
        // console.log(profile)
        // login
        if (userDB) {
          if (userDB.isGithub) {
            return done(null, userDB);
          } else {
            return done(null, false);
          }
        }
        // signup
        const infoUser = {
          first_name: profile._json.name.split(" ")[0], // ['farid','sesin']
          last_name: profile._json.name.split(" ")[1],
          email: profile.emails[0].value,
          password: " ",
          isGithub: true,
        };
        const createdUser = await uManager.createUser(infoUser);
        // console.log(profile)
        done(null, createdUser);
      } catch (error) {
        done(error);
      }
    }
  )
); */




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