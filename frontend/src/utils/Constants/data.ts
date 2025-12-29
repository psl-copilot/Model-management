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
    EXPORTED: 'STATUS_06_EXPORTED',
    READY: 'STATUS_07_READY_FOR_DEPLOYMENT',
    DEPLOYED: 'STATUS_08_DEPLOYED',
}

export const rule_types = {
    Fraud: 'Fraud',
    AML: 'AML',
    FRAUD_AML: "FRAUD & AML"
}