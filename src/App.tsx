import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  BackgroundVariant,
  Background,
  MarkerType,
  Panel,
} from "reactflow";
import code_interpreter from "./datasource/code_interpreter.json";
import dagre from "dagre";

import "reactflow/dist/style.css";
import { GeneralNode } from "./CustomNodes";
import { Textarea, Box, Stack, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";

const prepareData = (input: any) => {
  let initialNodes: Object[] = [];
  let initialEdges: Object[] = [];
  // const mappings = input.mapping;

  const nodes = Object.entries(input.mapping) as any[];
  for (const [current_count, current_node] of nodes) {
    initialNodes.push({
      type: "general",
      id: current_node.id,
      position: { x: 50, y: (current_count - 1) * 450 },
      data: current_node,
    });

    // @ts-ignore
    if (current_node.parent) {
      initialEdges.push({
        // @ts-ignore
        id: "e-" + current_node.id + "-" + current_node.parent,
        // @ts-ignore
        source: current_node.parent,
        target: current_node.id,
        markerEnd: {
          type: MarkerType.Arrow,
        },
      });
    }
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

  return layouted;
};

const defaultRawData = code_interpreter;
const defaultData = prepareData(defaultRawData);

export default function App() {
  const [rawData, setRawData] = useState(defaultRawData);
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultData.edges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = useMemo(() => {
    return {
      general: GeneralNode,
    };
  }, []);

  const handleDrop = (files) => {
    // alert("File dropped");
    // console.log("what is my file", files);
    if (files.length > 1) {
      notifications.show({
        message: "Only one file can be dropped at a time",
      });
      return;
    }

    const file = files[0];

    if (file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event?.target?.result as string;
        if (!content) {
          console.error("No content found in file");
          return;
        }

        try {
          const parsedJSON = JSON.parse(content);
          console.log("File content is a valid JSON:", parsedJSON);
          debugger;

          const { nodes, edges } = prepareData(parsedJSON);
          // @ts-ignore
          setRawData(parsedJSON);
          setNodes(nodes);
          setEdges(edges);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    } else {
      console.log("Dropped file is not a JSON file.");
    }
  };

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
        <Panel position="bottom-right">
          <Box p={16} bg="white">
            <Stack>
              <Textarea
                minRows={5}
                label="JSON string"
                value={JSON.stringify(rawData, null, 2)}
              ></Textarea>
              <Dropzone onDrop={handleDrop} accept={["application/json"]}>
                <Stack style={{ gap: 4 }}>
                  <Text size="lg" inline>
                    Drag a json file
                  </Text>
                  <Text size="lg" color="dimmed" inline mt={7}>
                    Attach as many files as you like, each file should not
                    exceed 5mb
                  </Text>
                </Stack>
              </Dropzone>
            </Stack>
          </Box>
        </Panel>
      </ReactFlow>
    </div>
  );
}
