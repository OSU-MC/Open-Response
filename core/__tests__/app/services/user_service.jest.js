const db = require("../../../app/models");
const UserService = require("../../../app/services/user_service");

describe("Users Service", () => {
  let completeCreationFields = {
    firstName: "Memer",
    lastName: "Magic",
    email: "memer@open-response.org",
    rawPassword: "Iamsuchamemer!",
    isTeacher: true,
  };

  let incompleteRequestBody = completeCreationFields;

  let missingRequestFields = {
    confirmedPassword: "Iamsuchamemer!",
  };

  describe("validateUserCreationRequest", () => {
    it("should return an empty array when all required fields are present", () => {
      expect(
        UserService.validateUserCreationRequest({
          ...incompleteRequestBody,
          ...missingRequestFields,
        }).length
      ).toEqual(0);
    });

    it("should return an array with the missingRequestFields keys", () => {
      const missingFields = UserService.validateUserCreationRequest(
        incompleteRequestBody
      );
      const missingRequestFieldsKeys = Object.keys(missingRequestFields);
      expect(missingFields.length).toEqual(missingRequestFieldsKeys.length);
      expect(missingFields).toEqual(missingRequestFieldsKeys);
    });
  });

  describe("extractUserCreationFields", () => {
    it("should extract only the needed parameters to create a user", () => {
      const extractedFields = UserService.extractUserCreationFields({
        ...completeCreationFields,
        ...missingRequestFields,
      });
      expect(Object.keys(extractedFields).length).toEqual(
        Object.keys(completeCreationFields).length
      );
      expect(extractedFields).toEqual(completeCreationFields);
    });
  });

  describe("filterUserFields", () => {
    let user;

    beforeEach(async () => {
      user = await db.User.create(completeCreationFields);
    });

    it("should return the firstName, lastName, and email of the user", () => {
      expect(UserService.filterUserFields(user)).toEqual({
        id: user.id,
        firstName: "Memer",
        lastName: "Magic",
        email: "memer@open-response.org",
        isTeacher: true,
      });
    });

    afterEach(async () => {
      await user.destroy();
    });
  });

  describe("validateUserLoginRequest", () => {
    let incompleteLoginRequestBody = {
      email: "memer@open-response.org",
    };

    let missingLoginRequestFields = {
      rawPassword: "Iamsuchamemer!",
    };

    it("should return an empty array when all required fields are present", () => {
      expect(
        UserService.validateUserLoginRequest({
          ...incompleteLoginRequestBody,
          ...missingLoginRequestFields,
        }).length
      ).toEqual(0);
    });

    it("should return an array with the missingRequestFields keys", () => {
      const missingFields = UserService.validateUserLoginRequest(
        incompleteLoginRequestBody
      );
      const missingRequestFieldsKeys = Object.keys(missingLoginRequestFields);
      expect(missingFields.length).toEqual(missingRequestFieldsKeys.length);
      expect(missingFields).toEqual(missingRequestFieldsKeys);
    });
  });

  describe("validateUserPasswordChangeRequest", () => {
    let incompletePasswordRequestBody = {
      oldPassword: "",
      rawPassword: "",
    };

    let missingPasswordRequestFields = {
      confirmedPassword: "",
    };

    it("should return an empty array when all required fields are present", () => {
      expect(
        UserService.validateUserPasswordChangeRequest({
          ...incompletePasswordRequestBody,
          ...missingPasswordRequestFields,
        }).length
      ).toEqual(0);
    });

    it("should return an array with the missingRequestFields keys", () => {
      const missingFields = UserService.validateUserPasswordChangeRequest(
        incompletePasswordRequestBody
      );
      const missingRequestFieldsKeys = Object.keys(
        missingPasswordRequestFields
      );
      expect(missingFields.length).toEqual(missingRequestFieldsKeys.length);
      expect(missingFields).toEqual(missingRequestFieldsKeys);
    });
  });

  describe("validateUserPasswordChangeRequest", () => {
    let incompletePasswordRequestBody = {
      email: "",
      passwordResetCode: "",
      rawPassword: "",
    };

    let missingPasswordRequestFields = {
      confirmedPassword: "",
    };

    it("should return an empty array when all required fields are present", () => {
      expect(
        UserService.validateUserPasswordResetRequest({
          ...incompletePasswordRequestBody,
          ...missingPasswordRequestFields,
        }).length
      ).toEqual(0);
    });

    it("should return an array with the missingRequestFields keys", () => {
      const missingFields = UserService.validateUserPasswordResetRequest(
        incompletePasswordRequestBody
      );
      const missingRequestFieldsKeys = Object.keys(
        missingPasswordRequestFields
      );
      expect(missingFields.length).toEqual(missingRequestFieldsKeys.length);
      expect(missingFields).toEqual(missingRequestFieldsKeys);
    });
  });

  describe("login", () => {
    let user;
    let emailConfirmationCode;

    beforeEach(async () => {
      user = await db.User.create(completeCreationFields);
      const response = await db.User.findByPk(user.id, {
        attributes: ["emailConfirmationCode"], // only pull this column
      });
      emailConfirmationCode = response.dataValues.emailConfirmationCode;
    });

    it("should return 0 for success", () => {
      user.confirmEmail(emailConfirmationCode);
      expect(UserService.login(user, user.rawPassword)).toEqual(0);
    });

    it("should return -1 for invalid password", () => {
      expect(UserService.login(user, "wrong password")).toEqual(-1);
    });

    it("should return -2 for invalid password and password reset from 3rd failure", () => {
      UserService.login(user, "wrong password");
      UserService.login(user, "wrong password");
      expect(UserService.login(user, "wrong password")).toEqual(-2);
    });

    it("should return -3 for account locked from too many failures", () => {
      UserService.login(user, "wrong password");
      UserService.login(user, "wrong password");
      UserService.login(user, "wrong password");
      expect(UserService.login(user, "wrong password")).toEqual(-3);
    });

    it("should return 1 for account waiting on password reset", () => {
      user.confirmEmail(emailConfirmationCode);
      user.generatePasswordReset();
      expect(UserService.login(user, user.rawPassword)).toEqual(1);
    });

    it("should return 2 for account waiting on email confirmation", () => {
      expect(UserService.login(user, user.rawPassword)).toEqual(2);
    });

    it("should return 'A password reset...' for confirmed email and generated password reset", () => {
      user.confirmEmail(emailConfirmationCode);
      user.generatePasswordReset();
      expect(UserService.getLoggedInStatus(user)).toEqual(
        "A password reset has been initiated for this account, but the password has not been reset"
      );
    });

    it("should return '' for confirmed email", () => {
      user.confirmEmail(emailConfirmationCode);
      expect(UserService.getLoggedInStatus(user)).toEqual("");
    });

    it("should return 'This account email...' for no email confirmation", () => {
      expect(UserService.getLoggedInStatus(user)).toEqual(
        "This account email has not been confirmed. You cannot recover your account in the case of a lost password unless you confirm your email."
      );
    });

    afterEach(async () => {
      await user.destroy();
    });
  });
});
