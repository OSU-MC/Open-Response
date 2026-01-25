import { useParams } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";

import useEnrollments from "@/hooks/useEnrollments";
import useSections from "@/hooks/useSections";

import Notice from "@/components/Notice";
import StudentListItem from "@/components/StudentListItem";
import ImportStudentList from "@/components/ImportStudentList";

function Enrollments() {
  const { courseId, sectionId } = useParams();
  const [enrollments, message, error, loading, refreshEnrollments] =
    useEnrollments();
  const [sections] = useSections();

  const section = sections[courseId]?.find((s) => s.id === Number(sectionId));
  const allStudentsInSection = enrollments[courseId]?.filter(
    (e) => e.sectionId === Number(sectionId)
  );

  return (
    <>
      <div className="contentbody">
        <div className="allstudents">
          {loading ? (
            <TailSpin visible={true} />
          ) : section ? (
            "Section #" + section.number
          ) : null}
        </div>

        <div className="allstudents">
          <ImportStudentList
            callback={refreshEnrollments}
            sectionId={section?.id}
          />
        </div>

        {message ? (
          <Notice error={error ? "error" : ""} message={message} />
        ) : !enrollments ? (
          <Notice message={"No students are enrolled in this course"} />
        ) : null}

        <ul className="allstudents">
          {loading ? (
            <TailSpin visible={true} />
          ) : allStudentsInSection.length > 0 ? (
            allStudentsInSection.map((e) => {
              return <StudentListItem key={e.id} student={e} />;
            })
          ) : (
            <Notice message={"No students have joined this section"} />
          )}
        </ul>
      </div>
    </>
  );
}

export default Enrollments;
