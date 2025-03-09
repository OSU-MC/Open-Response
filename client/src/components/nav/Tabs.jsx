/**
 * Tabs Component
 *
 * This component renders a navigation bar with links based on the provided `tabs` array.
 * It highlights the currently active tab by checking the current URL.
 *
 * Props:
 * - `courseId` (string): The unique identifier for the course, used in link paths.
 * - `tabs` (Array): A list of tab entries, where each entry is a tuple `[displayName, pageToLinkTo]`.
 *   - `displayName` (string): The text displayed for the tab.
 *   - `pageToLinkTo` (string): The path segment to append to `/${courseId}/`, determining the tab's destination.
 *
 * Usage Example:
 * ```
 * <Tabs 
 *   courseId="cs101"
 *   tabs={[
 *     ["Sections", "sections"],
 *     ["Lecture Templates", "lectures"],
 *     ["Roster", "roster"],
 *     ["Settings", "settings"]
 *   ]}
 * />
 * ```
 *
 * The component does not apply role-based filtering; ensure tabs are pre-filtered before passing them in.
 */


import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/Tabs.css";

const Tabs = ({ courseId, tabs }) => {


    const location = useLocation(); // Get current URL path

    // Determine the active tab dynamically
    const getActiveTab = () => {
        return tabs.find(([_, path]) => location.pathname.includes(path))?.[1] || "";
    };

    return (
        <>
            <div className="tabs">
                {tabs.map(([displayName, pageToLinkTo]) => (
                    <Link key={pageToLinkTo} to={`/${courseId}/${pageToLinkTo}`}>
                        <span className={getActiveTab() === pageToLinkTo ? "active-tab" : "no-link-style"}>
                            {displayName}
                        </span>
                    </Link>
                ))}
            </div>
            <hr />
        </>
    );
};

export default Tabs;