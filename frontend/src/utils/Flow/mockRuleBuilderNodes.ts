/**
 * Mock node data for rule builder
 * This file contains the recommended API response structure
 * It can be easily replaced with actual API calls once backend is ready
 */

interface ApiNodeInput {
  key: string;
  label: string;
  type: string;
  defaultValue?: string | boolean | number;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface ApiNode {
  id: number;
  name: string;
  node_type: string;
  label: string;
  description: string | null;
  type: string;
  category: string;
  color: string;
  handles: {
    source: boolean;
    target: boolean;
  };
  inputs: ApiNodeInput[];
  code_template: string;
  default_data: Record<string, unknown>;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export const mockRuleBuilderNodes: ApiNode[] = [
  {
    id: 1,
    name: 'Flow Start Node',
    node_type: 'Start',
    label: 'Start',
    description: 'Entry point of the flow - automatically executed when flow begins',
    type: 'basic',
    category: 'rule_builder',
    color: '#4CAF50',
    handles: {
      source: true,
      target: false,
    },
    inputs: [],
    code_template: '// Start of flow',
    default_data: {},
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Flow End Node',
    node_type: 'End',
    label: 'End',
    description: 'Exit point of the flow - marks completion of execution',
    type: 'basic',
    category: 'rule_builder',
    color: '#F44336',
    handles: {
      source: false,
      target: true,
    },
    inputs: [],
    code_template: '// End of flow',
    default_data: {},
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'Variable Declaration Node',
    node_type: 'SetVariable',
    label: 'Set Variable',
    description: 'Declares and initializes a variable with specified type and value',
    type: 'basic',
    category: 'rule_builder',
    color: '#2196F3',
    handles: {
      source: true,
      target: true,
    },
    inputs: [
      {
        key: 'name',
        label: 'Variable Name',
        type: 'text',
        defaultValue: 'x',
        required: true,
        placeholder: 'Enter variable name',
      },
      {
        key: 'declarationType',
        label: 'Declaration Type',
        type: 'dropdown',
        options: ['var', 'let', 'const'],
        defaultValue: 'var',
        required: true,
      },
      {
        key: 'dataType',
        label: 'Data Type',
        type: 'dropdown',
        options: ['string', 'number', 'boolean', 'array', 'object', 'any', 'undefined'],
        defaultValue: 'any',
        required: true,
      },
      {
        key: 'value',
        label: 'Value',
        type: 'text',
        defaultValue: '10',
        required: false,
        placeholder: 'Enter value or {{ variable }}',
      },
    ],
    code_template: "const ${params.name || 'variable'} = ${params.value || ''};",
    default_data: {
      name: 'x',
      declarationType: 'var',
      dataType: 'any',
      value: '10',
    },
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 4,
    name: 'Logger Node',
    node_type: 'Log',
    label: 'Print Log',
    description: 'Logs a message to the console or logging service',
    type: 'basic',
    category: 'rule_builder',
    color: '#FF9800',
    handles: {
      source: true,
      target: true,
    },
    inputs: [
      {
        key: 'text',
        label: 'Message',
        type: 'text',
        defaultValue: "'Hello'",
        required: true,
        placeholder: 'Enter log message',
      },
    ],
    code_template: "loggerService.log('${params.text || params.message || ''}', context, msgId);",
    default_data: {
      text: "'Hello'",
    },
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 5,
    name: 'Conditional Branch Node',
    node_type: 'If',
    label: 'If Condition',
    description: 'Executes different branches based on conditional logic (if/else if/else)',
    type: 'basic',
    category: 'rule_builder',
    color: '#FFC107',
    handles: {
      source: true,
      target: true,
    },
    inputs: [
      {
        key: 'conditions',
        label: 'Conditions',
        type: 'json',
        defaultValue: '[{"type":"if","condition":"x > 5"}]',
        required: true,
        placeholder: 'Condition array',
      },
    ],
    code_template: "if (${params.condition || 'true'}) { /* logic */ }",
    default_data: {
      conditions: '[{"type":"if","condition":"x > 5"}]',
    },
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 6,
    name: 'Import Statement Node',
    node_type: 'Import',
    label: 'Import',
    description: 'Imports modules or libraries for use in the flow',
    type: 'basic',
    category: 'rule_builder',
    color: '#9C27B0',
    handles: {
      source: true,
      target: true,
    },
    inputs: [
      {
        key: 'importStatement',
        label: 'Import Statement',
        type: 'text',
        defaultValue: "import { something } from 'module'",
        required: true,
        placeholder: "import { } from ''",
      },
    ],
    code_template: "${params.importStatement || 'import module'}",
    default_data: {
      importStatement: "import { something } from 'module'",
    },
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 7,
    name: 'Database Query Node',
    node_type: 'FetchDB',
    label: 'Fetch from DB',
    description: 'Executes a database query and stores the result in a variable',
    type: 'basic',
    category: 'rule_builder',
    color: '#00BCD4',
    handles: {
      source: true,
      target: true,
    },
    inputs: [
      {
        key: 'variable',
        label: 'Result Variable',
        type: 'text',
        defaultValue: 'data',
        required: true,
        placeholder: 'Variable to store result',
      },
      {
        key: 'query',
        label: 'SQL Query',
        type: 'textarea',
        defaultValue: 'SELECT * FROM users',
        required: true,
        placeholder: 'Enter SQL query',
      },
    ],
    code_template:
      "const ${params.variable || 'data'} = await databaseManager.executeQuery('${params.query || 'SELECT * FROM table'}');",
    default_data: {
      variable: 'data',
      query: 'SELECT * FROM users',
    },
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 8,
    name: 'Custom Code Node',
    node_type: 'Code',
    label: 'Custom Code',
    description: 'Executes custom JavaScript/TypeScript code',
    type: 'basic',
    category: 'rule_builder',
    color: '#607D8B',
    handles: {
      source: true,
      target: true,
    },
    inputs: [
      {
        key: 'code',
        label: 'Code',
        type: 'textarea',
        defaultValue: "console.log('Hello');",
        required: true,
        placeholder: 'Enter custom code',
      },
    ],
    code_template: "${params.code || '// Custom code'}",
    default_data: {
      code: "console.log('Hello');",
    },
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 9,
    name: 'Error Throwing Node',
    node_type: 'ThrowError',
    label: 'Throw Error',
    description: 'Throws an error with a custom message to halt execution',
    type: 'basic',
    category: 'rule_builder',
    color: '#E91E63',
    handles: {
      source: true,
      target: true,
    },
    inputs: [
      {
        key: 'text',
        label: 'Error Message',
        type: 'text',
        defaultValue: "'Error occurred'",
        required: true,
        placeholder: 'Enter error message',
      },
    ],
    code_template: "throw new Error('${params.text || 'Error occurred'}');",
    default_data: {
      text: "'Error occurred'",
    },
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 10,
    name: 'Custom Function Node',
    node_type: 'CustomFunction',
    label: 'Custom Function',
    description: 'Calls a custom function and stores its return value',
    type: 'function',
    category: 'rule_builder',
    color: '#3F51B5',
    handles: {
      source: true,
      target: true,
    },
    inputs: [
      {
        key: 'functionName',
        label: 'Function Name',
        type: 'text',
        defaultValue: 'customFunction',
        required: true,
        placeholder: 'Function to call',
      },
      {
        key: 'resultVar',
        label: 'Result Variable',
        type: 'text',
        defaultValue: 'result',
        required: false,
        placeholder: 'Variable to store result',
      },
    ],
    code_template:
      "const ${params.resultVar || 'result'} = await ${params.functionName || 'customFunction'}();",
    default_data: {
      functionName: 'customFunction',
      resultVar: 'result',
    },
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 11,
    name: 'Handle Transaction Node',
    node_type: 'HandleTransaction',
    label: 'Handle Transaction',
    description: 'Processes incoming transaction data and prepares context',
    type: 'function',
    category: 'rule_builder',
    color: '#009688',
    handles: {
      source: true,
      target: true,
    },
    inputs: [],
    code_template: '// Handle transaction logic',
    default_data: {},
    tenant_id: 'cbe',
    created_at: '2026-01-08T00:00:00.000Z',
    updated_at: '2026-01-08T00:00:00.000Z',
  },
];
