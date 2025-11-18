import { Link, useParams } from "react-router-dom";
import useSections from "../hooks/useSections";
import Notice from "../components/Notice";
import { TailSpin } from "react-loader-spinner";
import SectionCard from "../components/SectionCard";

function Roster(props) {
  const { courseId } = useParams();
  const [sections, message, error, loading] = useSections();

  return (
    <>
      {message ? (
        <Notice error={error ? "error" : ""} message={message} />
      ) : !sections[courseId] ? (
        <Notice message={"You Do Not Have Any Sections Yet"} />
      ) : (
        <></>
      )}

      {loading ? (
        <TailSpin visible={true} />
      ) : sections[courseId] ? (
        sections[courseId].map((section) => {
          return (
            <SectionCard
              key={section.id}
              section={section}
              courseId={courseId}
              view={"roster"}
            />
          );
        })
      ) : (
        <></>
      )}
    </>
  );
}

export default Roster;
