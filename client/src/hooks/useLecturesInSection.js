import apiUtil from "../utils/apiUtil";
import { addLecturesInSection } from "../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { getLecturesInSection } from "../redux/selectors";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function useLecturesInSection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lecturesInSection = useSelector(getLecturesInSection);
  const { courseId, sectionId } = useParams();
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLectures = async () => {
    setLoading(true);
    const response = await apiUtil(
      "get",
      `courses/${courseId}/sections/${sectionId}`,
      { dispatch: dispatch, navigate: navigate }
    );
    setMessage(response.message);
    setError(response.error);
    if (response.status === 200) {
      dispatch(addLecturesInSection(sectionId, response.data.lectures));
    }
    setLoading(false);
  };

  useEffect(() => {
    async function getSection() {
      setLoading(true);
      const response = await apiUtil(
        "get",
        `courses/${courseId}/sections/${sectionId}`,
        { dispatch: dispatch, navigate: navigate }
      );
      setMessage(response.message);
      setError(response.error);
      if (response.status === 200) {
        dispatch(addLecturesInSection(sectionId, response.data.lectures));
      }
      setLoading(false);
    }
    if (lecturesInSection[sectionId] == null) {
      getSection();
    } else {
      setLoading(false);
    }
  }, []);

  return [lecturesInSection[sectionId], message, error, loading, fetchLectures];
}

export default useLecturesInSection;
