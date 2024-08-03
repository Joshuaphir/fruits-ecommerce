const { promisify } = require("util");
const User = require("./../models/UserModel");
const jwt = require("jsonwebtoken");
const sendMail = require("./emailXnder/email");
const crypto = require("crypto");

// Create token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.signup = async (req, res, next) => {
    try {
        const newuser = await User.create(req.body);
        
        // Generate token
        const token = signToken(newuser._id);
        res.status(201).json({
            status: "Success",
            token,
            data: {
                user: newuser
            }
        });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            message: error.message
        });
    }
};

// Login function
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: "Fail",
            message: "Email and password are required"
        });
    }

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: "Fail",
                message: "Incorrect email or password"
            });
        }

        const token = signToken(user.id);
        res.status(200).json({
            status: "Success",
            token
        });
    } catch (error) {
        res.status(500).json({
            status: "Fail",
            message: error.message
        });
    }
};

// Protecting data
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            status: "Fail",
            message: "You are not logged in. Please log in to get access."
        });
    }

    try {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: "Fail",
                message: "The user belonging to this token no longer exists."
            });
        }

        if (currentUser.changePasswordAfter(decoded.iat)) {
            return res.status(401).json({
                status: "Fail",
                message: "User recently changed password. Please log in again."
            });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        res.status(401).json({
            status: "Fail",
            message: "Invalid token."
        });
    }
};

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

// Forget password
exports.forgetPass = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'No user with that email'
            });
        }

        // Create a random token
        const resetToken = user.PasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Send email back to the user
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetpassword/${resetToken}`;
        const message = `You have requested to change your password. Please click here ${resetUrl} to provide a new password.
        \nIf this was not you, please ignore this message.`;

        try {
            await sendMail({
                email: user.email,
                subject: "Your password reset token (valid for 10 minutes)",
                message,
            });

            res.status(200).json({
                status: "Success",
                message: "Token sent successfully"
            });
        } catch (error) {
            user.PasswordResetToken = undefined;
            user.passwordTokenExpire = undefined;
            await user.save({ validateBeforeSave: false });

            res.status(500).json({
                status: "Fail",
                message: "There was an error sending the email. Please try again later."
            });
        }
    } catch (error) {
        res.status(500).json({
            status: "Fail",
            message: error.message
        });
    }
};

// Reset password
exports.resetPass = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({
            PasswordResetToken: hashedToken,
            passwordTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid token or token has expired'
            });
        }

        user.password = req.body.password;
        user.confirmpassword = req.body.confirmpassword;
        user.PasswordResetToken = undefined;
        user.passwordTokenExpire = undefined;
        await user.save();

        const token = signToken(user.id);
        res.status(200).json({
            status: "Success",
            token
        });
    } catch (error) {
        res.status(500).json({
            status: 'Fail',
            message: error.message
        });
    }
};

// Update password
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("+password");

        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: "Current password is incorrect"
            });
        }

        user.password = req.body.password;
        user.confirmpassword = req.body.confirmpassword;
        await user.save();

        res.status(200).json({
            status: 'Success',
            message: "Password updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: 'Fail',
            message: error.message
        });
    }
};
