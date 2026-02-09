import { validateEmail, validateMobile, validateString } from "../validation";

export const validateInput = (inputId: string, inputVal: string) => {
  if (inputId === "firstName" || inputId === "lastName") {
    return validateString(inputId, inputVal);
  }
  if (inputId === "email") {
    return validateEmail(inputId, inputVal);
  } else if (inputId === "mobile") {
    return validateMobile(inputId, inputVal);
  }
};
