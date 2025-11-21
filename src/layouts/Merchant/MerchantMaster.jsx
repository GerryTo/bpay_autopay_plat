import { useState, useEffect } from 'react';
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
  IconTrash,
  IconEdit,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';

const MasterMerchant = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    merchantcode: '',
    merchantname: '',
    timezone: '',
  });

  // Filter data based on column filters
  const filteredData = data.filter((item) => {
    const merchantcodeMatch =
      !columnFilters.merchantcode ||
      item.merchantcode
        ?.toLowerCase()
        .includes(columnFilters.merchantcode.toLowerCase());

    const merchantnameMatch =
      !columnFilters.merchantname ||
      item.merchantname
        ?.toLowerCase()
        .includes(columnFilters.merchantname.toLowerCase());

    const timezoneMatch =
      !columnFilters.timezone ||
      item.timezone
        ?.toLowerCase()
        .includes(columnFilters.timezone.toLowerCase());

    return merchantcodeMatch && merchantnameMatch && timezoneMatch;
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
      merchantcode: '',
      merchantname: '',
      timezone: '',
    });
  };

  const handleNew = () => {
    // Navigate to merchant form with empty merchantcode
    navigate('/merchant-form', { state: { merchantcode: '' } });
  };

  const handleEdit = (merchantcode) => {
    // Navigate to merchant form with merchantcode
    navigate('/merchant-form', { state: { merchantcode } });
  };

  const handleDelete = (merchantname, merchantcode) => {
    modals.openConfirmModal({
      title: 'Delete Merchant',
      children: (
        <Text size="sm">
          Are you sure you want to delete merchant{' '}
          <strong>{merchantname}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await merchantAPI.deleteMerchant(merchantcode);

          if (
            response.success &&
            response.data.status?.toLowerCase() === 'ok'
          ) {
            showNotification({
              title: 'Success',
              message: 'Merchant deleted successfully',
              color: 'green',
            });
            await getListData(); // Refresh data
          } else {
            showNotification({
              title: 'Error',
              message:
                response.data?.message ||
                response.error ||
                'Failed to delete merchant',
              color: 'red',
            });
          }
        } catch (error) {
          showNotification({
            title: 'Error',
            message: 'Failed to delete merchant',
            color: 'red',
          });
          console.error('Error deleting merchant:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getListData = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getMerchantList();

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
          {item.merchantcode}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.merchantname}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.timezone}</Text>
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
              onClick={() => handleEdit(item.merchantcode)}
            >
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => handleDelete(item.merchantname, item.merchantcode)}
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
                Merchant Master
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage Merchant Operations
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
                  minWidth: 800,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
                styles={{
                  th: {
                    backgroundColor: '#f8f9fa',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#0f1012ff',
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
                    <Table.Th style={{ minWidth: 100 }}>Merchant Code</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Merchant Name</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Timezone</Table.Th>
                    <Table.Th style={{ minWidth: 80 }}>Action</Table.Th>
                  </Table.Tr>

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
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
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.merchantname}
                        onChange={(e) =>
                          handleFilterChange(
                            'merchantname',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.timezone}
                        onChange={(e) =>
                          handleFilterChange('timezone', e.currentTarget.value)
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
                              : 'Click "Add New" to create a merchant'}
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

export default MasterMerchant;
