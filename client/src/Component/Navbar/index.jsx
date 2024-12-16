import React from "react";
import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import "./index.scss";
import { isMobile } from "../../utils";
import { dropDownList, mobileDropDownList } from "./menuItems";
import { useLogout } from "../../hooks/useLogout";
import { useAuthContext } from "../../hooks/useAuthContext";

let menuList = isMobile ? mobileDropDownList : mobileDropDownList;

const Navbar = () => {
	const { logout } = useLogout();
	const { user } = useAuthContext();

	const handleClick = () => {
		logout();
		window.location.reload();
	};

	return (
		<>
			<div className="d-flex justify-content-around  p-2 border-bottom navbar">
				<Link to="/" className="flex-grow-1 ml-5 bd-highlight title">
					COMMUNITY
				</Link>

				<div className="action-buttons">
					{user && (
						<div>
							<span>{user.email}</span>
							<Link
								to="/write"
								className="mt-2 btn btn-primary font-weight-bold"
							>
								Write Article
							</Link>
							<Link to="/request" className="mt-2 btn btn-outline-primary">
								Request Article
							</Link>
							<button
								onClick={handleClick}
								className="mt-2 btn btn-outline-primary"
							>
								Log out
							</button>
						</div>
					)}
					{!user && (
						<div>
							<Link to="/login" className="mt-2 btn btn-outline-primary">
								Login
							</Link>
							<Link to="/signup" className="mt-2 btn btn-outline-primary">
								Sign Up
							</Link>
						</div>
					)}
				</div>
				<Dropdown className="navDropDown">
					<Dropdown.Toggle size="lg" variant="white" id="dropdown-basic">
						<i
							className={isMobile ? "fa fa-bars" : "fa fa-chevron-circle-down"}
							aria-hidden="true"
						></i>{" "}
					</Dropdown.Toggle>
					<Dropdown.Menu>
						{menuList
							.filter((item) => {
								// Check if the user exists to filter out Login and Sign Up
								if (user) {
									return item.title !== "Login" && item.title !== "Sign Up";
								}
								return true;
							})
							.map((item, index) => (
								<Dropdown.Item key={index}>
									<Link to={item.link}>
										<i className={item.iconClass} aria-hidden="true"></i>
										{item.title}
									</Link>
								</Dropdown.Item>
							))}
						{user && (
							<Dropdown.Item>
								<Link to="#" onClick={handleClick}>
									<i className="fa fa-sign-out" aria-hidden="true"></i>
									Log out
								</Link>
							</Dropdown.Item>
						)}
					</Dropdown.Menu>
				</Dropdown>
			</div>
		</>
	);
};

export default Navbar;
