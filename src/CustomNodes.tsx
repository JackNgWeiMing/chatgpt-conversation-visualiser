import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Code,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Title,
  rem,
} from "@mantine/core";
import { IconEye, IconGitBranch } from "@tabler/icons-react";
import React, { useCallback } from "react";
/**
 * possible role: system , assistance , tool
 *
 * Requirement:
 * If there content show content
 * - author.role
 * - content.content_type
 * - click to show prettify message
 */

import { Handle, Position } from "reactflow";
import { modals } from "@mantine/modals";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

export function GeneralNode({ data }) {
  const is_main = data?._is_main;
  const role = data?.message?.author?.role;
  const content_type = data?.message?.content?.content_type;
  const content = data?.message?.content?.parts?.[0];
  const content_text = data?.message?.content?.text;
  const attactments = data?.message?.metadata?.attachments;
  const endTurn = data?.message?.end_turn;
  const user_context_message =
    data?.message?.metadata?.user_context_message_data?.about_model_message;

  const fields = [
    {
      label: "Role",
      rawValue: role,
      value: role,
    },
    {
      label: "Content Type",
      rawValue: content_type,
      value: content_type,
    },

    Boolean(content || content_text)
      ? {
          label: "Content",
          rawValue: content || content_text,
          value: (
            <Textarea minRows={5} value={content || content_text}></Textarea>
          ),
        }
      : null,
    attactments && attactments.length
      ? {
          label: "Attactments",
          rawValue: attactments,
          value: attactments && attactments.length ? true : false,
        }
      : null,
    Boolean(user_context_message)
      ? {
          label: "User Context Message",
          rawValue: user_context_message,
          value: <Textarea minRows={3}>{user_context_message}</Textarea>,
        }
      : null,
    typeof endTurn === "boolean"
      ? {
          label: "End Turn",
          rawValue: endTurn,
          value: <Checkbox checked={endTurn} />,
        }
      : null,
  ].filter(Boolean);

  return (
    <div style={{ width: 400, height: 400 }}>
      <Box
        sx={(them) => {
          return {
            display: "flex",
            flexDirection: "column",
            backgroundColor:
              {
                user: them.colors.green[0],
                system: them.colors.blue[0],
                assistant: them.colors.blue[0],
                tool: them.colors.yellow[0],
              }[role] ?? "#fff",
            width: 400,
            height: 400,
            border: "1px solid #f2eeee",
            borderRadius: them.radius.md,
          };
        }}
      >
        <Handle type="target" position={Position.Left} />
        <Group position="apart" px={16} py={8}>
          <Title size={"xs"} transform="capitalize">
            {is_main ? (
              <Badge
                leftSection={
                  <ActionIcon size="xs" radius="xl">
                    <IconGitBranch size={rem(10)} color="#fff" />
                  </ActionIcon>
                }
                color="indigo"
                variant="filled"
                mr="md"
              >
                Main
              </Badge>
            ) : (
              ""
            )}
            {role}{" "}
          </Title>
          <Title size={"xs"}>{content_type}</Title>
        </Group>

        <Divider></Divider>
        <Stack justify="space-between" style={{ flexGrow: 1 }}>
          <Stack p={16} style={{ gap: 4 }}>
            {fields.map((field) => {
              return (
                <Group style={{ flexWrap: "nowrap" }}>
                  <Group>
                    <Text size={"xs"} w={80}>
                      {field.label}
                    </Text>
                    {field.value ? (
                      <div
                        onClick={() => {
                          modals.openConfirmModal({
                            size: "lg",
                            title: "View Message",
                            children: (
                              <Box>
                                <Code
                                  block
                                  w="100%"
                                  style={{ whiteSpace: "pre-wrap" }}
                                >
                                  {typeof field.rawValue === "string"
                                    ? field.rawValue
                                    : JSON.stringify(field.rawValue, null, 2)}
                                </Code>
                              </Box>
                            ),
                            labels: {
                              confirm: "Confirm",
                              cancel: "Cancel",
                            },
                            onCancel: () => console.log("Cancel"),
                            onConfirm: () => console.log("Confirmed"),
                          });
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <IconEye size={rem(20)} />
                      </div>
                    ) : null}
                  </Group>

                  <Box
                    style={{
                      flexGrow: 1,
                    }}
                  >
                    {typeof field.value === "string" ? (
                      <TextInput
                        size="xs"
                        style={{ textTransform: "capitalize" }}
                        value={field.value}
                      />
                    ) : typeof field.value === "boolean" ? (
                      <Checkbox checked={field.value} />
                    ) : (
                      field.value
                    )}
                  </Box>
                </Group>
              );
            })}
          </Stack>
          <Button
            variant="outline"
            m={4}
            draggable={false}
            onDragStart={(event) => {
              event.stopPropagation();
              event.preventDefault();
            }}
            onClick={() => {
              modals.openConfirmModal({
                size: "lg",
                title: "View Message",
                children: (
                  <Box>
                    <JsonView data={data} />
                  </Box>
                ),
                labels: { confirm: "Confirm", cancel: "Cancel" },
                onCancel: () => console.log("Cancel"),
                onConfirm: () => console.log("Confirmed"),
              });
            }}
          >
            View all
          </Button>
        </Stack>
        <Handle type="source" position={Position.Right} id="a" />
      </Box>
    </div>
  );
}

// export function SystemNode() {
//   return null;
// }

// export function AssistantNode() {
//   return null;
// }

// export function ToolNode() {
//   return;
// }
