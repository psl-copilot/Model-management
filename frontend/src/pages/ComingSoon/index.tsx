import { Box, Typography } from "@mui/material";
import Logo from '../../../assets/logo.png';

const ComingSoon = () => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            bgcolor="#f5f5f5"
            px={2}
            color="primary.main"
        >
            <Box textAlign="center">
                <Box
                    component="img"
                    src={Logo}
                    alt="Logo"
                    sx={{
                        mx: "auto",
                        mb: 6,
                        width: 320,
                        maxWidth: "100%",
                    }}
                />

                <Typography
                    variant="h3"
                    fontWeight={700}
                    mb={2}
                    sx={{
                        typography: { xs: "h4", md: "h2" },
                    }}
                >
                    Coming Soon
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: "grey.900",
                        typography: { xs: "body1", md: "h6" },
                    }}
                >
                    We're working on something amazing. Stay tuned!
                </Typography>
            </Box>
        </Box>
    );
};

export default ComingSoon;
