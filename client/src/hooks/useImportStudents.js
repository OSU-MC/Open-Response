// useImportStudents.js
//
// Custom React hook for fetching and managing imported new student data.
//
// Returns:
//   [importStudents, isImporting, error]
//     - importStudents: Function that triggers the student import for the optional section.
//     - isImporting: Boolean indicating whether the import request is currently in progress.
//     - error: Boolean indicating if there was an error.
//
// Behavior:
//   - Fetches students for the given course and section from the API on upload button press.
//   - Handles loading and error states.
//
// Example usage:
//   const [importStudents, importing, importError] = useImportGrades(courseId, sectionId);

import { useState } from "react";
import apiUtil from "../utils/apiUtil";

function useImportedStudents(sectionId = undefined) {
  const [isImporting, setIsImporting] = useState(false);
  const [isError, setIsError] = useState(false);

  // handles imported file to create new users for each student in csv
  async function importStudents(file) {
    if (!file) return;
    setIsImporting(true);
    setIsError(false);

    // add optional sectionId depending on where the import was started from
    let endpoint = "/users/import-by-csv";
    if (sectionId !== undefined) {
      endpoint += "?sectionId=" + sectionId;
    }
    console.log("endpoint:", endpoint);

    // send raw file to api
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiUtil("post", endpoint, {}, formData);
    console.log(response);

    // handle response
    setIsImporting(false);

    if (response.status === 400) {
      setIsError(true);
    }

    if (response.status === 200) {
      return response.data;
    }

    return undefined;
  }

  return [importStudents, isImporting, isError];
}

export default useImportedStudents;
