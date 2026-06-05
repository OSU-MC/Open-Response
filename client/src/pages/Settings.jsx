import { useParams } from "react-router-dom";
import useCourse from "../hooks/useCourse";
import Breadcrumbs from "../components/nav/Breadcrumbs";
import Tabs from "../components/nav/Tabs.jsx";

function Settings() {
  const { courseId, sectionId } = useParams();
  const [course, role, Cmessage, Cerror, Cloading] = useCourse();
  const courseName =
    course?.name || (Cloading ? "Loading..." : "Unknown Course");
  const isInstructor = role === "teacher";

  const breadcrumbs_object = [
    ["Courses", "/"],
    [courseName, `/${courseId}/sections`],
    [`Section ${sectionId}`, null],
  ];
  const tabs_o_teacher = [
    ["Lectures", sectionId ? `sections/${sectionId}` : "sections"], // added guard against sectionId being undefined in the tabs, prevents error.
    ["Gradebook", sectionId ? `sections/${sectionId}/grades` : "sections"], // added guard against sectionId being undefined in the tabs: this stops server from crashing when navigating to course settings, and then gradebook.
    ["Settings", "settings"],
  ];
  const tabs_o_student = [
    ["Lectures", `lectures`],
    ["Gradebook", `sections/${sectionId}/grades`],
    ["Settings", "settings"],
  ];

  return (
    <>
      <div className="grades-page">
        <div className="grades-header">
          <div>
            <Breadcrumbs breadcrumbs={breadcrumbs_object} />
          </div>
          <h1 className="course-title">{`${courseName} Settings`}</h1>
          <Tabs
            courseId={courseId}
            tabs={isInstructor ? tabs_o_teacher : tabs_o_student}
          />
          <p>Settings have not been set up.</p>
        </div>
      </div>
    </>
  );
}

export default Settings;
