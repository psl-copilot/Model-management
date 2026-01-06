import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DropdownOption } from "../../components/DropDown";
import type { TableColumn } from "../../components/Table";
import TableActions from "../../components/TableActions";
import { useModal } from "../../contexts/ModalContext";
import useFilters from "../../hooks/useFilters";
import { useGetRulesMutation } from "../../redux/Api/Rules";
import { extractData } from "../../utils/Common/storage";
import { claims, getStatusOptionsForRole, rule_types, rules } from "../../utils/Constants/data";
import ViewRule from "./ViewRule";

const useHomeController = () => {
    const navigate = useNavigate();
    const [ruleType, setRuleType] = useState<DropdownOption | DropdownOption[] | null>(null)
    const [status, setStatus] = useState<DropdownOption | DropdownOption[] | null>(null)

    const { open } = useModal()
    const user = extractData('user')

    const isEditor = user.claims === claims.editor

    const {
        offset,
        limit,
        setOffset,
    } = useFilters();

    const [getRules, { isLoading }] = useGetRulesMutation();

    const [data, setData] = useState<unknown[]>([]);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const params = {
                    offset,
                    limit
                }
                const statusValue = status && !Array.isArray(status) ? status.value : undefined;
                const ruleValue = ruleType && !Array.isArray(ruleType) ? ruleType.value : undefined;
                const body = { ruleName: searchTerm ?? undefined, status: statusValue, ruleType: ruleValue };
                const response = await getRules({
                    params, body
                }).unwrap();

                setData(response?.rules || []);
                setTotal(response?.total || 0);
            } catch (err) {
                console.error(err);
            }
        };

        fetchRules();
    }, [getRules, offset, limit, searchTerm, status, ruleType]);

    useEffect(() => {
        setOffset(0);
    }, [status, ruleType, setOffset]);

    const pagination = useMemo(() => {
        return {
            offset,
            limit,
            total,
            onPageChange: (page: number) => setOffset(page - 1),
        };
    }, [offset, limit, total])

    const handleCreateNew = () => {
        navigate("/editor");
    };

    const onView = (data: Record<string, string>) => {
        open('View Rule', <ViewRule data={data} />)
    }

    const getAll = useCallback(() => {
        return getStatusOptionsForRole(user.claims).map((item) => item.value).join(',')
    }, [user.claims])

    const columns: TableColumn[] = [
        { label: "Rule Name", key: "rule_name" },
        { label: "Rule Id", key: "id" },
        { label: "Rule Type", key: "rule_type" },
        { label: "Status", key: "status" },
        { label: "Created At", key: "created_at", type: 'date' as const },
        { label: "Version", key: "version" },
        {
            label: 'Actions',
            key: 'actions',
            render: (row: unknown) => (
                <TableActions
                    onView={() => onView(row as Record<string, string>)}
                    {...(isEditor && {
                        onEdit: () => onView(row as Record<string, string>),
                        onClone: () => onView(row as Record<string, string>)
                    })}
                />
            )
        }
    ];

    return {
        values: {
            columns,
            data: rules,
            isLoading,
            pagination,
            searchTerm,
            status,
            ruleType,
            user,
            status_options: [{ label: 'All', value: getAll() }, ...getStatusOptionsForRole(user.claims)],
            rule_types: [{ label: 'All', value: null }, ...Object.entries(rule_types).map(([_, value]) => { return { label: value, value } })],
        },
        functions: {
            handleCreateNew,
            setSearchTerm,
            setStatus,
            setRuleType
        },
    };
};

export default useHomeController;
