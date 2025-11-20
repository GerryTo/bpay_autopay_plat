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
  Paper,
  ScrollArea,
  Badge,
  Card,
  Pagination,
  Select,
} from '@mantine/core';
import { IconRefresh, IconSearch } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import apiClient from '../../helper/api';

const AutomationError = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    username: '',
    bankCode: '',
    state: '',
    automationStatus: '',
    status: '',
    serverName: '',
    serialNumber: '',
  });

  // Filter data based on column filters
  const filteredData = data.filter((item) => {
    const usernameMatch =
      !columnFilters.username ||
      item.username
        ?.toLowerCase()
        .includes(columnFilters.username.toLowerCase());

    const bankCodeMatch =
      !columnFilters.bankCode || item.bankCode === columnFilters.bankCode;

    const stateMatch =
      !columnFilters.state ||
      item.state?.toLowerCase().includes(columnFilters.state.toLowerCase());

    const automationStatusMatch =
      !columnFilters.automationStatus ||
      item.automationStatus === columnFilters.automationStatus;

    const statusMatch =
      !columnFilters.status ||
      item.status?.toLowerCase().includes(columnFilters.status.toLowerCase());

    const serverNameMatch =
      !columnFilters.serverName ||
      item.serverName
        ?.toLowerCase()
        .includes(columnFilters.serverName.toLowerCase());

    const serialNumberMatch =
      !columnFilters.serialNumber ||
      item.serialNumber
        ?.toLowerCase()
        .includes(columnFilters.serialNumber.toLowerCase());

    return (
      usernameMatch &&
      bankCodeMatch &&
      stateMatch &&
      automationStatusMatch &&
      statusMatch &&
      serverNameMatch &&
      serialNumberMatch
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
      username: '',
      bankCode: '',
      state: '',
      automationStatus: '',
      status: '',
      serverName: '',
      serialNumber: '',
    });
  };

  const getListData = async () => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('data', 'get');

      const response = await apiClient.post(
        '/automationError_getList.php',
        formData
      );

      if (response.data && response.data.status?.toLowerCase() === 'ok') {
        const records = response.data.records || [];
        setData(records);
      } else {
        showNotification({
          title: 'Error',
          message: response.data?.message || 'Failed to load data',
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

  useEffect(() => {
    getListData();
  }, []);

  const getStatusColor = (status) => {
    if (!status) return 'gray';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('error') || statusLower.includes('failed'))
      return 'red';
    if (statusLower.includes('success') || statusLower.includes('ok'))
      return 'green';
    return 'orange';
  };

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          fw={600}
          size="sm"
          c="blue"
        >
          {item.username}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color="indigo"
          variant="light"
        >
          {item.bankCode}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.state}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getStatusColor(item.automationStatus)}
          variant="filled"
        >
          {item.automationStatus}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getStatusColor(item.status)}
          variant="dot"
        >
          {item.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.serverName}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.serialNumber}</Text>
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
                Automation ERROR
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Monitor automation errors and issues
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
              color="red"
            >
              {filteredData.length} of {data.length} errors
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
                  {/* Header Row */}
                  <Table.Tr>
                    <Table.Th style={{ maxWidth: 100 }}>Username</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Bank Code</Table.Th>
                    <Table.Th style={{ maxWidth: 100 }}>State</Table.Th>
                    <Table.Th style={{ maxWidth: 160 }}>
                      Automation Status
                    </Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Status</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Server</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Serial Number</Table.Th>
                  </Table.Tr>

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.username}
                        onChange={(e) =>
                          handleFilterChange('username', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.bankCode}
                        onChange={(value) =>
                          handleFilterChange('bankCode', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'NAGAD', label: 'NAGAD' },
                          { value: 'BKASH', label: 'BKASH' },
                          { value: 'BKASHM', label: 'BKASHM' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.state}
                        onChange={(e) =>
                          handleFilterChange('state', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.automationStatus}
                        onChange={(e) =>
                          handleFilterChange(
                            'automationStatus',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.status}
                        onChange={(e) =>
                          handleFilterChange('status', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.serverName}
                        onChange={(e) =>
                          handleFilterChange(
                            'serverName',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.serialNumber}
                        onChange={(e) =>
                          handleFilterChange(
                            'serialNumber',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
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
                              : 'No automation errors found'}
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
                    {filteredData.length === 1 ? 'error' : 'errors'}
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

export default AutomationError;
