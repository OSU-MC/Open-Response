import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
import apiUtil from '../utils/apiUtil'
import { useDispatch } from 'react-redux'






// URL: courses/:courseId/lectures


function Lectures(props){

    //get the lectures for the current course & section
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const { courseId } = useParams()
    const [lectures, message, error, loading] = useLectures()
    const [ course, role, Cmessage, Cerror, Cloading ] = useCourse()
    const sectionId = useSectionId();
    const breadcrumbs_object = [['Courses', '/'], [course.name, null]];
    const user = useSelector(getUserState);
    const [liveLecture, setLiveLecture] = useState(null);
    const [ apierror, setError ] = useState(false)
    const [ apimessage, setMessage ] = useState("")
    const [ apiloading, setLoading ] = useState(false)

    

    useEffect(() => {
        const fetchLectures = async () => {
            try {
                setLoading(true)
                
                const response = await apiUtil("get", `/courses/${courseId}/sections/${user.user.id}/lectures/live`, { dispatch: dispatch, navigate: navigate });
                
                setLoading(false)
                setError(response.error)
                setMessage(response.message)
                if (response.status === 200) {
                    setLiveLecture(response.data.filteredLecture);
                
            }
            } catch (err) {
                console.error(err);
            }
        };
        if (!user.user.isTeacher) {
            fetchLectures();
        }
    }, [courseId]);



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
            {<Tabs courseId={courseId} tabs={tabs_o} />}
            
            {/*Join Live Lecture Button - ONLY if enrollment != teacher and a live lecture exists*/}
            {role !== "teacher" && liveLecture && 
                <Link className="join-live-btn" to={`/${courseId}/live/${liveLecture.id}`}>
                    <Button variant="success" className="btn-add">{liveLecture.name} is Live</Button>
                </Link>
            }
            </div>
            <hr></hr>
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
            {role !== "student" && (
                <Button 
                    className="create-lecture-btn"
                    onClick={openCreateModal}
                >
                    + Create Lecture
                </Button>
            )}
        </div>
    )
}

export default Lectures;
