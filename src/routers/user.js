const express = require('express')
const User = require('../models/user');
const auth = require('../middleware/authenticator')
const Jimp = require('jimp')
const multer = require('multer')
const router = new express.Router()
//const bcrypt = require('bcryptjs')


//CREATE USER
router.post('/users', async(req, res) => {
    //incoming body data
    //console.log(req.body)
    //res.send('test')
    const user = new User(req.body)
    //console.log(user);

    //using async-await
    try{
        
        //const usrPwd = user.password;
        //const hashPwd = await bcrypt.hash(usrPwd, 8)
        //user.password = hashPwd
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(e) {
        //console.log(e)
        res.status(400).send(e)

    }
    // user.save().then(() => {
    //     //console.log(user);
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

//LOGIN ROUTER
router.post('/users/login', async(req, res) => {
    try {
        const user = await User.findByCreds(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        //console.log(token)
        res.send({user, token})
    } catch(e){
        res.status(404).send()
    }
})

//LOGOUT USER
router.post('/users/logout', auth, async(req, res) => {
    try{
        //filtering out only the unmatched tokens removing the matched one
        //removing only one token keeping all other token logged in
        //token is a property of req
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e) {
        res.status(500).send()
    }
})

//LOGOUT ALL SESSIONS
router.post('/users/logoutAll', auth, async(req, res) => {
    try{
        //removing all the tokens of a user
        //token is a property of req
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e) {
        res.status(500).send()
    }
})

//GET USERS
//call the middleware authenticator in all except sign up and login
router.get('/users/me', auth, async(req, res) => {
    // try{
    //     const user = await User.find({})
    //     //console.log('Inside user')
    //     res.send(user)
    // }catch(e){
    //     res.status(500).send(e)
    // }
    //Getting only the authenticated user profile hiding other users
    res.send(req.user)
})

//We dont need this as we would not have access to ohter user ids
//GET USER BY ID
/*router.get('/users/:id', async(req, res) => {
    //console.log(req.params)
    const _id = req.params.id;
    //console.log(name)
    //console.log(_id.length)
    try{
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
            res.send(user)
    }catch(e){
        res.status(500).send(e)
    }   
})*/

//UPDATE USER
router.patch('/users/me', auth, async(req,res) => {
    //const _id = req.params.id;
    //console.log(_id)
    //console.log(req.body)
    const updates = Object.keys(req.body)
    const allowed = ['name', 'email', 'age', 'password']
    const validOps = updates.every((update) => allowed.includes(update))
    if(!validOps){
        return res.status(400).send({error: 'Invalid update'})
    }
    try{
        //const user = await User.findById(_id)
        //dynamic assignment
        updates.forEach((update) => req.user[update] = req.body[update])
        //run check for new user save and validators
        //findbyidandupdate bypasses advanced func like middleware
        //need to do in traditional mongoose way
        //const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true} )
        await req.user.save()
        res.send(req.user)
    }catch(e){
        //console.log(e)
        res.status(400).send(e)
    }
})

//DELETE USER
router.delete('/users/me', auth, async(req, res) => {
    //const _id = req.params.id;
    try{
    //     const user = await User.findByIdAndDelete(_id)
    //     if(!user){
    //         return res.status(404).send()
    //     }
    await req.user.remove()
    res.send(req.user)

    }catch(e){
        res.status(500).send() 
    }
})
//PIC UPLOAD
const avatar = multer({
    //remove dest if file is to saved in user properties as a buffer in db and not FS
    //dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please upload valid photo'))
        }
        callback(undefined, true)
    }
})
router.post('/users/me/avatar', auth, avatar.single('avatar'), async (req, res) => {

    const buf = await Jimp.read(req.file.buffer)
    buf.resize(250, 250)
    //console.log(`Test1: ${buf}`)
    buf.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
        //console.log(`Test2: ${buffer}`)
        req.user.avatar = buffer
      });
      //console.log(`Test3: ${req.user.avatar}`)
    //save the buffer data of the file in the avatar property
    //req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
})

//DELETE PROFILE PIC
router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//GET PROFILE PIC BY ID
router.get('/users/:id/avatar', async(req, res) => {
    //console.log(req.params.id)
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        //set the output to image
        res.set('content-type', 'image/png')
        res.send(user.avatar)
        //console.log('Test')
    }
    catch(e){
        res.status(404).send(e)
        //console.log(e)
    }
})


module.exports = router
