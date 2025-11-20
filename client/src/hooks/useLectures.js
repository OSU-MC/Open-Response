import apiUtil from "../utils/apiUtil";
import { addLectures } from "../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { getLectures } from "../redux/selectors";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function useLectures() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lectures = useSelector(getLectures);
  const { courseId } = useParams();
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getLectures() {
      setLoading(true);
      const response = await apiUtil("get", `courses/${courseId}/lectures`, {
        dispatch: dispatch,
        navigate: navigate,
      });
      setMessage(response.message);
      setError(response.error);
      if (response.status === 200) {
        dispatch(addLectures(courseId, response.data.lectures));
      }
      setLoading(false);
    }
    if (lectures[courseId] == null) {
      getLectures();
    } else {
      setLoading(false);
    }
  }, []);

  return [lectures, message, error, loading];
}

export default useLectures;
