import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { TailSpin } from  'react-loader-spinner'
import useLectures from '../hooks/useLectures';
import Notice from '../components/Notice'
import { Button, Card } from "react-bootstrap"
import useCourse from "../hooks/useCourse";
import LectureCard from '../components/LectureCard';

function Lectures(props){
    //get the lectures for the current course & section
    const { courseId } = useParams()
    const [lectures, message, error, loading] = useLectures()
    const [ course, role, Cmessage, Cerror, Cloading ] = useCourse()
    
    

    const liveLecture = lectures[courseId]?.[0]
    const lectureId = liveLecture?.id;
    return (
        <div className='lectures'>
            <div className='lectures-top-bar'>
            <Link className='back-btn-lectures' to={`/`}>
                <Button className='back-btn'> 
                    <div id="back-btn-image"/>
                </Button>
            </Link>

            <p id="lectures-subtitle">{course.name} Lectures</p>

            {/*Add Lecture Button - ONLY if enrollment == teacher*/}
            {role == "teacher" && 
                <Link className="create-lecture-btn" to={`/${courseId}/createlecture`}>
                    <Button variant="primary" className="btn-add">Create Lecture</Button>
                </Link>}
            <hr></hr>
            {/* && lectures[courseId]  */}
            {/*Join Live Lecture Button - ONLY if enrollment != teacher and a live lecture exists*/}
            {role !== "teacher" && lectureId &&
                <Link className="join-live-btn" to={`/${courseId}/live/${lectureId}`}>
                    <Button variant="success" className="btn-add">Join Live Lecture</Button>
                </Link>
            }
            </div>
            <hr></hr>



            {/*No Lectures*/}
            { message ? <Notice error={error ? "error" : ""} message={message}/> : (!lectures) ? <Notice message={"You Do Not Have Any Lectures Yet"}/> : <></>}

            <div className="lectures-container">
                {lectures[courseId] && lectures[courseId].map((lecture) => {
                    return <LectureCard key={lecture.id} lecture={lecture} view={role} />;
                })}
            </div>
        </div>
    )
}

export default Lectures;
