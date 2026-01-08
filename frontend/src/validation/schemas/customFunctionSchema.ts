import * as yup from 'yup';

/**
 * Validation schema for CustomFunction node
 */
export const customFunctionSchema = yup.object({
  functionName: yup
    .string()
    .required('Function name is required')
    .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Must be a valid function name'),
  resultVar: yup
    .string()
    .required('Result variable is required')
    .matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Must be a valid identifier'),
});
