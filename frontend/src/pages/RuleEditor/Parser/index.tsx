import Grid from "@mui/material/Grid";
import { Controller } from "react-hook-form";
import Input from "../../../components/Input";
import { Text } from "../../../components/Text";
import Section from "../../../components/Wrappers/Section";
import useParserController from "./useParserController";
import { Box } from "@mui/material";
import FormattedJsonSection from "../../../components/JsonFormatter";

const Parser = (props: Record<string, unknown> | undefined) => {

    const { values } = useParserController(props)

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

            <Section header={'Payload Schema Definition'} subHeader={'Define the transaction payload structure to extract variables for rule building   '}>
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
                    <Grid size={{ xs: 12, md: 6 }} border={1} borderColor={'static.border'} mt={0.4} p={2} borderRadius={1} minHeight={310}>
                        <FormattedJsonSection value={values?.json ?? JSON.stringify({})} />
                    </Grid>
                </Grid>
            </Section >
        </Grid >
    )
}

export default Parser;
