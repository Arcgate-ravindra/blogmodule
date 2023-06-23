const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: 'eda.rosenbaum@ethereal.email',
        pass: 'hVaUPWqxVaDtPPtNFz'
    },
    tls: {
        rejectUnauthorized: false
    }
});

const emailTransporter = async(email) => {

    try {
           // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Ravindra 👻" <eda.rosenbaum@ethereal.email>', // sender address
        to: "khushi.vijay@arcgate.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Link for reset the password", // plain text body
        html: "<a href='http://localhost:3000/api/user/forgotpass'>Please click on this link</a>", // html body
    });
    return "email sent"
    } catch (error) {
            return error.message;
    }

 

    
}

module.exports = emailTransporter;