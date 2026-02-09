import { validate } from "validate.js";

export const validateString = (inputId: string, inputVal: string) => {
  const constraints = {
    presence: { allowEmpty: false },
  };
  if (inputVal !== "") {
    constraints.format = {
      pattern: "[a-z]+",
      flags: "i",
      message: "Value can only contain characters",
    };
  }
  const result = validate({ [inputId]: inputVal }, { [inputId]: constraints });
  return result && result[inputId];
};

export const validateEmail = (inputId: string, inputVal: string) => {
  const constraints = {
    presence: { allowEmpty: false },
  };
  if (inputVal !== "") {
    constraints.email = true;
  }
  const result = validate({ [inputId]: inputVal }, { [inputId]: constraints });
  return result && result[inputId];
};

export const validateMobile = (inputId: string, inputVal: string) => {
  const constraints = {
    presence: { allowEmpty: false },
  };
  if (inputVal !== "") {
    constraints.format = {
      pattern: "[0-9]+",
      flags: "i",
      message: "Value can only contain digits",
    };
    constraints.length = {
      minimum: 10,
      message: "Please enter a valid mobile number with 10 digits",
    };
  }
  const result = validate({ [inputId]: inputVal }, { [inputId]: constraints });
  return result && result[inputId];
};
