import React from 'react';
import TeacherLanding from './TeacherLanding';
import StudentLanding from './StudentLanding';
import apiUtil from '../utils/apiUtil'
import { useSelector, useDispatch } from 'react-redux'
import { getUserState } from '../redux/selectors'
import '../styles/landing.css'

function Landing(props) {
    //const { user } = useAuth(); // Assuming you have access to the user's role through an authentication context
    //const user = await apiUtil('post', 'users/login', { dispatch: dispatch, navigate: navigate }, user)
    const user = useSelector(getUserState)
    return (
        <div className="landing-page">
            {user && user.user.isTeacher ? <TeacherLanding /> : <StudentLanding />}
        </div>
    );
}

export default Landing;
