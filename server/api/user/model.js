const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide your name"],
	},
	email: {
		type: String,
		required: [true, "Please provide an email address"],
		unique: true,
		lowercase: true,
		trim: true,
	},
	password: {
		type: String,
		required: [true, "Please provide a password"],
		minlength: 6,
	},
});

userSchema.statics.register = async function (name, email, password) {
	// check if email exists
	if (!email || !password) {
		throw new Error("Please provide an email and password");
	}

	if (!validator.isEmail(email)) {
		throw new Error("Please provide a valid email address");
	}

	const exists = await this.findOne({ email });
	if (exists) {
		throw new Error("Email already exists");
	}
	// password hash
	const salt = await bcrypt.genSalt(10);
	const passwordHash = await bcrypt.hash(password, salt);

	const user = await this.create({ name, email, password: passwordHash });
	return user;
};

// static login method

userSchema.statics.login = async function (email, password) {
	// check if email exists
	if (!email || !password) {
		throw new Error("Please provide an email and password");
	}

	const user = await this.findOne({ email });
	if (!user) {
		throw new Error("Invalid Email");
	}

	const match = await bcrypt.compare(password, user.password);
	if (!match) {
		throw new Error("Invalid Password");
	}

	return user;
};

module.exports = mongoose.model("User", userSchema);
