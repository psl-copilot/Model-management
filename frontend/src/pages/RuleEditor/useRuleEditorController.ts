import { useState } from "react"

const Tabs = [
    {
        label: 'Overview',
        value: 'overview'
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

    return {
        values: {
            tabs: Tabs,
            selected
        },
        functions: {
            setSelected,
            handleSubmit
        }
    }
}

export default useRuleEditorController
