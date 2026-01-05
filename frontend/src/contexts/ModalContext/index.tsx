import { createContext, useContext, useState } from "react"
import Modal, { type ModalProps } from "../../components/Wrappers/Modal"

interface ModalState {
    open: boolean
    title: string
    content: React.ReactNode | null
    footer: React.ReactNode | null
    props?: Partial<ModalProps>
}

interface ModalContextType {
    open: (
        title: string,
        content: React.ReactNode,
        footer?: React.ReactNode,
        props?: Partial<ModalProps>
    ) => void
    close: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

interface ModalProviderProps {
    children: React.ReactNode
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
    const [modal, setModal] = useState<ModalState>({
        open: false,
        title: "",
        content: null,
        footer: null,
        props: {},
    })

    const open = (
        title: string,
        content: React.ReactNode,
        footer: React.ReactNode | null = null,
        props: Partial<ModalProps> = {}
    ) => {
        setModal({ open: true, title, content, footer, props })
    }

    const close = () => {
        setModal(prev => ({ ...prev, open: false }))
    }

    return (
        <ModalContext.Provider value={{ open, close }}>
            {children}
            <Modal
                open={modal.open}
                title={modal.title}
                footer={modal.footer}
                onClose={close}
                {...modal.props}
            >
                {modal.content ?? null}
            </Modal>
        </ModalContext.Provider>
    )
}

export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider")
    }
    return context
}
