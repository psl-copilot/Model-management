import React, { useState, useCallback, useRef } from 'react';
import type { DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  type ReactFlowInstance,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditableNode, { type EditableNodeData } from '../EditableNode';
import { getNodeTemplate } from '../../../utils/Templates/customFuncTemplate';
import DebuggerPanel, { type DebugLog } from '../DebuggerPanel';
import { sortNodesInFlowOrder, getLabelForHandle, getColorForHandle } from '../../../utils/Common/helpers';
import { generateTypeScriptCode } from '../../../utils/Flow/CodeGenerator';
import { generateNodeId, getDefaultFlow } from '../../../utils/Flow/FlowDefaults';

const nodeTypes = {
  editableNode: EditableNode,
};

interface NestedCanvasData {
  nodes: Node[];
  edges: Edge[];
}

interface CanvasProps {
  isPlaying?: boolean;
  onJsonGenerate?: (json: string) => void;
  onCodeGenerate?: (code: string) => void;
  onNodeSelect?: (node: Node | null) => void;
  onNodeUpdate?: (nodeId: string, updates: Record<string, unknown>) => void;
  debugVariables?: Record<string, unknown>;
  debugLogs?: DebugLog[];
  currentNodeId?: string;
  nestedCanvasData?: Record<string, NestedCanvasData>;
  onFlowStateUpdate?: (
    nodes: Node[], 
    edges: Edge[], 
    setNodes: (nodes: Node[] | ((prevNodes: Node[]) => Node[])) => void, 
    setEdges: (edges: Edge[] | ((prevEdges: Edge[]) => Edge[])) => void
  ) => void;
  viewOnly?: boolean;
}



const RuleBuilderCanvas: React.FC<CanvasProps> = ({ 
  isPlaying, 
  onJsonGenerate, 
  onCodeGenerate,
  onNodeSelect,
  onNodeUpdate,
  nestedCanvasData = {},
  debugVariables = {},
  debugLogs = [],
  currentNodeId,
  onFlowStateUpdate,
  viewOnly = false,
}) => {
  // Generate initial nodes and edges once using lazy initialization
  const [initialNodesEdges] = useState(() => {
    const defaultFlow = getDefaultFlow();
    return {
      nodes: defaultFlow.mainCanvas.nodes as Node[],
      edges: defaultFlow.mainCanvas.edges as Edge[],
    };
  });
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesEdges.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialNodesEdges.edges);
  const [panelHeight, setPanelHeight] = useState(80); // Percentage height of debugger panel
  const [isResizing, setIsResizing] = useState(false);
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false); // Separate state for debugger visibility

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // History management for undo/redo
  const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const redoRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const saveHistory = useCallback(() => {
    historyRef.current.push({ nodes: [...nodes], edges: [...edges] });
    redoRef.current = [];
  }, [nodes, edges]);

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect]
  );

  // Handle clicking on pane (deselect)
  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  // Handle node updates from RightSidebar
  const handleNodeUpdate = useCallback(
    (nodeId: string, updates: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
    },
    [setNodes]
  );

  // Expose handleNodeUpdate to parent
  React.useEffect(() => {
    if (onNodeUpdate) {
      // Pass the handler to parent so it can be used by RightSidebar
      onNodeUpdate('_handler', handleNodeUpdate as unknown as Record<string, unknown>);
    }
  }, [onNodeUpdate, handleNodeUpdate]);

  // Sync flow state with parent for animation
  React.useEffect(() => {
    if (onFlowStateUpdate) {
      onFlowStateUpdate(nodes, edges, setNodes, setEdges);
    }
  }, [nodes, edges, onFlowStateUpdate, setNodes, setEdges]);

  // Auto-open debugger when play starts
  React.useEffect(() => {
    if (isPlaying) {
      setIsDebuggerOpen(true);
    }
  }, [isPlaying]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Find the source node to check if it's an If node
      const sourceNode = nodes.find((n) => n.id === params.source);
      const isIfNode = sourceNode?.data.nodeType === 'If';
      
      if (!isIfNode) {
        // For non-If nodes, check if source already has an outgoing edge
        const sourceHasEdge = edges.some((edge) => edge.source === params.source);
        
        if (sourceHasEdge) {
          console.warn('Each node can only have one outgoing connection');
          return;
        }
      } else {
        // For If nodes, check if this specific handle already has an edge
        const handleHasEdge = edges.some(
          (edge) => edge.source === params.source && edge.sourceHandle === params.sourceHandle
        );
        
        if (handleHasEdge) {
          console.warn('This condition already has a connection');
          return;
        }
      }
      
      // Add label and style for If node edges
      const edgeWithLabel = {
        ...params,
        label: isIfNode && params.sourceHandle ? getLabelForHandle(params.sourceHandle) : undefined,
        style: isIfNode && params.sourceHandle ? { 
          stroke: getColorForHandle(params.sourceHandle),
          strokeWidth: 2,
        } : undefined,
      };
      
      saveHistory();
      setEdges((eds) => addEdge(edgeWithLabel, eds));
    },
    [nodes, edges, setEdges, saveHistory]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');

      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const template = getNodeTemplate(type);
      const newNodeId = generateNodeId();

      // Initialize params with default values from template
      const defaultParams: Record<string, string> = {};
      if (template?.inputs) {
        template.inputs.forEach((input) => {
          defaultParams[input.key] = input.defaultValue || '';
        });
      }

      const newNode: Node = {
        id: newNodeId,
        type: 'editableNode',
        position,
        data: {
          label: template?.displayName || type,
          nodeType: type,
          params: defaultParams,
          onChange: (value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNodeId
                  ? { ...node, data: { ...node.data, label: value } }
                  : node
              )
            );
          },
          onParamChange: (paramKey: string, value: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNodeId
                  ? {
                      ...node,
                      data: {
                        ...node.data,
                        params: { ...(node.data.params as Record<string, string> || {}), [paramKey]: value },
                      },
                    }
                  : node
              )
            );
          },
        } as EditableNodeData,
      };

      saveHistory();
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, saveHistory]
  );

  // Keyboard shortcuts
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Check if any input/textarea is focused - don't delete if user is typing
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return; // Don't delete when typing in input fields
        }

        const selectedNodes = nodes.filter((node) => node.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);

        // Check if any protected nodes are selected
        const hasProtectedNodes = selectedNodes.some(
          (node) => 
            node.data.nodeType === 'Start' || 
            node.data.nodeType === 'HandleTransaction' || 
            node.data.nodeType === 'End'
        );

        // Filter out protected nodes (Start, HandleTransaction, End) from deletion
        const deletableNodes = selectedNodes.filter(
          (node) => 
            node.data.nodeType !== 'Start' && 
            node.data.nodeType !== 'HandleTransaction' && 
            node.data.nodeType !== 'End'
        );

        // Only proceed if there are nodes/edges to delete
        if (deletableNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault(); // Prevent browser back navigation
          saveHistory();
          
          // Delete only non-protected nodes
          if (deletableNodes.length > 0) {
            const deletableIds = new Set(deletableNodes.map(n => n.id));
            setNodes((nds) => nds.filter((node) => !deletableIds.has(node.id)));
          }
          
          // Delete selected edges
          if (selectedEdges.length > 0) {
            setEdges((eds) => eds.filter((edge) => !edge.selected));
          }
        } else if (hasProtectedNodes) {
          // Prevent default to stop browser navigation even if only protected nodes are selected
          event.preventDefault();
        }
      }

      // Undo: Ctrl+Z
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (historyRef.current.length > 0) {
          const previous = historyRef.current.pop()!;
          redoRef.current.push({ nodes: [...nodes], edges: [...edges] });
          setNodes(previous.nodes);
          setEdges(previous.edges);
        }
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
        event.preventDefault();
        if (redoRef.current.length > 0) {
          const next = redoRef.current.pop()!;
          historyRef.current.push({ nodes: [...nodes], edges: [...edges] });
          setNodes(next.nodes);
          setEdges(next.edges);
        }
      }
    },
    [nodes, edges, setNodes, setEdges, saveHistory]
  );

  React.useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Handle panel resize
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const container = document.getElementById('canvas-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newHeight = ((containerRect.bottom - e.clientY) / containerRect.height) * 100;

      // Constrain between 20% and 70%
      if (newHeight >= 20 && newHeight <= 70) {
        setPanelHeight(newHeight);
      }
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Generate JSON output
  const generateJson = useCallback(() => {
    const flowData = {
      nodes: nodes.map((node) => {
        const baseNode = {
          id: node.id,
          type: node.data.nodeType,
          label: node.data.label,
          params: node.data.params || {},
          position: node.position,
        };
        
        // If HandleTransaction node, include nested canvas data
        if (node.data.nodeType === 'HandleTransaction' && nestedCanvasData[node.id]) {
          const nestedData = nestedCanvasData[node.id];
          const sortedNestedNodes = sortNodesInFlowOrder(nestedData.nodes, nestedData.edges);
          
          return {
            ...baseNode,
            nestedFlow: {
              nodes: sortedNestedNodes.map((nestedNode) => ({
                id: nestedNode.id,
                type: nestedNode.data.nodeType,
                label: nestedNode.data.label,
                params: nestedNode.data.params || {},
                position: nestedNode.position,
              })),
              edges: nestedData.edges.map((nestedEdge) => ({
                id: nestedEdge.id,
                source: nestedEdge.source,
                target: nestedEdge.target,
              })),
            },
          };
        }
        
        return baseNode;
      }),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
      })),
    };

    const json = JSON.stringify(flowData, null, 2);
    if (onJsonGenerate) {
      onJsonGenerate(json);
    }
  }, [nodes, edges, nestedCanvasData, onJsonGenerate]);

  // Generate TypeScript code
  const generateCode = useCallback(() => {
    const code = generateTypeScriptCode(nodes, edges, nestedCanvasData);

    if (onCodeGenerate) {
      onCodeGenerate(code);
    }
  }, [nodes, edges, nestedCanvasData, onCodeGenerate]);

  // Expose methods to parent via refs
  React.useEffect(() => {
    if (reactFlowInstance) {
      window.generateFlowJson = generateJson;
      window.generateFlowCode = generateCode;
    }
  }, [reactFlowInstance, generateJson, generateCode]);

  return (
    <Box 
      id="canvas-container"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}
    >
      <Box
        ref={reactFlowWrapper}
        sx={{ 
          height: isDebuggerOpen ? `${100 - panelHeight}%` : '100%', 
          width: '100%', 
          bgcolor: 'grey.50', 
          position: 'relative',
          overflow: 'hidden',
          transition: 'height 0.3s ease',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={viewOnly ? undefined : onNodesChange}
          onEdgesChange={viewOnly ? undefined : onEdgesChange}
          onConnect={viewOnly ? undefined : onConnect}
          onInit={setReactFlowInstance}
          onDrop={viewOnly ? undefined : onDrop}
          onDragOver={viewOnly ? undefined : onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 150, y: 50, zoom: 1 }}
          nodesDraggable={!isPlaying && !viewOnly}
          nodesConnectable={!isPlaying && !viewOnly}
          elementsSelectable={!isPlaying && !viewOnly}
          deleteKeyCode={null}
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-right">
            <Paper
              sx={{
                p: 1,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.75rem',
              }}
            >
              <Typography variant="caption">
                Nodes: {nodes.length} | Edges: {edges.length}
              </Typography>
            </Paper>
          </Panel>
        </ReactFlow>
      </Box>

      {/* Resize Handle - Only show when debugger is visible */}
      {isDebuggerOpen && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            height: '6px',
            width: '100%',
            backgroundColor: 'divider',
            cursor: 'ns-resize',
            position: 'relative',
            zIndex: 10,
            '&:hover': {
              backgroundColor: 'primary.main',
              height: '8px',
            },
            '&:active': {
              backgroundColor: 'primary.dark',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: 'grey.400',
            }}
          />
        </Box>
      )}

      {/* Debugger Panel - Visible when opened, stays open after animation */}
      {isDebuggerOpen && (
        <Paper
          sx={{
            height: `${panelHeight}%`,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1100,
          }}
        >
        {/* Debugger Panel Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'grey.50',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Debugger
          </Typography>
          <IconButton
            size="small"
            onClick={() => setIsDebuggerOpen(false)}
            title="Close debugger"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Debugger Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DebuggerPanel
            variables={debugVariables}
            logs={debugLogs}
            currentNodeId={currentNodeId}
            isPlaying={isPlaying || false}
          />
        </Box>
      </Paper>
    )}
    </Box>
  );
};

export default RuleBuilderCanvas;
