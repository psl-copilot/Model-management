import { Grid } from "@mui/material"
import Button from "../../../components/Button"
import useRuleBuilderController, { type IRuleBuilder } from "./useRuleBuilderController"

const RuleBuilder = (props: IRuleBuilder) => {

    const { functions } = useRuleBuilderController(props);

    return (
        <Grid
            container
            py={3}
            display={'flex'}
            justifyContent={'center'}
        >
            <Button
                height="40px"
                width="170px"
                type="secondary"
                size="md"
                text="Open Rule Builder"
                onClick={functions.handleBuilder}
            />
        </Grid>
    )
}

export default RuleBuilder
