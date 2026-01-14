import Approval from "../../../components/Wrappers/Approval";
import { useModal } from "../../../contexts/ModalContext";
import { useUpdateStatusMutation } from "../../../redux/Api/Rules";

export interface ISimulation {
    setSelected: (selected: string) => void,
    data?: Record<string, unknown> | undefined
}

const useSimulationController = (props: ISimulation) => {

    const { open } = useModal()

    const [updateStatus, { isLoading }] = useUpdateStatusMutation()

    const handleApproval = (type: 'approve' | 'reject') => {
        open(`${type === 'approve' ? 'Approval' : 'Rejection'} Confirmation Required!`, <Approval type={type} />, null, { maxWidth: 'sm' })
    }

    return {
        values: {},
        functions: {
            handleApproval
        }
    }
}

export default useSimulationController;
