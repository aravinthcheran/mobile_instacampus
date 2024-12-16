import { AuthContext } from "../context/AuthContext";

import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../constants";
export const useSignUp = () => {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const { dispatch } = useContext(AuthContext);
	const navigate = useHistory();

	const signUp = async (name, email, password) => {
		setLoading(true);
		try {
			const response = await axios.post(`${apiUrl}/api/v1/auth/register`, {
				name,
				email,
				password,
			});

			console.log("Response:", response);
			if (!response.status === 200) {
				setLoading(false);
				setError(response.data.error);
			}
			if (response.statusText === "OK") {
				console.log("Came heree");
				// Save user to local storage
				localStorage.setItem("user", JSON.stringify(response.data));

				// Dispatch to context
				dispatch({
					type: "LOGIN",
					payload: response.data,
				});

				setLoading(false);
				navigate.push("/");
			}
		} catch (error) {
			console.log("Error", error);
			setError(error.response.data.error);
		}
		setLoading(false);
	};

	return { signUp, error, loading };
};
