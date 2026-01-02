import { Box, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReactJson from "react-json-view";
import { useCallback } from "react";

const FormattedJsonSection = ({ value, onChange }: any) => {

    const safeJsonParse = useCallback((
        jsonString: string,
    ): { success: boolean; data?: any; error?: string } => {
        try {
            const parsed = JSON.parse(jsonString || '{}');
            return { success: true, data: parsed };
        } catch (error) {
            return { success: false, error: 'Invalid JSON format' };
        }
    }, [value])

    const parseResult = safeJsonParse(value);

    if (parseResult.success && parseResult.data) {
        return (
            <Box sx={{ fontSize: 13 }}>
                <ReactJson
                    src={parseResult.data}
                    onEdit={(e) =>
                        onChange(JSON.stringify(e.updated_src, null, 2))
                    }
                    onAdd={(e) =>
                        onChange(JSON.stringify(e.updated_src, null, 2))
                    }
                    onDelete={(e) =>
                        onChange(JSON.stringify(e.updated_src, null, 2))
                    }
                    theme="rjv-default"
                    name={false}
                    displayDataTypes={false}
                    displayObjectSize
                    // enableClipboard
                    collapsed={false}
                />
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            color="text.secondary"
            textAlign="center"
        >
            <Box>
                <ErrorOutlineIcon
                    color="disabled"
                    sx={{ fontSize: 48, mb: 1 }}
                />

                <Typography variant="body2">
                    Invalid JSON format
                </Typography>

                <Typography variant="caption" display="block" mt={0.5}>
                    Enter valid JSON to see preview
                </Typography>
            </Box>
        </Box>
    );
};

export default FormattedJsonSection;
