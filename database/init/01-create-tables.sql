-- SPDX-License-Identifier: Apache-2.0

CREATE TABLE trs_rules (
    rule_id SERIAL,
    rule_name VARCHAR(100),
    desc VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    txtp VARCHAR(50) NOT NULL,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    publishing_status VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_at DATE,
    created_at DATE,
    PRIMARY KEY (rule_id, tenant_id, version)
);

-- Index on tenant_id for faster retrieval of rules by tenant
CREATE INDEX idx_trs_rules_tenant_id ON trs_rules (tenant_id);

-- Index on status for faster filtering based on rule status
CREATE INDEX idx_trs_rules_status ON trs_rules (status);

-- Index on version for faster version-based queries
CREATE INDEX idx_trs_rules_version ON trs_rules (version);

-- Composite index if you frequently query by tenant_id and status together
CREATE INDEX idx_trs_rules_tenant_status ON trs_rules (tenant_id, status);
