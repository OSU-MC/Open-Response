import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGrades from '../hooks/useGrades';
import Notice from '../components/Notice';
import { Table } from "react-bootstrap";
import useCourse from "../hooks/useCourse";
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";
import Tabs from "../components/nav/Tabs.jsx";
import { TailSpin } from 'react-loader-spinner';
import "../styles/Grades.css";

// URL for this page: /:courseId/sections/:sectionId/grades

function Grades(props) {
    const { courseId, sectionId } = useParams();
    const [grades, message, error, loading] = useGrades(courseId, sectionId);
    const [course, role, Cmessage, Cerror, Cloading] = useCourse();
    const courseName = course?.name || (Cloading ? "Loading..." : "Unknown Course");

    useEffect(() => {
        console.log('Grades:', grades); // Log grades data
        console.log('Message:', message); // Log message
        console.log('Error:', error); // Log error
        console.log('Loading:', loading); // Log loading state
    }, [grades, message, error, loading]);

    const breadcrumbs_object = [['Courses', '/'], [courseName, `/${courseId}/sections`], [courseId, null]];
    const tabs_o = [
        ["Lectures", "lectures"], 
        ["Gradebook", `sections/${sectionId}/grades`], 
        ["Settings", "settings"]
    ];

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
                                <th>Student</th>
                                <th>Lecture</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(grades) && grades.map((grade) => (
                                <tr key={grade.id}>
                                    <td>{grade.studentName}</td>
                                    <td>{grade.lectureTitle}</td>
                                    <td>{grade.grade}</td>
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
