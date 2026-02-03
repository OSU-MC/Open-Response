import { useState } from "react";
import PropTypes from "prop-types";
import { TailSpin } from "react-loader-spinner";

import useExportStudentGrades from "@/hooks/useExportStudentGrades";
import useSections from "@/hooks/useSections";

import Popup from "@/components/Popup";
import FileUpload from "@/components/FileUpload";

const ExportStudentGrades = ({ courseId }) => {
  const [
    validateCanvasCSV,
    exportStudentGrades,
    isExportingGrades,
    isErrorExportingGrades,
  ] = useExportStudentGrades(courseId);
  const [sections] = useSections();
  const [stepCounter, setStepCounter] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sectionSelection, setSectionSelection] = useState([]);
  const [exportGradeType, setExportGradeType] = useState("section");

  function handlePopupVisible() {
    setStepCounter(1);
    setUploadedFile(null);
    setSectionSelection([]);
    setShowUpload((curr) => !curr);
  }

  function successfulImport(res) {
    console.log("successful import:", res);
    setStepCounter(2);
    setUploadedFile(res);
  }

  async function handleSubmit() {
    const sectionPayload = sectionSelection.sort((a, b) => a - b);
    const response = await exportStudentGrades(sectionPayload, exportGradeType);
    console.log("response:", response);

    // prompt to download with temporary a tag
    // const blob = new Blob([csvText], { type: "text/csv" });
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "grades.csv"; // filename
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // window.URL.revokeObjectURL(url);
  }

  return (
    <>
      <button className="btn btn-primary" onClick={handlePopupVisible}>
        Export Student Grades
      </button>
      {showUpload && (
        <Popup close={handlePopupVisible}>
          <p>Export Student Grades</p>
          <p>1. Upload grades export from Canvas as &quot;.csv&quot; file</p>
          <FileUpload
            handleUpload={validateCanvasCSV}
            isImporting={isExportingGrades}
            isError={isErrorExportingGrades}
            allowedTypes={["text/csv"]}
            callback={successfulImport}
          />
          {uploadedFile && <p>File uploaded</p>}
          {stepCounter >= 2 && (
            <>
              <p>2. Select sections to export</p>
              <p>Sections</p>

              <div className="button-spacing">
                <label className="button-spacing">
                  <input
                    type="checkbox"
                    checked={
                      sectionSelection.length === sections[courseId]?.length
                    }
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setStepCounter(3);
                      setSectionSelection(() => {
                        return checked
                          ? sections[courseId]?.map((section) => section.id)
                          : [];
                      });
                    }}
                  />
                  All sections
                </label>
                {sections[courseId]?.map((section) => {
                  return (
                    <label key={section.id} className="button-spacing">
                      <input
                        type="checkbox"
                        checked={sectionSelection.includes(section.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setStepCounter(3);
                          setSectionSelection((old) => {
                            return checked
                              ? [...old, section.id]
                              : old.filter((id) => id !== section.id);
                          });
                        }}
                      />
                      Section #{section.number}
                    </label>
                  );
                })}
              </div>
            </>
          )}
          {stepCounter >= 3 && (
            <>
              <p>3. How to group grades?</p>

              <div className="button-spacing">
                <label className="button-spacing">
                  <input
                    type="radio"
                    name="export-grade-type"
                    value="section"
                    checked={exportGradeType === "section"}
                    onChange={() => setExportGradeType("section")}
                  />
                  Each section is a grade
                </label>
                <label className="button-spacing">
                  <input
                    type="radio"
                    name="export-grade-type"
                    value="lecture"
                    checked={exportGradeType === "lecture"}
                    onChange={() => setExportGradeType("lecture")}
                  />
                  Each lecture is a grade
                </label>
              </div>

              {isExportingGrades && <TailSpin visible={true} />}

              <button onClick={handleSubmit}>Download</button>
            </>
          )}
          <button onClick={handlePopupVisible}>Cancel</button>
        </Popup>
      )}
    </>
  );
};

ExportStudentGrades.propTypes = {
  courseId: PropTypes.number,
};

export default ExportStudentGrades;
