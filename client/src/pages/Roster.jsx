import { useParams } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";

import useSections from "@/hooks/useSections";

import Notice from "@/components/Notice";
import SectionCard from "@/components/SectionCard";
import ImportStudentList from "@/components/ImportStudentList";
import ExportStudentGrades from "@/components/ExportStudentGrades";

function Roster() {
  const { courseId } = useParams();
  const [sections, message, error, loading] = useSections();

  return (
    <>
      <div className="contentbody">
        <div className="allstudents">
          <div className="button-spacing">
            <ImportStudentList />
            <ExportStudentGrades />
          </div>
        </div>

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
      </div>
    </>
  );
}

export default Roster;
