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
  Modal,
} from '@mantine/core';
import { IconRefresh, IconSearch, IconTrash, IconPlus } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';

const BlacklistList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Auto refresh interval
  const intervalRef = useRef(null);

  // Modal state
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [newMerchantCode, setNewMerchantCode] = useState('');
  const [newCustomerCode, setNewCustomerCode] = useState('');

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    merchantCode: '',
    customerCode: '',
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

    return merchantMatch && customerMatch;
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
    });
  };

  // Load blacklist data
  const loadBlacklistData = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getBlacklistList();

      console.log('API Response:', response);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          setData(records);

          if (records.length === 0) {
            showNotification({
              title: 'Info',
              message: 'No blacklisted customers found',
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
      console.error('Error fetching blacklist data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle add action
  const handleAdd = async () => {
    if (!newMerchantCode || !newCustomerCode) {
      showNotification({
        title: 'Error',
        message: 'Please enter both merchant code and customer code',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await merchantAPI.addBlacklistCustomer(
        newMerchantCode,
        newCustomerCode
      );

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: 'Customer added to blacklist successfully',
            color: 'green',
          });
          setAddModalOpened(false);
          setNewMerchantCode('');
          setNewCustomerCode('');
          loadBlacklistData(); // Reload data
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to add customer',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to add customer',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to add customer',
        color: 'red',
      });
      console.error('Error adding customer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete action
  const handleDelete = async (item) => {
    if (
      window.confirm(
        `Are you sure you want to delete [${item.merchantCode}, ${item.customerCode}]?`
      )
    ) {
      try {
        const response = await merchantAPI.deleteBlacklist(
          item.merchantCode,
          item.customerCode
        );

        if (response.success && response.data) {
          if (response.data.status?.toLowerCase() === 'ok') {
            showNotification({
              title: 'Success',
              message: 'Customer deleted successfully',
              color: 'green',
            });
            loadBlacklistData(); // Reload data
          } else {
            showNotification({
              title: 'Error',
              message: response.data.message || 'Failed to delete customer',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to delete customer',
            color: 'red',
          });
        }
      } catch (error) {
        showNotification({
          title: 'Error',
          message: 'Failed to delete customer',
          color: 'red',
        });
        console.error('Error deleting customer:', error);
      }
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadBlacklistData();
  };

  // Setup auto-refresh (every 2 minutes)
  useEffect(() => {
    // Initial load
    loadBlacklistData();

    // Setup interval
    intervalRef.current = setInterval(() => {
      loadBlacklistData();
    }, 120000); // 120000ms = 2 minutes

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text size="sm" fw={600}>
          {item.merchantCode}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.customerCode}</Text>
      </Table.Td>
      <Table.Td>
        <Button
          size="xs"
          variant="filled"
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={() => handleDelete(item)}
        >
          Delete
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Box>
              <Text size="xl" fw={700} c="dark">
                Blacklist Customer
              </Text>
              <Text size="sm" c="dimmed">
                Manage blacklisted customers
              </Text>
            </Box>
          </Group>

          {/* Action Buttons */}
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
              leftSection={<IconPlus size={18} />}
              onClick={() => setAddModalOpened(true)}
              variant="filled"
              color="green"
              radius="md"
              size="sm"
            >
              Add Blacklist
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
          </Group>

          {/* Table */}
          <Box pos="relative" style={{ minHeight: 400 }}>
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: 'md', blur: 2 }}
              loaderProps={{ color: 'blue', type: 'dots' }}
            />

            <ScrollArea type="auto" scrollbarSize={10} scrollHideDelay={500}>
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 600,
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
                    <Table.Th style={{ minWidth: 220 }}>Merchant Code</Table.Th>
                    <Table.Th style={{ minWidth: 220 }}>Customer Code</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Action</Table.Th>
                  </Table.Tr>

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter merchant..."
                        size="xs"
                        value={columnFilters.merchantCode}
                        onChange={(e) =>
                          handleFilterChange('merchantCode', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter customer..."
                        size="xs"
                        value={columnFilters.customerCode}
                        onChange={(e) =>
                          handleFilterChange('customerCode', e.currentTarget.value)
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
                      <Table.Td colSpan={3}>
                        <Stack align="center" py="xl" gap="xs">
                          <Text size="lg" c="dimmed" fw={500}>
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
                <Group justify="space-between" align="center" wrap="wrap">
                  <Group gap="md">
                    <Text size="sm" c="dimmed" fw={500}>
                      Showing {startIndex + 1}-
                      {Math.min(endIndex, filteredData.length)} of{' '}
                      {filteredData.length}{' '}
                      {filteredData.length === 1 ? 'record' : 'records'}
                      {Object.values(columnFilters).some((val) => val !== '') &&
                        ` (filtered from ${data.length} total)`}
                    </Text>
                    <Group gap="xs" align="center">
                      <Text size="sm" c="dimmed">
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

      {/* Add Blacklist Modal */}
      <Modal
        opened={addModalOpened}
        onClose={() => {
          setAddModalOpened(false);
          setNewMerchantCode('');
          setNewCustomerCode('');
        }}
        title={
          <Text size="lg" fw={700}>
            Add Blacklist Customer
          </Text>
        }
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Merchant Code"
            placeholder="Enter merchant code"
            value={newMerchantCode}
            onChange={(e) => setNewMerchantCode(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Customer Code"
            placeholder="Enter customer code"
            value={newCustomerCode}
            onChange={(e) => setNewCustomerCode(e.currentTarget.value)}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setAddModalOpened(false);
                setNewMerchantCode('');
                setNewCustomerCode('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              color="green"
              onClick={handleAdd}
              disabled={loading}
            >
              Add to Blacklist
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default BlacklistList;
