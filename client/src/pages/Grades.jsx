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


    useEffect(() => {
        console.log('Grades:', grades);
    }, [grades]);

    const breadcrumbs_object = [['Courses', '/'], [courseName, `/${courseId}/sections`], [courseId, null]];
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
                    <h1 className="course-title">{`${courseName} Grades`}</h1>
                    <Tabs courseId={courseId} tabs={tabs_o} />
                    <div className="grades-actions">
                        <button className="btn btn-primary">Export</button>
                        <button className="btn btn-primary">Import</button>
                        
                        {/* <button className="btn btn-primary" onClick={exportGrades} disabled={exporting}>
                            {exporting ? 'Exporting...' : 'Export'}
                        </button>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleImport}
                            style={{ display: 'none' }}
                            id="import-grades"
                        />
                        <label htmlFor="import-grades" className="btn btn-secondary">
                            {importing ? 'Importing...' : 'Import'}
                        </label> */}
                    </div>
                </div>

                {message ? (
                    <Notice error={error ? "error" : ""} message={message} />
                ) : Array.isArray(grades) && grades.length === 0 ? (
                    <Notice message="No grades available" />
                ) : null}

                <div className="grades-container">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                {isInstructor && <th>Student</th>}
                                {isInstructor ? (
                                    grades[0]?.lectures.map((lecture) => (
                                        <th key={lecture.lectureId}>{lecture.lectureTitle}</th>
                                    ))
                                ) : (
                                    <>
                                        <th>Lecture</th>
                                        <th>Grade</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(grades) && grades.map((grade) => (
                                <tr key={grade.studentId}>
                                    {isInstructor && <td>{grade.studentName}</td>}
                                    {isInstructor ? (
                                        grade.lectures.map((lecture) => (
                                            <td key={lecture.lectureId}>{lecture.lectureGrade}</td>
                                        ))
                                    ) : (
                                        grade.lectures.map((lecture) => (
                                            <React.Fragment key={lecture.lectureId}>
                                                <td>{lecture.lectureTitle}</td>
                                                <td>{lecture.lectureGrade}</td>
                                            </React.Fragment>
                                        ))
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    );
}

export default Grades;
