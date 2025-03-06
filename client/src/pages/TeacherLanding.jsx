import React from 'react';
import CourseCard from '../components/CourseCard.jsx'
import { Button, Card } from "react-bootstrap"
import useCourses from '../hooks/useCourses.js'
import Notice from '../components/Notice.jsx'
import { Link } from 'react-router-dom'
import AddCourse from './AddCourse.jsx'
import PageButton from '../components/2024/PageButton.jsx'


function TeacherLanding(props) {
    const [courses, message, error, loading] = useCourses()

    return (
        <div className="user-courses">
            {/*No Courses*/}
            {message ? <Notice error={error ? "error" : ""} message={message} /> : (!courses.studentCourses && !courses.instructorCourses) ? <Notice message={"You do not have any courses yet"} /> : <></>}

            {/*Teacher Courses*/}
            {courses.teacherCourses &&
                <div id="courses-page">
                    {/*Top line of  page*/}
                    <div className='landing-header'>
                        <p id="landing-subtitle">Courses</p>
                        
                        <PageButton newPage={< AddCourse/>} className='create-course'>
                        + Create Course </PageButton>
                    </div>
                    
                    {/*Sorting buttons*/}
                    <div className='course-sort'>
                        <span className ='selected'>ALL</span>
                        <span>PUBLISHED</span>
                        <span>ARCHIVED</span>
                        <span>DRAFT</span>
                    </div>
                    
                    {/*Places all courses in course cards*/}
                    <div className='courses'>
                        {courses.teacherCourses.map((teacherCourse) => {
                            return (
                                <Link 
                                    key={teacherCourse.id} 
                                    to={`/${teacherCourse.id}/sections/`}>
                                    <CourseCard course={teacherCourse} role={"teacher"} />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            }
        </div>
    )
}

export default TeacherLanding;
