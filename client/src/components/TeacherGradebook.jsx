import React from 'react';
import { Table } from "react-bootstrap";

function TeacherGradebook({ grades }) {
    return (
        console.log(grades),
        <div className="grades-container">
            <Table striped bordered hover className="grades-table">
                <thead>
                    <tr>
                        <th className="grades-student-column">Student</th>
                        {grades[0]?.lectures.map((lecture) => (
                            <th key={lecture.lectureId} className="grades-lecture-column">{lecture.lectureTitle}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(grades) && grades.map((grade) => (
                        <tr key={grade.studentId}>
                            <td className="grades-student">{grade.studentName}</td>
                            {grade.lectures.map((lecture) => (
                                <td key={lecture.lectureId} className="grades-grade">{lecture.lectureGrade} / {lecture.totalScore}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default TeacherGradebook;