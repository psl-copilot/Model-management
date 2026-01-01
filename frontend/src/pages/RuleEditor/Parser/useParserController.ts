import { useForm } from "react-hook-form";

const transactions = [
    { label: 'pacs008', value: 'pacs008' }
]

const useParserController = (props: Record<string, unknown> | undefined) => {

    const data = props?.data as Record<string, unknown> | undefined

    const initial = {
        payload: (data?.payload as string) || "",
    }

    const { handleSubmit, formState: { errors }, control } = useForm({ defaultValues: initial })

    const onSubmit = () => {

    }


    return {
        values: {
            control,
            errors,
            transactions
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
        }
    }
}

export default useParserController;
