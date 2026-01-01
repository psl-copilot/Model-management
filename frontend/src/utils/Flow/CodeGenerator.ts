import type { Node, Edge } from '@xyflow/react';
import type { EditableNodeData } from '../../components/RuleBuilder/EditableNode';
import { getNodesInBranch } from '../Common/helpers';

interface NestedCanvasData {
  nodes: Node[];
  edges: Edge[];
}

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
      const isNumber = !isNaN(Number(varValue));
      const valueStr = isNumber ? varValue : `"${varValue}"`;
      
      return `${indent}const ${varName} = ${valueStr};`;
    }
    
    case 'Log': {
      const message = params.text || params.message || '';
      return `${indent}loggerService.log('${message}', context, msgId);`;
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
      const variable = params.variable || params.resultVar || 'dbResult';
      const query = params.query || 'SELECT * FROM table';
      return `${indent}const ${variable} = await databaseManager.executeQuery('${query}');`;
    }
    
    case 'Code': {
      const code = params.code || '// Custom code';
      return `${indent}${code}`;
    }
    
    case 'ThrowError': {
      const message = params.text || params.message || 'Error occurred';
      return `${indent}throw new Error('${message}');`;
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
