import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import { loginValidation } from "../../../utils/Common/validators";

const initial = {
    email: '',
    password: ''
}

const useLoginController = () => {



    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues: initial, resolver: yupResolver(loginValidation) });

    const onSubmit = () => {

    };

    return {
        values: {
            control,
            errors,
            isLoading: false
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
        }
    }
}

export default useLoginController;
