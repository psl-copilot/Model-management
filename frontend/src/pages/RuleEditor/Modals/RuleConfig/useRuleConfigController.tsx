import { useEffect, useState } from "react";
import type { DropdownOption } from "../../../../components/DropDown";
import { useGetRuleConfigsIdsQuery, useLazyGetRuleConfigQuery } from "../../../../redux/Api/Rules";

export interface RuleConfigProps {
  handleRuleValue: (val: DropdownOption) => void
}

interface IRuleId {
  ruleid: string,
  rulecfg: string,
  tenantid: string,
}

const useRuleConfigController = ({ handleRuleValue }: RuleConfigProps) => {

  const { data, isLoading } = useGetRuleConfigsIdsQuery({})
  const [submit, { isLoading: configLoader }] = useLazyGetRuleConfigQuery()

  const [ruleId, setRuleId] = useState<DropdownOption | null>(null);
  const [json, setJson] = useState(null)

  useEffect(() => {
    if (ruleId) {
      submit({ id: ruleId.value }).then((res) => {
        if (res?.data) {
          setJson(res?.data?.configuration)
        }
      })
    }
  }, [ruleId])

  const handleRuleId = (value: DropdownOption) => {
    setRuleId(value)
    handleRuleValue(value)
  }

  return {
    values: {
      ruleConfigs: data?.map((item: IRuleId) => ({ label: item.ruleid, value: item.ruleid })),
      ruleId,
      isLoading,
      configLoader,
      json
    },
    functions: {
      handleRuleId
    }
  }
}

export default useRuleConfigController;
