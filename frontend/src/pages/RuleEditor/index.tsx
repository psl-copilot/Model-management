import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CodeIcon from '@mui/icons-material/Code';
import { Box } from "@mui/material";
import Button from "../../components/Button";
import { Text } from "../../components/Text";
import BoxWrapper from "../../components/Wrappers/BoxWrapper";
import useRuleEditorController from './useRuleEditorController';
import Tabs from '../../components/Tabs';
import SuspenseLoader from '../../components/SuspenseLoader';

const RuleEditor = () => {

    const { values, functions } = useRuleEditorController()

    if (values?.isLoading) {
        return <SuspenseLoader />
    }

    return (
        <BoxWrapper>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} gap={1}>
                    <CodeIcon sx={{ color: '#4789f6', fontSize: '30px' }} />
                    <Text weight={'bold'} color="black" size={'header'}>Rule Editor</Text>
                </Box>
                <Button Icon={AccountTreeIcon} height="40px" type="secondary" size="md" text="Submit For Review" onClick={functions.handleSubmit} />
            </Box>

            <Tabs tabs={values.tabs} selected={values.selected} setSelected={functions.setSelected} />


            {functions.renderComponent()}
        </BoxWrapper>
    )
}

export default RuleEditor
