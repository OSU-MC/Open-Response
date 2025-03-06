import { useParams } from 'react-router-dom';
import useSections from '../hooks/useSections';
import AddSection from '../components/AddSection';
import Popup from '../components/Popup';
import Notice from '../components/Notice';
import { TailSpin } from 'react-loader-spinner';
import SectionCard from '../components/SectionCard';
import { Button } from "react-bootstrap";
import React, { useEffect, useState } from 'react';
import useCourses from '../hooks/useCourses.js';
import Tabs from "../components/nav/Tabs.jsx";
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";

import { useSelector, useDispatch } from 'react-redux'
import { getUserState } from '../redux/selectors'
import "../styles/Sections.css";

function Sections() {
    const { courseId } = useParams();
    const [sections, message, error, loading] = useSections();
    const [courseName, setCourseName] = useState('');
    const user = useSelector(getUserState)
    const breadcrumbs_object = [['Courses', '/'], [courseName, null]];
    const tabs_o = [
        ["Sections", "sections"],
        ["Lecture Templates", "lectures"], 
        ["Roster", "roster"], 
        ["Settings", "settings"]
    ];


    // Using the useCourses hook to get course data
    const [courses, coursesMessage, coursesError, coursesLoading] = useCourses();

    useEffect(() => {
        if (courses.teacherCourses && courses.studentCourses) {
            // Find the course name by matching the courseId with the courses data
            const course = courses.teacherCourses.find(course => course.id === parseInt(courseId)) ||
                           courses.studentCourses.find(course => course.id === parseInt(courseId));
    
            if (course) {
                setCourseName(course.name);  // Set the course name
            }
        }
    }, [courses, courseId]);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const closeCreateModal = () => {
        setShowCreateModal(false);
    };

    const openCreateModal = () => {
        setShowCreateModal(true);
    };

    return (
        <div className="sections-page">
            <div className="sections-header">
            <div>
                {/* Display the Breadcrumbs component */}
                <Breadcrumbs breadcrumbs={breadcrumbs_object} />
            </div>
                <h1 className="course-title">{courseName}</h1>

                    
                <Tabs courseId={courseId} tabs={tabs_o} />
                
     </div>

            {showCreateModal && (
                <Popup close={closeCreateModal}>
                    <AddSection closeFunction={closeCreateModal} />
                </Popup>
            )}

            <div className="sections-container">
                {coursesLoading ? (
                    <TailSpin visible={true} />
                ) : sections[courseId] != null ? (
                    sections[courseId].map((section) => (
                        <SectionCard key={section.id} section={section} />
                    ))
                ) : (
                    <Notice message={"You have not created any sections for this course yet"} />
                )}
            </div>

            <Button 
                className="create-section-btn"
                onClick={openCreateModal}
            >
                + Create Section
            </Button>
        </div>
    );
}

export default Sections;
