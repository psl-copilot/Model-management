import * as yup from 'yup';

export const loginValidation = yup
    .object({
        email: yup
            .string()
            .required('This Field is Required')
            .max(100, 'Email must not exceed 100 characters')
            .email('A valid email address is required.'),
        password: yup
            .string()
            .required('This Field is Required')
            .min(6, 'Must be at least 6 characters')
            .max(50, 'Password must not exceed 50 characters'),
    })
    .required();