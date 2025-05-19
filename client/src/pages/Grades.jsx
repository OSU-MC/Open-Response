import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGrades from '../hooks/useGrades';
// import useExportGrades from '../hooks/useExportGrades';
// import useImportGrades from '../hooks/useImportGrades';
import Notice from '../components/Notice';
import { Table } from "react-bootstrap";
import useCourse from "../hooks/useCourse";
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";
import Tabs from "../components/nav/Tabs.jsx";
import { TailSpin } from 'react-loader-spinner';
import "../styles/Grades.css";
import TeacherGradebook from '../components/TeacherGradebook';
import StudentGradebook from '../components/StudentGradebook';


// URL for this page: /:courseId/sections/:sectionId/grades

/*
TODO: make it so that instruct sees all lecures regardless of published or not
TODO: make it so that studet sees only the published lectures
*/

function Grades(props) {
    const { courseId, sectionId } = useParams();
    const [grades, message, error, loading] = useGrades(courseId, sectionId);
    const [course, role, Cmessage, Cerror, Cloading] = useCourse();
    // const [exportGrades, exporting, exportError] = useExportGrades(courseId, sectionId);
    // const [importGrades, importing, importError] = useImportGrades(courseId, sectionId);
    const courseName = course?.name || (Cloading ? "Loading..." : "Unknown Course");

    // const handleImport = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         importGrades(file);
    //     }
    // };


    const breadcrumbs_object = [['Courses', '/'], [courseName, `/${courseId}/sections`], [`Section ${sectionId}`, null]];
    const tabs_o = [
        ["Lectures", `sections/${sectionId}`], 
        ["Gradebook", `sections/${sectionId}/grades`], 
        ["Settings", "settings"]
    ];

    const isInstructor = role === 'teacher';

    return (
        loading || Cloading ? (
            <TailSpin visible={true} />
        ) : (
            <div className="grades-page">
                <div className="grades-header">
                    <div>
                        <Breadcrumbs breadcrumbs={breadcrumbs_object} />
                    </div>
                    <h1 className="course-title">{`${courseName} Section ${sectionId} Grades`}</h1>
                    <Tabs courseId={courseId} tabs={tabs_o} />
                    {isInstructor && (
                        <div className="grades-actions">
                            <button className="btn btn-primary">Export</button>
                            <button className="btn btn-primary">Import</button>
                        </div>
                    )}
                </div>

                {/* Course Grade for students */}
                {!isInstructor && grades && grades.courseGrades && (
                    <div className="course-grade-summary">
                        <h2>Course Grade</h2>
                        <div className="course-grade-value">
                            {grades.courseGrades.courseGrade !== undefined
                                ? `${grades.courseGrades.courseGrade} / 100`
                                : 'N/A'}
                        </div>
                    </div>
                )}

                {message ? (
                    <Notice error={error ? "error" : ""} message={message} />
                ) : Array.isArray(grades) && grades.length === 0 ? (
                    <Notice message="No grades available" />
                ) : null}

                {isInstructor ? (
                    <TeacherGradebook grades={grades} />
                ) : (
                    <StudentGradebook grades={grades} />
                )}
            </div>
        )
    );
}

export default Grades;
