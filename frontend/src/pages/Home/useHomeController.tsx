import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFilters from "../../hooks/useFilters";
import { useGetRulesMutation } from "../../redux/Api/Rules";

const useHomeController = () => {
    const navigate = useNavigate();

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
                const body = { ruleName: searchTerm || undefined };
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
    }, [getRules, offset, limit, searchTerm]);


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

    const columns = [
        { label: "Name", key: "rule_name" },
        { label: "Rule Id", key: "rule_id" },
        { label: "Status", key: "status" },
        { label: "Owner", key: "owner" },
        { label: "Updated", key: "updated_by" },
        { label: "Version", key: "version" },
    ];

    return {
        values: {
            columns,
            data,
            isLoading,
            pagination,
            searchTerm
        },
        functions: {
            handleCreateNew,
            setSearchTerm
        },
    };
};

export default useHomeController;
