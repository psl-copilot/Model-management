import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CodeIcon from '@mui/icons-material/Code';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { Box, IconButton, useTheme } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "../../components/Text";
import * as S from './Sidebar.styles';

const menuItems: any[] = [
    { icon: <HomeOutlinedIcon />, label: "Rules Home", route: "dashboard" },
    { icon: <CodeIcon />, label: "Rule Editor", route: "dashboard" },
    { icon: <StorageRoundedIcon />, label: "Datasets", route: "dashboard" },
    { icon: <SettingsOutlinedIcon />, label: "Settings", route: "dashboard" },
    { icon: <HelpOutlineOutlinedIcon />, label: "Help", route: "dashboard" },
];

const Sidebar = ({ expanded, setExpanded }: { expanded: boolean; setExpanded: (v: boolean) => void }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleMenuClick = (idx: number) => {
        setActiveIdx(idx);
        navigate(menuItems[idx].route);
    };

    return (
        <S.SidebarContainer expanded={expanded}>
            <S.LogoBox>
                <Text color="text.white" weight="bold" size="subHeader">
                    {expanded ? 'Tazama Rule Studio' : 'TRS'}
                </Text>
            </S.LogoBox>

            <S.ToggleButtonWrapper>
                <IconButton onClick={() => setExpanded(!expanded)}>
                    {expanded ? (
                        <ChevronLeftIcon fontSize="small" sx={{ color: theme.palette.text.white }} />
                    ) : (
                        <ChevronRightIcon fontSize="small" sx={{ color: theme.palette.text.white }} />
                    )}
                </IconButton>
            </S.ToggleButtonWrapper>

            <Box flex={1} position="relative" width="100%">
                {menuItems.map((item, idx) => (
                    <S.MenuItemBox
                        key={idx}
                        active={idx === activeIdx}
                        expanded={expanded}
                        onClick={() => handleMenuClick(idx)}
                    >
                        <S.IconWrapper>{item.icon}</S.IconWrapper>
                        {expanded && (
                            <Text size="body" fontWeight={500} color="text.white" ml={1}>
                                {item.label}
                            </Text>
                        )}
                    </S.MenuItemBox>
                ))}
            </Box>
        </S.SidebarContainer>
    );
};
export default Sidebar;
