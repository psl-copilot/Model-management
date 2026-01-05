import type { Node, Edge } from '@xyflow/react';
import type { EditableNodeData } from '../../components/RuleBuilder/EditableNode';
import { getNodesInBranch } from '../Common/helpers';

interface NestedCanvasData {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Converts text with variable references to template literal syntax
 * Example: "User ID is {{ RuleRequest.userId }}" -> `User ID is ${RuleRequest.userId}`
 * Example: "The value is {{ x }}" -> `The value is ${x}`
 */
const convertToTemplateLiteral = (text: string): string => {
  // Pattern to match {{ variableName }} or {{ RuleRequest.property }}
  const varPattern = /\{\{\s*(.+?)\s*\}\}/g;
  
  // Check if text contains any variables
  if (!varPattern.test(text)) {
    // No variables, return as string literal
    return `'${text.replace(/'/g, "\\'")}'`;
  }
  
  // Reset regex
  varPattern.lastIndex = 0;
  
  // Replace {{ varName }} with ${varName}
  const templateContent = text.replace(varPattern, '${$1}');
  
  // Return as template literal
  return '`' + templateContent.replace(/`/g, '\\`') + '`';
};

/**
 * Generates TypeScript code for a single node
 */
const generateNodeCode = (node: Node, indent: string = ''): string => {
  const nodeData = node.data as EditableNodeData;
  const params = nodeData.params || {};
  
  switch (nodeData.nodeType) {
    case 'Start':
      return `${indent}// Start of flow`;
      
    case 'End':
      return `${indent}// End of flow`;
      
    case 'SetVariable': {
      const varName = params.name || params.variableName || 'variable';
      const varValue = params.value || params.variableValue || '""';
      
      // Check if value is a number
      const isNumber = !isNaN(Number(varValue)) && varValue.trim() !== '';
      
      // Check if value contains variables in {{ }} syntax
      const hasVariables = /\{\{\s*.+?\s*\}\}/.test(varValue);
      
      let valueStr: string;
      if (isNumber) {
        valueStr = varValue;
      } else if (hasVariables) {
        // Convert to template literal if it contains variables
        valueStr = convertToTemplateLiteral(varValue);
      } else {
        // Regular string
        valueStr = varValue.startsWith('"') ? varValue : `"${varValue}"`;
      }
      
      return `${indent}const ${varName} = ${valueStr};`;
    }
    
    case 'Log': {
      const message = params.text || params.message || '';
      // Convert to template literal if it contains variables
      const messageStr = convertToTemplateLiteral(message);
      return `${indent}loggerService.log(${messageStr}, context, msgId);`;
    }
    
    case 'Import': {
      const importStatement = params.importStatement || 'module';
      return `${indent}// Import: ${importStatement}`;
    }
    
    case 'If': {
      // Parse conditions from JSON
      try {
        const conditionsStr = params.conditions || JSON.stringify([{ type: 'if', condition: 'true' }]);
        const conditions = JSON.parse(conditionsStr);
        
        let code = '';
        conditions.forEach((cond: { type: string; condition?: string }) => {
          if (cond.type === 'if') {
            // Keep variable paths as-is in generated code
            code += `${indent}if (${cond.condition || 'true'}) {\n${indent}  // Add logic here\n${indent}}`;
          } else if (cond.type === 'elseif') {
            code += ` else if (${cond.condition || 'true'}) {\n${indent}  // Add logic here\n${indent}}`;
          } else if (cond.type === 'else') {
            code += ` else {\n${indent}  // Default logic\n${indent}}`;
          }
        });
        
        return code;
      } catch {
        return `${indent}if (true) {\n${indent}  // Add logic here\n${indent}}`;
      }
    }
    
    case 'FetchDB': {
      const resultVar = params.resultVar || params.variable || 'dbResult';
      const query = params.query || 'SELECT * FROM table';
      
      // Extract variables from {{ }} syntax and replace with parameterized placeholders
      const varPattern = /\{\{\s*(.+?)\s*\}\}/g;
      const globalVars: string[] = [];
      let parameterizedQuery = query;
      
      // Find all variables in {{ }} format
      const matches = [...query.matchAll(varPattern)];
      if (matches.length > 0) {
        const uniqueVars = Array.from(new Set(matches.map(m => m[1])));
        uniqueVars.forEach((varPath, index) => {
          globalVars.push(varPath);
          // Replace {{ varPath }} with parameterized placeholder ($1, $2, etc.)
          const placeholder = `$${index + 1}`;
          const escapedVar = varPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          parameterizedQuery = parameterizedQuery.replace(new RegExp(`\\{\\{\\s*${escapedVar}\\s*\\}\\}`, 'g'), placeholder);
        });
      }
      
      // Generate the query constant name (e.g., getAmtNewestPacs008 -> queryName)
      const queryConstName = `query${resultVar.charAt(0).toUpperCase()}${resultVar.slice(1)}`;
      
      const lines = [
        `${indent}// Define parameterized query`,
        `${indent}const ${queryConstName} = \`${parameterizedQuery.replace(/`/g, '\\`')}\`;`,
        '',
      ];
      
      // Generate the query execution with parameters
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
    }
    
    case 'Code': {
      const code = params.code || '// Custom code';
      // Keep variable paths as-is in generated code
      return `${indent}${code}`;
    }
    
    case 'ThrowError': {
      const message = params.text || params.message || 'Error occurred';
      // Convert to template literal if it contains variables
      const messageStr = convertToTemplateLiteral(message);
      return `${indent}throw new Error(${messageStr});`;
    }
    
    case 'CustomFunction': {
      const funcName = params.functionName || 'customFunction';
      const resultVar = params.resultVar || 'result';
      return `${indent}const ${resultVar} = await ${funcName}();`;
    }
    
    default:
      return `${indent}// ${nodeData.nodeType} - ${nodeData.label}`;
  }
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
          
          if (cond.type === 'if') {
            ifCode += `${indent}if (${cond.condition || 'true'}) {\n`;
            ifCode += branchCode || `${indent}  // Empty if branch\n`;
            ifCode += `${indent}}`;
          } else if (cond.type === 'elseif') {
            ifCode += ` else if (${cond.condition || 'true'}) {\n`;
            ifCode += branchCode || `${indent}  // Empty else if branch\n`;
            ifCode += `${indent}}`;
          } else if (cond.type === 'else') {
            ifCode += ` else {\n`;
            ifCode += branchCode || `${indent}  // Empty else branch\n`;
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
