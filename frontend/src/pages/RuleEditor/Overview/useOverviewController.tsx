import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { DropdownOption } from "../../../components/DropDown";
import { useModal } from "../../../contexts/ModalContext";
import { useGetTypesQuery, useLazyGetTxtpVersionsQuery } from "../../../redux/Api/Config";
import { useCreateRuleMutation } from "../../../redux/Api/Rules";
import { extractData, insertData } from "../../../utils/Common/storage";
import { ruleTypes, Tabs } from "../../../utils/Constants/data";
import RuleConfig from "../Modals/RuleConfig";
import ViewNetworkMap from "../Modals/ViewNetworkMap";
import { toDropdown } from "../../../utils/Common/helpers";
import { LocalStorage } from "../../../utils/Common/enums";

interface RuleFormValues {
    rule_name: string;
    description: string;
    txtp: DropdownOption | null;
    txtpVersion: DropdownOption | null;
    version: string;
    rule_config_id: DropdownOption | null;
    rule_type: DropdownOption | null;
}

export interface IOverviewProps {
    data?: Record<string, unknown> | undefined
    setSelected: (selected: string) => void,
}

const useOverviewController = (props: IOverviewProps) => {

    const { data, setSelected } = props
    const [versions, setVersions] = useState<string[]>([])

    const { data: types, isLoading } = useGetTypesQuery({})
    const [submit, { isLoading: createLoading }] = useCreateRuleMutation()
    const [getVersions] = useLazyGetTxtpVersionsQuery()

    const { open } = useModal()
    const user = extractData('user')

    const initial: RuleFormValues = {
        rule_name: (data?.rule_name as string) ?? '',
        description: (data?.description as string) ?? '',
        txtp: toDropdown(data?.txtp as string),
        txtpVersion: toDropdown(data?.txtpVersion as string),
        version: (data?.version as string) ?? '',
        rule_config_id: toDropdown(data?.rule_config_id as string),
        rule_type: toDropdown(data?.rule_type as string),
    };
    const { handleSubmit, formState: { errors }, control, setValue, watch } = useForm({ defaultValues: initial })
    // eslint-disable-next-line react-hooks/incompatible-library
    const rule_config_id = watch('rule_config_id')

    const onSubmit = (values: RuleFormValues) => {
        const payload = {
            ...values,
            txtp: values?.txtp?.value,
            rule_config_id: values?.rule_config_id?.value,
            rule_type: values?.rule_type?.value,
            txtpVersion: values?.txtpVersion?.value,
        }
        submit(payload).then((res) => {
            if (res) {
                insertData(res?.data, 'trs_rule', LocalStorage, true)
                toast.success('Rule Successfully Created')
                setSelected(Tabs[1].value)
            }
        })
    }

    const handleRuleValue = (val: DropdownOption) => {
        setValue('rule_config_id', val)
        const rule_no = val?.value?.toString().split('@')
        setValue('rule_name', `${user.tenantId}-${rule_no?.[0]}`)
    }

    const handleTxTp = (val: DropdownOption) => {
        setValue('txtp', val)
        if (val?.value) {
            getVersions({ type: val.value }).unwrap().then((res) => {
                if (res) {
                    setVersions(res)
                }
            })
        }
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
            txtpVersions: versions?.map((item: string) => ({ label: item, value: item })) || [],
            ruleTypes: ruleTypes.map(({ display, value }) => { return { label: display, value } }),
        },
        functions: {
            handleSubmit: handleSubmit(onSubmit),
            handleRuleConfig,
            handleNetworkMap,
            handleTxTp
        }
    }
}

export default useOverviewController;
