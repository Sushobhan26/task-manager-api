const express = require('express');
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express();
const port = process.env.PORT || 3000

//setting up middle functions to use token
//new req --> use middleware func --> run route handlers
// app.use((req, res, next) => {
//      res.status(503).send('Site is down. Maintenance going on')
    
// })

//MULTER DEMO
// const multer = require('multer');
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, callback) {
//         //if(!file.originalname.endsWith('.pdf')){
//             if(!file.originalname.match(/\.(doc|docx)$/)){
//             return callback(new Error('Please upload a Word document'))
//         }
//         callback(undefined, true)
//     }
// })
// //inclding error handler
// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({error : error.message})
// })

//express parses the incoming json from client/postman
//to grab incoming json data
app.use(express.json());
//routers are used to organize different ruters used in apps
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

//HOW JWT WORKS
/*const jwt = require('jsonwebtoken')

const myFunction = async() => {
    const token = jwt.sign({ _id: 'abc123'}, 'mysecretstring', { expiresIn: '7 days' })
    //console.log(token)

    const data = jwt.verify(token, 'mysecretstring')
    //console.log(data)

}

myFunction()*/