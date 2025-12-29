import type { Node } from '@xyflow/react';

export interface ExecutionResult {
  newVariables: Record<string, unknown>;
  logMessage: string | null;
  error: string | null;
}

/**
 * Simulates the execution logic of a node and tracks variable state
 */
export const simulateNodeExecution = (
  node: Node,
  currentVariables: Record<string, unknown>
): ExecutionResult => {
  const type = node.data.nodeType as string;
  const params = (node.data.params as Record<string, string>) || {};

  console.log(`[Simulator] Node: ${type}`, params);

  const newVariables = { ...currentVariables };
  let logMessage: string | null = null;
  let error: string | null = null;

  /**
   * Helper: Resolve a value (number or variable reference)
   */
  const resolve = (val: unknown): number => {
    if (val === undefined || val === null || val === '') return 0;

    // Check if it's a number
    const strVal = String(val);
    if (!isNaN(Number(strVal)) && strVal.trim() !== '') {
      return parseFloat(strVal);
    }

    // Check if it's a variable name
    const key = strVal.trim();
    if (currentVariables[key] !== undefined) {
      const varVal = currentVariables[key];
      return typeof varVal === 'number' ? varVal : Number(varVal) || 0;
    }

    return 0; // Default fallback
  };

  /**
   * Helper: Safe parameter lookup with fallback keys
   */
  const getParam = (keys: string[]): string | null => {
    for (const key of keys) {
      if (params[key] !== undefined && params[key] !== '') {
        return params[key];
      }
    }
    return null;
  };

  try {
    switch (type) {
      // BASIC NODES
      case 'Start':
        logMessage = '🚀 Process Started';
        break;

      case 'Import':
        logMessage = `📦 Imported module: ${params.importStatement || 'default'}`;
        break;

      case 'SetVariable': {
        const varName = getParam(['name', 'variableName']);
        const varValueRaw = getParam(['value', 'variableValue']);

        if (varName) {
          let finalValue: unknown = varValueRaw;

          // If value is a variable reference, resolve it
          if (varValueRaw && currentVariables[varValueRaw] !== undefined) {
            finalValue = currentVariables[varValueRaw];
          }
          // If it's a number, parse it
          else if (varValueRaw && !isNaN(Number(varValueRaw))) {
            finalValue = parseFloat(varValueRaw);
          }

          newVariables[varName] = finalValue;
          logMessage = `✅ Set ${varName} = ${finalValue}`;
        }
        break;
      }

      case 'Log': {
        let msg = getParam(['text', 'message']) || '';

        // Replace {{variable}} placeholders
        Object.keys(currentVariables).forEach((key) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          msg = msg.replace(regex, String(currentVariables[key]));
        });

        // Check if message is just a variable name
        if (msg && currentVariables[msg] !== undefined) {
          msg = `${msg}: ${currentVariables[msg]}`;
        }

        logMessage = `📝 LOG: ${msg}`;
        break;
      }

      case 'If': {
        const condition = getParam(['condition']);
        logMessage = `🔀 IF condition: ${condition}`;
        // Note: Actual condition evaluation would happen in real execution
        break;
      }

      // FUNCTION NODES
      case 'addTwoNumbers': {
        const val1 = resolve(getParam(['param1', 'a']));
        const val2 = resolve(getParam(['param2', 'b']));
        const sumResult = getParam(['resultVar', 'output']) || 'sum';

        const sum = val1 + val2;
        newVariables[sumResult] = sum;
        logMessage = `➕ Add: ${val1} + ${val2} = ${sum}`;
        break;
      }

      case 'calculateDiscount': {
        const price = resolve(getParam(['price', 'amount']));
        const percent = resolve(getParam(['discountPercent', 'discount']));
        const discResult = getParam(['resultVar', 'output']) || 'finalPrice';

        const discountAmount = price * (percent / 100);
        const finalPrice = price - discountAmount;

        newVariables[discResult] = finalPrice;
        logMessage = `💰 Discount: ${price} - ${percent}% = ${finalPrice.toFixed(2)}`;
        break;
      }

      case 'validateEmail': {
        const email = getParam(['email']) || '';
        const validRes = getParam(['resultVar']) || 'isValid';
        const isValid = email.includes('@');
        newVariables[validRes] = isValid;
        logMessage = `✉️ Validate Email (${email}) → ${isValid}`;
        break;
      }

      case 'fetchUserData': {
        const userId = getParam(['userId']) || '1';
        const userDataVar = getParam(['resultVar']) || 'userData';
        newVariables[userDataVar] = {
          id: userId,
          name: 'John Doe',
          email: 'john@example.com',
        };
        logMessage = `👤 Fetched user data for ID: ${userId}`;
        break;
      }

      case 'CustomFunction': {
        const funcName = getParam(['functionName']) || 'customFunc';
        const resVar = getParam(['resultVar']) || 'result';
        newVariables[resVar] = 'MOCK_RESULT';
        logMessage = `⚙️ Executed ${funcName}, result saved to ${resVar}`;
        break;
      }

      case 'FetchDB': {
        const dbVar = getParam(['variable', 'resultVar']) || 'dbResult';
        newVariables[dbVar] = { membership_level: 'GOLD', id: 123 };
        logMessage = `🗄️ Fetched DB → ${dbVar}`;
        break;
      }

      case 'Code':
        logMessage = '💻 Custom Code Executed';
        break;

      case 'ThrowError':
        error = getParam(['text', 'message']) || 'Error Occurred';
        logMessage = `❌ ERROR: ${error}`;
        break;

      case 'End':
        logMessage = '🏁 Process Ended';
        break;

      default:
        logMessage = `⏭️ [Skipped] Node Type: ${type}`;
        break;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
    logMessage = `❌ Execution Error: ${error}`;
    console.error('Simulator Error', e);
  }

  return { newVariables, logMessage, error };
};
