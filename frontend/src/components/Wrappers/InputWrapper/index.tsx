import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { memo, type ReactNode, useState } from 'react';
import { hideValue } from '../../../utils/Common/helpers';

interface InputWrapperProps {
    label?: string;
    value?: string | number;
    type?: 'text' | 'password' | 'textarea' | 'time';
    error?: string;
    view_only?: boolean;
    disabled?: boolean;
    mode?: string;
    country?: string;
    children: ReactNode;
}

const InputWrapper = ({
    value,
    type = 'text',
    error,
    view_only = false,
    disabled = false,
    children,
}: InputWrapperProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Box width="100%" mb={3}>

            {view_only ? (
                <Box display="flex" alignItems="center" mt={0.5} px={1}>
                    <Typography variant="body2" color="text.primary">
                        {type === 'password' && !showPassword && value
                            ? hideValue(value.toString())
                            : value || '-'}
                    </Typography>
                    {type === 'password' && value && (
                        <IconButton
                            onClick={() => !disabled && setShowPassword((prev) => !prev)}
                            size="small"
                            disabled={disabled}
                            sx={{ ml: 1 }}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {!showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                    )}
                </Box>
            ) : (
                <>
                    <Paper
                        sx={{
                            mt: 0.5,
                            display: 'flex',
                            alignItems: 'flex-start',
                            backgroundColor: disabled ? 'grey.100' : 'background.paper',
                            borderColor: disabled ? 'grey.200' : 'grey.300',
                            borderRadius: 1,
                            cursor: disabled ? 'not-allowed' : 'text',
                        }}
                    >
                        {children}
                    </Paper>
                    {error && (
                        <Typography color="error" variant="body2" mt={0.5} px={1}>
                            {error}
                        </Typography>
                    )}
                </>
            )}
        </Box>
    );
};

export default memo(InputWrapper);
