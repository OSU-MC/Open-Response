import { React, useState } from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import apiUtil from "../../utils/apiUtil";
import { useNavigate } from "react-router";
import "../../styles/topNav.css";

function TopNavbar(props) {
	return (
		<nav>
			<a className='page' id='classroomLink' href='/home'>
				<img id='classroomIcon' src='/classroomIcon.png'></img>
				<span>Open Response</span>
			</a>
			{props.loggedIn ? <LoggedIn loggedIn={props.loggedIn} /> : <LoggedOut />}
		</nav>
	);
}

function LoggedOut() {
	return (
		<>
			<a href='/create' className='page right'>
				Get Started
			</a>
			<a href='/login' className='page right'>
				Log In
			</a>
		</>
	);
}

function LoggedIn(props) {
	const { pathname } = useLocation();
	const handleLogout = async (event) => {
		event.preventDefault(); // Prevent default anchor behavior
		try {
			const response = await apiUtil("get", `/users/logout`);
			if (response.status === 200) window.location.reload();
		} catch (error) {
			console.error("Error occurred during logout:", error);
		}
	};

	const navItems = [
		{ path: "/", label: "Courses" },
		{
			path: "/login",
			label: "Logout",
			className: "right",
			onClick: handleLogout,
		},
		{ path: "/profile", label: "Profile", className: "right " },
	];

	return (
		<>
			{navItems.map((item, index) => (
				<a
					key={index}
					href={item.path}
					className={`page ${item.className} ${
						pathname === item.path ? "curr" : ""
					}`}
					onClick={item.onClick}
				>
					{item.label}
				</a>
			))}
		</>
	);
}

export default TopNavbar;
