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
  const [successMessage, setSuccessMessage] = useState(false);
  const [errors, setErrors] = useState(false);

  function handlePopupVisible() {
    setStepCounter(1);
    setUploadedFile(null);
    setSectionSelection([]);
    setExportGradeType("section");
    setShowUpload((curr) => !curr);
  }

  function successfulImport(resp) {
    setStepCounter(2);
    setUploadedFile(resp.saveInState);
    // console.log("successful import:", resp);
  }

  async function handleSubmit() {
    // query backend
    const sectionPayload = sectionSelection.sort((a, b) => a - b);
    const resp = await exportStudentGrades(sectionPayload, exportGradeType);
    const csvText = resp.csv;
    // console.log("csv:", csvText);

    // prompt to download with temporary <a> tag
    const filename = `OpenResponseGrades_${courseId}_${sectionPayload.join("-")}.csv`;
    const blob = new Blob([csvText], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setStepCounter(4);
    setSuccessMessage(resp.successMessage);
    setErrors(resp.errors);
  }

  const step2Content = (
    <>
      <p>2. Select sections to export</p>
      <p>Sections</p>

      <div className="button-spacing">
        <label className="button-spacing">
          <input
            type="checkbox"
            checked={sectionSelection.length === sections[courseId]?.length}
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
  );

  const step3Content = (
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
          Overall grade (each section is a grade)
        </label>
        <label className="button-spacing">
          <input
            type="radio"
            name="export-grade-type"
            value="lecture"
            checked={exportGradeType === "lecture"}
            onChange={() => setExportGradeType("lecture")}
          />
          Every lecture assignment (each lecture is a grade)
        </label>
      </div>

      {isExportingGrades && <TailSpin visible={true} />}

      <button onClick={handleSubmit}>Download</button>
    </>
  );

  const popupContent = (
    <>
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
      {stepCounter >= 2 && step2Content}
      {stepCounter >= 3 && step3Content}
      {stepCounter >= 4 && successMessage && <p>{successMessage}</p>}
      {stepCounter >= 4 && errors?.length > 0 && (
        <>
          <p>Errors</p>
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </>
      )}
      {stepCounter >= 4 && <button onClick={handlePopupVisible}>Done</button>}
      <button onClick={handlePopupVisible}>Cancel</button>
    </>
  );

  return (
    <>
      <button className="btn btn-primary" onClick={handlePopupVisible}>
        Export Student Grades
      </button>
      {showUpload && <Popup close={handlePopupVisible}>{popupContent}</Popup>}
    </>
  );
};

ExportStudentGrades.propTypes = {
  courseId: PropTypes.number,
};

export default ExportStudentGrades;
