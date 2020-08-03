const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/authenticator')
const router = new express.Router()

//CREATE TASK
router.post('/tasks', auth, async(req, res) => {
    //const task = new Task(req.body);
    //adding the author property to task
    const task = new Task({
        ...req.body,
        author: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})



//GET TASKS
//URL : /tasks?completed=true||false
//URL: /tasks?limit=4&skip=4
//URL : /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
        //const task = await Task.find({ author: req.user._id })
        //console.log(task)
        //Another way
        const match = {}
        const sort = {}
        if(req.query.completed){

            match.completed = req.query.completed === 'true'
                //console.log('Test')
           //console.log(complt)
         }
        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':')
            //-1 for dec and 1 for asc
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
            //console.log(sort[parts[0]])
        }
        try{
        //pass in the complt (null/true/false) based on the query to the populate method
        await req.user.populate({
            path: 'tasks', match,
            //all query strings are optional
            options :{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)
    }
})

//GET TASK BY ID
router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id;
    try{
        //const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, author: req.user._id })
        if(!task){
            return res.status(404).send()
        }
            res.send(task)
    }catch(e){
        res.status(500).send(e)
    }  
})

//UPDATE TASK
router.patch('/tasks/:id', auth, async(req,res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body)
    const allowed = ['description', 'completed']
    const validOps = updates.every((update) => allowed.includes(update))
    if(!validOps){
        return res.status(400).send({error: 'Invalid update'})
    }
    try{
        const task = await Task.findOne({ _id, author: req.user._id })
        
        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        //const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true} )
        await task.save()
        res.send(task)
    }catch(e){
        //console.log(e)
        res.status(400).send(e)
    }
})

//DELETE TASK
router.delete('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id;
    try{
        const task = await Task.findOneAndDelete({ _id, author: req.user._id })
        if(!task){
            return res.status(404).send()
        }
        res.send(task)

    }catch(e){
        res.status(400).send(e) 
    }
})

module.exports = router
