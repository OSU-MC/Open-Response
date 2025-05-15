import React from 'react';
import { Table } from "react-bootstrap";

function StudentGradebook({ grades }) {
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
                    {grades.map((lecture) => (
                        <tr key={lecture.lectureId}>
                            <td className="grades-assignment">{lecture.lectureTitle}</td>
                            <td className="grades-questions">{lecture.totalAnswered} / {lecture.totalQuestions}</td>
                            <td className="grades-grade">{lecture.lectureGrade} / {lecture.totalScore}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default StudentGradebook;