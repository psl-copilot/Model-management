import { useForm } from "react-hook-form";
import type { DropdownOption } from "../../../components/DropDown";
import { useGetTypesQuery } from "../../../redux/Api/Config";
import { useModal } from "../../../contexts/ModalContext";
import RuleConfig from "../Modals/RuleConfig";
import { rule_types } from "../../../utils/Constants/data";

const useOverviewController = (props: Record<string, unknown> | undefined) => {

    const data = props?.data as Record<string, unknown> | undefined

    const { data: types, isLoading } = useGetTypesQuery({})

    const { open } = useModal()

    const initial = {
        ruleName: (data?.rule_name as string) || "",
        description: (data?.description as string) || "",
        txtp: (data?.txtp as DropdownOption) || null,
        version: (data?.version as string) || "",
        rule_config: (data?.rule_config as DropdownOption) || "",
        rule_type: (data?.rule_type as DropdownOption) || ""
    }

    const { handleSubmit, formState: { errors }, control } = useForm({ defaultValues: initial })

    const onSubmit = () => {

    }

    const handleRuleConfig = () => {
        open('Select Rule Config', <RuleConfig />, null, { maxWidth: 'md' })
    }


    return {
        values: {
            control,
            errors,
            isLoading,
            transactions: types?.map((item: string) => ({ label: item, value: item })) || [],
            rule_types: [{ label: 'All', value: null }, ...Object.entries(rule_types).map(([_, value]) => { return { label: value, value } })],
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
            handleRuleConfig
        }
    }
}

export default useOverviewController;
