import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { TailSpin } from  'react-loader-spinner'
import useLectures from '../hooks/useLectures';
import Notice from '../components/Notice'
import { Button, Card } from "react-bootstrap"
import useCourse from "../hooks/useCourse";
import LectureCard from '../components/LectureCard';
import Tabs from "../components/nav/Tabs.jsx";
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";
import { useSelector} from 'react-redux'
import { getUserState } from '../redux/selectors'


function Lectures(props){
    //get the lectures for the current course & section
    const { courseId } = useParams()
    const [lectures, message, error, loading] = useLectures()
    const [ course, role, Cmessage, Cerror, Cloading ] = useCourse()
    const breadcrumbs_object = [['Courses', '/'], [course.name, null]];
    const user = useSelector(getUserState);
    const tabs_o = [
        ["Lectures", "lectures"], 
        ["Gradebook", "grades"], 
        ["Settings", "settings"]
    ];

    return (
        <div className='lectures'>
            <div className='lectures-top-bar'>
            <div>
                <Breadcrumbs breadcrumbs={breadcrumbs_object} />            
            </div>
            <p id="lectures-subtitle">{course.name} Lectures</p>
            <Tabs courseId={courseId} tabs={tabs_o} />
                


            {/*Add Lecture Button - ONLY if enrollment == teacher*/}
            {role == "teacher" && 
                <Link to={`/${courseId}/createlecture`}>
                    <Button className="create-lecture-btn"> + Create Lecture</Button>
                </Link>}
            </div>

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
