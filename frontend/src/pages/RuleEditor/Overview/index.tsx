import Grid from "@mui/material/Grid";
import { Text } from "../../../components/Text";
import { Controller } from "react-hook-form";
import useOverviewController from "./useOverviewController";
import Input from "../../../components/Input";
import DropDown from "../../../components/DropDown";
import Section from "../../../components/Wrappers/Section";
import Loader from "../../../components/Loader";

const Overview = (props: Record<string, unknown> | undefined) => {

    const { values, functions } = useOverviewController(props)

    if (values?.isLoading) {
        return <Grid
            container
            py={3}
            justifyContent={'center'}
        >
            <Loader />
        </Grid>
    }

    return (
        <Grid
            container
            py={3}
        >
            <Grid size={12} >
                <Text weight={'bold'} color="black" size={'header'}>Rule Overview</Text>
            </Grid>
            <Grid size={12} >
                <Text color="text.ternary" size={'body'}>Basic information about this rule</Text>
            </Grid>

            <Section header={'General Information'}>
                <Controller
                    name="ruleName"
                    control={values.control}
                    render={({ field, fieldState: { error } }) => (
                        <Input
                            required
                            disabled
                            label="Rule Name"
                            {...field}
                            error={error?.message}
                        />
                    )}
                />
                <Controller
                    name="description"
                    control={values.control}
                    render={({ field, fieldState: { error } }) => (
                        <Input
                            maxWidth={'100%'}
                            required
                            type='textarea'
                            label="Description"
                            {...field}
                            error={error?.message}
                        />
                    )}
                />
                <Grid container size={12} spacing={2} alignItems={'flex-end'} justifyContent={'space-between'}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            control={values.control}
                            name="txtp"
                            rules={{ required: "Type is required" }}
                            render={({ field }) => (
                                <DropDown
                                    required
                                    label="Transaction Type"
                                    options={values.transactions}
                                    {...field}
                                    placeholder="Select Transaction type"
                                    error={values.errors.txtp?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="version"
                            control={values.control}
                            render={({ field, fieldState: { error } }) => (
                                <Input
                                    maxWidth={'100%'}
                                    required
                                    label="Version"
                                    {...field}
                                    error={error?.message}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Section>
            <Section header={'Configuration Association'} subHeader={'Associate this rule with transaction flow, network context, and typology definitions'}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                        control={values.control}
                        name="rule_config"
                        rules={{ required: "Rule Config is required" }}
                        render={({ field }) => (
                            <DropDown
                                required
                                label="Rule Config"
                                {...field}
                                onClick={functions.handleRuleConfig}
                                placeholder="Select Rule Config"
                                error={values.errors.rule_config?.message}
                            />
                        )}
                    />
                </Grid>
            </Section>
        </Grid>
    )
}

export default Overview;
