import { useCallback, useState } from "react"
import Overview from "./Overview"
import Parser from "./Parser"
import { Tabs } from "../../utils/Constants/data"
import { useLocation } from "react-router-dom"
import { useGetRuleByIdQuery } from "../../redux/Api/Rules"



const useRuleEditorController = () => {

    const [selected, setSelected] = useState(Tabs[0].value)

    const { state } = useLocation();
    const id = state?.id ?? null;

    const { data, isLoading } = useGetRuleByIdQuery({ id }, { skip: !id })

    const handleSubmit = () => {

    }

    const renderComponent = useCallback(() => {
        switch (selected) {
            case 'overview':
                return <Overview data={data} setSelected={setSelected} />
            case 'parser':
                return <Parser data={data} setSelected={setSelected} />
            default:
                return null;
        }
    }, [selected])

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
