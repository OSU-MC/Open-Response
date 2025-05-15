import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TailSpin } from  'react-loader-spinner'
import useLectures from '../hooks/useLectures';
import Notice from '../components/Notice'
import { Button, Card } from "react-bootstrap"
import useSectionId from "../hooks/useSectionId";
import useCourse from "../hooks/useCourse";
import LectureCard from '../components/LectureCard';
import Tabs from "../components/nav/Tabs.jsx";
import Breadcrumbs from "../components/nav/Breadcrumbs.jsx";
import { useSelector} from 'react-redux'
import { getUserState } from '../redux/selectors'
import Popup from '../components/Popup';
import AddLecture from '../components/AddLecture';


// URL: courses/:courseId/lectures


function Lectures(props){
    //get the lectures for the current course & section
    const { courseId } = useParams()
    const [lectures, message, error, loading] = useLectures()
    const [ course, role, Cmessage, Cerror, Cloading ] = useCourse()
    const sectionId = useSectionId();
    const breadcrumbs_object = [['Courses', '/'], [course.name, null]];
    const user = useSelector(getUserState);
    

    // Ensure course is defined before accessing its properties
    const tabs_o = (role === "teacher") ? [
        ["Sections", "sections"],
        ["Lecture Templates", "lectures"],  
        ["Settings", null]
    ] 
    :
    [
        ["Lectures", "lectures"], 
        ["Gradebook", `sections/${sectionId}/grades`], 
        ["Settings", null]
    ];

    const [showCreateModal, setShowCreateModal] = useState(false);


    
    const closeCreateModal = () => {
        setShowCreateModal(false);
    };

    const openCreateModal = () => {
        setShowCreateModal(true);
    };

    return (
        <div className='lectures'>
            <div className='lectures-top-bar'>
            <div>
                <Breadcrumbs breadcrumbs={breadcrumbs_object} />            
            </div>
            <p id="lectures-subtitle">{course.name} Lectures</p>
            <Tabs courseId={courseId} tabs={tabs_o} />
                


             {/*Add Lecture Button - ONLY if enrollment == teacher*/}
            {/* {role == "teacher" && 
                <Link to={`/${courseId}/createlecture`}>
                    <Button className="create-lecture-btn"> + Create Lecture</Button>
                </Link>} */}
            </div>

            {showCreateModal && (
                <Popup close={closeCreateModal}>
                    <AddLecture closeFunction={closeCreateModal} />
                </Popup>
            )}

            {/*No Lectures*/}
            { message ? <Notice error={error ? "error" : ""} message={message}/> : (!lectures) ? <Notice message={"You Do Not Have Any Lectures Yet"}/> : <></>}

            <div className="lectures-container">
                {lectures[courseId] && lectures[courseId].map((lecture) => {
                    return <LectureCard key={lecture.id} lecture={lecture} view={role} course={courseId} />;
                })}
            </div>
            <Button 
                className="create-lecture-btn"
                onClick={openCreateModal}
            >
                + Create Lecture
            </Button>
        </div>
    )
}

export default Lectures;
