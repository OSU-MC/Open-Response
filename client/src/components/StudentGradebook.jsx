import React from 'react';
import { Table } from "react-bootstrap";

function StudentGradebook({ grades }) {
    const lectureGrades = Array.isArray(grades) ? grades : (Array.isArray(grades?.lectures) ? grades.lectures : []);
    if (lectureGrades.length === 0) {
        return <div>No grades available.</div>;
    }
    return (
        <div className="grades-container">
            <Table striped bordered hover className="grades-table">
                <thead>
                    <tr>
                        <th className="grades-assignment-column">Assignment</th>
                        <th className="grades-questions-column">Questions Answered</th>
                        <th className="grades-grade-column">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {lectureGrades.map((lecture) => (
                        <tr key={lecture.lectureId}>
                            <td className="grades-assignment">{lecture.lectureTitle}</td>
                            <td className="grades-questions">{lecture.totalAnswered} / {lecture.totalQuestions}</td>
                            <td className="grades-grade">{lecture.lectureGrade} / {lecture.totalPoints}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default StudentGradebook;