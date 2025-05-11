import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TailSpin } from 'react-loader-spinner';
import useLecturesInSection from '../hooks/useLecturesInSection';
import useCourse from '../hooks/useCourse'; // Use the new hook
import Notice from '../components/Notice';
import LectureCard from '../components/LectureCard';
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";
import Tabs from "../components/nav/Tabs.jsx";
import AddLectureToSection from '../components/AddLectureToSection';
import "../styles/Section.css";


/*
TODO: make it so that on the delete or add of a lecture, the page refreshes
*/

function Section() { 
    const { sectionId, courseId } = useParams();
    const [lecturesInSection, message, error, loading] = useLecturesInSection();
    const [course, role, courseMessage, courseError, courseLoading] = useCourse(); 
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const courseName = course?.name || (courseLoading ? "Loading..." : "Unknown Course");

    const breadcrumbs_object = [['Courses', '/'], [courseName, `/${courseId}/sections`], [`Section ${sectionId}`, null]];
    const tabs_o = [
        ["Lectures", `sections/${sectionId}`], 
        ["Gradebook", `sections/${sectionId}/grades`],
        ["Settings", "settings"]
    ];
    
    return (
        loading || courseLoading ? (
            <TailSpin visible={true} />
        ) : (
            <div className="section-page">
                <div className="section-header">
                    <div>
                        <Breadcrumbs breadcrumbs={breadcrumbs_object} />
                    </div>
                    <h1 className="course-title">{`${courseName} - ${sectionId}`}</h1>
                    <Tabs courseId={courseId} tabs={tabs_o} />
                </div>

                <div className="add-lecture-action">
                    <button className="btn btn-primary add-lecture-button" onClick={handleOpenModal}>
                        Add Lecture to Section
                    </button>
                </div>

                <AddLectureToSection show={showModal} handleClose={handleCloseModal} courseId={courseId} sectionId={sectionId} />

                {message ? (
                    <Notice error={error ? "error" : ""} message={message} />
                ) : lecturesInSection.length === 0 ? (
                    <Notice message="You Do Not Have Any Lectures Yet" />
                ) : null}

                <div className="horizontal-flex-container">
                    {lecturesInSection.map((lecture) => (
                        <LectureCard key={lecture.id} lecture={lecture} view={role} section={sectionId} course={courseId} />
                    ))}
                </div>
            </div>
        )
    );
}

export default Section;
