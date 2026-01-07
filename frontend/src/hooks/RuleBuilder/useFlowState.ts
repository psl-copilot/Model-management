import { useState, useCallback } from 'react';
import type { Node } from '@xyflow/react';
import type { DebugLog } from '../../components/RuleBuilder/DebuggerPanel';

export const useFlowState = () => {
  // Modal state
  const [jsonModalOpen, setJsonModalOpen] = useState<boolean>(false);
  const [codeModalOpen, setCodeModalOpen] = useState<boolean>(false);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [codeOutput, setCodeOutput] = useState<string>('');
  
  // Animation and debugging state
  const [debugVariables, setDebugVariables] = useState<Record<string, unknown>>({});
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [currentAnimationNode, setCurrentAnimationNode] = useState<string | undefined>();
  
  // UI state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [allNodes, setAllNodes] = useState<Node[]>([]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleCloseRightSidebar = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleJsonGenerate = useCallback((json: string) => {
    try {
      const formatted = JSON.stringify(JSON.parse(json), null, 2);
      setJsonOutput(formatted);
    } catch (error) {
      console.error('JSON formatting error:', error);
      setJsonOutput(json);
    }
    setJsonModalOpen(true);
  }, []);

  const handleCodeGenerate = useCallback((code: string) => {
    setGeneratedCode(code);
    setCodeOutput(code);
    setCodeModalOpen(true);
  }, []);

  const handleDownload = useCallback((code: string) => {
    if (!code) {
      alert('Generate code first');
      return;
    }
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowchart.ts';
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    // Modal state
    jsonModalOpen,
    setJsonModalOpen,
    codeModalOpen,
    setCodeModalOpen,
    jsonOutput,
    setJsonOutput,
    codeOutput,
    setCodeOutput,
    
    // Animation and debugging state
    debugVariables,
    setDebugVariables,
    debugLogs,
    setDebugLogs,
    currentAnimationNode,
    setCurrentAnimationNode,
    
    // UI state
    selectedNode,
    setSelectedNode,
    sidebarCollapsed,
    setSidebarCollapsed,
    generatedCode,
    setGeneratedCode,
    allNodes,
    setAllNodes,
    
    // Handlers
    handleToggleSidebar,
    handleCloseRightSidebar,
    handleJsonGenerate,
    handleCodeGenerate,
    handleDownload,
  };
};
