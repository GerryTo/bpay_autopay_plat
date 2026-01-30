import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Group,
  Table,
  TextInput,
  LoadingOverlay,
  Stack,
  Text,
  Paper,
  ScrollArea,
  Badge,
  Card,
  Pagination,
  Select,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconRefresh,
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { showNotification } from '../../helper/showNotification';
import { serverAPI } from '../../helper/api';

const ServerList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    address: '',
    password: '',
  });

  // Filter data based on column filters
  const filteredData = data.filter((item) => {
    const nameMatch =
      !columnFilters.name ||
      item.name?.toLowerCase().includes(columnFilters.name.toLowerCase());

    const addressMatch =
      !columnFilters.address ||
      item.address?.toLowerCase().includes(columnFilters.address.toLowerCase());

    const passwordMatch =
      !columnFilters.password ||
      item.password
        ?.toLowerCase()
        .includes(columnFilters.password.toLowerCase());

    return nameMatch && addressMatch && passwordMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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
      name: '',
      address: '',
      password: '',
    });
  };

  const handleNew = () => {
    // Navigate to server create form
    navigate('/server-form');
  };

  const handleEdit = (server) => {
    // Navigate to server edit form with data
    navigate('/server-form', { state: { server } });
  };

  const handleDelete = (server) => {
    modals.openConfirmModal({
      title: 'Delete Server',
      children: (
        <Text size="sm">
          Are you sure you want to delete the server:{' '}
          <strong>{server.name}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await serverAPI.deleteServer(server.name);

          if (
            response.success &&
            response.data?.message === 'success delete server'
          ) {
            showNotification({
              title: 'Success',
              message: 'Server deleted successfully',
              color: 'green',
            });
            await getListData(); // Refresh data
          } else {
            showNotification({
              title: 'Error',
              message: response.data?.message || 'Failed to delete server',
              color: 'red',
            });
          }
        } catch (error) {
          showNotification({
            title: 'Error',
            message: 'Failed to delete server',
            color: 'red',
          });
          console.error('Error deleting server:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getListData = async () => {
    setLoading(true);
    try {
      const response = await serverAPI.getServerList();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          setData(records);
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

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          fw={600}
          size="sm"
          c="blue"
        >
          {item.name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.address}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.password}</Text>
      </Table.Td>
      <Table.Td>
        <Group
          gap="xs"
          wrap="nowrap"
        >
          <Tooltip label="Edit">
            <ActionIcon
              color="blue"
              variant="light"
              onClick={() => handleEdit(item)}
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              color="red"
              variant="light"
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
                Server List
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage server configurations and Anydesk connections
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

            <Badge
              size="lg"
              variant="light"
              color="blue"
            >
              {filteredData.length} of {data.length} records
            </Badge>
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
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 800,
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
                  {/* Header Row */}
                  <Table.Tr>
                    <Table.Th style={{ minWidth: 200 }}>Server Name</Table.Th>
                    <Table.Th style={{ minWidth: 200 }}>
                      Anydesk Address
                    </Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Password</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Action</Table.Th>
                  </Table.Tr>

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.name}
                        onChange={(e) =>
                          handleFilterChange('name', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.address}
                        onChange={(e) =>
                          handleFilterChange('address', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.password}
                        onChange={(e) =>
                          handleFilterChange('password', e.currentTarget.value)
                        }
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
                      <Table.Td colSpan={4}>
                        <Stack
                          align="center"
                          gap="xs"
                          py="xl"
                        >
                          <Text
                            size="lg"
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
                              : 'Click "Add New" to create a server'}
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {/* Footer with Pagination */}
            <Paper
              p="md"
              mt="md"
              withBorder
              radius="md"
              bg="gray.0"
            >
              <Group
                justify="space-between"
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
                      Per page:
                    </Text>
                    <Select
                      size="xs"
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
                      style={{ width: 70 }}
                    />
                  </Group>
                </Group>

                {totalPages > 1 && (
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                    size="sm"
                    radius="md"
                    withEdges
                  />
                )}
              </Group>
            </Paper>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default ServerList;
