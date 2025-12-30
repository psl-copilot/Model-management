import CodeIcon from '@mui/icons-material/Code';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { Box } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "../../components/Text";
import * as S from './Sidebar.styles';

const menuItems: { icon: React.ReactElement, label: string, route: string, color: string }[] = [
    { icon: <HomeOutlinedIcon />, label: "Rules Home", route: "home", color: "#8f57ee" },
    { icon: <CodeIcon />, label: "Rule Editor", route: "editor", color: "#4789f6" },
    { icon: <StorageRoundedIcon />, label: "Datasets", route: "datasets", color: "#2bc08f" },
    { icon: <SettingsOutlinedIcon />, label: "Settings", route: "settings", color: "#f5a319" },
    { icon: <HelpOutlineOutlinedIcon />, label: "Help", route: "help", color: "#8f57ee" },
];

const Sidebar = ({ expanded }: { expanded: boolean; }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const navigate = useNavigate();

    const handleMenuClick = (idx: number) => {
        setActiveIdx(idx);
        navigate(menuItems[idx].route);
    };

    return (
        <S.SidebarContainer expanded={expanded}>
            <Box flex={1} position="relative" width="100%" mt={2} >
                {menuItems.map((item, idx) => (
                    <S.MenuItemBox
                        key={idx}
                        active={idx === activeIdx}
                        expanded={expanded}
                        onClick={() => handleMenuClick(idx)}
                    >
                        <S.IconWrapper expanded={expanded} color={item.color}>{item.icon}</S.IconWrapper>
                        {expanded ? (
                            <Text size="sub" weight={idx === activeIdx ? 700 : 350} color={idx === activeIdx ? "text.secondary" : "text.black"} ml={1} mx={3}>
                                {item.label}
                            </Text>
                        ) : null}
                    </S.MenuItemBox>
                ))}
            </Box>
        </S.SidebarContainer>
    );
};
export default Sidebar;
