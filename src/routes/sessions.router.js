import { uManager } from "../dao/managersMongo/usersManager.js";
import { hashData, compareData } from "../utils.js";
import {Router} from "express"
import passport from "passport"
import "../passport.js"
import { generateToken } from "../utils.js"


const router = Router();


router.post('/signup', passport.authenticate('signup'),(req, res) => {
    res.json({message: 'Signed up'})    
})


/* //con flash
router.post('/login', (req, res, next) => {
  passport.authenticate('login', { failureFlash: true, failureMessage: true, failureRedirect: '/error' }, (err, user, info) => {
    // Verifico si algun error durante la autenticación
    if (err) {
      return next(err);
    }
    
    // Verifico si el usuario está autenticado, si no hay user, muestra mensajes
    //de error que armé en la estrategia en passport.js
    // if (!user) { 
    //   console.log(req.flash('error'));               
    //   const messages = info.message
    //   return res.render("login", {messages, style: "login"}); 
    // }    
    
    const { first_name, last_name, email, age, role, carts } = user;
    const token = generateToken({ first_name, last_name, email, age, role, carts });
    res.cookie('token', token, { maxAge: 60000, httpOnly: true });
    return res.redirect('/api/sessions/current');
  })(req, res, next);
}); */



router.get('/current', passport.authenticate('jwt', {session: false}), async(req, res) => {
  res.status(200).json({message: 'User logged', user: req.user})  
})


router.get('/signout', async(req, res)=>{
  req.session.destroy(()=> {       
      res.redirect('/login')
  })
})


//ESTO ES LO QUE HIZO EL PROFE EN CLASE QUE AL FINAL LO REFORMULÉ
router.post('/login', passport.authenticate('login', {failureMessage: true, failureRedirect: "/login"}),(req, res) => {
  //  res.json({message: 'Signed up'})
    //le paso el req.user por parámetro a generateToken para guardar en el token la info del usuario
    
    const {first_name, last_name, email, age, role, carts} = req.user    
   
    const token = generateToken({ first_name, last_name, email, age, role, carts})
    //ahora guardo en cookies el token, 'token' va a ser el nombre de la cookie
    //maxAge es la duracion de la cookie y httpOnly para que  no se pueda
    //recuperar esa cookie desde el front, solo va a ser accedido desde un request http
    res.cookie('token', token, { maxAge: 60000, httpOnly: true })
    return res.redirect('/api/sessions/current')
}) 



export default router



