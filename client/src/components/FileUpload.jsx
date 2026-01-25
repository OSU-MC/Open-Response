import { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import PropTypes from "prop-types";

const FileUpload = ({
  handleUpload,
  isImporting,
  isError,
  allowedTypes,
  callback,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const maxDisplayedErrors = 10;

  function onFileChange(event) {
    const files = event.target.files;
    if (!files || files.length <= 0) {
      return;
    }
    const file = files[0];
    setSelectedFile(file);
    console.log(files);
    console.log(file);
  }

  async function onFileUpload() {
    if (!selectedFile) {
      return;
    }
    const resp = await handleUpload(selectedFile);
    setUploadResponse(resp);
    if (resp.errors.length <= 0) {
      if (callback) callback();
    }
  }

  return (
    <>
      {isImporting ? (
        <TailSpin visible={true} />
      ) : (
        <>
          <div className="mb-3">
            <input
              type="file"
              accept={allowedTypes.join(",")}
              onChange={onFileChange}
            />
            <button onClick={onFileUpload}>Upload!</button>
          </div>
          {isError && (
            <div className="mb-3">
              <p>Bad request</p>
            </div>
          )}
          {uploadResponse && uploadResponse.errors.length > 0 && (
            <div className="mb-3">
              {uploadResponse.errors
                .slice(0, maxDisplayedErrors)
                .map((error) => {
                  return <p key={error.row}>{error.error}</p>;
                })}
              {uploadResponse.errors.length > maxDisplayedErrors && (
                <p>Displaying only the first {maxDisplayedErrors} errors.</p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

FileUpload.propTypes = {
  handleUpload: PropTypes.func.isRequired,
  isImporting: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  allowedTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  callback: PropTypes.func,
};

export default FileUpload;
