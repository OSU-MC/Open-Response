import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/Tabs.css";

const Tabs = ({ user, courseId }) => {
    const location = useLocation(); // Get current URL path

    // Determine the active tab dynamically
    const getActiveTab = () => {
        if (location.pathname.includes("sections")) return "sections";
        if (location.pathname.includes("lectures")) return "lectures";
        if (location.pathname.includes("settings")) return "settings";
        return "";
    };

    return (
        <>
            <div className="tabs">
                <Link to={`/${courseId}/sections`}>
                    <span className={getActiveTab() === "sections" ? "active-tab" : "no-link-style"}>Sections</span>
                </Link>

                {/* Show "Lecture Templates" only if user is an instructor */}
                {user?.user?.isTeacher && (
                    <Link to={`/${courseId}/lectures`}>
                        <span className={getActiveTab() === "lectures" ? "active-tab" : "no-link-style"}>Lecture Templates</span>
                    </Link>
                )}

                {/* Show "Roster" only if user is an instructor */}
                {/* planned changed to only show when you are in a section arleady*/}
                {user?.user?.isTeacher && (
                    <Link to={`/${courseId}/roster`}>
                        <span className={getActiveTab() === "roster" ? "active-tab" : "no-link-style"}>Roster</span>
                    </Link>
                )}

                <Link to={`/${courseId}/settings`}>
                    <span className={getActiveTab() === "settings" ? "active-tab" : "no-link-style"}>Settings</span>
                </Link>
            </div>
            <hr />
        </>
    );
};

export default Tabs;
