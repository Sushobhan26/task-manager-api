const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

//We are defining the schema explicitly instead of passing it into model directly
//this is required to make use of the midleware functionalities
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)) {
                throw new Error('Not a valid emailid')
            }
        }
    },
    password: {
        required: true,
        type: String,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "passowrd"')
            }
        },
        minlength: 7
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age cannot be negative')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }], 
    avatar :{
        type: Buffer
    }
}, { timestamps: true })
//virtual property is used to establish relationship between 2 entity. It is not an actual property
//localfield is the property in the user model
//foreignfield is the property in the task model with which it is associated
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'author'
})

//static methods are accessible on the models also called model methods, checking all on users

//add the findByCreds in the schema
userSchema.statics.findByCreds = async(email, password) => {
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('Unable to login!')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login!')
    }
    return user //if its success
}
//methods are accessible on the instances also called instance methods, checking on an instance of user
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    //adding the token to the user tokens property
    user.tokens = user.tokens.concat({ token })
    //calling the save method again to save the token to DB
    await user.save()
    //console.log(token)
    return token
}

//to hide the imp details
userSchema.methods.toJSON = function() {
    const user = this
    //creates a raw object
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    //remove profile pic from get profile to make response faster
    delete userObject.avatar
    return userObject
}

//pre is used to perform something pre event. post is also used
//refer middleware in mongoose docs
//in middleware, arow function cannot be used since arrow functions dont have access to this
userSchema.pre('save', async function(next){
    const user = this
    //console.log('Before saving')
    //check if pwd is modified
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//middleware func to delete the associated tasks before deleting the user
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ author: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User