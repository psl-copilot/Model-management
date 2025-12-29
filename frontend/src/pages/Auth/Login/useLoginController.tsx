import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import { loginValidation } from "../../../utils/Common/validators";
import { useLoginMutation } from '../../../redux/Api/Auth';
import { useEffect } from 'react';
import { insertData } from '../../../utils/Common/storage';
import { useNavigate } from 'react-router-dom';

const initial = {
    username: '',
    password: ''
}

const useLoginController = () => {

    const navigate = useNavigate()

    const [submit, { data, isLoading, isSuccess }] = useLoginMutation()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues: initial, resolver: yupResolver(loginValidation) });

    useEffect(() => {
        if (isSuccess) {
            insertData(data?.token, "access_token")
            navigate("/home")
        }
    }, [isSuccess, data])

    const onSubmit = (data: unknown) => {
        submit(data)
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
