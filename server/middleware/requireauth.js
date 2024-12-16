const jwt = require("jsonwebtoken");
const User = require("../api/user/model");

const requireAuth = async (req, res, next) => {
	 const openPaths = [
        "/api/v1/auth/register",
        "/api/v1/auth/login",
    ];

    // Check if the path is an open path or matches the verify route
    if (
        openPaths.includes(req.path) ||
        req.path.startsWith("/api/v1/article/verify/")
    ) {
        // Proceed to the next middleware or route handler
        return next();
    }
	// verify user is authenticated
	else {
		const { authorization } = req.headers;
        console.log(authorization);



		if (!authorization) {
			return res.status(401).json({ error: "Authorization token required" });
		}

		const token = authorization.split(" ")[1];

		try {
			const { _id } = jwt.verify(token, process.env.JWT_SECRET);

			req.user = await User.findOne({ _id }).select("_id");
			next();
		} catch (error) {
			console.log(error);
			res.status(401).json({ error: "Request is not authorized" });
		}
	}
};

module.exports = requireAuth;
