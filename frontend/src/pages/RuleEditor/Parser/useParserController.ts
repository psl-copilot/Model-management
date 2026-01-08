import { useForm } from "react-hook-form";

const transactions = [
    { label: 'pacs008', value: 'pacs008' }
]


const useParserController = (props: Record<string, unknown> | undefined) => {

    const data = props?.data as Record<string, unknown> | undefined


    const initial = {
        payload: (data?.payload as string) || "",
    }

    const { handleSubmit, formState: { errors }, control, watch } = useForm({ defaultValues: initial })
    // eslint-disable-next-line react-hooks/incompatible-library
    const json = watch('payload')

    const onSubmit = () => {

    }

    const handleSimulation = () => { }

    return {
        values: {
            control,
            errors,
            transactions,
            json,
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
            handleSimulation
        }
    }
}

export default useParserController;
