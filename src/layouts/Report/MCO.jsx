import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Group,
  Table,
  LoadingOverlay,
  Stack,
  Text,
  Card,
  ScrollArea,
  TextInput,
  Pagination,
  Select,
  Checkbox,
  Modal,
} from '@mantine/core';
import {
  IconRefresh,
  IconSearch,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';

const MCO = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [includeBlacklist, setIncludeBlacklist] = useState(false);

  // Auto refresh interval
  const intervalRef = useRef(null);

  // Modal state for detail
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    merchantCode: '',
    customerCode: '',
    count: '',
    isBlacklist: '',
  });

  // Filter data based on column filters
  const filteredData = data.filter((item) => {
    const merchantMatch =
      !columnFilters.merchantCode ||
      item.merchantCode
        ?.toLowerCase()
        .includes(columnFilters.merchantCode.toLowerCase());

    const customerMatch =
      !columnFilters.customerCode ||
      item.customerCode
        ?.toLowerCase()
        .includes(columnFilters.customerCode.toLowerCase());

    const countMatch =
      !columnFilters.count ||
      item.count?.toString().includes(columnFilters.count);

    const blacklistMatch =
      !columnFilters.isBlacklist ||
      item.isBlacklist
        ?.toLowerCase()
        .includes(columnFilters.isBlacklist.toLowerCase());

    return merchantMatch && customerMatch && countMatch && blacklistMatch;
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
      merchantCode: '',
      customerCode: '',
      count: '',
      isBlacklist: '',
    });
  };

  // Load flag customer data
  const loadFlagData = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getFlagCustomerList(
        includeBlacklist ? 1 : 0
      );

      console.log('API Response:', response);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          setData(records);

          if (records.length === 0) {
            showNotification({
              title: 'Info',
              message: 'No flagged customers found',
              color: 'blue',
            });
          }
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
      console.error('Error fetching flag data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle blacklist action
  const handleBlacklist = async (item) => {
    if (
      window.confirm(
        `Are you sure you want to blacklist [${item.merchantCode}, ${item.customerCode}]?`
      )
    ) {
      try {
        const response = await merchantAPI.blacklistFlagCustomer(
          item.merchantCode,
          item.customerCode
        );

        if (response.success && response.data) {
          if (response.data.status?.toLowerCase() === 'ok') {
            showNotification({
              title: 'Success',
              message: 'Customer blacklisted successfully',
              color: 'green',
            });
            loadFlagData(); // Reload data
          } else {
            showNotification({
              title: 'Error',
              message: response.data.message || 'Failed to blacklist customer',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to blacklist customer',
            color: 'red',
          });
        }
      } catch (error) {
        showNotification({
          title: 'Error',
          message: 'Failed to blacklist customer',
          color: 'red',
        });
        console.error('Error blacklisting customer:', error);
      }
    }
  };

  // Handle detail modal
  const handleDetail = (item) => {
    setDetailData(item);
    setDetailModalOpened(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadFlagData();
  };

  // Setup auto-refresh (every 2 minutes)
  useEffect(() => {
    // Initial load
    loadFlagData();

    // Setup interval
    intervalRef.current = setInterval(() => {
      loadFlagData();
    }, 120000); // 120000ms = 2 minutes

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeBlacklist]);

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          size="sm"
          fw={600}
        >
          {item.merchantCode}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.customerCode}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          size="sm"
          fw={500}
        >
          {item.count}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          size="sm"
          c={item.isBlacklist ? 'red' : 'dimmed'}
        >
          {item.isBlacklist || '-'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button
            size="xs"
            variant="filled"
            color="blue"
            onClick={() => handleDetail(item)}
          >
            Detail
          </Button>
          {!item.isBlacklist && (
            <Button
              size="xs"
              variant="filled"
              color="yellow"
              onClick={() => handleBlacklist(item)}
            >
              Blacklist
            </Button>
          )}
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
                MCO - Flag Report
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Monitor customers with multiple different source accounts
              </Text>
            </Box>
          </Group>

          {/* Filters */}
          <Group>
            <Button
              leftSection={<IconRefresh size={18} />}
              onClick={handleRefresh}
              variant="filled"
              color="blue"
              radius="md"
              disabled={loading}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              leftSection={<IconSearch size={18} />}
              onClick={handleClearFilters}
              variant="light"
              color="red"
              radius="md"
              size="sm"
            >
              Clear Column Filters
            </Button>
            <Checkbox
              label="Include Blacklist"
              checked={includeBlacklist}
              onChange={(event) =>
                setIncludeBlacklist(event.currentTarget.checked)
              }
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
                    <Table.Th style={{ minWidth: 180 }}>Merchant Code</Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>Customer Code</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      No. Different Src Acc
                    </Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Blacklist</Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>Action</Table.Th>
                  </Table.Tr>

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter merchant..."
                        size="xs"
                        value={columnFilters.merchantCode}
                        onChange={(e) =>
                          handleFilterChange(
                            'merchantCode',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter customer..."
                        size="xs"
                        value={columnFilters.customerCode}
                        onChange={(e) =>
                          handleFilterChange(
                            'customerCode',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter count..."
                        size="xs"
                        value={columnFilters.count}
                        onChange={(e) =>
                          handleFilterChange('count', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter blacklist..."
                        size="xs"
                        value={columnFilters.isBlacklist}
                        onChange={(e) =>
                          handleFilterChange(
                            'isBlacklist',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
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
            </ScrollArea>

            {/* Pagination */}
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

      {/* Detail Modal */}
      <Modal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        title={
          <Group>
            <IconAlertTriangle
              size={24}
              color="orange"
            />
            <Text
              size="lg"
              fw={700}
            >
              Flag Customer Detail
            </Text>
          </Group>
        }
        size="lg"
      >
        {detailData && (
          <Stack gap="md">
            <Group>
              <Text
                fw={600}
                w={150}
              >
                Merchant Code:
              </Text>
              <Text>{detailData.merchantCode}</Text>
            </Group>
            <Group>
              <Text
                fw={600}
                w={150}
              >
                Customer Code:
              </Text>
              <Text>{detailData.customerCode}</Text>
            </Group>
            <Group>
              <Text
                fw={600}
                w={150}
              >
                Different Src Acc:
              </Text>
              <Text>{detailData.count}</Text>
            </Group>
            <Group>
              <Text
                fw={600}
                w={150}
              >
                Blacklist Status:
              </Text>
              <Text c={detailData.isBlacklist ? 'red' : 'dimmed'}>
                {detailData.isBlacklist || 'Not Blacklisted'}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default MCO;
