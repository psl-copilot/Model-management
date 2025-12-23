import { useForm } from "react-hook-form";
import { useLoginMutation } from "../../../redux/Api/Auth";
import { loginValidation } from "../../../utils/Common/validators";
import { yupResolver } from '@hookform/resolvers/yup';

const initial = {
    email: '',
    password: ''
}

const useLoginController = () => {


    const [submit, { isLoading }] = useLoginMutation()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues: initial, resolver: yupResolver(loginValidation) });

    const onSubmit = (data: unknown) => {

    };

    return {
        values: {
            control,
            errors,
            isLoading
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
        }
    }
}

export default useLoginController;
