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