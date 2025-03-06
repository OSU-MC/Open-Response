module.exports = {
    /*
     * Performs data validation on an object by verifying that it contains
     * all required fields specified in a given schema.
     *
     * Returns an empty array if the object is valid against the schema, and an array containing the missing fields otherwise
     */
    validateAgainstSchema: function (obj, schema) {
      let missingFields = []
      Object.keys(schema).forEach((field) => {
        if (schema[field].required && obj[field] == undefined) {
          missingFields.push(field)
        }
      })
      return missingFields
    },
  
    /*
     * Extracts all fields from an object that are valid according to a specified
     * schema.  Extracted fields can be either required or optional.
     *
     * Returns a new object containing all valid fields extracted from the
     * original object.
     */
    extractValidFields: function (obj, schema) {
      let validObj = {};
      Object.keys(schema).forEach((field) => {
        if (obj[field] != undefined) {
          validObj[field] = obj[field];
        }
      });
      return validObj;
    }
  };