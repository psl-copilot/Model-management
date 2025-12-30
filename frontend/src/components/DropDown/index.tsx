import {
    Box,
    Typography,
    Paper,
    IconButton,
    InputBase,
    List,
    ListItemButton,
    ListItemText,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import { memo, useEffect, useRef, useState } from 'react';
import useDebouncedSearch from '../../hooks/useDebouncedSearch';

export interface DropdownOption {
    label: string;
    value: string | number | null;
}

interface DropdownProps {
    label?: string;
    placeholder?: string;
    options: DropdownOption[];
    value: DropdownOption | DropdownOption[] | null;
    onChange: (value: DropdownOption | DropdownOption[] | null) => void;
    multiple?: boolean;
    required?: boolean;
    error?: string;
    view_only?: boolean;
    disabled?: boolean;
    searchable?: boolean;
    cancelable?: boolean;
    maxWidth?: string | number
}

const Dropdown = ({
    label = 'Select Options',
    placeholder = 'Choose...',
    options,
    value,
    onChange,
    multiple = false,
    required = false,
    error,
    view_only = false,
    disabled = false,
    searchable = false,
    cancelable = false,
    maxWidth = 300
}: DropdownProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [search, debouncedSearch, setSearch] =
        useDebouncedSearch();

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const isSelected = (option: DropdownOption): boolean =>
        multiple
            ? Array.isArray(value) &&
            value.some((v) => v.value === option.value)
            : !Array.isArray(value) && value?.value === option.value;

    const toggleOption = (option: DropdownOption): void => {
        if (disabled) return;

        if (multiple) {
            const current = Array.isArray(value) ? value : [];
            const exists = current.some((v) => v.value === option.value);

            const updated = exists
                ? current.filter((v) => v.value !== option.value)
                : [...current, option];

            onChange(updated);
        } else {
            onChange(option);
            setOpen(false);
        }
    };

    const filteredOptions = options.filter((opt) =>
        searchable
            ? opt.label.toLowerCase().includes(debouncedSearch.toLowerCase())
            : true
    );


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open) setSearch('');
    }, [open, setSearch]);


    return (
        <Box width="100%" maxWidth={maxWidth} ref={dropdownRef} position={'relative'}>
            <Typography textAlign={'left'} variant="body2" mb={0.5} px={1}>
                {label}
                {required && !view_only && (
                    <Typography component="span" color="error">
                        {' '}
                        *
                    </Typography>
                )}
            </Typography>

            {view_only ? (
                <Typography px={1} variant="body2">
                    {multiple
                        ? Array.isArray(value) && value.length
                            ? value.map((v) => v.label).join(', ')
                            : '-'
                        : !Array.isArray(value)
                            ? value?.label ?? '-'
                            : '-'}
                </Typography>
            ) : (
                <>
                    <Paper
                        variant="outlined"
                        onClick={() => !disabled && setOpen((p) => !p)}
                        sx={{
                            minHeight: 20,
                            px: 1.5,
                            py: 1,
                            boxShadow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.6 : 1,
                        }}
                    >
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {multiple ? (
                                Array.isArray(value) && value.length ? (
                                    value.map((v) => (
                                        <Box
                                            key={v.value}
                                            px={1}
                                            borderRadius={1}
                                            bgcolor="text.secondary"
                                            color="#e9e9ed"
                                            fontSize={12}
                                        >
                                            {v.label}
                                        </Box>
                                    ))
                                ) : (
                                    <Typography color="text.primary.main" variant="body2">
                                        {placeholder}
                                    </Typography>
                                )
                            ) : !Array.isArray(value) && value ? (
                                <Typography variant="body2">{value.label}</Typography>
                            ) : (
                                <Typography color="text.primary.main" variant="body2">
                                    {placeholder}
                                </Typography>
                            )}
                        </Box>

                        <Box display="flex" alignItems="center">
                            {cancelable &&
                                ((multiple &&
                                    Array.isArray(value) &&
                                    value.length > 0) ||
                                    (!multiple && value)) && (
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(multiple ? [] : null);
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                )}
                            <KeyboardArrowDownIcon />
                        </Box>
                    </Paper>

                    {open && (
                        <Paper
                            variant="outlined"
                            sx={{
                                maxHeight: 240,
                                overflow: 'hidden',
                                position: 'absolute',
                                width: '100%',
                                zIndex: 10,
                            }}
                        >
                            {searchable && (
                                <Box p={1} borderBottom="1px solid" borderColor="divider">
                                    <InputBase
                                        fullWidth
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </Box>
                            )}

                            <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                {filteredOptions.length === 0 ? (
                                    <Typography
                                        px={2}
                                        py={1}
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        No options found
                                    </Typography>
                                ) : (
                                    filteredOptions.map((opt) => (
                                        <ListItemButton
                                            key={opt.value}
                                            selected={isSelected(opt)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOption(opt);
                                            }}
                                        >
                                            <ListItemText primary={opt.label} />
                                        </ListItemButton>
                                    ))
                                )}
                            </List>
                        </Paper>
                    )}

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

export default memo(Dropdown);
