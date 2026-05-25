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

const sanitizeString = (str) => {
  // adds a ' in front of symbols that could execute
  if (["=", "+", "-", "@"].includes(str[0])) {
    return "'" + str;
  }
  return str;
};

module.exports = {
  isValidFileSize,
  isValidFileType,
  isValidCsv,
  validateHeaders,
  sanitizeString,
};
