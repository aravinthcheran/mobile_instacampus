require("dotenv").config();
const ErrorResponse = require("../../util/errorResponse");
const asyncHandler = require("../../middleware/async");
const ReqArticle = require("./model");
const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_ID,
		pass: process.env.EMAIL_PASS,
	},
});

// @route : /api/v1/request/
// @req-type : POST
// @description : Request an article
exports.reqArticle = asyncHandler(async (req, res, next) => {
	const body = {
		requesterName: req.body.requesterName,
		requesteeName: req.body.requesteeName,
		requesteeContact: req.body.requesteeContact,
		company: req.body.company,
		note: req.body.note,
	};
	await ReqArticle.create(body);
	return res.status(200).json({
		success: true,
		message: "Request noted successfully !",
	});
});

exports.getAllRequests = asyncHandler(async (req, res, next) => {
	const requests = await ReqArticle.find();
	return res.status(200).json({
		success: true,
		requests,
	});
});

exports.sendEmail = asyncHandler(async (req, res, next) => {
	const body = {
		requesterName: req.body.requesterName,
		requesteeName: req.body.requesteeName,
		requesteeContact: req.body.requesteeContact,
		company: req.body.company,
		note: req.body.note,
	};
	console.log("email", body.requesteeContact);
	const mailOptions = {
		from: "csea.cse@psgtech.ac.in",
		to: body.requesteeContact,
		subject: "Interview Experience",
		text: `Hello ${body.requesteeName},

 Hope this email finds you well.

We are currently gathering insights for an article on interview experiences within ${body.company}. Your unique perspective and firsthand experience would be incredibly valuable to us.

Could you please share your interview experience with us? We're particularly interested in hearing about your preparation process, impressions of the company and interviewers, any challenges you encountered, and insights gained from the experience.

Your input will not only enrich our article but also provide valuable guidance to others navigating similar paths.

Thank you in advance for considering our request. We look forward to hearing from you soon.

Best regards,
${body.requesterName}`,
	};

	// console.log(email, "----", me, "----", "Insideee maillll");

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
			return res
				.status(200)
				.json({ message: "Failed to send mail", error: error });
		}
		console.log("Email sent:", info.response);
		return res.status(200).json({
			message: "Email sent successfully",
			error: `The mail has been sent to ${email} Make sure You are not moving out of this page until the meet ends.If you move out you will be assigned a new id `,
		});
	});
});
