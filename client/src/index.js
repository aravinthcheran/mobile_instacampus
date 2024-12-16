import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
// import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContextProvider } from "./context/AuthContext";

ReactDOM.render(
	<BrowserRouter>
		<AuthContextProvider>
			<App />
		</AuthContextProvider>
	</BrowserRouter>,
	document.getElementById("root")
);
