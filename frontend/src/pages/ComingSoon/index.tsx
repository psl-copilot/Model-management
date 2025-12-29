import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { NAV_HEIGHT } from "../../utils/Constants";
import Sidebar from "../../layout/Sidebar";
import Header from "../../layout/Header";

const ComingSoon = () => {
    const [expanded, setExpanded] = useState(false);
    const SIDEBAR_WIDTH = expanded ? 260 : 60;

    return (
        <Box display="flex" height="100vh">
            <Sidebar expanded={expanded} setExpanded={setExpanded} />

            <Box flex={1} display="flex" flexDirection="column">

                <Box
                    height={`${NAV_HEIGHT}px`}
                    sx={{
                        backgroundColor: "#ffffff",
                        boxShadow: 1,
                        borderBottom: 1,
                        borderColor: "#e2e4e8",
                        marginLeft: `${SIDEBAR_WIDTH}px`,
                        transition: "margin-left 0.2s ease",
                        zIndex: 5,
                    }}
                >
                    <Header />
                </Box>

                <Box
                    component="main"
                    flex={1}
                    p={2}
                    bgcolor="#f9fafb"
                    sx={{
                        marginLeft: `${SIDEBAR_WIDTH}px`,
                        transition: "margin-left 0.2s ease",
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default ComingSoon;
