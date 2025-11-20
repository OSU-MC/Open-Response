import apiUtil from "../utils/apiUtil";
import { setCourses, logout } from "../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { getCourses } from "../redux/selectors";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function useCourses() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const courses = useSelector(getCourses);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function populateCourses() {
      setLoading(true);
      const response = await apiUtil("get", "courses/", {
        dispatch: dispatch,
        navigate: navigate,
      });
      setLoading(false);
      setMessage(response.message);
      setError(response.error);
      if (response.status === 200) {
        dispatch(
          setCourses(response.data.studentCourses, response.data.teacherCourses)
        );
      }
    }
    if (courses.studentCourses == null || courses.teacherCourses == null) {
      populateCourses();
    }
  }, []);

  return [courses, message, error, loading];
}

export default useCourses;
