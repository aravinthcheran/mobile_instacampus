import React, { useState } from "react";
import "./index.scss";
import { useSignUp } from "../../hooks/useSignUp";

const SignUp = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { signUp, error, loading } = useSignUp();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const emailRegex = /^[0-9]{2}[a-zA-Z][0-9]{3}@psgtech\.ac\.in$/;
		if (!emailRegex.test(email)) {
			alert("Please provide a valid email address");
			return;
		}

		await signUp(name, email, password);
	};

	return (
		<div className="signup-holder">
			<form className="signup" onSubmit={handleSubmit}>
				<h3>Sign Up</h3>
				<label>Name:</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Enter your name"
				/>
				<label>Email:</label>
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Enter your email"
				/>
				<label>Password:</label>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Enter your password"
				/>
				<button disabled={loading} type="submit">
					{loading ? "Signing Up..." : "Sign Up"}
				</button>
				{error && <p>{error}</p>}
			</form>
		</div>
	);
};

export default SignUp;