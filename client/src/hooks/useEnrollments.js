import apiUtil from "../utils/apiUtil";
import { addEnrollments } from "../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { getEnrollments } from "../redux/selectors";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function useEnrollments() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const enrollments = useSelector(getEnrollments);
  const { courseId } = useParams();
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEnrollments() {
      setLoading(true);
      const response = await apiUtil("get", `courses/${courseId}/enrollments`, {
        dispatch: dispatch,
        navigate: navigate,
      });
      setMessage(response.message);
      setError(response.error);
      if (response.status === 200) {
        dispatch(addEnrollments(courseId, response.data.enrollments));
      }
      setLoading(false);
    }
    if (enrollments[courseId] == null) {
      getEnrollments();
    } else {
      setLoading(false);
    }
  }, []);

  return [enrollments, message, error, loading];
}

export default useEnrollments;
