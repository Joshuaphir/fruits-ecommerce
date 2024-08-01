const {promisify} = require("util")
const User = require("./../models/UserModel");
const jwt = require("jsonwebtoken");
const sendMail = require("./emailXnder/email")
const crypto = require("crypto")


//create token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

exports.signup = async(req, res, next) => {
    const newuser = await User.create(req.body);
    // const newuser = await User.create({
        // name: req.body.name,
        // email: req.body.email,
        // photo: req.body.photo,
        // password: req.body.password,
        // confirmpassword: req.body.confirmpassword
    // });

    // making the user have token when the account is created
    const token = signToken(newuser._id)
    res.status(201).json({
        status: "Success",
        token,
        data: {
            user : newuser
        }
    })
}

// login function 
exports.login = async(req, res, next) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(404).json({
            status: "Fail",
            message: "error"
        })
    }

    const user = await User.findOne({email}).select("+password")
    //decryption and comparing passwords when user login is done the model
    if(!user || !(await user.correctPassword(password, user.password))){
        res.status(404).json({
            status: "Fail",
            message: "error : incorrect password and username"
        })
    }
    const token = signToken(user.id);
    res.status(200).json({
        status: "Success",
        token
    })
}

//protecting data

exports.protect = async (req, res, next) => {
    //check token, validate token, check if user exist ,change pass
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1]
    } 
    // error if there is no token
    if(!token){
        res.status(404).json({
            status:"Fail",
            message: "login failed"
        })
    }

    //validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    //check if user exist
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        res.status(404).json({
            status:"Fail",
            message: "user for the token no longer exist"
        })
    }

    // if the user change password the token has to change as well
    if(currentUser.changePasswordAfter(decoded.iat)){
        res.status(404).json({
            status:"Fail",
            message: "user password changed recently"
        })
    }
    //grant access to protected data 
    req.user = currentUser;
    next()
}

exports.roleDefiner = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

// forget password
exports.forgetPass = async (req, res, next) => {
    //get the user based on given email
    const user = await User.findOne({email: req.body.email});
    if (!user){
        return res.status(404).json({
            status: 'fail',
            message: 'No user with that email'
        });
    }
    //create a random token
    const resetToken = user.PasswordResetToken()
    await user.save({validateBeforeSave: false})

    //send email back to the user 
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetpassword/${resetToken}`;
    const message = `you have requested to change password, please click here ${resetUrl} and provide new password.
     \n If its not you please ignore this message`;

     
    try {
        await sendMail({
            email: user.email,
            subject: "your password reset token is valid for 10 minutes",
            message,
         });
    
         res.status(200).json({
            status: "Success",
            message: "Token sent successfully"
        })
    } catch (error) {
        user.passResetToken = undefined;
        user.passwordTokenExpire = undefined;
        await user.save({validateBeforeSave: false})
    }

    next()
}
//reset password
exports.resetPass = async (req, res, next) => {
    // get user based on token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        passResetToken: hashedToken,
        passwordTokenExpire: {$gt: Date.now()}
    })

    // if token has not expire, and user is available , set new password
    if(!user){
        return res.status(404).json({
            status: 'fail',
            message: 'invalid token or token has expired'
        });
    }
    // saving the changes
    user.password = req.body.password;
    user.confirmpassword = req.body.confirmpassword;
    user.PasswordResetToken = undefined;
    user.passwordTokenExpire = undefined;
    await user.save()

    // loging in user
    const token = signToken(user.id);
    res.status(200).json({
        status: "Success",
        token
    })

}

//updating password
exports.updatePassword = async (req, res, next) => {
    // get user from database
    const user = await User.findById(req.user.id).select("+password");
    // check if passwords matches
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return res.status(404).json({
            status: 'fail',
            message: "passwords doesn't match"
        });
    }

    // update the password
    user.password = req.body.password;
    user.confirmpassword = req.body.confirmpassword;
    await user.save()
}