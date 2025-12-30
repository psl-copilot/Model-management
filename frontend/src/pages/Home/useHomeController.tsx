import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DropdownOption } from "../../components/DropDown";
import useFilters from "../../hooks/useFilters";
import { useGetRulesMutation } from "../../redux/Api/Rules";
import { rule_types, Status } from "../../utils/Constants/data";
import { useModal } from "../../contexts/ModalContext";
import TableActions from "../../components/TableActions";
import ViewRule from "./ViewRule";
import type { TableColumn } from "../../components/Table";

const useHomeController = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<DropdownOption | DropdownOption[] | null>(null)
    const [ruleType, setRuleType] = useState<DropdownOption | DropdownOption[] | null>(null)

    const { open } = useModal()

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

    const columns: TableColumn[] = [
        { label: "Name", key: "rule_name" },
        { label: "Rule Id", key: "rule_id" },
        { label: "Status", key: "status" },
        { label: "Owner", key: "updated_by" },
        { label: "Updated At", key: "updated_at", type: 'date' as const },
        { label: "Version", key: "version" },
        {
            label: 'Actions',
            key: 'actions',
            render: (row: unknown) => (
                <TableActions
                    onView={() => onView(row as Record<string, string>)}
                />
            )
        }
    ];

    return {
        values: {
            columns,
            data,
            isLoading,
            pagination,
            searchTerm,
            status,
            ruleType,
            status_options: [{ label: 'All', value: null }, ...Object.entries(Status).map(([_, value]) => { return { label: value, value } })],
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
