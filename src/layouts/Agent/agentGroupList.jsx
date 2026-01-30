import { useState } from 'react';
import {
  Box,
  Button,
  Group,
  Table,
  LoadingOverlay,
  Stack,
  Text,
  ActionIcon,
  Tooltip,
  Card,
  Badge,
} from '@mantine/core';
import {
  IconPlus,
  IconRefresh,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../../helper/showNotification';
import { userAPI } from '../../helper/api';

const AgentGroupList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getListData = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAgentGroup();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'success') {
          setData(response.data.data || []);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load data',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to load data',
        color: 'red',
      });
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    navigate('/agentgroup-form', {
      state: {
        data: {
          id: 0,
          name: '',
          active: 'Yes',
        },
      },
    });
  };

  const handleEdit = (record) => {
    navigate('/agentgroup-form', {
      state: {
        data: {
          id: record.agentgroupid,
          name: record.agentgroupname,
          active: record.active,
        },
      },
    });
  };

  const handleDelete = async (record) => {
    if (
      window.confirm(`Are you sure want to delete [${record.agentgroupname}]?`)
    ) {
      try {
        const response = await userAPI.deleteAgentGroup(record.agentgroupid);

        if (response.success && response.data) {
          if (response.data.status?.toLowerCase() === 'ok') {
            showNotification({
              title: 'Success',
              message: 'Agent group deleted successfully',
              color: 'green',
            });
            getListData();
          } else {
            showNotification({
              title: 'Error',
              message: response.data.message || 'Failed to delete agent group',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to delete agent group',
            color: 'red',
          });
        }
      } catch (error) {
        showNotification({
          title: 'Error',
          message: 'Failed to delete agent group',
          color: 'red',
        });
        console.error('Error deleting agent group:', error);
      }
    }
  };

  const rows = data.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          fw={600}
          size="sm"
        >
          {item.agentgroupname}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={item.active === 'Yes' ? 'green' : 'red'}
          variant="light"
        >
          {item.active}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group
          gap="xs"
          wrap="nowrap"
        >
          <Tooltip label="Edit Agent Group">
            <ActionIcon
              variant="light"
              color="blue"
              size="md"
              onClick={() => handleEdit(item)}
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Agent Group">
            <ActionIcon
              variant="light"
              color="red"
              size="md"
              onClick={() => handleDelete(item)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box p="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        <Stack gap="lg">
          {/* Header */}
          <Group
            justify="space-between"
            align="center"
          >
            <Box>
              <Text
                size="xl"
                fw={700}
                c="dark"
              >
                Agent Group
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage agent groups
              </Text>
            </Box>
          </Group>

          {/* Action Buttons */}
          <Group>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleNew}
              variant="filled"
              color="blue"
              radius="md"
            >
              Add New
            </Button>
            <Button
              leftSection={<IconRefresh size={18} />}
              onClick={getListData}
              variant="light"
              color="gray"
              radius="md"
              disabled={loading}
            >
              Refresh
            </Button>
          </Group>

          {/* Table */}
          <Box
            pos="relative"
            style={{ minHeight: 300 }}
          >
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: 'md', blur: 2 }}
              loaderProps={{ color: 'blue', type: 'dots' }}
            />

            <Table
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              horizontalSpacing="md"
              verticalSpacing="sm"
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
              }}
              styles={{
                th: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#0f1011ff',
                  whiteSpace: 'nowrap',
                  padding: '12px 16px',
                },
                td: {
                  padding: '10px 16px',
                  fontSize: '14px',
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ minWidth: 200 }}>Group Name</Table.Th>
                  <Table.Th style={{ minWidth: 120 }}>Active</Table.Th>
                  <Table.Th style={{ minWidth: 120 }}>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? (
                  rows
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3}>
                      <Stack
                        align="center"
                        py="xl"
                        gap="xs"
                      >
                        <Text
                          size="lg"
                          c="dimmed"
                          fw={500}
                        >
                          No Data Available
                        </Text>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default AgentGroupList;
