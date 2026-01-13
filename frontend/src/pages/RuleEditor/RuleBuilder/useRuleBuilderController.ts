import { useNavigate } from "react-router-dom";

export interface IRuleBuilder {
    setSelected: (selected: string) => void,
    data?: Record<string, unknown> | undefined
}

const useRuleBuilderController = (props: IRuleBuilder) => {

    const { data } = props

    const navigate = useNavigate()

    const handleBuilder = () => {
        navigate(`/rule-builder/${data?.id}`)
    }

    return {
        values: {},
        functions: {
            handleBuilder
        }
    }
}

export default useRuleBuilderController;
