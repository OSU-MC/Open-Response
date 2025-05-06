import { Link, useParams } from 'react-router-dom';
import useEnrollments from '../hooks/useEnrollments';
import Notice from '../components/Notice'
import { TailSpin } from  'react-loader-spinner'
import StudentListItem from '../components/StudentListItem';
import { useState, useEffect } from 'react'

function Enrollments(props) {
    const { courseId, sectionId } = useParams()
    const [ enrollments, message, error, loading ] = useEnrollments()
    const [ sectionStudents, setSectionStudents ] = useState([])

    // used to determine if a student is enrolled in the section
    const studentInSection = (enrollment) => {
        return enrollment.sectionId == sectionId
    }

    return(
        <>
        { message ? <Notice error={error ? "error" : ""} message={message}/> : (!enrollments) ? <Notice message={"No students are enrolled in this course"}/> : <></>}
        <ul className="allstudents">
            { (loading && enrollments[courseId]) ? <TailSpin visible={true}/> : enrollments[courseId] && enrollments[courseId].filter(studentInSection).length > 0 ? enrollments[courseId].filter(studentInSection).map((enrollment) => {
                return <StudentListItem key={enrollment.id} student={enrollment}/>
            }) : <Notice message={"No students have joined this section"}/>}
        </ul>
        </>
    )
}

export default Enrollments;