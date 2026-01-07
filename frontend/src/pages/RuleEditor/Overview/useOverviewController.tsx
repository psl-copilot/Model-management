import { useForm } from "react-hook-form";
import type { DropdownOption } from "../../../components/DropDown";
import { useGetTypesQuery } from "../../../redux/Api/Config";
import { useModal } from "../../../contexts/ModalContext";
import RuleConfig from "../Modals/RuleConfig";
import { ruleTypes, Tabs } from "../../../utils/Constants/data";
import ViewNetworkMap from "../Modals/ViewNetworkMap";
import { useCreateRuleMutation } from "../../../redux/Api/Rules";
import { extractData } from "../../../utils/Common/storage";
import toast from "react-hot-toast";

interface RuleFormValues {
    rule_name: string;
    description: string;
    txtp: DropdownOption | null;
    version: string;
    rule_config: DropdownOption | null;
    rule_type: DropdownOption | null;
}

export interface IOverviewProps {
    data?: Record<string, unknown> | undefined
    setSelected: (selected: string) => void,
}

const useOverviewController = (props: IOverviewProps) => {

    const { data, setSelected } = props

    const { data: types, isLoading } = useGetTypesQuery({})
    const [submit, { isLoading: createLoading }] = useCreateRuleMutation()

    const { open } = useModal()
    const user = extractData('user')

    const initial = {
        rule_name: '',
        description: (data?.description as string) || "",
        txtp: (data?.txtp as DropdownOption) || null,
        version: (data?.version as string) || "",
        rule_config: (data?.rule_config as DropdownOption) || null,
        rule_type: (data?.rule_type as DropdownOption) || null
    }

    const { handleSubmit, formState: { errors }, control, setValue, watch } = useForm({ defaultValues: initial })

    const rule_config_id = watch('rule_config')

    const onSubmit = (values: RuleFormValues) => {
        const payload = {
            ...values,
            txtp: values?.txtp?.value,
            rule_config: values?.rule_config?.value,
            rule_type: values?.rule_type?.value
        }
        submit(payload).then((res) => {
            if (res) {
                toast.success('Rule Successfully Created')
                setSelected(Tabs[1].value)
            }
        })
    }

    const handleRuleValue = (val: DropdownOption) => {
        setValue('rule_config', val)
        const rule_no = val?.value?.toString().split('@')
        setValue('rule_name', `${user.tenantId}-${rule_no?.[0]}`)
    }

    const handleRuleConfig = () => {
        open('Select Rule Config', <RuleConfig handleRuleValue={handleRuleValue} />, null, { maxWidth: 'md' })
    }

    const handleNetworkMap = () => {
        open('View Network Map', <ViewNetworkMap />, null, { maxWidth: 'md' })
    }

    return {
        values: {
            control,
            errors,
            isLoading,
            rule_config_id,
            createLoading,
            transactions: types?.map((item: string) => ({ label: item, value: item })) || [],
            rule_types: [...Object.entries(ruleTypes).map(([_, value]) => { return { label: value, value } })],
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
            handleRuleConfig,
            handleNetworkMap,
        }
    }
}

export default useOverviewController;
