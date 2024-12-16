const ErrorResponse = require("../../util/errorResponse");
const asyncHandler = require("../../middleware/async");
const User = require("../user/model");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
	return jwt.sign({ _id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password } = req.body;
	console.log(req.body);
	try {
		const user = await User.register(name, email, password);
		const token = createToken(user._id);
		res.status(200).json({ user,token });
	} catch (err) {
		res.status(400).json({ success: false, error: err.message });
		// console.error(err);
	}
});

exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	try {
		const user = await User.login(email, password);
		const token = createToken(user._id);
		res.status(200).json({user,token});
	} catch (err) {
		res.status(400).json({ success: false, error: err.message });
		console.error(err);
	}
});

exports.logout = asyncHandler(async (req, res, next) => {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		data: {},
	});
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");

	// Check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse("Password is incorrect", 401));
	}

	user.password = req.body.newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.getSignedJwtToken();
	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
		secure: true,
	};
	res
		.status(statusCode)
		.cookie("token", token, options)
		.json({ success: true, token });
};
