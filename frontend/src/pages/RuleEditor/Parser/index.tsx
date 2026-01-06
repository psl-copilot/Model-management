import Grid from "@mui/material/Grid";
import { Controller } from "react-hook-form";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import FormattedJsonSection from "../../../components/JsonFormatter";
import { Text } from "../../../components/Text";
import Section from "../../../components/Wrappers/Section";
import useParserController from "./useParserController";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SimulationResultCard from "../../../components/Cards/SimulationResult";

const Parser = (props: Record<string, unknown> | undefined) => {

    const { values, functions } = useParserController(props)

    return (
        <Grid
            container
            py={3}
        >
            <Grid size={12} >
                <Text weight={'bold'} color="black" size={'header'}>Payload Parser</Text>
            </Grid>
            <Grid size={12} >
                <Text color="text.ternary" size={'body'}>Parse and Extract Variables from Sample Payload</Text>
            </Grid>

            <Section header={'Payload Schema Definition'} subHeader={'Define the transaction payload structure to extract variables for rule building'}>
                <Grid size={12} display={'flex'} justifyContent={'flex-end'} width={'100%'}>
                    <Button
                        height="30px"
                        width="170px"
                        type="secondary"
                        size="md"
                        text="Fetch Json"
                        Icon={FileUploadIcon}
                        onClick={functions.handleSimulation}
                    />
                </Grid>
                <Grid container size={12} spacing={2} alignItems={'flex-start'}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="payload"
                            control={values.control}
                            render={({ field, fieldState: { error } }) => (
                                <Input
                                    type="textarea"
                                    maxWidth={'100%'}
                                    required
                                    rows={12}
                                    label="JSON Payload"
                                    {...field}
                                    error={error?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} border={1} borderColor={'static.border'} mt={0.4} p={2} overflow={'auto'} borderRadius={1} height={310}>
                        <FormattedJsonSection value={values?.json ?? JSON.stringify({})} />
                    </Grid>
                </Grid>

                {values?.json ?
                    <Button
                        height="40px"
                        type="secondary"
                        size="md"
                        text="Simulate"
                        onClick={functions.handleSimulation}
                    />
                    : null}
                {/* <Grid size={12} width={'100%'}>
                    <SimulationResultCard simulationResult={values?.simulationResultPassed} />
                </Grid> */}
            </Section >
        </Grid >
    )
}

export default Parser;
