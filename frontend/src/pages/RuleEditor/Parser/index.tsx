import Grid from "@mui/material/Grid";
import { Controller } from "react-hook-form";
import Input from "../../../components/Input";
import { Text } from "../../../components/Text";
import Section from "../../../components/Wrappers/Section";
import useParserController from "./useParserController";

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
                <Grid container size={12} alignItems={'flex-end'} justifyContent={'space-between'}>
                    <Controller
                        name="payload"
                        control={values.control}
                        render={({ field, fieldState: { error } }) => (
                            <Input
                                type="textarea"
                                maxWidth={'45%'}
                                required
                                rows={12}
                                label="JSON Payload"
                                {...field}
                                error={error?.message}
                            />
                        )}
                    />
                </Grid>
            </Section>
        </Grid>
    )
}

export default Parser;
