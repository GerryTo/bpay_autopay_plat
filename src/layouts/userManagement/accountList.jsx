import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Group,
  Table,
  TextInput,
  LoadingOverlay,
  Stack,
  Text,
  ActionIcon,
  Tooltip,
  Paper,
  ScrollArea,
  Badge,
  Card,
  Pagination,
  Select,
} from '@mantine/core';
import {
  IconPlus,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconSearch,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../../helper/showNotification';
import { userAPI } from '../../helper/api';

const AccountList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter data based on search query
  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.login?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.merchantcode?.toLowerCase().includes(query) ||
      item.phoneNumber?.toLowerCase().includes(query) ||
      item.agentName?.toLowerCase().includes(query) ||
      item.alias?.toLowerCase().includes(query)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getListData = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getMasterLogin();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          // Records are already decoded in api.js
          const records = response.data.records || [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load data',
            Color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load data',
          Color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to load data',
        Color: 'red',
      });
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    navigate('/login-form', { state: { data: {} } });
  };

  const handleEdit = (record) => {
    navigate('/login-form', {
      state: {
        data: {
          login: record.login,
          active: record.active,
          merchantcode: record.merchantcode,
          logintype: record.type,
          phoneNumber: record.phoneNumber,
          agentName: record.agentName,
          alias: record.alias,
          status: record.status,
          agentgroupid: record.agentgroupid,
          useCredit: record.useCredit,
          isdm: record.isdm,
          issetmerchant: record.issetmerchant,
          access: record.menuaccess || record.access || 0,
          provider: record.provider || '',
        },
      },
    });
  };

  const handleDelete = async (record) => {
    if (window.confirm(`Are you sure want to delete [${record.login}]?`)) {
      try {
        const response = await userAPI.deleteMasterLogin(record.login);

        if (response.success && response.data) {
          if (response.data.status?.toLowerCase() === 'ok') {
            showNotification({
              title: 'Success',
              message: 'User deleted successfully',
              Color: 'green',
            });
            // Reload the data from server
            getListData();
          } else {
            showNotification({
              title: 'Error',
              message: response.data.message || 'Failed to delete user',
              Color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to delete user',
            Color: 'red',
          });
        }
      } catch (error) {
        showNotification({
          title: 'Error',
          message: 'Failed to delete user',
          Color: 'red',
        });
        console.error('Error deleting user:', error);
      }
    }
  };

  useEffect(() => {
    getListData();
  }, []);

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          fw={600}
          size="sm"
          c="blue"
        >
          {item.login}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={item.active === 'Y' ? 'green' : 'red'}
          variant="light"
        >
          {item.active === 'Y' ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          color="blue"
          variant="outline"
        >
          {item.type}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.merchantcode}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.phoneNumber}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.agentName}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.alias}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={item.isdm === 'Y' ? 'teal' : 'gray'}
          size="sm"
          variant="dot"
        >
          {item.isdm === 'Y' ? 'Yes' : 'No'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          color={item.issetmerchant === 'Y' ? 'teal' : 'gray'}
          size="sm"
          variant="dot"
        >
          {item.issetmerchant === 'Y' ? 'Yes' : 'No'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group
          gap="xs"
          wrap="nowrap"
        >
          <Tooltip label="Edit User">
            <ActionIcon
              variant="light"
              color="blue"
              size="md"
              onClick={() => handleEdit(item)}
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete User">
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
                User Account Management
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage user accounts and permissions
              </Text>
            </Box>
          </Group>

          {/* Button Container */}
          <Group
            justify="space-between"
            wrap="wrap"
          >
            <Group>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={handleNew}
                variant="filled"
                color="blue"
                radius="md"
              >
                Add New User
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

            <TextInput
              placeholder="Search by login, merchant, phone..."
              leftSection={<IconSearch size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ minWidth: 300 }}
              radius="md"
            />
          </Group>

          {/* Table */}
          <Box
            pos="relative"
            style={{ minHeight: 400 }}
          >
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: 'md', blur: 2 }}
              loaderProps={{ color: 'blue', type: 'dots' }}
            />

            <ScrollArea
              type="auto"
              scrollbarSize={10}
              scrollHideDelay={500}
              styles={{
                scrollbar: {
                  '&[data-orientation="horizontal"]': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                  },
                  '&[data-orientation="horizontal"] .mantine-ScrollArea-thumb':
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      },
                    },
                },
              }}
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 1200,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
                styles={{
                  th: {
                    backgroundColor: '#f8f9fa',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#495057',
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
                    <Table.Th style={{ minWidth: 120 }}>Login</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Status</Table.Th>
                    <Table.Th style={{ minWidth: 80 }}>Type</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Merchant</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Phone Number</Table.Th>
                    <Table.Th style={{ minWidth: 160 }}>Agent Name</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Alias</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>
                      Direct Merchant
                    </Table.Th>
                    <Table.Th style={{ minWidth: 130 }}>Set Merchant</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={10}>
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
                          <Text
                            size="sm"
                            c="dimmed"
                          >
                            {searchQuery
                              ? 'Try adjusting your search terms'
                              : 'Click "Add New User" to create your first user'}
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {/* Footer with Pagination */}
            {filteredData.length > 0 && (
              <Stack
                gap="md"
                mt="md"
                pt="md"
                style={{ borderTop: '1px solid #dee2e6' }}
              >
                <Group
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                >
                  <Group gap="md">
                    <Text
                      size="sm"
                      c="dimmed"
                      fw={500}
                    >
                      Showing {startIndex + 1}-
                      {Math.min(endIndex, filteredData.length)} of{' '}
                      {filteredData.length}{' '}
                      {filteredData.length === 1 ? 'record' : 'records'}
                      {searchQuery && ` (filtered from ${data.length} total)`}
                    </Text>
                    <Group
                      gap="xs"
                      align="center"
                    >
                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        Rows per page:
                      </Text>
                      <Select
                        value={String(itemsPerPage)}
                        onChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}
                        data={[
                          { value: '10', label: '10' },
                          { value: '25', label: '25' },
                          { value: '50', label: '50' },
                          { value: '100', label: '100' },
                        ]}
                        style={{ width: 80 }}
                        size="sm"
                      />
                    </Group>
                  </Group>

                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                    size="sm"
                    radius="md"
                    withEdges
                  />
                </Group>
              </Stack>
            )}
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default AccountList;
