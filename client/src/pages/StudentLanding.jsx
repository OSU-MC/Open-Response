import React, { useState } from 'react';
import CourseCard from '../components/CourseCard'
import useCourses from '../hooks/useCourses'
import Notice from '../components/Notice'
import JoinCourse from '../components/JoinCourse'
import PageButton from '../components/2024/PageButton.jsx'

function StudentLanding(props) {

    const [courses, message, error, loading] = useCourses()

    // Add state to track the selected filter (sorting category)
    const [selectedFilter, setSelectedFilter] = useState("ALL");

    const studentCourses = courses.studentCourses || [];

    // Define group for each category
    const archivedCourses = studentCourses.filter(course => course.softDelete);

    // cards for student and teacher courses
    return (
        <div className="user-courses">
            {/*No Courses*/}
            {message ? <Notice error={error ? "error" : ""} message={message} /> : (!courses.studentCourses && !courses.instructorCourses) ? <Notice message={"You do not have any courses yet"} /> : <></>}

            {/*Student Courses*/}
            {courses.studentCourses &&
                <div id="courses-page">
                    {/*Top line of  page*/}
                    <div className="landing-header">
                        <p id="landing-subtitle">Courses</p>
                        {/* <JoinCourse /> */}
                        <PageButton newPage={<JoinCourse />} className="join-course">
                        + Join Course
                        </PageButton>
                    </div>
                
                    {/*Sorting buttons*/}
                    <div className='course-sort'>
                        <span 
                            className ={selectedFilter === "ALL" ? 'selected' : ''}
                            onClick={() => setSelectedFilter("ALL")}
                        >
                            ALL
                        </span>
                        <span
                            className={selectedFilter === "ARCHIVED" ? 'selected' : ''}
                            onClick={() => setSelectedFilter("ARCHIVED")}
                        >
                            ARCHIVED
                        </span>
                    </div>

                    {/* Render sections based on selected filter */}
                    {selectedFilter === "ALL" ? (
                        <div className="course-section">
                        <h2>All Courses</h2>
                        <div className='courses'>
                        {courses.studentCourses.map((studentCourse) => {
                            return <CourseCard key={studentCourse.id} course={studentCourse} role={"student"} />
                        })}
                        </div>
                        </div>
                    ) : selectedFilter === "ARCHIVED" ? (
                        <div className="course-section">
                        <h2>Archived Courses</h2>
                        <div className="courses">
                            {archivedCourses.length > 0 ? (
                            archivedCourses.map(course => (
                                <Link key={course.id} to={`/${course.id}/sections/`}>
                                <CourseCard course={course} role="student" />
                                </Link>
                            ))
                            ) : (
                            <p>No archived courses found.</p>
                            )}
                        </div>
                        </div>
                    ) : null}
                </div>
            }
        </div>
    )
}

export default StudentLanding;
