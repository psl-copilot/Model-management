import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton } from "@mui/material";
import logo from "../../assets/logo.png";
import { Text } from '../../components/Text';

const Header = ({ expanded, setExpanded }: { expanded: boolean; setExpanded: (v: boolean) => void }) => {

    const iconButtonStyle = {
        width: '25px',
        height: '25px',
        "&:hover": {
            bgcolor: "#f3f4f6",
        },
    };
    return (
        <Box
            display="flex"
            height={'100%'}
            px={3}
        >
            <Box display="flex" alignItems="center" width="100vw">
                <Box flex={1} display={'flex'} alignItems={'center'}>
                    <IconButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? (
                            <CloseIcon fontSize="small" sx={iconButtonStyle} />
                        ) : (
                            <MenuIcon fontSize="small" sx={iconButtonStyle} />
                        )}
                    </IconButton>
                    <Box
                        component="img"
                        src={logo}
                        alt="Logo"
                        sx={{
                            width: '32px',
                            height: '32px',
                            mx: 2,
                            maxWidth: "100%",
                        }}
                    />
                    <Text color="text.black" weight="bold" size="subHeader">
                        Tazama Rule Studio
                    </Text>
                </Box>

                {/* <Stack direction="row" spacing={1}>
                    <IconButton sx={iconButtonStyle}>
                        <NotificationsNoneIcon style={iconStyle} />
                    </IconButton>
                    <IconButton sx={iconButtonStyle} onClick={handleLogout}>
                        <LogoutIcon style={iconStyle} />
                    </IconButton>
                </Stack> */}
            </Box>
        </Box>
    );
};

export default Header;
