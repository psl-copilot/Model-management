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
import { getDefaultFlow } from '../../utils/Flow/FlowDefaults';

// Extend Window interface for flow generation methods
declare global {
  interface Window {
    generateFlowJson?: () => void;
    generateFlowCode?: () => void;
    generateNestedFlowJson?: () => void;
    generateNestedFlowCode?: () => void;
  }
}

interface NestedCanvasData {
  nodes: Node[];
  edges: Edge[];
}

interface RuleBuilderProps {
  viewOnly?: boolean;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({ viewOnly = false }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  
  // Nested canvas state - initialize with default flow
  const [activeNestedCanvas, setActiveNestedCanvas] = useState<string | null>(null);
  const [activeNestedCanvasLabel, setActiveNestedCanvasLabel] = useState<string>('Handle Transaction');
  const [nestedCanvasData, setNestedCanvasData] = useState<Record<string, NestedCanvasData>>(() => {
    const defaultFlow = getDefaultFlow();
    return defaultFlow.nestedCanvasData as Record<string, NestedCanvasData>;
  });
  
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
      const { newVariables, logMessage, error, branchHandle } = simulateNodeExecution(
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

      // --- PROCEED TO NEXT NODE FUNCTION (Define before nested flow logic) ---
      const proceedToNext = () => {
        // Check if current node is End node - if so, complete animation
        if (node.data.nodeType === 'End') {
          animationTimeoutRef.current = setTimeout(() => {
            if (onDone) onDone();
          }, 800);
          return;
        }
        
        // For If nodes, first execute the branch, then continue with exit handle
        if (node.data.nodeType === 'If' && branchHandle) {
          // Find the edge for the evaluated branch (right-side handle)
          const branchEdge = currentEdges.find((e) => e.source === nodeId && e.sourceHandle === branchHandle);
          
          if (branchEdge) {
            // Animate the branch edge
            animationTimeoutRef.current = setTimeout(() => {
              if (setEdgesRef.current) {
                setEdgesRef.current((eds: Edge[]) =>
                  eds.map((e) => ({ ...e, selected: e.id === branchEdge.id }))
                );
              }
              if (setNodesRef.current) {
                setNodesRef.current((nds: Node[]) => nds.map((n) => ({ ...n, selected: false })));
              }

              // Execute branch nodes
              const branchTargetNode = currentNodes.find((n) => n.id === branchEdge.target);
              if (branchTargetNode) {
                animationTimeoutRef.current = setTimeout(() => {
                  // Execute the branch, then come back to execute exit handle
                  animateStep(branchTargetNode.id, () => {
                    // After branch completes, follow exit handle
                    const exitEdge = currentEdges.find((e) => e.source === nodeId && e.sourceHandle === 'exit');
                    if (exitEdge) {
                      animationTimeoutRef.current = setTimeout(() => {
                        if (setEdgesRef.current) {
                          setEdgesRef.current((eds: Edge[]) =>
                            eds.map((e) => ({ ...e, selected: e.id === exitEdge.id }))
                          );
                        }
                        
                        const exitTargetNode = currentNodes.find((n) => n.id === exitEdge.target);
                        if (exitTargetNode) {
                          animationTimeoutRef.current = setTimeout(() => {
                            animateStep(exitTargetNode.id, onDone);
                          }, 800);
                        } else {
                          if (onDone) onDone();
                        }
                      }, 800);
                    } else {
                      // No exit path, complete
                      if (onDone) onDone();
                    }
                  });
                }, 800);
              } else {
                if (onDone) onDone();
              }
            }, 800);
            return;
          }
        }
        
        // For regular nodes or If nodes without branches, follow normal flow
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

      // --- CHECK FOR NESTED FLOW (HandleTransaction) ---
      const isHandleTransaction = node.data.nodeType === 'HandleTransaction';
      const hasNestedFlow = isHandleTransaction && nestedCanvasData[nodeId];
      
      if (hasNestedFlow) {
        const nestedData = nestedCanvasData[nodeId];
        const nestedStartNode = nestedData.nodes.find((n) => n.data.nodeType === 'Start');
        
        if (nestedStartNode) {
          // Execute nested flow recursively
          const executeNestedFlow = (nestedNodeId: string, onNestedComplete: () => void) => {
            const nestedNode = nestedData.nodes.find((n) => n.id === nestedNodeId);
            if (!nestedNode) {
              onNestedComplete();
              return;
            }

            // Execute nested node
            const nestedResult = simulateNodeExecution(nestedNode, flowVarsRef.current);
            flowVarsRef.current = nestedResult.newVariables;
            setDebugVariables({ ...nestedResult.newVariables });

            if (nestedResult.logMessage) {
              const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
              setDebugLogs((prevLogs) => [
                ...prevLogs,
                {
                  time: timestamp,
                  message: `  ↳ ${nestedResult.logMessage}`,
                  type: nestedResult.error ? 'error' : 'info',
                },
              ]);
            }

            // Check if this is the End node - if so, complete nested flow
            if (nestedNode.data.nodeType === 'End') {
              animationTimeoutRef.current = setTimeout(() => {
                onNestedComplete();
              }, 800);
              return;
            }

            // Handle If nodes in nested flow
            if (nestedNode.data.nodeType === 'If' && nestedResult.branchHandle) {
              const branchEdge = nestedData.edges.find(
                (e) => e.source === nestedNodeId && e.sourceHandle === nestedResult.branchHandle
              );
              
              if (branchEdge) {
                const branchTargetNode = nestedData.nodes.find((n) => n.id === branchEdge.target);
                if (branchTargetNode) {
                  animationTimeoutRef.current = setTimeout(() => {
                    executeNestedFlow(branchTargetNode.id, () => {
                      // After branch, follow exit handle
                      const exitEdge = nestedData.edges.find(
                        (e) => e.source === nestedNodeId && e.sourceHandle === 'exit'
                      );
                      if (exitEdge) {
                        const exitTargetNode = nestedData.nodes.find((n) => n.id === exitEdge.target);
                        if (exitTargetNode) {
                          animationTimeoutRef.current = setTimeout(() => {
                            executeNestedFlow(exitTargetNode.id, onNestedComplete);
                          }, 800);
                        } else {
                          onNestedComplete();
                        }
                      } else {
                        onNestedComplete();
                      }
                    });
                  }, 800);
                  return;
                }
              }
            }

            // Find next nested node (regular flow)
            const nestedOutgoingEdge = nestedData.edges.find((e) => e.source === nestedNodeId);
            if (nestedOutgoingEdge) {
              const nextNestedNode = nestedData.nodes.find((n) => n.id === nestedOutgoingEdge.target);
              if (nextNestedNode) {
                animationTimeoutRef.current = setTimeout(() => {
                  executeNestedFlow(nextNestedNode.id, onNestedComplete);
                }, 800);
              } else {
                onNestedComplete();
              }
            } else {
              onNestedComplete();
            }
          };

          // Execute nested flow and then continue main flow
          executeNestedFlow(nestedStartNode.id, () => {
            // Log nested flow completion
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
            setDebugLogs((prevLogs) => [
              ...prevLogs,
              {
                time: timestamp,
                message: '✅ Nested flow completed',
                type: 'info',
              },
            ]);
            
            // Continue with main flow
            proceedToNext();
          });
          
          // Exit here - proceedToNext will be called after nested flow completes
          return;
        }
      }

      // --- VISUAL HIGHLIGHTING ---
      setCurrentAnimationNode(nodeId);
      
      if (setNodesRef.current) {
        setNodesRef.current((nds: Node[]) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
      }
      if (setEdgesRef.current) {
        setEdgesRef.current((eds: Edge[]) => eds.map((e) => ({ ...e, selected: false })));
      }

      // Execute next step after delay (if not HandleTransaction with nested flow)
      if (!hasNestedFlow) {
        proceedToNext();
      }
    };

    // 5. Start Animation
    animateStep(startNode.id, () => {
      setIsPlaying(false);
      setCurrentAnimationNode(undefined);
      
      if (setNodesRef.current) {
        setNodesRef.current((nds: Node[]) => nds.map((n) => ({ ...n, selected: false })));
      }
      if (setEdgesRef.current) {
        setEdgesRef.current((eds: Edge[]) => eds.map((e) => ({ ...e, selected: false })));
      }
    });
  }, [nestedCanvasData]);

  const handlePlayClick = () => {
    // Always close nested canvas and start animation from main/parent canvas
    if (activeNestedCanvas) {
      // Close nested canvas (auto-save already handled by NestedCanvas component)
      setActiveNestedCanvas(null);
      setSelectedNode(null);
      // Wait for nested canvas to close before starting animation
      setTimeout(() => {
        playFlowAnimation();
      }, 100);
    } else {
      playFlowAnimation();
    }
  };

  const handleStopClick = () => {
    stopAnimation();
  };

  const handleDisplayJson = () => {
    // Always use main canvas JSON, even when nested canvas is open
    if (window.generateFlowJson) {
      window.generateFlowJson();
    }
  };

  const handleGenerateCode = () => {
    // Always use main canvas code generation, even when nested canvas is open
    if (window.generateFlowCode) {
      window.generateFlowCode();
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
    try {
      // Format JSON with 2-space indentation
      const formatted = JSON.stringify(JSON.parse(json), null, 2);
      setJsonOutput(formatted);
    } catch (error) {
      // If JSON parsing fails, display as-is
      console.error('JSON formatting error:', error);
      setJsonOutput(json);
    }
    setJsonModalOpen(true);
  };

  const handleCodeGenerate = (code: string) => {
    setGeneratedCode(code);
    setCodeOutput(code);
    setCodeModalOpen(true);
  };

  const handleNodeSelect = (node: Node | null) => {
    if (node) {
      // Check if it's a HandleTransaction node
      if (node.data.nodeType === 'HandleTransaction') {
        // Open nested canvas instead of right sidebar
        setActiveNestedCanvas(node.id);
        setActiveNestedCanvasLabel(String(node.data.label || 'Handle Transaction'));
        setSelectedNode(null); // Close right sidebar
      } else {
        // For other nodes, open right sidebar
        setSelectedNode(node);
        setActiveNestedCanvas(null); // Close nested canvas if open
      }
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
    setAllNodes(nodes);
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
        viewOnly={viewOnly}
      />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!viewOnly && (
          <LeftSidebar 
            mode="main" 
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
            hideCustomFunctions={activeNestedCanvas !== null}
          />
        )}
        <RuleBuilderCanvas
          isPlaying={isPlaying}
          onJsonGenerate={handleJsonGenerate}
          onCodeGenerate={handleCodeGenerate}
          onNodeSelect={handleNodeSelect}
          onNodeUpdate={handleNodeUpdate}
          debugVariables={debugVariables}
          debugLogs={debugLogs}
          currentNodeId={currentAnimationNode}
          nestedCanvasData={nestedCanvasData}
          viewOnly={viewOnly}
          onFlowStateUpdate={handleFlowStateUpdate}
        />
        <RightSidebar
          key={selectedNode?.id || 'no-selection'}
          selectedNode={selectedNode}
          onClose={handleCloseRightSidebar}
          onUpdateNode={handleNodeUpdate}
          allNodes={allNodes}
          viewOnly={viewOnly}
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
            viewOnly={viewOnly}
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
        language="json"
      />

      {/* TypeScript Code Modal */}
      <OutputModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        title="Generated TypeScript Code"
        content={codeOutput}
        emptyMessage="Click 'Generate Code' to see output"
        onDownload={handleDownload}
        language="typescript"
      />
    </Box>
  );
};

export default RuleBuilder;