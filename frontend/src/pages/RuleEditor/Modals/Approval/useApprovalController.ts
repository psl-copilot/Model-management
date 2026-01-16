import { useForm } from "react-hook-form";
import { useUpdateStatusMutation } from "../../../../redux/Api/Rules";
import { Status } from "../../../../utils/Constants/data";
import { useModal } from "../../../../contexts/ModalContext";
import { useNavigate } from "react-router-dom";

export interface IApproval {
    type: 'review' | 'approve' | 'reject',
    id: string
}

interface IValues {
    comments: string
}

const message = {
    approve: 'Important: This will approve the rule and move it to the next stage in the workflow.',
    reject: 'Important: This will reject the rule and send it back to the maker for revisions.',
    review: 'Important: This will submit the rule for approval and update its status to UNDER REVIEW.'
}

const header = {
    approve: 'Are you sure you want to approve this rule?',
    reject: 'Are you sure you want to reject this rule?',
    review: 'Are you sure you want to send this rule for review?'
}

const getBtnTitle = (type: IApproval['type']) => {
    switch (type) {
        case 'approve': return 'Approve'
        case 'reject': return 'Reject'
        case 'review': return 'Send For Approval'
    }
}

const useApprovalController = (props: IApproval) => {

    const { type, id } = props
    const { close } = useModal()
    const navigate = useNavigate()

    const isApproved = type === 'approve'
    const isReviewed = type === 'review'

    const { handleSubmit, formState: { errors }, control } = useForm({
        defaultValues: { comments: '' }
    })

    const [submit, { isLoading }] = useUpdateStatusMutation()

    const onSubmit = (values: IValues) => {
        const status = isApproved ? Status.STATUS_04_APPROVED : isReviewed ? Status.STATUS_03_UNDER_REVIEW : Status.STATUS_05_REJECTED
        submit({ id, body: { ...values, status } })
            .then((res) => {
                if (res) {
                    close()
                    navigate('/home')
                }
            })
    }

    return {
        values: {
            control,
            errors,
            isLoading,
            isApproved,
            isReviewed,
            message: message[type],
            header: header[type],
            type,
            btnTitle: getBtnTitle(type)
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
            close
        }
    }
}

export default useApprovalController;
