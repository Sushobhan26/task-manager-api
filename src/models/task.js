const mongoose = require('mongoose');
//const validator = require('validator');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
       type: Boolean,
       default: false 
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true })

const Task = mongoose.model('Task', taskSchema)

//ref is used to establish a relationship between the task and the owner (user schema)

module.exports = Task