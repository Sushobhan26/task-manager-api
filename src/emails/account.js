//const nodemailer = require('nodemailer')
const sgMail = require('@sendgrid/mail')


//const sendgripAPIKey = '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'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'srk.shovon@gmail.com',
    subject: 'Welcome to Task Manager App',
    text: `Welcome to the app, ${name}. We hope you like it!`
  })
}

const sendDeleteMail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'srk.shovon@gmail.com',
    subject: 'Good Bye',
    text: `Hi ${name}, please let us know how much did you like our app!`
  })
}

module.exports = {
  sendWelcomeMail,
  sendDeleteMail
}

  


   