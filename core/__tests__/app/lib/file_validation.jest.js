"use_strict";
const path = require("node:path");
const mime = require("mime-types");
const fs = require("fs");
const {
  isValidFileSize,
  isValidFileType,
  isValidCsv,
  validateHeaders,
  sanitizeString,
} = require("../../../lib/file_validation.js");

describe("Sanitize strings", () => {
  it("should not change the safe string", () => {
    const str = sanitizeString("safe");
    expect(str).toBe("safe");
  });

  it("should sanitize potentially malicious string starting with '='", () => {
    const str = sanitizeString("=malicious");
    expect(str).toBe("'=malicious");
  });

  it("should sanitize potentially malicious string starting with '+'", () => {
    const str = sanitizeString("+malicious");
    expect(str).toBe("'+malicious");
  });

  it("should sanitize potentially malicious string starting with '-'", () => {
    const str = sanitizeString("-malicious");
    expect(str).toBe("'-malicious");
  });

  it("should sanitize potentially malicious string starting with '@'", () => {
    const str = sanitizeString("@malicious");
    expect(str).toBe("'@malicious");
  });
});

describe("CSV headers match expected", () => {
  it("should respond with object that isValid=true and error=''", () => {
    const headers = ["header1", "header2", "header3"];
    const expectedHeaders = ["header1", "header2", "header3"];
    const res = validateHeaders(headers, expectedHeaders);
    expect(res.isValid).toBeTruthy();
    expect(res.error).toBe("");
  });

  it("should respond with object that isValid=false and error=`Missing headers: xxx`", () => {
    const headers = ["header1", "header2", "header3"];
    const expectedHeaders = ["diff1", "diff2", "diff3"];
    const res = validateHeaders(headers, expectedHeaders);
    expect(res.isValid).toBeFalsy();
    expect(res.error).toContain(`Missing headers:`);
  });
});

describe("File type match expected", () => {
  const filePath = path.join(__dirname, "../fixtures/studentlist.csv");
  const fileName = path.basename(filePath);
  const file = {
    mimetype: mime.lookup(filePath), // "text/csv"
    originalname: fileName, // "studentlist.csv"
  };

  it("should respond with true if all matches", () => {
    const res = isValidFileType(file, ["text/csv"], "csv");
    expect(res).toBeTruthy();
  });

  it("should respond with false if doesn't match one of expectedTypes", () => {
    const res = isValidFileType(file, ["notcsv"], "csv");
    expect(res).toBeFalsy();
  });

  it("should respond with false if doesn't match extension", () => {
    const res = isValidFileType(file, ["text/csv"], "notcsv");
    expect(res).toBeFalsy();
  });
});

describe("File size is within expected limits", () => {
  const file = {
    size: 5 * 1024,
  };
  const badFile = {
    size: 5 * 1024 * 1024 * 2,
  };
  const maxSize = 5 * 1024 * 1024;

  it("should resppond with true if size is within max", () => {
    const res = isValidFileSize(file, maxSize);
    expect(res).toBeTruthy();
  });

  it("should resppond with false if size is not within max", () => {
    const res = isValidFileSize(badFile, maxSize);
    expect(res).toBeFalsy();
  });
});

describe("Overall CSV validation", () => {
  const filePath = path.join(__dirname, "../fixtures/studentlist.csv");
  const fileName = path.basename(filePath);
  const file = {
    mimetype: mime.lookup(filePath), // "text/csv"
    originalname: fileName, // "studentlist.csv"
    size: fs.statSync(filePath).size,
  };

  it("should respond with true if all the file validations return true", () => {
    const expected = {
      maxFileSize: 5 * 1024 * 1024,
      acceptedTypes: ["text/csv"],
      acceptedExtension: "csv",
    };
    const res = isValidCsv(file, expected);
    expect(res).toBeTruthy();
  });

  it("should respond with false if valid size fails", () => {
    const expected = {
      maxFileSize: 0,
      acceptedTypes: ["text/csv"],
      acceptedExtension: "csv",
    };
    const res = isValidCsv(file, expected);
    expect(res).toBeFalsy();
  });

  it("should respond with false if valid size fails", () => {
    const expected = {
      maxFileSize: 5 * 1024 * 1024,
      acceptedTypes: ["text/csv"],
      acceptedExtension: "csv",
    };
    const badFile = {
      mimetype: mime.lookup(filePath), // "text/csv"
      originalname: fileName, // "studentlist.csv"
      size: 0,
    };
    const res = isValidCsv(badFile, expected);
    expect(res).toBeFalsy();
  });

  it("should respond with false if valid file type fails", () => {
    const expected = {
      maxFileSize: 5 * 1024 * 1024,
      acceptedTypes: ["notcsv"],
      acceptedExtension: "csv",
    };
    const res = isValidCsv(file, expected);
    expect(res).toBeFalsy();
  });

  it("should respond with false if valid file type fails", () => {
    const expected = {
      maxFileSize: 5 * 1024 * 1024,
      acceptedTypes: ["text/csv"],
      acceptedExtension: "notcsv",
    };
    const res = isValidCsv(file, expected);
    expect(res).toBeFalsy();
  });
});
