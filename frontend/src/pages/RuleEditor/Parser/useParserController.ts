import { useForm } from "react-hook-form";
import { useParsePayloadMutation } from "../../../redux/Api/Parse";
import { useLazyGetSamplePayloadQuery } from "../../../redux/Api/Config";
import { useEffect, useState } from "react";
import type { IResult } from "../../../utils/Common/types";


export interface IParseProps {
    setSelected: (selected: string) => void,
    data?: Record<string, unknown> | undefined
}

const useParserController = (props: IParseProps) => {

    const { data } = props

    const [submit, { data: parseBody, isLoading, isSuccess }] = useParsePayloadMutation()
    const [getPayload] = useLazyGetSamplePayloadQuery()
    const [result, setResult] = useState<IResult | null>(null)

    const initial = {
        payload: (data?.payload as string) || "",
    }

    const { handleSubmit, control, watch, setValue } = useForm({ defaultValues: initial })
    // eslint-disable-next-line react-hooks/incompatible-library
    const json = watch('payload')

    const onSubmit = () => {
        submit(JSON.parse(json)).unwrap()
    }

    useEffect(() => {
        if (isSuccess) {
            setResult(parseBody)
        }
    }, [isSuccess, parseBody])


    const handleSimulation = () => {
        getPayload({ type: 'pain.001.001.11 ' }).then((res) => {
            if (res) {
                setValue('payload', JSON.stringify(res))
            }
        })
    }

    return {
        values: {
            control,
            json,
            result,
            isLoading
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
            handleSimulation
        }
    }
}

export default useParserController;
