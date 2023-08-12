import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  BackgroundVariant,
  Background,
} from "reactflow";
import code_interpreter from "./datasource/code_interpreter.json";
import dagre from "dagre";

import "reactflow/dist/style.css";
import { GeneralNode } from "./CustomNodes";

const startNode = code_interpreter.mapping[code_interpreter.current_node];
let initialNodes = [];
let initialEdges = [];

let previous_node = null;
let current_count = 1;
let current_node = startNode;

// eslint-disable-next-line no-constant-condition
while (true) {
  initialNodes.push({
    type: "general",
    id: current_count.toString(),
    position: { x: 50, y: (current_count - 1) * 450 },
    data: current_node,
  });

  if (previous_node) {
    initialEdges.push({
      id: "e" + current_count,
      source: (current_count - 1).toString(),
      target: current_count.toString(),
    });
  }

  if (!current_node.parent) {
    break;
  }

  previous_node = current_node;
  current_node = code_interpreter.mapping[current_node.parent];
  current_count++;
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 400;
const nodeHeight = 400;

const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction, marginx: 100, marginy: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const layouted = getLayoutedElements(initialNodes, initialEdges, "LR");
console.log(layouted);

export default function App() {
  const { fitBounds } = useReactFlow();

  // const [nodes, setNodes, onNodesChange] = useNodesState(example.initialNodes);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(example.initialEdges);
  const [nodes, setNodes, onNodesChange] = useNodesState(layouted.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layouted.edges);

  // const nodesInitialized = useNodesInitialized({
  //   includeHiddenNodes: true, // this is the default
  // });

  // useEffect(() => {
  //   if (nodesInitialized) {
  //     onLayout("LR");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [nodesInitialized]);

  const onLayout = useCallback(
    (direction) => {
      const layouted = getLayoutedElements(nodes, edges, direction);

      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      window.requestAnimationFrame(() => {
        fitBounds();
      });
    },
    [nodes, edges]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = useMemo(() => {
    return {
      general: GeneralNode,
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div id="modal_target"></div>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        zoomOnScroll={false}
        panOnScroll={true}
      >
        <Background color="#000" variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}
