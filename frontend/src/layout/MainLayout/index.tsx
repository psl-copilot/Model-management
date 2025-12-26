import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { NAV_HEIGHT } from "../../utils/Constants";
const MainLayout = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Box height="100vh" display="flex" flexDirection="column">
            <Sidebar expanded={expanded} setExpanded={setExpanded} />
            <Box flex={1} overflow="hidden" >
                <Paper
                    sx={{
                        backgroundColor: "#ffffff",
                        zIndex: 5,
                        alignSelf: 'flex-end',
                        alignItems: 'flex-end',
                        height: NAV_HEIGHT,
                        boxShadow: 1,
                        marginLeft: expanded ? "260px" : "60px",
                        borderBottom: 1,
                        borderColor: '#e2e4e8'
                    }}
                >
                    <Header />
                </Paper>

                <Box
                    component="main"
                    flex={1}
                    p={2}
                    bgcolor="#f9fafb"
                    overflow="auto"
                    height={'80vh'}
                    sx={{
                        transition: "margin-left 0.2s ease",
                        marginLeft: expanded ? "260px" : "60px",
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
