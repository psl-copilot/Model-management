import { memo } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type TableActionsProps = {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onClone?: () => void;
    onToggleStatus?: () => void;
    active?: boolean;
    children?: React.ReactNode;
};

const TableActions = ({
    onView,
    onEdit,
    onDelete,
    onClone,
    onToggleStatus,
    active = false,
    children,
}: TableActionsProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
            }}
        >
            {onView && (
                <Tooltip title="View">
                    <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={onView}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}

            {onEdit && (
                <Tooltip title="Edit">
                    <IconButton size="small" sx={{ color: '#d08700' }} onClick={onEdit}>
                        <EditSquareIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}

            {onClone && (
                <Tooltip title="Clone">
                    <IconButton size="small" sx={{ color: '#21a0c1' }} onClick={onEdit}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}

            {onToggleStatus && (
                <Tooltip title={active ? "Mark Inactive" : "Mark Active"}>
                    <IconButton
                        size="small"
                        color={active ? "inherit" : "success"}
                        onClick={onToggleStatus}
                    >
                        {active ? (
                            <BlockIcon fontSize="small" />
                        ) : (
                            <CheckCircleIcon fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>
            )}

            {children}

            {onDelete && (
                <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={onDelete}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

export default memo(TableActions);
