import { memo } from "react";
import Grid from '@mui/material/Grid';
import Input from "../../Input";
import { Box, Paper } from "@mui/material";
import { Text } from "../../Text";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

interface IApproval {
    type: 'approve' | 'reject',
}

const Approval = (props: IApproval) => {

    const { type } = props

    const isApproved = type === 'approve'

    const message = isApproved ? 'Important: This will approve the rule and move it to the next stage in the workflow.' : ' Important: This will reject the rule and send it back to the maker for revisions.'

    return (
        <Grid container spacing={2}>
            <Box width={'100%'}>
                <Text size="body">Are you sure you want to {isApproved ? 'approve' : 'reject'} this rule?</Text>
            </Box>
            <Paper
                variant="outlined"
                sx={{
                    width: '100%',
                    borderRadius: 2,
                    p: 1,
                    bgcolor: isApproved ? "#edf7ed" : "#fef2f2",
                    borderColor: isApproved ? "success.main" : "error.main",
                    display: 'flex',
                    gap: 1
                }}
            >
                <WarningRoundedIcon sx={{ color: '#ffba57' }} />
                <Text size="sub" color={isApproved ? "text.black" : "error"}>{message}</Text>
            </Paper>
            <Grid container size={12} >
                <Input
                    maxWidth={'100%'}
                    type='textarea'
                    rows={3}
                    label="Comments"
                    disabled
                    view_only={false} />
            </Grid>
        </Grid >
    )
}


export default memo(Approval);