import { Box, styled } from "@mui/material";

export const SidebarContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== "expanded"
})<{ expanded: boolean }>(({ expanded }) => ({
    position: "fixed",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1000,
    width: expanded ? "260px" : "65px",
    backgroundColor: "#111827",
    borderRight: "1px solid #f0f0f0",
    transition: "all 0.2s",
}));

export const LogoBox = styled(Box)({
    paddingTop: "24px",
    paddingBottom: "24px",
    height: "25px",
});

export const ToggleButtonWrapper = styled(Box)({
    position: "absolute",
    right: "-10px",
    top: "50px",
    width: "25px",
    height: "25px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    boxShadow: "1px 1px 3px rgba(0,0,0,0.2)",
});

export const MenuItemBox = styled(Box, {
    shouldForwardProp: (prop) => prop !== "active" && prop !== "expanded"
})<{ active?: boolean; expanded?: boolean }>(({ theme, active, expanded }) => ({
    display: "flex",
    alignItems: "center",
    height: 48,
    width: expanded ? "90%" : "60%",
    cursor: "pointer",
    padding: "0 8px",
    justifyContent: expanded ? undefined : 'center',
    backgroundColor: active ? theme.palette.text.primary : "transparent",
    borderLeft: active ? "5px solid #3b82f6" : "0",
    transition: "all 0.2s",
}));

export const IconWrapper = styled(Box)({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 56,
    color: "#fff",
});