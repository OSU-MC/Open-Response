import React, { useState } from 'react';
import CourseCard from '../components/CourseCard.jsx'
import { Button, Card } from "react-bootstrap"
import useCourses from '../hooks/useCourses.js'
import Notice from '../components/Notice.jsx'
import { Link } from 'react-router-dom'
import AddCourse from './AddCourse.jsx'
import PageButton from '../components/2024/PageButton.jsx'
import "../styles/landing.css"


function TeacherLanding(props) {
    const [courses, message, error, loading] = useCourses()
    
    // Add state to track the selected filter (sorting category)
    const [selectedFilter, setSelectedFilter] = useState("ALL");

    const teacherCourses = courses.teacherCourses || [];

    // Define groups for each category
    const recentCourses = courses.teacherCourses?.slice(0, 3) || [];
    const publishedCourses = courses.teacherCourses?.filter(course => course.published) || [];
    const draftCourses = courses.teacherCourses?.filter(course => !course.published) || [];
    const archivedCourses = teacherCourses.filter(course => course.softDelete);

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
                    <div className="course-sort">
                        <span
                            className={selectedFilter === "ALL" ? 'selected' : ''}
                            onClick={() => setSelectedFilter("ALL")}
                        >
                            ALL
                        </span>
                        <span
                            className={selectedFilter === "PUBLISHED" ? 'selected' : ''}
                            onClick={() => setSelectedFilter("PUBLISHED")}
                        >
                            PUBLISHED
                        </span>
                        <span
                            className={selectedFilter === "ARCHIVED" ? 'selected' : ''}
                            onClick={() => setSelectedFilter("ARCHIVED")}
                        >
                            ARCHIVED
                        </span>
                        <span
                            className={selectedFilter === "DRAFT" ? 'selected' : ''}
                            onClick={() => setSelectedFilter("DRAFT")}
                        >
                            DRAFT
                        </span>
                    </div>

                    {/* Render sections based on selected filter */}
                    {selectedFilter === "ALL" ? (
                        <>
                        {recentCourses.length > 0 && (
                            <div className="course-section">
                            <h2>Recent Courses</h2>
                            <div className="courses">
                                {recentCourses.map(course => (
                                <Link key={course.id} to={`/${course.id}/sections/`}>
                                    <CourseCard course={course} role="teacher" />
                                </Link>
                                ))}
                            </div>
                            </div>
                        )}
                        {publishedCourses.length > 0 && (
                            <div className="course-section">
                            <h2>Published Courses</h2>
                            <div className="courses">
                                {publishedCourses.map(course => (
                                <Link key={course.id} to={`/${course.id}/sections/`}>
                                    <CourseCard course={course} role="teacher" />
                                </Link>
                                ))}
                            </div>
                            </div>
                        )}
                        {draftCourses.length > 0 && (
                            <div className="course-section">
                            <h2>Draft Courses</h2>
                            <div className="courses">
                                {draftCourses.map(course => (
                                <Link key={course.id} to={`/${course.id}/sections/`}>
                                    <CourseCard course={course} role="teacher" />
                                </Link>
                                ))}
                            </div>
                            </div>
                        )}
                        </>
                    ) : selectedFilter === "PUBLISHED" ? (
                        <div className="course-section">
                        <h2>Published Courses</h2>
                        <div className="courses">
                            {publishedCourses.length > 0 ? (
                            publishedCourses.map(course => (
                                <Link key={course.id} to={`/${course.id}/sections/`}>
                                <CourseCard course={course} role="teacher" />
                                </Link>
                            ))
                            ) : (
                            <p>No published courses found.</p>
                            )}
                        </div>
                        </div>
                    ) : selectedFilter === "ARCHIVED" ? (
                        <div className="course-section">
                        <h2>Archived Courses</h2>
                        <div className="courses">
                            {archivedCourses.length > 0 ? (
                            archivedCourses.map(course => (
                                <Link key={course.id} to={`/${course.id}/sections/`}>
                                <CourseCard course={course} role="teacher" />
                                </Link>
                            ))
                            ) : (
                            <p>No archived courses found.</p>
                            )}
                        </div>
                        </div>
                    ) : selectedFilter === "DRAFT" ? (
                        <div className="course-section">
                        <h2>Draft Courses</h2>
                        <div className="courses">
                            {draftCourses.length > 0 ? (
                            draftCourses.map(course => (
                                <Link key={course.id} to={`/${course.id}/sections/`}>
                                <CourseCard course={course} role="teacher" />
                                </Link>
                            ))
                            ) : (
                            <p>No draft courses found.</p>
                            )}
                        </div>
                        </div>
                    ) : null}

                </div>
            }
        </div>
    )
}

export default TeacherLanding;
