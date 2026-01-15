import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DropdownOption } from "../../components/DropDown";
import type { TableColumn } from "../../components/Table";
import TableActions from "../../components/TableActions";
import { useModal } from "../../contexts/ModalContext";
import useFilters from "../../hooks/useFilters";
import { useGetRulesMutation, useGetStatusQuery } from "../../redux/Api/Rules";
import { extractData, removeData } from "../../utils/Common/storage";
import { claims, publishingStatus, ruleTypes, Status } from "../../utils/Constants/data";
import ViewRule from "./ViewRule";
import { LocalStorage } from "../../utils/Common/enums";

const useHomeController = () => {
    const navigate = useNavigate();
    const [ruleType, setRuleType] = useState<DropdownOption | DropdownOption[] | null>(null)
    const [status, setStatus] = useState<DropdownOption | DropdownOption[] | null>(null)
    const [publishing, setPublishing] = useState<DropdownOption | null>(null)

    const { open } = useModal()
    const user = extractData('user')

    const isEditor = user.claims === claims.editor

    const {
        offset,
        limit,
        setOffset,
    } = useFilters();

    const [getRules, { isLoading }] = useGetRulesMutation();
    const { data: statuses, isLoading: statusLoad } = useGetStatusQuery({}, { refetchOnMountOrArgChange: true });

    const [data, setData] = useState<unknown[]>([]);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const resetFilter = () => {
        setRuleType(null)
        setStatus(null)
        setPublishing(null)
        setSearchTerm('')
    }


    useEffect(() => {
        const fetchRules = async () => {
            try {
                const params = {
                    offset,
                    limit
                }
                const statusValue = status && !Array.isArray(status) ? status.value : undefined;
                const ruleValue = ruleType && !Array.isArray(ruleType) ? ruleType.value : undefined;
                const publishingStatus = publishing ? publishing.value : undefined;
                const body = { ruleName: searchTerm.length > 0 ? searchTerm : undefined, status: statusValue, ruleType: ruleValue, publishingStatus };
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
    }, [getRules, offset, limit, searchTerm, status, ruleType, publishing]);

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
    }, [offset, limit, total, setOffset])

    const handleCreateEdit = (row?: Record<string, unknown>) => {
        if (!row) {
            removeData('trs_rule', LocalStorage)
        }
        navigate(row ? `/editor/${row?.id}?mode=edit` : "/editor");
    };

    const onView = (row: Record<string, string>) => {
        navigate(`/editor/${row?.id}?mode=view`);
    }


    const columns: TableColumn[] = [
        { label: "Rule Name", key: "rule_name" },
        { label: "Rule ID", key: "id" },
        { label: "Status", key: "status" },
        { label: "Created At", key: "created_at", type: 'date' as const },
        { label: "Version", key: "version" },
        {
            label: 'Actions',
            key: 'actions',
            render: (row: Record<string, unknown>) => (
                <TableActions
                    onView={() => onView(row as Record<string, string>)}
                    {...(isEditor && {
                        ...(row?.status === Status.INPROGRESS ? { onEdit: () => handleCreateEdit(row as Record<string, string>) } : {}),
                        onClone: () => onView(row as Record<string, string>)
                    })}
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
            user,
            publishing,
            statusLoad,
            statusOptions: [
                { label: 'All', value: '' },
                ...(statuses && statuses.length > 0
                    ? statuses.map((item: string) => ({
                        label: item,
                        value: item,
                    }))
                    : []),
            ],
            ruleTypes: [
                { label: 'All', value: null },
                ...ruleTypes.map(({ display, value }) => { return { label: display, value } })],
            publishingOptions: [
                { label: 'All', value: null },
                ...Object.entries(publishingStatus).map(([, value]) => { return { label: value, value: value } })],
        },
        functions: {
            handleCreateEdit,
            setSearchTerm,
            setStatus,
            setRuleType,
            setPublishing,
            resetFilter
        },
    };
};

export default useHomeController;
