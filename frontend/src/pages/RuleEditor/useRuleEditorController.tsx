import { useCallback, useState } from "react"
import Overview from "./Overview"
import Parser from "./Parser"

const Tabs = [
    {
        label: 'Overview',
        value: 'overview'
    },
    {
        label: 'Parser',
        value: 'parser'
    },
    {
        label: 'Rule Builder',
        value: 'rule_builder'
    },
    {
        label: 'Validation',
        value: 'validation'
    },
    {
        label: 'Generate Test Cases',
        value: 'test_cases'
    },
    {
        label: 'Simulation',
        value: 'simulation'
    },
    {
        label: 'Documentation',
        value: 'documentation'
    },
    {
        label: 'History',
        value: 'History'
    },
]

const useRuleEditorController = () => {

    const [selected, setSelected] = useState(Tabs[0].value)

    const handleSubmit = () => {

    }

    const renderComponent = useCallback(() => {
        switch (selected) {
            case 'overview':
                return <Overview />
            case 'parser':
                return <Parser />
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
