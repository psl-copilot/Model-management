import { useForm } from "react-hook-form";

const transactions = [
    { label: 'pacs008', value: 'pacs008' }
]


const simulationResultPassed = {
    status: "PASSED",
    summary: {
        passedStages: 5,
        totalStages: 5,
        failedStages: 0,
        mappingsApplied: 12,
    },
    stages: [
        { name: "Schema Validation", status: "PASSED" },
        { name: "Required Fields Check", status: "PASSED" },
        { name: "Type Validation", status: "PASSED" },
        { name: "Transformation Rules", status: "PASSED" },
        { name: "Output Mapping", status: "PASSED" },
    ],
};



const useParserController = (props: Record<string, unknown> | undefined) => {

    const data = props?.data as Record<string, unknown> | undefined
    
    const initial = {
        payload: (data?.payload as string) || "",
    }

    const { handleSubmit, formState: { errors }, control, watch } = useForm({ defaultValues: initial })

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
            simulationResultPassed
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
            handleSimulation
        }
    }
}

export default useParserController;
