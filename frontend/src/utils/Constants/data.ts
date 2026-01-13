export const rules = [
    {
        name: 'High Value Transaction Detection',
        rule_id: 'HVT-001',
        status: 'In-Progress',
        owner: 'John Doe',
        updated_at: '2024-07-01',
        version: '1.0.0'
    },
    {
        name: 'High Value Transaction Detection',
        rule_id: 'HVT-001',
        status: 'In-Progress',
        owner: 'John Doe',
        updated_at: '2024-07-01',
        version: '1.0.0'
    },
    {
        name: 'High Value Transaction Detection',
        rule_id: 'HVT-001',
        status: 'In-Progress',
        owner: 'John Doe',
        updated_at: '2024-07-01',
        version: '1.0.0'
    },
]


export const Status = {
    INPROGRESS: 'STATUS_01_IN_PROGRESS',
    ON_HOLD: 'STATUS_02_ON_HOLD',
    REVIEW: 'STATUS_03_UNDER_REVIEW',
    APPROVED: 'STATUS_04_APPROVED',
    REJECTED: 'STATUS_05_REJECTED',
    READY: 'STATUS_07_READY_FOR_DEPLOYMENT',
    DEPLOYED: 'STATUS_08_DEPLOYED',
    ARCHIVED: 'STATUS_09_ARCHIVED',
}

export const publishingStatus = {
    Active: 'ACTIVE',
    Inactive: 'INACTIVE'
}

export const Tabs = [
    {
        label: 'Overview',
        value: 'overview'
    },
    {
        label: 'Parser',
        value: 'parser'
    },
    {
        label: 'Rule Builder',
        value: 'rule_builder'
    },
    {
        label: 'Generate Test Cases',
        value: 'test_cases'
    },
    {
        label: 'Simulation',
        value: 'simulation'
    },
    {
        label: 'Documentation',
        value: 'documentation'
    },
    {
        label: 'History',
        value: 'History'
    },
]


export const claims = {
    editor: 'editor',
    approver: 'approver',
    publisher: 'publisher'
}

export const RoleStatusMap: Record<string, string[]> = {
    editor: Object.values(Status),
    approver: [
        Status.REVIEW,
        Status.APPROVED,
        Status.REJECTED,
    ],
    deployer: [
        Status.READY,
        Status.DEPLOYED,
    ],
};

export const getStatusOptionsForRole = (role: string) => {
    const allowedStatuses = RoleStatusMap[role] ?? [];
    return [
        ...allowedStatuses.map((value) => ({ label: value, value })),
    ];
};


export const ruleTypes = [
    {
        display: 'Fraud',
        value: 'FRAUD'
    },
    {
        display: 'AML',
        value: 'AML'
    },
    {
        display: 'Fraud & AML',
        value: 'FRAUD/AML'
    },
]

export const metaData = {
    step: 3
}

