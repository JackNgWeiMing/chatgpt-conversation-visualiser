import React, { useCallback, useMemo, useRef, useState } from "react";
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
import {
  Box,
  Stack,
  Text,
  Collapse,
  Title,
  Group,
  ScrollArea,
  ActionIcon,
  Textarea,
  Button,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useDisclosure, useHover } from "@mantine/hooks";
import { JsonView } from "react-json-view-lite";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

const prepareData = (input: any) => {
  let initialNodes: Object[] = [];
  let initialEdges: Object[] = [];
  // const mappings = input.mapping;

  let mainNodes: string[] = [];
  let lastNode = input.mapping[input.current_node];
  while (lastNode) {
    mainNodes.push(lastNode.id);
    lastNode._is_main = true;
    if (lastNode.parent) {
      lastNode = input.mapping[lastNode.parent];
    } else {
      lastNode = null;
    }
  }

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

  return {
    ...layouted,
    mainNodes,
  };
};

const defaultRawData = code_interpreter;
const defaultData = prepareData(defaultRawData);

export default function App() {
  const [jsonEdit, setJsonEdit] = useState(false);
  const { hovered, hoverRef } = useHover();
  const [panelOpened, panelHelper] = useDisclosure(false);

  const [rawData, setRawData] = useState(defaultRawData);
  const [preparedData, setPreparedData] = useState(defaultRawData);
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultData.edges);
  const refs = {
    panel: useRef<HTMLDivElement>(null),
    jsonTextarea: useRef<HTMLTextAreaElement>(null),
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const nodeTypes = useMemo(() => {
    return {
      general: GeneralNode,
    };
  }, []);

  const setNewJson = (content: any) => {
    return new Promise((resolve, reject) => {
      let parsedJSON = null as null | Object;
      try {
        parsedJSON = JSON.parse(content) as Object;
      } catch (error) {
        console.error("Error parsing JSON:", error);
        reject("Invalid JSON");
      }

      const preparedData = prepareData(parsedJSON);
      // @ts-ignore
      setRawData(parsedJSON);
      setNodes(preparedData.nodes);
      setEdges(preparedData.edges);
      setPreparedData(preparedData.nodes);

      resolve(prepareData);
    });
  };

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
        setNewJson(content);
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
        style={{ backgroundColor: "#888" }}
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        zoomOnScroll={false}
        panOnScroll={true}
      >
        <Background color="#fff" variant={BackgroundVariant.Dots} />
        <Panel position="bottom-right">
          <Box
            tabIndex={0}
            ref={refs.panel}
            onMouseEnter={() => {
              if (!refs.panel.current?.contains(document.activeElement)) {
                panelHelper.open();
              }
            }}
            onMouseLeave={() => {
              if (!refs.panel.current?.contains(document.activeElement)) {
                panelHelper.close();
              }
            }}
            p={16}
            bg="white"
            w="800px"
            sx={(theme) => {
              return { border: `1px solid ${theme.colors.gray[3]}` };
            }}
          >
            <Group position="apart" mb={4}>
              <Title size={"sm"}>Setting</Title>
              <ActionIcon
                onClick={() => {
                  panelHelper.close();
                  setTimeout(() => {
                    (document.activeElement as HTMLElement)?.blur();
                  }, 1000);
                }}
              >
                {panelOpened ? <IconChevronDown /> : <IconChevronUp />}
              </ActionIcon>
            </Group>
            <Collapse in={panelOpened || hovered}>
              <Stack h="80vh">
                <ScrollArea style={{ flexGrow: 1, position: "relative" }}>
                  {jsonEdit ? (
                    <>
                      <Textarea
                        ref={refs.jsonTextarea}
                        autosize
                        style={{ maxHeight: "100%" }}
                        defaultValue={JSON.stringify(rawData, null, 2)}
                      ></Textarea>
                    </>
                  ) : (
                    <Box>
                      <Button
                        onClick={() => {
                          setJsonEdit(true);
                        }}
                        style={{ position: "absolute", right: 10, bottom: 10 }}
                      >
                        Edit
                      </Button>
                      <JsonView data={rawData} />
                    </Box>
                  )}
                </ScrollArea>
                {jsonEdit ? (
                  <Group>
                    <Button
                      variant="outline"
                      style={{ flexGrow: 1 }}
                      onClick={() => {
                        setJsonEdit(false);
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      style={{ flexGrow: 1 }}
                      onClick={() => {
                        const content = refs.jsonTextarea.current?.value;
                        console.log("what is thsi", content);

                        setNewJson(content).then(() => {
                          notifications.show({
                            message: "Updated",
                          });
                        });
                      }}
                    >
                      Submit
                    </Button>
                  </Group>
                ) : null}

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
            </Collapse>
          </Box>
        </Panel>
      </ReactFlow>
    </div>
  );
}
