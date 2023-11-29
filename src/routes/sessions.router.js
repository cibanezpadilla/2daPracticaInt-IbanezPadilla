/* import { Router } from "express"; */
import { uManager } from "../dao/managersMongo/usersManager.js";
import { hashData, compareData } from "../utils.js";
/* import passport from "passport"; */
/* import { generateToken } from "../utils" */
import {Router} from "express"
import passport from "passport"
import "../passport.js"
import { generateToken } from "../utils.js"


const router = Router();


router.post('/signup', passport.authenticate('signup'),(req, res) => {
    res.json({message: 'Signed up'})    
})


/* router.post('/login', passport.authenticate('login'),(req, res) => {
  //  res.json({message: 'Signed up'})
    //le paso el req.user por parámetro a generateToken para guardar en el token la info del usuario
    
    const {first_name, last_name, email, age, role, carts} = req.user
    
    console.log('age', req.user.age)
    console.log('req.user', req.user)
    console.log('req flash', req.flash('error'))
    const token = generateToken({ first_name, last_name, email, age, role, carts})
    //ahora guardo en cookies el token, 'token' va a ser el nombre de la cookie
    //maxAge es la duracion de la cookie y httpOnly para que  no se pueda
    //recuperar esa cookie desde el front, solo va a ser accedido desde un request http
    res.cookie('token', token, { maxAge: 60000, httpOnly: true })
    return res.redirect('/api/sessions/current')
})  */


router.post('/login', (req, res, next) => {
  passport.authenticate('login', { failureFlash: true }, (err, user, info) => {
    // Verifica si hay un error durante la autenticación
    if (err) {
      return next(err);
    }
    // Verifica si el usuario no está autenticado
    if (!user) {                
      const messages = info.message
      return res.render("login", {messages, style: "login"}); 
    }    
    // Si el usuario está autenticado, genera el token y realiza otras acciones
    const { first_name, last_name, email, age, role, carts } = user;
    const token = generateToken({ first_name, last_name, email, age, role, carts });
    res.cookie('token', token, { maxAge: 60000, httpOnly: true });
    return res.redirect('/api/sessions/current');
  })(req, res, next);
});




router.get('/current', passport.authenticate('jwt', {session: false}), async(req, res) => {
  res.status(200).json({message: 'User logged', user: req.user})  
})


router.get('/signout', async(req, res)=>{
  req.session.destroy(()=> {       
      res.redirect('/login')
  })
})


export default router





/* TODO ESTO ES DEL DESAFIO 7

// SIGNUP - LOGIN - PASSPORT LOCAL

router.post(
    "/signup",
    passport.authenticate("signup", {
      successRedirect: "/home",
      failureRedirect: "/error",
    })
  );
  
  router.post(
    "/login",
    passport.authenticate("login", {
      successRedirect: "/home",
      failureRedirect: "/error",
    })
  );
  


  // SIGNUP - LOGIN - PASSPORT GITHUB
  
  router.get(
    "/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
  );
  

  router.get("/callback", passport.authenticate("github"), (req, res) => {
    res.redirect('/home');
  });
  

  router.get("/signout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });
  

  router.post("/restaurar", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await uManager.findUserByEmail(email);      
      if (!user) {        
        return res.redirect("/restaurar");
      }
      const hashedPassword = await hashData(password);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({ message: "Password updated" });
    } catch (error) {
      res.status(500).json({ error });
    }
  });


  export default router;
 */








/* *******************************************************************
ESTO ES LO DEL DESAFIO PASADO
******************************************************************* */

/* router.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;    
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const createdUser = await uManager.createUser(req.body)
        res.status(200).json({message: 'User created'})
    }catch (error) {
        res.status(500).json({error})
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body    
    if (!email || !password)
        return res.status(400).json({message: 'All fields are requiered'})    
    try {
        const user = await uManager.findUserByEmail(email)        
        if (!user){
            return res.redirect('/api/views/signup')
        } 
        const isPasswordValid = password === user.password
        if(!isPasswordValid) {
            return res.status(401).json({message: 'Password is not valid'})
        } //hasta aca funciona
        const sessionInfo =
            email === "adminCoder@coder.com" && password === "adminCod3r123"
                ? { email, first_name: user.first_name, isAdmin: true }
                : { email, first_name: user.first_name, isAdmin: false };        
        console.log(req.session)
        req.session.user = sessionInfo;
        

        // res.status(200).json({message: 'User logged'})
        res.redirect("/api/views/products")
    }catch (error) {
        res.status(500).json({error})
    }
})

// router.get("/products", async (req, res) => {  
//     res.render("products", {user: req.session.user});
// }); 


router.get('/signout', async(req, res)=>{
    req.session.destroy(()=> {       
        res.redirect('/api/views/login')
    })
})


// export default router */

