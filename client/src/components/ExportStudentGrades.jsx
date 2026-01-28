import { useState } from "react";
import PropTypes from "prop-types";

import Popup from "@/components/Popup";

const ExportStudentGrades = ({ callback, sectionId }) => {
  const [showUpload, setShowUpload] = useState(false);

  function handlePopupVisible() {
    setShowUpload((curr) => !curr);
  }

  function successfulImport() {
    setShowUpload((curr) => !curr);
    if (callback && showUpload) callback();
  }

  return (
    <>
      <button className="btn btn-primary" onClick={handlePopupVisible}>
        Export Student Grades
      </button>
      {showUpload && (
        <Popup close={handlePopupVisible}>
          <p>Export Student Grades</p>
          <button onClick={handlePopupVisible}>Done</button>
        </Popup>
      )}
    </>
  );
};

ExportStudentGrades.propTypes = {
  callback: PropTypes.func,
  sectionId: PropTypes.number,
};

export default ExportStudentGrades;
