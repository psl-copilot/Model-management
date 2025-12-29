import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Box, IconButton, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Text } from '../../components/Text';
import { resetData } from "../../utils/Common/storage";

const Header = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        resetData();
        navigate("/login");
    };

    const iconButtonStyle = {
        width: 40,
        height: 40,
        "&:hover": {
            bgcolor: "#f3f4f6",
        },
    };

    const iconStyle = {
        color: "#1f2937",
        width: 20,
        height: 20,
    };

    return (
        <Box
            display="flex"
            height={'100%'}
        >
            <Box display="flex" alignItems="center" width="calc(100vw - 65px)">

                <Box flex={1} display="flex" justifyContent="start" pl={2}>
                    <Text
                        size='subHeader'
                    >
                        Home
                    </Text>
                </Box>

                <Stack direction="row" spacing={1}>
                    <IconButton sx={iconButtonStyle}>
                        <NotificationsNoneIcon style={iconStyle} />
                    </IconButton>
                    <IconButton sx={iconButtonStyle} onClick={handleLogout}>
                        <LogoutIcon style={iconStyle} />
                    </IconButton>
                </Stack>
            </Box>
        </Box>
    );
};

export default Header;
