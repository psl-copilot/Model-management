import { useNavigate } from "react-router-dom";

const useRuleBuilderController = () => {

    const navigate = useNavigate()

    const handleBuilder = () => {
        navigate('/rule-builder/1')
    }

    return {
        values: {},
        functions: {
            handleBuilder
        }
    }
}

export default useRuleBuilderController;
