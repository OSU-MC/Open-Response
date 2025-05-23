import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from 'react-bootstrap';
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { borderRadius, fontFamily, fontStyle, minHeight } from '@mui/system'
import "../styles/home.css"
import { useParams } from 'react-router-dom';
import useCourse from "../hooks/useCourse";
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";
import Tabs from "../components/nav/Tabs.jsx";
import { useEffect, useState } from 'react'

function PastLectureId() {
    const { courseId, sectionId } = useParams();
    const [course, role, Cmessage, Cerror, Cloading] = useCourse();
    const [ lecture, setLecture ] = useState({})
    const courseName = course?.name || (Cloading ? "Loading..." : "Unknown Course");

    const isInstructor = role === 'teacher';

    const breadcrumbs_object = [['Courses', '/'], [courseName, `/${courseId}/sections`], [`Section ${sectionId}`, null]];
    const tabs_o = [
        ["Lectures", `sections/${sectionId}`], 
        ["Gradebook", `sections/${sectionId}/grades`], 
        ["Settings", "settings"]
    ];
    return(
        <div className='past-lecture-page'>
            <div className='past-lecture-header'>
                <div>
                        <Breadcrumbs breadcrumbs={breadcrumbs_object} />
                    </div>
                    <h1 className="course-title">{`${courseName} Section ${sectionId} Grades`}</h1>
                    <Tabs courseId={courseId} tabs={tabs_o} />
            </div>
            <div className="section">
                <p className="lecture-subtitle"> "Lecture Title Here" Responses</p>
                {isInstructor ? (
                    <p> Teacher Grades Here </p>
                    //Implement <TeacherPastLecture PastLecture={PastLecture} />
                ) : (
                    <p> Student Grades Here </p>
                    //Implement <StudentPastLecture PastLecture={PastLecture} />
                )}
            </div>
        </div>
    )
}

export default PastLectureId