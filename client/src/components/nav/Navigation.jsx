import TopNavbar from './TopNavbar'
import SideNavbar from './SideNavbar'
import { Outlet, useLocation } from 'react-router-dom';
import useCourse from '../../hooks/useCourse'

function Navigation(props) {
    const location = useLocation()
    const courseRegex = /\/\d+/ //regular expression: / followed by 1 or more digits
    const inCourse = courseRegex.test(location.pathname) && !["sections", "lectures", "createlecture", "grades"].some(path => location.pathname.includes(path));
    const disableTopNavbar = !(location.pathname.match("login") || location.pathname.match("create")) //between this and inCourse, surely theres a better way.

    return <>
        {disableTopNavbar && <TopNavbar loggedIn={props.loggedIn}/>}
        <div className="mainBody">
            { inCourse && <SideNavbar/> }
            <Outlet/>
        </div>
    </> 
}

export default Navigation