// useExportStudentGrades.js
//
// Custom React hook for fetching and managing imported new student data.
//
// Returns:
//   [exportStudentGrades, isExporting, error]
//     - exportStudentGrades: Function that triggers the studnet import for the optional section.
//     - isExporting: Boolean indicating whether the import request is currently in progress.
//     - error: Boolean indicating if there was an error.
//
// Behavior:
//   - Fetches students for the given course and section from the API on upload button press.
//   - Handles loading and error states.
//
// Example usage:
//   const [exportStudentGrades, isExportingGrades, isErrorExportingGrades] = useExportStudentGrades();
// TODO: fill this out ^

import { useState } from "react";
import apiUtil from "@/utils/apiUtil";

function useExportStudentGrades(courseId) {
  const [isExporting, setIsExporting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [file, setFile] = useState();

  // checks that imported file is safe to read
  async function validateCanvasCSV(file) {
    if (!file) return;
    setIsExporting(true);
    setIsError(false);

    // 0 for courseId and sectionId here since we are just validating the file
    // and don't use either in the validtion on backend but this is the endpoint
    // for the grades.js in core/app/api/grades
    const endpoint = `/courses/0/sections/0/grades/export/validate-canvas-csv`;

    // send raw file to api
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiUtil("post", endpoint, {}, formData);
    const save = response.data.saveInState;

    // handle response
    setFile(save);
    setIsExporting(false);

    if (response.status === 400) {
      setIsError(true);
    }

    if (response.status === 200) {
      return response.data;
    }

    return undefined;
  }

  async function exportStudentGrades(sectionIds, exportGradeType) {
    setIsExporting(true);
    let endpoint = `/courses/${courseId}/sections/0/grades/export/canvas`;
    // adds sectionIds as query params
    if (sectionIds) {
      endpoint += "?sectionIds=" + sectionIds.join(",");
    }

    // post to backend
    const dataPayload = { rows: file, exportGradeType };
    const response = await apiUtil("post", endpoint, {}, dataPayload);
    setIsExporting(false);

    if (response.status === 400) {
      setIsError(true);
      return response.message;
    }

    if (response.status === 200) {
      return response.data;
    }

    return undefined;
  }

  return [validateCanvasCSV, exportStudentGrades, isExporting, isError];
}

export default useExportStudentGrades;
