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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    login: '',
    status: '',
    type: '',
    merchantcode: '',
    phoneNumber: '',
    agentName: '',
    alias: '',
    isdm: '',
    issetmerchant: '',
  });

  // Filter data based on column filters
  const filteredData = data.filter((item) => {
    // Check each column filter
    const loginMatch =
      !columnFilters.login ||
      item.login?.toLowerCase().includes(columnFilters.login.toLowerCase());

    const statusMatch =
      !columnFilters.status || item.active === columnFilters.status;

    const typeMatch = !columnFilters.type || item.type === columnFilters.type;

    const merchantMatch =
      !columnFilters.merchantcode ||
      item.merchantcode
        ?.toLowerCase()
        .includes(columnFilters.merchantcode.toLowerCase());

    const phoneMatch =
      !columnFilters.phoneNumber ||
      item.phoneNumber
        ?.toLowerCase()
        .includes(columnFilters.phoneNumber.toLowerCase());

    const agentMatch =
      !columnFilters.agentName ||
      item.agentName
        ?.toLowerCase()
        .includes(columnFilters.agentName.toLowerCase());

    const aliasMatch =
      !columnFilters.alias ||
      item.alias?.toLowerCase().includes(columnFilters.alias.toLowerCase());

    const dmMatch = !columnFilters.isdm || item.isdm === columnFilters.isdm;

    const setMerchantMatch =
      !columnFilters.issetmerchant ||
      item.issetmerchant === columnFilters.issetmerchant;

    // All filters must match
    return (
      loginMatch &&
      statusMatch &&
      typeMatch &&
      merchantMatch &&
      phoneMatch &&
      agentMatch &&
      aliasMatch &&
      dmMatch &&
      setMerchantMatch
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  // Update column filter
  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setColumnFilters({
      login: '',
      status: '',
      type: '',
      merchantcode: '',
      phoneNumber: '',
      agentName: '',
      alias: '',
      isdm: '',
      issetmerchant: '',
    });
  };

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
              <Button
                leftSection={<IconSearch size={18} />}
                onClick={handleClearFilters}
                variant="light"
                color="red"
                radius="md"
              >
                Clear All Filters
              </Button>
            </Group>

            {/* <Badge size="lg" variant="light" color="blue">
              {filteredData.length} of {data.length} records
            </Badge> */}
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
                  {/* Header Row */}
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

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter login..."
                        size="xs"
                        value={columnFilters.login}
                        onChange={(e) =>
                          handleFilterChange('login', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.status}
                        onChange={(value) =>
                          handleFilterChange('status', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'Y', label: 'Active' },
                          { value: 'N', label: 'Inactive' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.type}
                        onChange={(value) =>
                          handleFilterChange('type', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'S', label: 'Super Admin' },
                          { value: 'A', label: 'Admin' },
                          { value: 'M', label: 'Merchant' },
                          { value: 'R', label: 'Reseller' },
                          { value: 'G', label: 'Agent' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter merchant..."
                        size="xs"
                        value={columnFilters.merchantcode}
                        onChange={(e) =>
                          handleFilterChange(
                            'merchantcode',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter phone..."
                        size="xs"
                        value={columnFilters.phoneNumber}
                        onChange={(e) =>
                          handleFilterChange(
                            'phoneNumber',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter agent..."
                        size="xs"
                        value={columnFilters.agentName}
                        onChange={(e) =>
                          handleFilterChange('agentName', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter alias..."
                        size="xs"
                        value={columnFilters.alias}
                        onChange={(e) =>
                          handleFilterChange('alias', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.isdm}
                        onChange={(value) =>
                          handleFilterChange('isdm', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'Y', label: 'Yes' },
                          { value: 'N', label: 'No' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.issetmerchant}
                        onChange={(value) =>
                          handleFilterChange('issetmerchant', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'Y', label: 'Yes' },
                          { value: 'N', label: 'No' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      {/* No filter for Action column */}
                    </Table.Th>
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
                            {Object.values(columnFilters).some(
                              (val) => val !== ''
                            )
                              ? 'Try adjusting your filters'
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
                      {Object.values(columnFilters).some((val) => val !== '') &&
                        ` (filtered from ${data.length} total)`}
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
