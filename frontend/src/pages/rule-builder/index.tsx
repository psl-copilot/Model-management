import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import type { Node, Edge } from '@xyflow/react';
import LeftSidebar from '../../components/RuleBuilder/LeftSidebar';
import Header from '../../components/RuleBuilder/Header';
import RuleBuilderCanvas from '../../components/RuleBuilder/Canvas';
import RightSidebar from '../../components/RuleBuilder/RightSidebar';
import NestedCanvas from '../../components/RuleBuilder/NestedCanvas';
import OutputModal from '../../components/RuleBuilder/OutputModal';
import { simulateNodeExecution } from '../../utils/Flow/FlowExecutor';
import type { DebugLog } from '../../components/RuleBuilder/DebuggerPanel';

interface NestedCanvasData {
  nodes: Node[];
  edges: Edge[];
}

const RuleBuilder: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Nested canvas state
  const [activeNestedCanvas, setActiveNestedCanvas] = useState<string | null>(null);
  const [activeNestedCanvasLabel, setActiveNestedCanvasLabel] = useState<string>('Handle Transaction');
  const [nestedCanvasData, setNestedCanvasData] = useState<Record<string, NestedCanvasData>>({});
  
  // Modal state
  const [jsonModalOpen, setJsonModalOpen] = useState<boolean>(false);
  const [codeModalOpen, setCodeModalOpen] = useState<boolean>(false);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [codeOutput, setCodeOutput] = useState<string>('');
  
  // Animation and debugging state
  const [debugVariables, setDebugVariables] = useState<Record<string, unknown>>({});
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [currentAnimationNode, setCurrentAnimationNode] = useState<string | undefined>();
  
  // Use ref to store the node update handler from Canvas
  const nodeUpdateHandlerRef = useRef<((nodeId: string, updates: Record<string, unknown>) => void) | null>(null);
  
  // Refs for animation
  const animationTimeoutRef = useRef<number | null>(null);
  const flowVarsRef = useRef<Record<string, unknown>>({});
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const setNodesRef = useRef<((nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void) | null>(null);
  const setEdgesRef = useRef<((edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void) | null>(null);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const stopAnimation = useCallback(() => {
    console.log('STOP command received.');
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    setIsPlaying(false);
    setCurrentAnimationNode(undefined);
    
    if (setNodesRef.current) {
      setNodesRef.current((nds: Node[]) => nds.map((n) => ({ ...n, selected: false })));
    }
    if (setEdgesRef.current) {
      setEdgesRef.current((eds: Edge[]) => eds.map((e) => ({ ...e, selected: false })));
    }
  }, []);

  const playFlowAnimation = useCallback((startNodeId?: string) => {
    // 1. Clear previous timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    // 2. Reset Debugger State
    setDebugVariables({});
    setDebugLogs([]);
    flowVarsRef.current = {};

    // 3. Find Start Node
    let startNode: Node | undefined;
    if (startNodeId) {
      startNode = nodesRef.current.find((n) => n.id === startNodeId);
    } else {
      console.log('--- ANIMATION START ---');
      startNode = nodesRef.current.find((n) => n.data.nodeType === 'Start');
      
      if (startNode) {
        setIsPlaying(true);
        
        // Clear selections
        if (setNodesRef.current) {
          setNodesRef.current((nds: Node[]) => nds.map((n) => ({ ...n, selected: false })));
        }
        if (setEdgesRef.current) {
          setEdgesRef.current((eds: Edge[]) => eds.map((e) => ({ ...e, selected: false })));
        }
      }
    }

    if (!startNode) {
      if (!startNodeId) {
        alert("No 'Start' node found to begin animation.");
      }
      setIsPlaying(false);
      return;
    }

    // 4. Define Recursive Animation Step Function
    const animateStep = (nodeId: string, onDone?: () => void) => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      const node = currentNodes.find((n) => n.id === nodeId);
      if (!node) {
        if (onDone) onDone();
        return;
      }

      // --- SIMULATE NODE EXECUTION ---
      const { newVariables, logMessage, error } = simulateNodeExecution(
        node,
        flowVarsRef.current
      );
      
      // Update variable state
      flowVarsRef.current = newVariables;
      setDebugVariables({ ...newVariables });

      // Add log message
      if (logMessage) {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        setDebugLogs((prevLogs) => [
          ...prevLogs,
          {
            time: timestamp,
            message: logMessage,
            type: error ? 'error' : 'info',
          },
        ]);
      }

      // --- VISUAL HIGHLIGHTING ---
      console.log(`Animating step for node: ${nodeId}`);
      setCurrentAnimationNode(nodeId);
      
      if (setNodesRef.current) {
        setNodesRef.current((nds: Node[]) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
      }
      if (setEdgesRef.current) {
        setEdgesRef.current((eds: Edge[]) => eds.map((e) => ({ ...e, selected: false })));
      }

      // --- PROCEED TO NEXT NODE ---
      const proceedToNext = () => {
        const outgoingEdge = currentEdges.find((e) => e.source === nodeId);
        
        if (!outgoingEdge) {
          // No more nodes, animation complete
          if (onDone) onDone();
          return;
        }

        // Animate the edge
        animationTimeoutRef.current = setTimeout(() => {
          if (setEdgesRef.current) {
            setEdgesRef.current((eds: Edge[]) =>
              eds.map((e) => ({ ...e, selected: e.id === outgoingEdge.id }))
            );
          }
          if (setNodesRef.current) {
            setNodesRef.current((nds: Node[]) => nds.map((n) => ({ ...n, selected: false })));
          }

          // Find next node
          const nextNode = currentNodes.find((n) => n.id === outgoingEdge.target);
          if (nextNode) {
            animationTimeoutRef.current = setTimeout(() => {
              animateStep(nextNode.id, onDone);
            }, 800);
          } else {
            if (onDone) onDone();
          }
        }, 800);
      };

      // Execute next step after delay
      proceedToNext();
    };

    // 5. Start Animation
    animateStep(startNode.id, () => {
      console.log('Animation Complete.');
      setIsPlaying(false);
      setCurrentAnimationNode(undefined);
      
      if (setNodesRef.current) {
        setNodesRef.current((nds: Node[]) => nds.map((n) => ({ ...n, selected: false })));
      }
      if (setEdgesRef.current) {
        setEdgesRef.current((eds: Edge[]) => eds.map((e) => ({ ...e, selected: false })));
      }
    });
  }, []);

  const handlePlayClick = () => {
    playFlowAnimation();
  };

  const handleStopClick = () => {
    stopAnimation();
  };

  const handleDisplayJson = () => {
    // Call the exposed method from Canvas component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).generateFlowJson) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).generateFlowJson();
    }
  };

  const handleGenerateCode = () => {
    // Call the exposed method from Canvas component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).generateFlowCode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).generateFlowCode();
    }
  };

  const handleDownload = () => {
    if (!generatedCode) {
      alert('Generate code first');
      return;
    }
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowchart.ts';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleJsonGenerate = (json: string) => {
    setJsonOutput(json);
    setJsonModalOpen(true);
  };

  const handleCodeGenerate = (code: string) => {
    setGeneratedCode(code);
    setCodeOutput(code);
    setCodeModalOpen(true);
  };

  const handleNodeSelect = (node: Node | null) => {
    // Don't open sidebar for Start and End nodes
    if (node && (node.data.nodeType === 'Start' || node.data.nodeType === 'End')) {
      setSelectedNode(null);
      setActiveNestedCanvas(null);
      return;
    }
    
    // Check if the clicked node is HandleTransaction
    if (node && node.data.nodeType === 'HandleTransaction') {
      // Open nested canvas instead of right sidebar
      setActiveNestedCanvas(node.id);
      setActiveNestedCanvasLabel(String(node.data.label || 'Handle Transaction'));
      setSelectedNode(null); // Don't show right sidebar
    } else {
      setSelectedNode(node);
      setActiveNestedCanvas(null); // Close nested canvas if open
    }
  };

  const handleCloseRightSidebar = () => {
    setSelectedNode(null);
  };

  const handleNestedCanvasBack = () => {
    setActiveNestedCanvas(null);
  };

  const handleNestedCanvasSave = (nodeId: string, nodes: Node[], edges: Edge[]) => {
    setNestedCanvasData((prev) => ({
      ...prev,
      [nodeId]: { nodes, edges },
    }));
  };

  const handleNodeUpdate = (nodeId: string, updates: Record<string, unknown>) => {
    // Special case: if nodeId is '_handler', we're receiving the handler function
    if (nodeId === '_handler') {
      nodeUpdateHandlerRef.current = updates as unknown as (nodeId: string, updates: Record<string, unknown>) => void;
      return;
    }
    
    // Otherwise, use the stored handler to update the node
    if (nodeUpdateHandlerRef.current) {
      nodeUpdateHandlerRef.current(nodeId, updates);
    }
  };

  const handleFlowStateUpdate = useCallback((
    nodes: Node[], 
    edges: Edge[], 
    setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void, 
    setEdges: (edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void
  ) => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
    setNodesRef.current = setNodes;
    setEdgesRef.current = setEdges;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        isPlaying={isPlaying}
        onPlayClick={handlePlayClick}
        onStopClick={handleStopClick}
        onDisplayJson={handleDisplayJson}
        onGenerateCode={handleGenerateCode}
      />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <LeftSidebar 
          mode="main" 
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          hideCustomFunctions={activeNestedCanvas !== null}
        />
        <RuleBuilderCanvas
          isPlaying={isPlaying}
          onJsonGenerate={handleJsonGenerate}
          onCodeGenerate={handleCodeGenerate}
          onNodeSelect={handleNodeSelect}
          onNodeUpdate={handleNodeUpdate}
          debugVariables={debugVariables}
          debugLogs={debugLogs}
          currentNodeId={currentAnimationNode}
          onFlowStateUpdate={handleFlowStateUpdate}
        />
        <RightSidebar
          key={selectedNode?.id || 'no-selection'}
          selectedNode={selectedNode}
          onClose={handleCloseRightSidebar}
          onUpdateNode={handleNodeUpdate}
        />

        {/* Nested Canvas Overlay */}
        {activeNestedCanvas && (
          <NestedCanvas
            nodeId={activeNestedCanvas}
            nodeLabel={activeNestedCanvasLabel}
            initialNodes={nestedCanvasData[activeNestedCanvas]?.nodes}
            initialEdges={nestedCanvasData[activeNestedCanvas]?.edges}
            onBack={handleNestedCanvasBack}
            onSave={(nodes, edges) => handleNestedCanvasSave(activeNestedCanvas, nodes, edges)}
          />
        )}
      </Box>

      {/* JSON Output Modal */}
      <OutputModal
        open={jsonModalOpen}
        onClose={() => setJsonModalOpen(false)}
        title="JSON Output"
        content={jsonOutput}
        emptyMessage="Click 'Display JSON' to see output"
      />

      {/* TypeScript Code Modal */}
      <OutputModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        title="Generated TypeScript Code"
        content={codeOutput}
        emptyMessage="Click 'Generate Code' to see output"
        onDownload={handleDownload}
      />
    </Box>
  );
};

export default RuleBuilder;