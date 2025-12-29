import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
    IconButton,
    InputAdornment,
    TextField,
    styled
} from '@mui/material';
import { forwardRef, memo, useState, type ForwardedRef } from 'react';
import InputWrapper from '../Wrappers/InputWrapper';

export interface InputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: 'text' | 'password' | 'textarea';
    icon?: React.ElementType;
    success?: boolean;
    rows?: number;
    error?: string;
    onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    name?: string;
    maxLength?: number;
    disabled?: boolean;
    required?: boolean;
    leftIcon?: React.ElementType;
    height?: 'md' | 'sm';
    maxWidth?: string | number
}

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-input': {
        boxSizing: 'border-box',
    },
    '& .MuiInputBase-input.Mui-disabled': {
        color: theme.palette.text.disabled,
    },
    '& .MuiInputBase-input::placeholder': {
        color: theme.palette.text.ternary,
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.text.disabled,
    },
}));

const heightMap = {
    md: 50,
    sm: 45,
};

const Input = forwardRef(function Input(
    {
        label,
        placeholder,
        value,
        onChange,
        type = 'text',
        rows = 4,
        onBlur,
        name,
        maxLength,
        disabled = false,
        leftIcon: LeftIcon,
        error,
        height = 'md',
        maxWidth
    }: InputProps,
    ref: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
) {
    const [showPassword, setShowPassword] = useState(false);

    const isTextarea = type === 'textarea';
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <InputWrapper {...{ label, placeholder, value, onChange, type, disabled, error, maxWidth }}>
            <StyledTextField
                inputRef={ref}
                multiline={isTextarea}
                rows={isTextarea ? rows : undefined}
                placeholder={placeholder ?? (label ? `Enter ${label}` : '')}
                value={value}
                onChange={onChange}
                error={!!error}
                onBlur={onBlur}
                required
                label={label}
                variant='outlined'
                fullWidth
                id="outlined-required"
                name={name}
                disabled={disabled}
                type={inputType}
                inputProps={{ maxLength }}
                sx={{
                    '& .MuiInputBase-root': {
                        maxHeight: isTextarea ? 120 : heightMap[height],
                        height: isTextarea ? 'auto' : heightMap[height],
                    },
                }}
                slotProps={{
                    input: {
                        endAdornment: isPassword ? (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    edge="end"
                                    disabled={disabled}
                                    onClick={() =>
                                        !disabled && setShowPassword((prev) => !prev)
                                    }
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    {showPassword ? (
                                        <VisibilityIcon fontSize="small" />
                                    ) : (
                                        <VisibilityOffIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ) : undefined,
                        startAdornment: LeftIcon ? (
                            <InputAdornment position="start">
                                <LeftIcon fontSize="small" />
                            </InputAdornment>
                        ) : undefined,
                    },
                }}
            />
        </InputWrapper>
    );
});

export default memo(Input);
