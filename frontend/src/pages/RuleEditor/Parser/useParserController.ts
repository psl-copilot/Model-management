import { useForm } from "react-hook-form";
import { useParsePayloadMutation } from "../../../redux/Api/Parse";
import { useLazyGetSamplePayloadQuery } from "../../../redux/Api/Config";
import { useEffect, useState } from "react";
import type { IResult } from "../../../utils/Common/types";
import { extractData } from "../../../utils/Common/storage";
import { LocalStorage } from "../../../utils/Common/enums";


export interface IParseProps {
    setSelected: (selected: string) => void,
    data?: Record<string, unknown> | undefined
}

const useParserController = () => {

    const data = extractData('trs_rule', LocalStorage, true)

    const [submit, { data: parseBody, isLoading, isSuccess }] = useParsePayloadMutation()
    const [getPayload, { isLoading: sampleLoader }] = useLazyGetSamplePayloadQuery()
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


    const fetchJson = () => {
        getPayload({ type: data?.txtp }).unwrap().then((res) => {
            if (res) {
                setValue('payload', JSON.stringify(res, null, 4))
            }
        })
    }

    return {
        values: {
            control,
            json,
            result,
            isLoading,
            sampleLoader
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
            fetchJson
        }
    }
}

export default useParserController;
