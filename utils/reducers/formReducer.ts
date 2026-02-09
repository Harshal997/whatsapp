export const reducer = (state: any, action: any) => {
  console.log("action", action);
  const { inputId, res, inputVal } = action;
  const updatedValues = {
    ...state.inputValues,
    [inputId]: inputVal,
  };
  const updatedState = {
    ...state.inputFields,
    [inputId]: res,
  };
  let formIsValid = true;
  for (const key in updatedState) {
    if (updatedState[key] !== undefined) {
      formIsValid = false;
      break;
    }
  }
  return {
    ...state,
    inputValues: updatedValues,
    inputFields: updatedState,
    formIsValid,
  };
  // return state;
};
