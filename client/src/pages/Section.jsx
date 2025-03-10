import React from 'react';
import { useParams } from 'react-router-dom';
import { TailSpin } from 'react-loader-spinner';
import useLecturesInSection from '../hooks/useLecturesInSection';
import useCourse from '../hooks/useCourse'; // Use the new hook
import Notice from '../components/Notice';
import LectureCard from '../components/LectureCard';
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";
import Tabs from "../components/nav/Tabs.jsx";
// import "../styles/Section.css";

// URL for this page: /:courseId/sections/:sectionId

function Section() { 
    const { sectionId, courseId } = useParams();
    const [lecturesInSection, message, error, loading] = useLecturesInSection();
    const [course, role, courseMessage, courseError, courseLoading] = useCourse(); 

    const courseName = course?.name || (courseLoading ? "Loading..." : "Unknown Course");

    const breadcrumbs_object = [['Courses', '/'], [courseName, `/${courseId}/sections`], [courseId, null]];
    const tabs_o = [
        ["Lectures", "lectures"], 
        ["Gradebook", `sections/${sectionId}/grades`], // Updated link to the new Grades page URL
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

                <div className='lectures-top-bar'>
                    <p id="lectures-subtitle">Lectures for Section {sectionId}</p>
                </div>

                {message ? (
                    <Notice error={error ? "error" : ""} message={message} />
                ) : lecturesInSection.length === 0 ? (
                    <Notice message="You Do Not Have Any Lectures Yet" />
                ) : null}

                <div className="horizontal-flex-container">
                    {lecturesInSection.map((lecture) => (
                        <LectureCard key={lecture.id} lecture={lecture} view={role} section={sectionId} />
                    ))}
                </div>
            </div>
        )
    );
}

export default Section;
