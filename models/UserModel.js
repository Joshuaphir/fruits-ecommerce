const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")

// NAME, EMAIL, PHOTO, PASSWORD, CONFIRM PASSWORD

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Please enter name"],
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, "please provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "please provide valid email"]
    },
    photo: String,
    role: {
        type: String,
        enum: ["user", "buyer", "admin", "seller"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        select: false
    },
    confirmpassword: {
        type: String,
        required: [true, "Please confirm the password"],
        // this will work on save and create but not on update
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: "Password is not the same"
        }
        
    },
    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Fruit",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    passwordChangedAt: Date,
    passResetToken: String,
    passwordTokenExpire: Date
});
// the idea behind these pre function is not to run them when the user is being created
userSchema.pre("save", function(next){
    if(!this.isModified("password") || this.isNew ) return next();
    //The subtraction of 1000 milliseconds ensures that the passwordChangedAt field is 
    //set to a slightly earlier time, providing a buffer to avoid potential timing issues 
    //with token issuance and ensuring consistency in the timing of password changes and 
    //document saves.
    this.passwordChangedAt = Date.now() - 1000;
    next()
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    // if the account is being created run this code
    //hash the password
    this.password = await bcrypt.hash(this.password, 12);
    //delete confirmpassword
    this.confirmpassword = undefined;
    next()
})

// decryption and comparing password when user login
userSchema.methods.correctPassword = async function(
    candidatePassword,
    userPassword
){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStap = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

        return JWTTimestamp < changedTimeStap
    }
    //default return false
    return false
}

userSchema.methods.PasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordTokenExpire = Date.now() +10 * 60 * 1000;
    return resetToken;
}

const User = mongoose.model("User", userSchema);
module.exports = User;