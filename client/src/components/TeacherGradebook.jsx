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