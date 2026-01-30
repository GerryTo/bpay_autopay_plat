import { useState, useMemo } from 'react';
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
  Divider,
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
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { useTableControls } from '../../hooks/useTableControls';

const DEFAULT_COLUMN_FILTERS = {
  login: '',
  status: '',
  type: '',
  merchantcode: '',
  phoneNumber: '',
  agentName: '',
  alias: '',
  isdm: '',
  issetmerchant: '',
};

const AccountList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState(DEFAULT_COLUMN_FILTERS);

  const columns = useMemo(
    () => [
      {
        key: 'login',
        label: 'Login',
        minWidth: 120,
        render: (item) => (
          <Text
            fw={600}
            size="sm"
            c="blue"
          >
            {item.login}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter login..."
            size="xs"
            value={columnFilters.login}
            onChange={(e) => handleFilterChange('login', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'active',
        label: 'Status',
        minWidth: 120,
        render: (item) => (
          <Badge
            color={item.active === 'Y' ? 'green' : 'red'}
            variant="light"
          >
            {item.active === 'Y' ? 'Active' : 'Inactive'}
          </Badge>
        ),
        filter: (
          <Select
            placeholder="All"
            size="xs"
            value={columnFilters.status}
            onChange={(value) => handleFilterChange('status', value || '')}
            data={[
              { value: '', label: 'All' },
              { value: 'Y', label: 'Active' },
              { value: 'N', label: 'Inactive' },
            ]}
            clearable
          />
        ),
      },
      {
        key: 'type',
        label: 'Type',
        minWidth: 100,
        render: (item) => (
          <Badge
            color="blue"
            variant="outline"
          >
            {item.type}
          </Badge>
        ),
        filter: (
          <Select
            placeholder="All"
            size="xs"
            value={columnFilters.type}
            onChange={(value) => handleFilterChange('type', value || '')}
            data={[
              { value: '', label: 'All' },
              { value: 'S', label: 'Super Admin' },
              { value: 'A', label: 'Admin' },
              { value: 'M', label: 'Merchant' },
              { value: 'R', label: 'Reseller' },
            ]}
            clearable
          />
        ),
      },
      {
        key: 'merchantcode',
        label: 'Merchant',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.merchantcode}</Text>,
        filter: (
          <TextInput
            placeholder="Filter merchant..."
            size="xs"
            value={columnFilters.merchantcode}
            onChange={(e) =>
              handleFilterChange('merchantcode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'phoneNumber',
        label: 'Phone Number',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.phoneNumber}</Text>,
        filter: (
          <TextInput
            placeholder="Filter phone..."
            size="xs"
            value={columnFilters.phoneNumber}
            onChange={(e) =>
              handleFilterChange('phoneNumber', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'agentName',
        label: 'Agent Name',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.agentName}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.agentName}
            onChange={(e) =>
              handleFilterChange('agentName', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'alias',
        label: 'Alias',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.alias}</Text>,
        filter: (
          <TextInput
            placeholder="Filter alias..."
            size="xs"
            value={columnFilters.alias}
            onChange={(e) => handleFilterChange('alias', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'isdm',
        label: 'Direct Merchant',
        minWidth: 130,
        render: (item) => (
          <Badge
            color={item.isdm === 'Y' ? 'teal' : 'gray'}
            size="sm"
            variant="dot"
          >
            {item.isdm === 'Y' ? 'Yes' : 'No'}
          </Badge>
        ),
        filter: (
          <Select
            placeholder="All"
            size="xs"
            value={columnFilters.isdm}
            onChange={(value) => handleFilterChange('isdm', value || '')}
            data={[
              { value: '', label: 'All' },
              { value: 'Y', label: 'Yes' },
              { value: 'N', label: 'No' },
            ]}
            clearable
          />
        ),
      },
      {
        key: 'issetmerchant',
        label: 'Set Merchant',
        minWidth: 130,
        render: (item) => (
          <Badge
            color={item.issetmerchant === 'Y' ? 'teal' : 'gray'}
            size="sm"
            variant="dot"
          >
            {item.issetmerchant === 'Y' ? 'Yes' : 'No'}
          </Badge>
        ),
        filter: (
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
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 150,
        render: (item) => (
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
        ),
      },
    ],
    [columnFilters]
  );

  const {
    visibleColumns,
    sortConfig,
    handleHideColumn,
    handleSort,
    handleResetAll,
  } = useTableControls(columns, {
    onResetFilters: () => setColumnFilters(DEFAULT_COLUMN_FILTERS),
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.login, columnFilters.login) &&
          (columnFilters.status
            ? item.active === columnFilters.status
            : true) &&
          (columnFilters.type ? item.type === columnFilters.type : true) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.phoneNumber, columnFilters.phoneNumber) &&
          includesValue(item.agentName, columnFilters.agentName) &&
          includesValue(item.alias, columnFilters.alias) &&
          (columnFilters.isdm ? item.isdm === columnFilters.isdm : true) &&
          (columnFilters.issetmerchant
            ? item.issetmerchant === columnFilters.issetmerchant
            : true)
        );
      }),
    [data, columnFilters]
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const dir = direction === 'desc' ? -1 : 1;
    return [...filteredData].sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }, [filteredData, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Update column filter
  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Clear filters + reset sort/hidden columns
  const handleClearFilters = () => {
    handleResetAll();
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
                  <Table.Tr>
                    {visibleColumns.map((col) => (
                      <Table.Th
                        key={col.key}
                        style={{ minWidth: col.minWidth || 120 }}
                      >
                        <Group
                          gap={6}
                          justify="space-between"
                          align="center"
                        >
                          <Text
                            size="sm"
                            fw={600}
                          >
                            {col.label}
                          </Text>
                          <ColumnActionMenu
                            columnKey={col.key}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onHide={handleHideColumn}
                          />
                        </Group>
                        <Divider my={4} />
                        {col.filter || null}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <Table.Tr key={index}>
                        {visibleColumns.map((col) => (
                          <Table.Td key={col.key}>
                            {col.render ? col.render(item) : item[col.key]}
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))
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
