import { Box, Grid } from "@mui/material"
import Button from "../../../components/Button"
import useSimulationController, { type ISimulation } from "./useSimulationController";
import CheckIcon from '@mui/icons-material/Check';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

const Simulation = (props: ISimulation) => {

    const { functions } = useSimulationController(props);

    return (
        <Grid
            container
            py={3}
            display={'flex'}
            justifyContent={'center'}
        >
            <Box mt={2} width={'100%'} gap={2} display={'flex'} justifyContent={'flex-end'}>
                <Button
                    height="40px"
                    width="170px"
                    size="md"
                    type="danger"
                    Icon={ClearRoundedIcon}
                    onClick={() => functions.handleApproval('reject')}
                    text="Reject"
                />
                <Button
                    height="40px"
                    width="170px"
                    size="md"
                    Icon={CheckIcon}
                    onClick={() => functions.handleApproval('approve')}
                    text="Approve"
                />
            </Box>
        </Grid>
    )
}

export default Simulation
