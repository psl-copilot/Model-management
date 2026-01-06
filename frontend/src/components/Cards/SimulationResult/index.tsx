import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
    Box,
    Paper,
    Stack,
    Typography
} from "@mui/material";

interface SimulationResult {
    status: "PASSED" | "FAILED";
    summary?: {
        passedStages?: number;
        totalStages?: number;
        failedStages?: number;
        mappingsApplied?: number;
    };
    stages?: {
        name: string;
        status: "PASSED" | "FAILED" | "WARNING";
    }[];
    errors?: {
        field: string;
        message: string;
        path?: string;
    }[];
}

const SimulationResultCard = ({
    simulationResult,
}: {
    simulationResult: SimulationResult;
}) => {
    const isPassed = simulationResult.status === "PASSED";

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isPassed ? 'rgba(76, 175, 80,0.1)' : "rgba(254, 242, 242)",
                borderColor: isPassed ? "success.main" : "error.main",
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                {isPassed ? (
                    <CheckCircleIcon color="success" />
                ) : (
                    <CancelIcon color="error" />
                )}

                <Typography
                    fontWeight={500}
                    color={isPassed ? "success.dark" : "error.dark"}
                >
                    {isPassed ? "Simulation Passed" : "Simulation Failed"}
                </Typography>
            </Stack>

            <Stack spacing={1} mt={2}>
                <SummaryRow
                    label="Stages Passed"
                    value={`${simulationResult.summary?.passedStages || 0} / ${simulationResult.summary?.totalStages || 0
                        }`}
                />
                <SummaryRow
                    label="Stages Failed"
                    value={simulationResult.summary?.failedStages || 0}
                />
                <SummaryRow
                    label="Mappings Applied"
                    value={simulationResult.summary?.mappingsApplied || 0}
                />
            </Stack>

            {/* ---------- Stages ---------- */}
            {simulationResult.stages?.length ? (
                <Box mt={2}>
                    <Typography fontSize={14} fontWeight={500} color="text.secondary">
                        Validation Stages:
                    </Typography>

                    <Stack spacing={1} mt={1}>
                        {simulationResult.stages.map((stage, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: "grey.100",
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography fontSize={13} fontWeight={500}>
                                    {stage.name}
                                </Typography>

                                <Typography
                                    fontSize={13}
                                    fontWeight={500}
                                    color={
                                        stage.status === "PASSED"
                                            ? "success.main"
                                            : stage.status === "FAILED"
                                                ? "error.main"
                                                : "warning.main"
                                    }
                                >
                                    {stage.status}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            ) : null}

            {(simulationResult.errors?.length || 0) > 0 && (
                <Box mt={2}>
                    <Typography
                        fontSize={14}
                        fontWeight={500}
                        color="error.dark"
                        mb={1}
                    >
                        Errors:
                    </Typography>

                    <Stack spacing={1}>
                        {simulationResult.errors?.map((error, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: "error.light",
                                }}
                            >
                                <Typography fontSize={13} fontWeight={500} color="error.main">
                                    {error.field}
                                </Typography>

                                <Typography fontSize={13} color="error.main">
                                    {error.message}
                                </Typography>

                                {error.path && (
                                    <Typography fontSize={11} color="error.dark">
                                        Path: {error.path}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}
        </Paper>
    );
};

const SummaryRow = ({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) => (
    <Stack direction="row" justifyContent="space-between">
        <Typography fontSize={13}>{label}:</Typography>
        <Typography fontSize={13} fontWeight={500} color="text.primary">
            {value}
        </Typography>
    </Stack>
);

export default SimulationResultCard;
