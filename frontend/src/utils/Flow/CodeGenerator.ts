import type { Node, Edge } from '@xyflow/react';
import type { EditableNodeData } from '../../components/RuleBuilder/EditableNode';
import { getNodesInBranch } from '../Common/helpers';
import { mockRuleBuilderNodes } from './mockRuleBuilderNodes';

interface NestedCanvasData {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Strips {{ }} wrapping from variable indicators (UI-only syntax)
 * Example: "{{ x }}" -> "x", "The value is {{ x }}" -> "The value is x"
 */
const stripVariableIndicators = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\{\{\s*(.+?)\s*\}\}/g, '$1');
};

/**
 * Template engine: processes code_template with dynamic parameters
 * Supports ${params.key}, ${indent}, and ${variable} syntax
 */
const processCodeTemplate = (
  template: string,
  params: Record<string, string>,
  indent: string = ''
): string => {
  if (!template) return '';

  // Strip {{ }} from all params first
  const cleanParams: Record<string, string> = {};
  Object.keys(params).forEach((key) => {
    cleanParams[key] = stripVariableIndicators(params[key] || '');
  });

  // Replace ${params.key} with actual values
  let processedCode = template.replace(/\$\{params\.(\w+)\s*\|\|\s*['"]([^'"]*)['"  ]\}/g, (_match, key, defaultValue) => {
    return cleanParams[key] || defaultValue;
  });

  processedCode = processedCode.replace(/\$\{params\.(\w+)\}/g, (_match, key) => {
    return cleanParams[key] || '';
  });

  // Replace ${indent} if present
  processedCode = processedCode.replace(/\$\{indent\}/g, indent);

  // Add indent to each line
  if (indent) {
    processedCode = processedCode
      .split('\n')
      .map((line) => (line.trim() ? indent + line : line))
      .join('\n');
  }

  return processedCode;
};

/**
 * Generates TypeScript code for a single node
 */
const generateNodeCode = (node: Node, indent: string = ''): string => {
  const nodeData = node.data as EditableNodeData;
  const params = nodeData.params || {};
  const nodeType = nodeData.nodeType;

  // Find node definition from mock/API data
  const nodeDefinition = mockRuleBuilderNodes.find((n) => n.node_type === nodeType);

  // Special handling for nodes with complex logic that can't be templated
  if (nodeType === 'If') {
    return generateIfNodeCode(node, indent);
  }

  if (nodeType === 'FetchDB') {
    return generateFetchDBCode(params, indent);
  }

  if (nodeType === 'SetVariable') {
    return generateSetVariableCode(params, indent);
  }

  if (nodeType === 'Log') {
    return generateLogCode(params, indent);
  }

  if (nodeType === 'ThrowError') {
    return generateThrowErrorCode(params, indent);
  }

  if (nodeType === 'Loop') {
    return generateLoopCode(params, indent);
  }

  if (nodeType === 'Exit') {
    return generateExitCode(params, indent);
  }

  // For all other nodes, use the code_template from API/mock data
  if (nodeDefinition?.code_template) {
    return processCodeTemplate(nodeDefinition.code_template, params, indent);
  }

  // Fallback for unknown nodes
  return `${indent}// ${nodeType} - ${nodeData.label}`;
};

/**
 * Generates code for SetVariable node with type handling
 */
const generateSetVariableCode = (params: Record<string, string>, indent: string): string => {
  const varName = params.name || params.variableName || 'variable';
  const declarationType = params.declarationType || 'var';
  const dataType = params.dataType || 'any';
  let varValue = params.value || params.variableValue || '';
  
  // Strip {{ }} variable indicators from value
  varValue = stripVariableIndicators(varValue);
  
  // Handle undefined or empty value case
  if (!varValue || varValue.trim() === '' || dataType === 'undefined') {
    return `${indent}${declarationType} ${varName};`;
  }
  
  // Determine value string based on data type and content
  let valueStr: string;
  const isNumber = !isNaN(Number(varValue)) && varValue.trim() !== '';
  
  if (dataType === 'number' && isNumber) {
    valueStr = varValue;
  } else if (dataType === 'boolean') {
    valueStr = varValue.toLowerCase() === 'true' || varValue === '1' ? 'true' : 'false';
  } else if (dataType === 'array') {
    valueStr = varValue.trim().startsWith('[') ? varValue : `[${varValue}]`;
  } else if (dataType === 'object') {
    valueStr = varValue.trim().startsWith('{') ? varValue : `{${varValue}}`;
  } else if (isNumber && dataType === 'any') {
    valueStr = varValue;
  } else if (varValue.includes('$')) {
    valueStr = `\`${varValue.replace(/`/g, '\\`')}\``;
  } else {
    valueStr = varValue.startsWith('"') || varValue.startsWith("'") ? varValue : `"${varValue}"`;
  }
  
  return `${indent}${declarationType} ${varName} = ${valueStr};`;
};

/**
 * Generates code for Log node with variable handling
 */
const generateLogCode = (params: Record<string, string>, indent: string): string => {
  let message = params.text || params.message || '';
  const hasVariables = /\{\{\s*.+?\s*\}\}/.test(message);
  message = message.replace(/^['"]|['"]$/g, '').trim();
  
  let messageStr: string;
  
  if (!message) {
    messageStr = "''";
  } else if (hasVariables) {
    const onlyVariableMatch = message.match(/^\s*\{\{\s*([^}]+)\s*\}\}\s*$/);
    if (onlyVariableMatch) {
      messageStr = onlyVariableMatch[1].trim();
    } else {
      const interpolatedMessage = message.replace(/\{\{\s*(.+?)\s*\}\}/g, '${$1}');
      messageStr = `\`${interpolatedMessage.replace(/`/g, '\\`')}\``;
    }
  } else {
    messageStr = `'${message.replace(/'/g, "\\'")}'`;
  }
  
  return `${indent}loggerService.log(${messageStr}, context, msgId);`;
};

/**
 * Generates code for ThrowError node
 */
const generateThrowErrorCode = (params: Record<string, string>, indent: string): string => {
  let message = params.text || params.message || 'Error occurred';
  const hasVariables = /\{\{\s*.+?\s*\}\}/.test(message);
  message = message.replace(/^['"]|['"]$/g, '').trim();
  
  let messageStr: string;
  
  if (!message) {
    messageStr = "'Error occurred'";
  } else if (hasVariables) {
    const onlyVariableMatch = message.match(/^\s*\{\{\s*([^}]+)\s*\}\}\s*$/);
    if (onlyVariableMatch) {
      messageStr = onlyVariableMatch[1].trim();
    } else {
      const interpolatedMessage = message.replace(/\{\{\s*(.+?)\s*\}\}/g, '${$1}');
      messageStr = `\`${interpolatedMessage.replace(/`/g, '\\`')}\``;
    }
  } else {
    messageStr = `'${message.replace(/'/g, "\\'")}'`;
  }
  
  return `${indent}throw new Error(${messageStr});`;
};

/**
 * Generates code for Exit node (break, continue, return)
 */
const generateExitCode = (params: Record<string, string>, indent: string): string => {
  const exitType = params.exitType || 'break';
  
  if (exitType === 'return') {
    const returnValue = params.returnValue?.trim() || '';
    if (returnValue) {
      // Strip {{ }} indicators from return value
      const cleanedValue = stripVariableIndicators(returnValue);
      return `${indent}return ${cleanedValue};`;
    }
    return `${indent}return;`;
  } else if (exitType === 'continue') {
    return `${indent}continue;`;
  } else { // break
    return `${indent}break;`;
  }
};


/**
 * Generates code for FetchDB node with parameterized queries
 */
const generateFetchDBCode = (params: Record<string, string>, indent: string): string => {
  const resultVar = params.resultVar || params.variable || 'dbResult';
  const query = params.query || 'SELECT * FROM table';
  
  const varPattern = /\{\{\s*(.+?)\s*\}\}/g;
  const globalVars: string[] = [];
  let parameterizedQuery = query;
  
  const matches = [...query.matchAll(varPattern)];
  if (matches.length > 0) {
    const uniqueVars = Array.from(new Set(matches.map(m => m[1])));
    uniqueVars.forEach((varPath, index) => {
      globalVars.push(varPath);
      const placeholder = `$${index + 1}`;
      const escapedVar = varPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      parameterizedQuery = parameterizedQuery.replace(new RegExp(`\\{\\{\\s*${escapedVar}\\s*\\}\\}`, 'g'), placeholder);
    });
  }
  
  const queryConstName = `query${resultVar.charAt(0).toUpperCase()}${resultVar.slice(1)}`;
  
  const lines = [
    `${indent}// Define parameterized query`,
    `${indent}const ${queryConstName} = \`${parameterizedQuery.replace(/`/g, '\\`')}\`;`,
    '',
  ];
  
  if (globalVars.length > 0) {
    lines.push(`${indent}// Execute query with parameters`);
    lines.push(`${indent}const ${resultVar} = await databaseManager._eventHistory.query<{ [key: string]: unknown }>(${queryConstName}, [`);
    globalVars.forEach((varPath, index) => {
      const comma = index < globalVars.length - 1 ? ',' : '';
      lines.push(`${indent}  ${varPath}${comma}`);
    });
    lines.push(`${indent}]);`);
  } else {
    lines.push(`${indent}// Execute query without parameters`);
    lines.push(`${indent}const ${resultVar} = await databaseManager._eventHistory.query<{ [key: string]: unknown }>(${queryConstName});`);
  }
  
  return lines.join('\n');
};

/**
 * Generates code for If node (cannot be templated due to branching logic)
 */
const generateIfNodeCode = (node: Node, indent: string): string => {
  const nodeData = node.data as EditableNodeData;
  const params = nodeData.params || {};
  
  try {
    const conditionsStr = params.conditions || JSON.stringify([{ type: 'if', condition: 'true' }]);
    const conditions = JSON.parse(conditionsStr);
    
    let code = '';
    conditions.forEach((cond: { type: string; condition?: string }) => {
      const conditionText = cond.condition || 'true';
      const cleanCondition = stripVariableIndicators(conditionText);
      
      const branchBody = `\n${indent}  // Add logic here`;
      
      if (cond.type === 'if') {
        code += `${indent}if (${cleanCondition}) {${branchBody}\n${indent}}`;
      } else if (cond.type === 'elseif') {
        code += ` else if (${cleanCondition}) {${branchBody}\n${indent}}`;
      } else if (cond.type === 'else') {
        code += ` else {${branchBody}\n${indent}}`;
      }
    });
    
    return code;
  } catch {
    return `${indent}if (true) {\n${indent}  // Add logic here\n${indent}}`;
  }
};

/**
 * Generates code for Loop node with multiple loop types
 */
const generateLoopCode = (params: Record<string, string>, indent: string): string => {
  const loopType = params.loopType || 'forEach';
  const arrayVariable = stripVariableIndicators(params.arrayVariable || 'items');
  const itemVariable = params.itemVariable || 'item';
  const indexVariable = params.indexVariable || ''; // Empty by default
  const resultVariable = params.resultVariable || 'loopResult';
  const filterCondition = stripVariableIndicators(params.filterCondition || '');
  const loopBody = stripVariableIndicators(params.loopBody || '// Custom logic here');
  
  const lines: string[] = [];
  
  lines.push(`${indent}// Loop: ${loopType} over ${arrayVariable}`);
  
  switch (loopType) {
    case 'forEach': {
      // Only include index parameter if user specified an index variable
      const forEachParams = indexVariable ? `${itemVariable}, ${indexVariable}` : itemVariable;
      lines.push(`${indent}${arrayVariable}.forEach((${forEachParams}) => {`);
      lines.push(`${indent}  ${loopBody}`);
      lines.push(`${indent}});`);
      break;
    }
      
    case 'for':
      lines.push(`${indent}for (let ${indexVariable} = 0; ${indexVariable} < ${arrayVariable}.length; ${indexVariable}++) {`);
      lines.push(`${indent}  ${loopBody}`);
      lines.push(`${indent}}`);
      break;
      
    case 'map': {
      // Only include index parameter if user specified an index variable
      const mapParams = indexVariable ? `${itemVariable}, ${indexVariable}` : itemVariable;
      lines.push(`${indent}const ${resultVariable} = ${arrayVariable}.map((${mapParams}) => {`);
      lines.push(`${indent}  ${loopBody}`);
      lines.push(`${indent}  return ${itemVariable};`);
      lines.push(`${indent}});`);
      break;
    }
      
    case 'while': {
      lines.push(`${indent}let ${indexVariable} = 0;`);
      const whileCondition = `${indexVariable} < ${arrayVariable}.length`;
      lines.push(`${indent}while (${whileCondition}) {`);
      lines.push(`${indent}  ${loopBody}`);
      lines.push(`${indent}  ${indexVariable}++;`);
      lines.push(`${indent}}`);
      break;
    }
      
    case 'filter': {
      // Only include index parameter if user specified an index variable
      const filterParams = indexVariable ? `${itemVariable}, ${indexVariable}` : itemVariable;
      lines.push(`${indent}const ${resultVariable} = ${arrayVariable}.filter((${filterParams}) => {`);
      if (filterCondition) {
        lines.push(`${indent}  return ${filterCondition};`);
      } else {
        lines.push(`${indent}  return true;`);
      }
      lines.push(`${indent}});`);
      break;
    }
      
    default:
      lines.push(`${indent}// Unsupported loop type: ${loopType}`);
  }
  
  return lines.join('\n');
};

/**
 * Generates TypeScript code for nested flow with proper If node branch handling
 */
const generateNestedFlowCode = (nodes: Node[], edges: Edge[], indent: string = '  '): string => {
  const codeLines: string[] = [];
  const processedNodes = new Set<string>();
  
  const startNode = nodes.find((n) => (n.data as EditableNodeData).nodeType === 'Start');
  if (!startNode) return `${indent}// No start node found`;
  
  const processNode = (nodeId: string): void => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || processedNodes.has(node.id)) return;
    
    processedNodes.add(node.id);
    const nodeData = node.data as EditableNodeData;
    
    if (nodeData.nodeType === 'Start' || nodeData.nodeType === 'End') {
      const nextEdge = edges.find((e) => e.source === nodeId);
      if (nextEdge) processNode(nextEdge.target);
      return;
    }
    
    if (nodeData.nodeType === 'Loop') {
      processedNodes.add(node.id);
      const params = nodeData.params || {};
      const loopType = params.loopType || 'forEach';
      const arrayVariable = stripVariableIndicators(params.arrayVariable || 'items');
      const itemVariable = params.itemVariable || 'item';
      const indexVariable = params.indexVariable || ''; // Empty by default
      const resultVariable = params.resultVariable || 'loopResult';
      const filterCondition = stripVariableIndicators(params.filterCondition || '');
      
      // Get nodes connected to loopBody edge (right side - loop body)
      const loopBodyNodes = getNodesInBranch(node.id, 'loopBody', nodes, edges, new Set(processedNodes));
      loopBodyNodes.forEach((n) => processedNodes.add(n.id));
      
      const innerCode = loopBodyNodes
        .map((n) => generateNodeCode(n, indent + '  '))
        .filter(Boolean)
        .join('\n');
      
      // Generate loop wrapper based on type
      let loopCode = `${indent}// Loop: ${loopType} over ${arrayVariable}\n`;
      
      switch (loopType) {
        case 'forEach': {
          // Only include index parameter if user specified an index variable
          const forEachParams = indexVariable ? `${itemVariable}, ${indexVariable}` : itemVariable;
          loopCode += `${indent}${arrayVariable}.forEach((${forEachParams}) => {\n`;
          if (innerCode) {
            const indentedInnerCode = innerCode.split('\n').map(line => line ? `${indent}  ${line.trimStart()}` : '').join('\n');
            loopCode += indentedInnerCode + '\n';
          }
          loopCode += `${indent}});`;
          break;
        }
          
        case 'for': {
          const loopIndexVar = indexVariable || 'i';
          const initialization = stripVariableIndicators(params.initialization || `${loopIndexVar} = 0`);
          const loopCondition = stripVariableIndicators(params.loopCondition || `${loopIndexVar} < ${arrayVariable}.length`);
          const incrementOp = params.incrementOperation || 'i++';
          const customIncrement = stripVariableIndicators(params.customIncrement || '');
          const incrementStatement = incrementOp === 'custom' ? customIncrement : incrementOp.replace('i', loopIndexVar);
          
          loopCode += `${indent}for (let ${initialization}; ${loopCondition}; ${incrementStatement}) {\n`;
          if (innerCode) {
            const indentedInnerCode = innerCode.split('\n').map(line => line ? `${indent}  ${line.trimStart()}` : '').join('\n');
            loopCode += indentedInnerCode + '\n';
          }
          loopCode += `${indent}}`;
          break;
        }
          
        case 'while': {
          const whileCustomCondition = stripVariableIndicators(params.loopCondition || '');
          const loopIndexVar = indexVariable || 'i';
          
          if (whileCustomCondition) {
            // User provided custom while condition
            loopCode += `${indent}while (${whileCustomCondition}) {\n`;
          } else {
            // Default: iterate over array
            loopCode += `${indent}let ${loopIndexVar} = 0;\n`;
            const whileCondition = `${loopIndexVar} < ${arrayVariable}.length`;
            loopCode += `${indent}while (${whileCondition}) {\n`;
          }
          
          if (innerCode) {
            const indentedInnerCode = innerCode.split('\n').map(line => line ? `${indent}  ${line.trimStart()}` : '').join('\n');
            loopCode += indentedInnerCode + '\n';
          }
          
          if (!whileCustomCondition) {
            loopCode += `${indent}  ${loopIndexVar}++;\n`;
          }
          loopCode += `${indent}}`;
          break;
        }
          
        case 'map': {
          // Only include index parameter if user specified an index variable
          const mapParams = indexVariable ? `${itemVariable}, ${indexVariable}` : itemVariable;
          loopCode += `${indent}const ${resultVariable} = ${arrayVariable}.map((${mapParams}) => {\n`;
          if (innerCode) {
            const indentedInnerCode = innerCode.split('\n').map(line => line ? `${indent}  ${line.trimStart()}` : '').join('\n');
            loopCode += indentedInnerCode + '\n';
          }
          loopCode += `${indent}  return ${itemVariable};\n`;
          loopCode += `${indent}});`;
          break;
        }
          
        case 'filter': {
          // Only include index parameter if user specified an index variable
          const filterParams = indexVariable ? `${itemVariable}, ${indexVariable}` : itemVariable;
          loopCode += `${indent}const ${resultVariable} = ${arrayVariable}.filter((${filterParams}) => {\n`;
          if (filterCondition) {
            loopCode += `${indent}  return ${filterCondition};\n`;
          } else {
            loopCode += `${indent}  return true;\n`;
          }
          loopCode += `${indent}});`;
          break;
        }
          
        default:
          loopCode += `${indent}// Unknown loop type: ${loopType}`;
      }
      
      codeLines.push(loopCode);
      
      // Continue with exit edge
      const exitEdge = edges.find((e) => e.source === node.id && e.sourceHandle === 'exit');
      if (exitEdge) processNode(exitEdge.target);
      return;
    }
    
    if (nodeData.nodeType === 'If') {
      try {
        const params = nodeData.params || {};
        const conditionsStr = params.conditions || JSON.stringify([{ type: 'if', condition: 'true' }]);
        const conditions = JSON.parse(conditionsStr);
        
        let ifCode = '';
        
        for (let i = 0; i < conditions.length; i++) {
          const cond = conditions[i];
          const handleId = cond.type === 'else' ? 'else' : cond.type === 'if' ? 'if' : `elseif-${i}`;
          
          const branchNodes = getNodesInBranch(node.id, handleId, nodes, edges, new Set(processedNodes));
          branchNodes.forEach((n) => processedNodes.add(n.id));
          
          const branchCode = branchNodes
            .map((n) => generateNodeCode(n, indent + '  '))
            .filter(Boolean)
            .join('\n');
          
          // Determine branch body
          const branchBody = branchCode || `${indent}  // Add logic here`;
          
          if (cond.type === 'if') {
            const cleanCondition = stripVariableIndicators(cond.condition || 'true');
            ifCode += `${indent}if (${cleanCondition}) {\n`;
            ifCode += branchBody + '\n';
            ifCode += `${indent}}`;
          } else if (cond.type === 'elseif') {
            const cleanCondition = stripVariableIndicators(cond.condition || 'true');
            ifCode += ` else if (${cleanCondition}) {\n`;
            ifCode += branchBody + '\n';
            ifCode += `${indent}}`;
          } else if (cond.type === 'else') {
            ifCode += ` else {\n`;
            ifCode += branchBody + '\n';
            ifCode += `${indent}}`;
          }
        }
        
        codeLines.push(ifCode);
        
        const exitEdge = edges.find((e) => e.source === node.id && e.sourceHandle === 'exit');
        if (exitEdge) processNode(exitEdge.target);
      } catch {
        codeLines.push(`${indent}// Error parsing If node conditions`);
      }
    } else {
      const code = generateNodeCode(node, indent);
      if (code) codeLines.push(code);
      
      const nextEdge = edges.find((e) => e.source === nodeId);
      if (nextEdge) processNode(nextEdge.target);
    }
  };
  
  processNode(startNode.id);
  
  return codeLines.join('\n');
};

/**
 * Generates complete TypeScript code including HandleTransaction wrapper
 */
export const generateTypeScriptCode = (
  nodes: Node[],
  _edges: Edge[],
  nestedCanvasData: Record<string, NestedCanvasData>
): string => {
  // Check if there's a HandleTransaction node
  const handleTransactionNode = nodes.find((node) => node.data.nodeType === 'HandleTransaction');
  
  if (!handleTransactionNode || !nestedCanvasData[handleTransactionNode.id]) {
    return `// No HandleTransaction node found or no nested flow defined
// Please add a HandleTransaction node with nested flow to generate code`;
  }
  
  const nestedData = nestedCanvasData[handleTransactionNode.id];
  const nestedCode = generateNestedFlowCode(nestedData.nodes, nestedData.edges, '  ');
  
  // Generate the complete handleTransaction wrapper
  const code = `import { aql, type DatabaseManagerInstance, type LoggerService, type ManagerConfig } from '@tazama-lf/frms-coe-lib';
import type { OutcomeResult, RuleConfig, RuleRequest, RuleResult } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import { unwrap } from '@tazama-lf/frms-coe-lib/lib/helpers/unwrap';

export async function handleTransaction(
  req: RuleRequest,
  determineOutcome: (value: number, ruleConfig: RuleConfig, ruleResult: RuleResult) => RuleResult,
  ruleRes: RuleResult,
  loggerService: LoggerService,
  ruleConfig: RuleConfig,
  databaseManager: DatabaseManagerInstance<RuleExecutorConfig>,
): Promise<RuleResult> {
  
  const context = \`Rule-\${ruleConfig.id ? ruleConfig.id : '<unresolved>'} handleTransaction()\`;
  const msgId = req.transaction.FIToFIPmtSts.GrpHdr.MsgId;
  
  loggerService.trace('Start - handle transaction', context, msgId);
  
${nestedCode}
  
  loggerService.trace('End - handle transaction', context, msgId);
  
  return determineOutcome(count, ruleConfig, ruleRes);
}`;
  
  return code;
};
