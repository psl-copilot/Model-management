import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { Box, Paper } from "@mui/material";
import Grid from '@mui/material/Grid';
import { memo } from "react";
import { Controller } from "react-hook-form";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import { Text } from "../../../../components/Text";
import useApprovalController, { type IApproval } from "./useApprovalController";


const Approval = (props: IApproval) => {

    const { values, functions } = useApprovalController(props)
    const { isApproved, isReviewed, type, control, errors, isLoading, header, message, btnTitle } = values

    return (
        <Grid container spacing={2}>
            <Box width={'100%'}>
                <Text size="body">{header}</Text>
            </Box>
            <Paper
                variant="outlined"
                sx={{
                    width: '100%',
                    borderRadius: 2,
                    p: 1,
                    bgcolor: isApproved ? "#edf7ed" : isReviewed ? '#dceeff' : "#fef2f2",
                    borderColor: isApproved ? "success.main" : isReviewed ? "static.secondary" : "error.main",
                    display: 'flex',
                    gap: 1
                }}
            >
                <WarningRoundedIcon sx={{ color: '#ffba57' }} />
                <Text size="sub" color={isApproved ? "text.black" : isReviewed ? "static.secondary" : "error"}>{message}</Text>
            </Paper>

            {type !== 'review' && (
                <Grid container size={12}>
                    <Controller
                        name="comments"
                        control={control}
                        rules={!isApproved && !isReviewed ? { required: "Comment is required" } : undefined}
                        render={({ field }) => (
                            <Input
                                maxWidth={'100%'}
                                type='textarea'
                                required
                                rows={3}
                                label="Comments"
                                {...field}
                                error={errors.comments?.message}
                            />
                        )}
                    />
                </Grid>
            )}
            <Box width={'100%'} gap={2} display={'flex'} justifyContent={'flex-end'}>
                <Button height="35px" text="Cancel" size="sm" onClick={functions.close} type="muted" />
                <Button
                    height="35px"
                    type={isApproved ? 'primary' : isReviewed ? "secondary" : "danger"}
                    text={btnTitle}
                    onClick={functions.handleSubmit}
                    size="md"
                    loading={isLoading}
                />
            </Box>
        </Grid>
    )
}


export default memo(Approval);