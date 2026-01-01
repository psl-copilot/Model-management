import Grid from '@mui/material/Grid';
import useRuleConfigController, { type RuleConfigProps } from "./useRuleConfigController";

const RuleConfig = (props: RuleConfigProps) => {

    const { values } = useRuleConfigController(props)
    return (
        <Grid container spacing={2}>
        </Grid>
    )
}

export default RuleConfig
