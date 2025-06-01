// TeacherGradebook.jsx
//
// React component for displaying a gradebook table for teachers, showing all students and their grades for each lecture/assignment.
//
// Props:
//   - grades: An object containing:
//       - lectures: Array of student grade objects, each with student info and an array of lecture grades.
//       - courseGrades: (optional) Array of course grade objects, each with studentId and courseGrade.
//
// Behavior:
//   - Renders a table with students as rows and lectures as columns, plus a column for the overall course grade.
//   - Each cell shows the grade (points received out of total points) for a lecture.
//   - The course grade column shows the normalized course grade percentage if available.
//   - If no grades are available, the table will be empty.
//
// Example usage:
//   <TeacherGradebook grades={grades} />

import React from 'react';
import { Table } from "react-bootstrap";

function TeacherGradebook({ grades }) {
    // Use grades.lectures as the array of student grade objects
    const students = grades.lectures || [];
    // Try to get courseGrades by studentId for fast lookup if provided
    const courseGradesMap = (grades.courseGrades || []).reduce((acc, cg) => {
        acc[cg.studentId] = cg.courseGrade;
        return acc;
    }, {});
    return (
        <div className="grades-container" style={{ overflowX: 'auto', width: '100%' }}>
            <Table striped bordered hover className="grades-table" style={{ minWidth: 600 }}>
                <thead>
                    <tr>
                        <th className="grades-student-column sticky-col" style={{ left: 0, position: 'sticky', background: '#fff', zIndex: 2 }}>Student</th>
                        {students[0]?.lectures.map((lecture) => (
                            <th key={lecture.lectureId} className="grades-lecture-column">{lecture.lectureTitle}</th>
                        ))}
                        <th className="grades-course-column">Course Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((grade) => (
                        <tr key={grade.studentId}>
                            <td className="grades-student sticky-col" style={{ left: 0, position: 'sticky', background: '#fff', zIndex: 1 }}>{grade.studentName}</td>
                            {grade.lectures.map((lecture) => (
                                <td key={lecture.lectureId} className="grades-grade">{lecture.lectureGrade} / {lecture.totalPoints}</td>
                            ))}
                            <td className="grades-course-grade">
                                {courseGradesMap[grade.studentId] !== undefined
                                    ? `${courseGradesMap[grade.studentId]}%`
                                    : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default TeacherGradebook;