import { useCallback, useState } from "react"
import Overview from "./Overview"
import Parser from "./Parser"
import { Tabs } from "../../utils/Constants/data"



const useRuleEditorController = () => {

    const [selected, setSelected] = useState(Tabs[0].value)

    const handleSubmit = () => {

    }

    const renderComponent = useCallback(() => {
        switch (selected) {
            case 'overview':
                return <Overview setSelected={setSelected}  />
            case 'parser':
                return <Parser setSelected={setSelected} />
            default:
                return null;
        }
    }, [selected])

    return {
        values: {
            tabs: Tabs,
            selected
        },
        functions: {
            setSelected,
            handleSubmit,
            renderComponent
        }
    }
}

export default useRuleEditorController
