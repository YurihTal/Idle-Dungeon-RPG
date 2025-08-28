const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define what a User looks like in our database
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [2, 'Username must be at least 2 characters'],
        maxlength: [15, 'Username must be less than 15 characters'],
        trim: true,  // Removes extra spaces
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,  // Converts to lowercase automatically
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
    // Only hash password if it's new or has been modified
    if (!this.isModified('password')) return next();
    
    try {
        // Hash the password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;