const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
//sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    const welcomeMsg = {
        to: email,
        from: 'm3arafa906@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the App, ${name} let me know how you get along with the app.`
    }
    sgMail.send(welcomeMsg)
}

const sendCancelationEmail = (email, name) => {
    const cancelationMsg = {
        to: email,
        from: 'm3arafa906@gmail.com',
        subject: 'We are sorry to see you leave us!',
        text: `Hello, ${name} Your user account are deleted now as per your request, but please give us the reason why you are leaving? to see if we can improve our service. Regards, Task manager team`
    }
    sgMail.send(cancelationMsg)
}


module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}

