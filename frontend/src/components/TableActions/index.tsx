import { memo } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";

type TableActionsProps = {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onToggleStatus?: () => void;
    active?: boolean;
    children?: React.ReactNode;
};

const TableActions = ({
    onView,
    onEdit,
    onDelete,
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
                    <IconButton size="small" color="inherit" onClick={onView}>
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}

            {onEdit && (
                <Tooltip title="Edit">
                    <IconButton size="small" color="warning" onClick={onEdit}>
                        <EditIcon fontSize="small" />
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
