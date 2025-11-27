"use_strict";
const { generateOTP } = require("../../../lib/password_gen.js");

describe("Generating OTPs", () => {
  it("should generate an OTP of 6 characters", () => {
    const generatedOTP = generateOTP(6);

    expect(generatedOTP).toHaveLength(6);
  });

  it("should generate an OTP of 100 characters", () => {
    const generatedOTP = generateOTP(100);

    expect(generatedOTP).toHaveLength(100);
  });

  it("should return an empty string when passed a negative number", () => {
    const generatedOTP = generateOTP(-42);

    expect(generatedOTP).toBe("");
  });
});
