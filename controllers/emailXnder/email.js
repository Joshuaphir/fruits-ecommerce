const nodemailer = require("nodemailer");

const sendeMail = async (options) => {
    //create transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.google.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    //define email options

    const mailOptions = {
        from: process.env.EMAIL_USER,    
        to: options.email, 
        subject: options.subject, 
        text: options.message, 
        
      };
    //activate send email
    await transporter.sendMail(mailOptions)
}

module.exports = sendeMail;