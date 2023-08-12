import {
  ActionIcon,
  Box,
  Code,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
  rem,
} from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
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
import { useDisclosure } from "@mantine/hooks";

export function GeneralNode({ data }) {
  const role = data?.message?.author?.role;
  const content_type = data?.message?.content?.content_type;
  const content = data?.message?.content?.parts?.[0];
  const attactments = data?.message?.metadata?.attachments;
  const user_context_message =
    data?.message?.metadata?.user_context_message_data?.about_model_message;

  const [opened, { close, open }] = useDisclosure(false);

  const fields = [
    {
      label: "Role",
      value: role,
    },
    {
      label: "Content Type",
      value: content_type,
    },
    {
      label: "Content",
      value: content,
    },
    attactments && attactments.length
      ? {
          label: "Attactments",
          value: attactments && attactments.length ? "Has Attachment" : null,
        }
      : null,
    user_context_message
      ? {
          label: "User Context Message",
          value: user_context_message,
        }
      : null,
  ].filter(Boolean);

  return (
    <div style={{ width: 400, height: 400 }}>
      <Box
        sx={(them) => {
          return {
            backgroundColor: them.white,
            width: 400,
            height: 400,
            border: "1px solid #f2eeee",
            boxShadow: them.shadows.md,
            borderRadius: them.radius.md,
          };
        }}
      >
        <Handle type="target" position={Position.Left} />
        <Group position="apart" px={16} py={8}>
          <Title size={"xs"} transform="capitalize">
            {role}
          </Title>
          <Title size={"xs"}>{content_type}</Title>
        </Group>

        <Divider></Divider>
        <Stack p={16} style={{ gap: 4 }}>
          {fields.map((field) => {
            return (
              <Group style={{ flexWrap: "nowrap" }}>
                <Text size={"xs"} w={100}>
                  {field.label}
                </Text>
                <TextInput
                  size="xs"
                  style={{ flexGrow: 1, textTransform: "capitalize" }}
                  value={field.value}
                  rightSection={
                    field.value ? (
                      <div
                        onClick={() => {
                          // modals.openModal({});
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
                                  {field.value}
                                </Code>
                              </Box>
                            ),
                            labels: { confirm: "Confirm", cancel: "Cancel" },
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
                        <IconEye size={rem(20)} color="#ccc" />
                      </div>
                    ) : null
                  }
                />
              </Group>
            );
          })}
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
