import { useEffect, useState } from "react";
import useCourses from "./useCourses";
import { useParams } from "react-router-dom";

function useCourse() {
  const { courseId } = useParams();
  const [courses, coursesMessage, coursesError] = useCourses();
  const [course, setCourse] = useState({});
  const [role, setRole] = useState("");
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function findCourse() {
      setLoading(true);
      let found = false;
      courses.teacherCourses.forEach((teacherCourse) => {
        if (teacherCourse.id == courseId) {
          found = true;
          setCourse(teacherCourse);
          setRole("teacher");
        }
      });
      courses.studentCourses.find((studentCourse) => {
        if (studentCourse.id == courseId) {
          found = true;
          setCourse(studentCourse);
          setRole("student");
        }
      });
      setLoading(false);
      if (found == false) {
        setError(true);
        setMessage(`The course with id ${courseId} cannot be found`);
      }
    }
    if (courses.teacherCourses != null && courses.studentCourses != null) {
      findCourse();
    }
  }, [courseId, courses]);

  return [course, role, message, error, loading];
}

export default useCourse;
