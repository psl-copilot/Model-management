import { useCallback, useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useGetRuleByIdQuery } from "../../redux/Api/Rules"
import { Tabs } from "../../utils/Constants/data"
import Overview from "./Overview"
import Parser from "./Parser"
import RuleBuilder from "./RuleBuilder"

const useRuleEditorController = () => {

    const [selected, setSelected] = useState<string>(Tabs[0].value)

    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab') ?? Tabs[0].value;
    const mode = searchParams.get('mode') ?? null

    const { data, isLoading } = useGetRuleByIdQuery({ id }, { skip: !id, refetchOnMountOrArgChange: true })

    const handleSubmit = () => {

    }

    useEffect(() => {
        setSelected(tab)
    }, [tab])

    const renderComponent = useCallback(() => {
        switch (selected) {
            case 'overview':
                return <Overview mode={mode} data={data?.rules} setSelected={setSelected} />
            case 'parser':
                return <Parser data={data?.rules} setSelected={setSelected} />
            case 'rule_builder':
                return <RuleBuilder data={data?.rules} setSelected={setSelected} />
            default:
                return null;
        }
    }, [selected, data])

    return {
        values: {
            tabs: Tabs,
            selected,
            isLoading
        },
        functions: {
            setSelected,
            handleSubmit,
            renderComponent
        }
    }
}

export default useRuleEditorController
