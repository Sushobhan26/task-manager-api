const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    //console.log('Authenticator middleware')
    try{
        //getting the token from client passed along with in POSTMAN
        const token = req.header('Authorization').replace('Bearer ', '')
        //verify the token along with the secret key
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        //check the token is present in the tokens array as it might be valid even if user logs out
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })
        //console.log(token)
        if(!user){
            throw new Error()
        }
        //store the latest token verified
        req.token = token
        //creat a new req property to add the authenticated user
        req.user = user
        next()
    }catch(e){
        res.status(401).send({ Error: 'Please authenticate'})
    }
    //next()
}

module.exports = auth