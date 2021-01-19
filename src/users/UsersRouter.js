const express = require('express')
const UsersRouter = express.Router()
const bodyParser = express.json()
const UsersService = require('./UsersService')
const AuthService = require('./AuthService')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
//const logger = require('../logger.js)
//const xss = require('xss')

UsersRouter
    .route('/api/users')
    .get( (req,res,next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(data => {
                res.json(data)
            })
            .catch(next)
    })
    .post(bodyParser, (req,res,next) => {
        const { email, username, password } = req.body
        const new_user = { email, username, password}
        UsersService.newUser(req.app.get('db'), new_user)
            .then(data => {
                res.json(data).status(201)
            })
            .catch(next)
    })
  
UsersRouter
    .route('/api/user')
    .post(bodyParser, (req,res,next) => {
        const { username } = req.body
        UsersService.getUser(req.app.get('db'), username)
            .then(user => {
                res.json(user).status(201)
            })
            .catch(next)
})     

UsersRouter
    .route('/api/userLists')
    .post(bodyParser, (req,res,next) => {
        const { username } = req.body
        UsersService.seedUserLists(req.app.get('db'), username)
            .then(user => {
                res.json(user).status(201)
            })
            .catch(next)
    })

UsersRouter
    .route('/api/userItems')
    .post(bodyParser, (req,res,next) => {
        const { username } = req.body
        UsersService.seedUserItems(req.app.get('db'), username)
            .then(user => {
                res.json(user).status(201)
            })
            .catch(next)
})

UsersRouter
    .route('/api/register')
    .post(bodyParser, (req,res,next) => {
        const { email, username, password } = req.body
        const new_user = { email, username, password }
        //check if username exists
        UsersService.checkUsername(req.app.get('db'), new_user.username )
            .then(username => {
                if (username.length == 0 || username == undefined) {
                    //bcrypt password
                    bcrypt.hash(new_user.password, 4, function (err, hash) {
                        if (err) {
                            return next(err)
                        } else {
                            new_user.password = hash
                            console.log(new_user)
                            //insert new user here
                            UsersService.newUser(req.app.get('db'), new_user)
                                .then(user => {
                                    res.json(user).status(201)
                                })
                                }
                            })
                    //if the username already exists...
                }  else if (username) {
                        return res.status(404).json({
                            error: { message: `Username already exists` }
                    })  
                }
            })
            .catch(next)
        })

UsersRouter
    .route('/api/login')
    .post(bodyParser, (req,res,next) => {
        const { username, password } = req.body
        const login_user = { username, password }
    //bcrypt and jwt 
        for (const [key, value] of Object.entries(login_user))
            if (value === null) 
                return res.status(400).json({error: `Missing '${key}' in request body`})
            AuthService.getUsername(req.app.get('db'),login_user.user_name )
                .then(dbUser => {
                    if (!dbUser) 
                        return res.status(400).json({error: 'Incorrect username or password'})
                    AuthService.comparePasswords(login_user.password, password)
                        .then(compareMatch => {
                            res.json(compareMatch)
                            console.log(compareMatch)
                        })

                        // if (!compareMatch)
                        //     return res.status(400).json({error: 'Incorrect user_name or password',})
                        // //----JWT
                        //     const sub = dbUser.user_name
                        //     const payload = { user_id: dbUser.id }
                        //     res.send({ authToken: AuthService.createJwt(sub, payload) })
                        //     })
                        .catch(next)
                        })
                .catch(next)     
    })
    

        // try{
            //     const match = await bcrypt.compare(req.body.password, user.password)
            //     const accessToken = jwt.sign(JSON.stringify(user), process.env.TOKEN_SECRET)
            //     if(match){
            //         res.json({ accessToken: accessToken })
            //     } else {
            //         res.json({ message: "Invalid Credentials" })
            //     }
            // } catch(e) {
            //     console.log(e)
            // }
        


        // const jwtKey = "my_secret_key"
        // const jwtExpirySeconds = 300

        // const { username, password } = req.body
       
        // if (!username || !password || users[username] !== password) {
		// // return 401 error is username or password doesn't exist, or if password does
		// // not match the password in our records
		// return res.status(401).end()
    	// }

        // // Create a new token with the username in the payload
        // // and which expires 300 seconds after issue
        // const token = jwt.sign({ username }, jwtKey, {
        //     algorithm: "HS256",
        //     expiresIn: jwtExpirySeconds,
        // })
        // console.log("token:", token)
        
        // // set the cookie as the token string, with a similar max age as the token
        // // here, the max age is in milliseconds, so we multiply by 1000
        // res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 })
        // res.end()
        // const { username, password } = req.body
        // UsersService.getUser(req.app.get('db'), username)
        //     .then(user => {
        //         res.json(user).status(201)
        //     })
        //     .catch(next)
   


module.exports = UsersRouter