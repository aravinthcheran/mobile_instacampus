import React, { useState } from "react";
import { useLogin } from "../../hooks/useLogin";
import axios from "axios";
import "./index.scss";
const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login, error, loading } = useLogin();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const emailRegex = /^[0-9]{2}[a-zA-Z][0-9]{3}@psgtech\.ac\.in$/;
		if (!emailRegex.test(email)) {
			alert("Please provide a valid email address");
			return;
		}

		await login(email, password);
	};

	return (
		<div className="login-holder">
			<form action="" className="login" onSubmit={handleSubmit}>
				<h3>Log in</h3>
				<label htmlFor="">Email:</label>
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<label htmlFor="">Password:</label>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<p> </p>
				<button disabled={loading} type="submit">
					Log in
				</button>
				<p> </p>
				{error && <p>{error}</p>}
			</form>
		</div>
	);
};

export default Login;
