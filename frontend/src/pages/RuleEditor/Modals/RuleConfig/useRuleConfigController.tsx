import { useEffect, useState } from "react";
import type { DropdownOption } from "../../../../components/DropDown";
import { useGetRuleConfigsIdsQuery, useLazyGetRuleConfigQuery } from "../../../../redux/Api/Rules";

export interface RuleConfigProps {
}

interface IRuleId {
  ruleid: string,
  rulecfg: string,
  tenantid: string,
}

const useRuleConfigController = ({ }: RuleConfigProps) => {

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

  return {
    values: {
      ruleConfigs: data?.map((item: IRuleId) => ({ label: item.ruleid, value: item.ruleid })),
      ruleId,
      isLoading,
      configLoader,
      json
    },
    functions: {
      setRuleId
    }
  }
}

export default useRuleConfigController;
