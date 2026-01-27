function isValidFileSize(file, maxSize) {
  return file.size < maxSize && file.size > 0;
}

function isValidFileType(file, acceptedTypes, acceptedExtension) {
  const isValidContentType = acceptedTypes.includes(file.mimetype);
  const arr = file.originalname.split(".");
  const isValidExtension = acceptedExtension === arr[arr.length - 1];
  return isValidContentType && isValidExtension;
}

function validateHeaders(headers, expectedHeaders) {
  const res = {};
  const missing = expectedHeaders.filter((h) => !headers.includes(h));
  res.isValid = missing.length === 0;
  res.error = res.isValid ? "" : `Missing headers: ${missing.join(", ")}`;
  return res;
}

function isValidCsv(file, expected) {
  if (!isValidFileSize(file, expected.maxFileSize)) return false;
  if (
    !isValidFileType(file, expected.acceptedTypes, expected.acceptedExtension)
  )
    return false;
  return true;
}

// Upload file
// → Check size
// → Check extension + content type
// → Inspect raw bytes (text only)
// → Parse with CSV library
// → Validate headers
// → Validate rows
// → Escape CSV injection vectors
// → Insert with parameterized queries
// → Delete file

module.exports = {
  isValidFileSize,
  isValidFileType,
  isValidCsv,
  validateHeaders,
};
