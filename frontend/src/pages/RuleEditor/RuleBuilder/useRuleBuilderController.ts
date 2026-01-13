import { useNavigate } from "react-router-dom";
import { extractData } from "../../../utils/Common/storage";
import { LocalStorage } from "../../../utils/Common/enums";

export interface IRuleBuilder {
    setSelected: (selected: string) => void,
    data?: Record<string, unknown> | undefined
}

const useRuleBuilderController = (props: IRuleBuilder) => {

    const data = extractData('trs_rule', LocalStorage, true) ?? props?.data

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
