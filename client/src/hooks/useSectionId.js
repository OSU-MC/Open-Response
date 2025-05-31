// useSectionId.js
//
// Custom React hook to determine the section ID for the current course for a student.
//
// Returns:
//   sectionId (number|null): The ID of the section the student is enrolled in for the given course, or null if not found.
//
// Behavior:
//   - Uses React Router's useParams to get the current courseId from the URL.
//   - Fetches the student's courses using the useCourses hook.
//   - Searches for a section in the student's courses that matches the courseId.
//   - Updates sectionId whenever the courses or courseId change.
//
// Example usage:
//   const sectionId = useSectionId();
//
// This hook is useful for pages/components that need to know which section a student belongs to for a given course.

import { useState, useEffect } from 'react';
import useCourses from './useCourses';
import { useParams } from 'react-router-dom';

function findSectionIdForCourse(studentCourses, courseId) {
    if (!studentCourses || !Array.isArray(studentCourses)) {
        return null;
    }

    for (const course of studentCourses) {
        if (course.id === courseId && Array.isArray(course.Sections)) {
            for (const section of course.Sections) {
                if (section.courseId === courseId) {
                    return section.id;
                }
            }
        }
    }

    return null; // If no matching section is found
}

function useSectionId() {
    const { courseId } = useParams();
    const [courses, coursesMessage, coursesError] = useCourses();
    const [sectionId, setSectionId] = useState(null);

    useEffect(() => {
        if (courses && courses.studentCourses) {
            const foundSectionId = findSectionIdForCourse(courses.studentCourses, parseInt(courseId));
            setSectionId(foundSectionId);
        }
    }, [courses, courseId]);

    return sectionId;
}

export default useSectionId;