import { useState } from "react";
import PropTypes from "prop-types";

import useImportedStudents from "@/hooks/useImportStudents";

import Popup from "@/components/Popup";
import FileUpload from "@/components/FileUpload";

const ImportStudentList = ({ callback, sectionId }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [importStudents, isImportingStudents, isErrorImportStudents] =
    useImportedStudents(sectionId);

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
        Import Student List
      </button>
      {showUpload && (
        <Popup close={handlePopupVisible}>
          <p>Import Student List</p>
          <p>CSV Format: firstName, lastName, email</p>
          <FileUpload
            handleUpload={importStudents}
            isImporting={isImportingStudents}
            isError={isErrorImportStudents}
            allowedTypes={["text/csv"]}
            callback={successfulImport}
          />
          <button onClick={handlePopupVisible}>Done</button>
        </Popup>
      )}
    </>
  );
};

ImportStudentList.propTypes = {
  callback: PropTypes.func,
  sectionId: PropTypes.number,
};

export default ImportStudentList;
