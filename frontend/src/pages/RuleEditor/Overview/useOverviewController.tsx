import { useForm } from "react-hook-form";
import type { DropdownOption } from "../../../components/DropDown";
import { useGetTypesQuery } from "../../../redux/Api/Config";
import { useModal } from "../../../contexts/ModalContext";
import RuleConfig from "../Modals/RuleConfig";
import { rule_types } from "../../../utils/Constants/data";
import ViewNetworkMap from "../Modals/ViewNetworkMap";

const useOverviewController = (props: Record<string, unknown> | undefined) => {

    const data = props?.data as Record<string, unknown> | undefined

    const { data: types, isLoading } = useGetTypesQuery({})

    const { open } = useModal()

    const initial = {
        ruleName: (data?.rule_name as string) || "",
        description: (data?.description as string) || "",
        txtp: (data?.txtp as DropdownOption) || null,
        version: (data?.version as string) || "",
        rule_config: (data?.rule_config as DropdownOption) || null,
        rule_type: (data?.rule_type as DropdownOption) || null
    }

    const { handleSubmit, formState: { errors }, control, setValue, watch } = useForm({ defaultValues: initial })

    const rule_config_id = watch('rule_config')

    const onSubmit = (data: unknown) => {
        
    }

    const handleRuleValue = (value: DropdownOption) => {
        setValue('rule_config', value)
    }

    const handleRuleConfig = () => {
        open('Select Rule Config', <RuleConfig handleRuleValue={handleRuleValue} />, null, { maxWidth: 'md' })
    }

    const handleNetworkMap = () => {
        open('View Network Map', <ViewNetworkMap />, null, { maxWidth: 'md' })
    }


    console.log("rule_config_id", rule_config_id)

    return {
        values: {
            control,
            errors,
            isLoading,
            rule_config_id,
            transactions: types?.map((item: string) => ({ label: item, value: item })) || [],
            rule_types: [...Object.entries(rule_types).map(([_, value]) => { return { label: value, value } })],
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
            handleRuleConfig,
            handleNetworkMap
        }
    }
}

export default useOverviewController;
