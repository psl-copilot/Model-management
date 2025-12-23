import React, { memo } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type ButtonProps = {
  onClick?: () => void;
  Icon?: React.ElementType;
  disabled?: boolean;
  text?: string;
  type?: "primary" | "secondary" | "muted" | "danger" | "success" | "default";
  outlined?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg" | "";
};

const MuiButton = ({
  onClick,
  Icon,
  disabled = false,
  text = "Button",
  type = "primary",
  outlined = false,
  loading = false,
  size = "",
}: ButtonProps) => {
  const colors = {
    primary: {
      main: "#51be99",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f3f4f6",
      contrastText: "#394353",
    },
    muted: {
      main: "#e0e0e0",
      contrastText: "#555",
    },
    danger: {
      main: "#d32f2f",
      contrastText: "#fff",
    },
    success: {
      main: "#2e7d32",
      contrastText: "#fff",
    },
    default: {
      main: "#000",
      contrastText: "#fff",
    },
  };

  const widths: Record<string, string> = {
    sm: "120px",
    md: "200px",
    lg: "100%",
    "": "auto",
  };

  const selected = colors[type] || colors.default;

  const onPress = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <Button
      onClick={onPress}
      disabled={disabled || loading}
      variant={outlined ? "outlined" : "contained"}
      startIcon={!loading && Icon ? <Icon /> : undefined}
      sx={{
        height: '50px',
        px: 3,
        borderRadius: "6px",
        width: widths[size] || "auto",
        textTransform: "none",
        fontSize: "1rem",
        gap: 1,
        ...(outlined
          ? {
            color: selected.main,
            borderColor: selected.main,
          }
          : {
            backgroundColor: selected.main,
            color: selected.contrastText,
            "&:hover": {
              backgroundColor: selected.main,
            },
          }),
      }}
    >
      {loading ? (
        <CircularProgress
          size={18}
          sx={{
            color: outlined ? selected.main : selected.contrastText,
          }}
        />
      ) : (
        text
      )}
    </Button>
  );
};

export default memo(MuiButton);
