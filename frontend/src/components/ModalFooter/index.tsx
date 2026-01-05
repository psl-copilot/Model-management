import { memo } from "react";
import { useModal } from "../../contexts/ModalContext";
import Button from "../Button";
import { Box } from "@mui/material";

type ModalFooterProps = {
    onSubmit: () => void;
    isSubmitting?: boolean;
    title?: string;
};

const ModalFooter = ({ onSubmit, isSubmitting = false, title = "Submit" }: ModalFooterProps) => {
    const { close } = useModal();

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
            }}
        >
            <Button text="Cancel" onClick={close} type="muted" />
            <Button text={title} onClick={onSubmit} loading={isSubmitting} />
        </Box>
    );
};

export default memo(ModalFooter);
