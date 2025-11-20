import apiUtil from "../utils/apiUtil";
import { addSections } from "../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { getSections } from "../redux/selectors";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function useSections() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sections = useSelector(getSections);
  const { courseId } = useParams();
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSections() {
      setLoading(true);
      const response = await apiUtil("get", `courses/${courseId}/sections`, {
        dispatch: dispatch,
        navigate: navigate,
      });
      setMessage(response.message);
      setError(response.error);
      if (response.status === 200) {
        dispatch(addSections(courseId, response.data));
      }
      setLoading(false);
    }
    if (sections[courseId] == null) {
      getSections();
    } else {
      setLoading(false);
    }
  }, []);

  return [sections, message, error, loading];
}

export default useSections;
