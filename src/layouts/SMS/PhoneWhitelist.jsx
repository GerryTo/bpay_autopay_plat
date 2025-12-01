import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Select,
} from '@mantine/core';
import {
  IconFilter,
  IconMessage,
  IconRefresh,
  IconPlus,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { smsAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  phoneNumber: '',
  description: '',
  isActive: '',
};

const PhoneWhitelist = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    description: '',
    isActive: 'Y',
  });

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
  }, []);

  const handleResetAllFilters = () => {
    handleClearFilters();
    setData([]);
  };

  const columns = useMemo(
    () => [
      {
        key: 'phoneNumber',
        label: 'Phone Number',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.phoneNumber || '-'}
          </Text>
        ),
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
        key: 'description',
        label: 'Description',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.description || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter description..."
            size="xs"
            value={columnFilters.description}
            onChange={(e) =>
              handleFilterChange('description', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'isActive',
        label: 'Active',
        minWidth: 100,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
            c={
              (item.isActive || '').toString().toUpperCase() === 'Y'
                ? 'green'
                : 'red'
            }
          >
            {(item.isActive || '').toString().toUpperCase() === 'Y'
              ? 'Yes'
              : 'No'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter active..."
            size="xs"
            value={columnFilters.isActive}
            onChange={(e) =>
              handleFilterChange('isActive', e.currentTarget.value)
            }
          />
        ),
      },
    ],
    [columnFilters, handleFilterChange]
  );

  const {
    visibleColumns,
    sortConfig,
    handleHideColumn,
    handleSort,
    handleResetAll,
  } = useTableControls(columns, {
    onResetFilters: handleResetAllFilters,
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.phoneNumber, columnFilters.phoneNumber) &&
          includesValue(item.description, columnFilters.description) &&
          includesValue(item.isActive, columnFilters.isActive)
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

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const fetchData = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const response = await smsAPI.getPhoneWhitelist();

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records)
            ? response.data.records
            : [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message:
              response.data.message || 'Failed to load phone whitelist data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load phone whitelist data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Phone whitelist fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load phone whitelist data',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      phoneNumber: '',
      description: '',
      isActive: 'Y',
    });
    setFormModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.phoneNumber.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Phone number is required',
        color: 'yellow',
      });
      return;
    }

    setRefreshing(true);
    try {
      const response = await smsAPI.savePhoneWhitelist({
        phoneNumber: formData.phoneNumber.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: 'Phone whitelist saved',
            color: 'green',
          });
          setFormModalOpen(false);
          fetchData({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to save phone whitelist',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to save phone whitelist',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Phone whitelist save error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to save phone whitelist',
        color: 'red',
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, item) => {
          acc.rows += 1;
          return acc;
        },
        { rows: 0 }
      ),
    [filteredData]
  );

  return (
    <Box p="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        <LoadingOverlay
          visible={loading}
          overlayProps={{ radius: 'md', blur: 2 }}
        />

        <Stack gap="lg">
          <Group
            justify="space-between"
            align="flex-start"
          >
            <Stack gap={4}>
              <Group gap={8}>
                <IconMessage size={22} />
                <Text
                  size="xl"
                  fw={700}
                >
                  Phone Whitelist
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage phone numbers allowed for SMS. Totals are shown in the
                footer.
              </Text>
            </Stack>

            <Group gap="xs">
              <Button
                variant="light"
                color="gray"
                radius="md"
                size="sm"
                leftSection={<IconFilter size={18} />}
                onClick={handleResetAll}
              >
                Reset Filters
              </Button>
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing}
                onClick={() => fetchData({ silent: true })}
              >
                Refresh
              </Button>
            </Group>
          </Group>

          <Card
            withBorder
            radius="md"
            padding="md"
            shadow="xs"
          >
            <Group
              align="center"
              gap="xs"
              wrap="wrap"
            >
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                radius="md"
                onClick={handleAddNew}
              >
                Add New
              </Button>
            </Group>
          </Card>

          <Box pos="relative">
            <ScrollArea
              type="auto"
              h="60vh"
            >
              <Table
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="sm"
                verticalSpacing="xs"
                styles={{
                  th: { backgroundColor: '#f8f9fa', fontWeight: 600 },
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
                      </Table.Th>
                    ))}
                  </Table.Tr>
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    {visibleColumns.map((col) => (
                      <Table.Th
                        key={`${col.key}-filter`}
                        style={{
                          minWidth: col.minWidth || 120,
                          padding: '8px',
                        }}
                      >
                        {col.filter || null}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, idx) => (
                      <Table.Tr key={`${item.phoneNumber || idx}-${idx}`}>
                        {visibleColumns.map((col) => (
                          <Table.Td key={col.key}>{col.render(item)}</Table.Td>
                        ))}
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={visibleColumns.length}>
                        <Text
                          ta="center"
                          c="dimmed"
                        >
                          No data available
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>

                <Table.Tfoot>
                  <Table.Tr>
                    {visibleColumns.map((col, index) => {
                      if (index === 0) {
                        return (
                          <Table.Th key={`${col.key}-footer`}>
                            Totals (Rows: {totals.rows})
                          </Table.Th>
                        );
                      }
                      return <Table.Th key={`${col.key}-footer`} />;
                    })}
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </ScrollArea>
          </Box>

          <Group
            justify="space-between"
            align="center"
          >
            <Group
              gap="sm"
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
                style={{ width: 90 }}
                size="sm"
              />
              <Text
                size="sm"
                c="dimmed"
              >
                Total Rows: {totals.rows}
              </Text>
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
      </Card>

      <Modal
        opened={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title="Add Phone Whitelist"
        centered
      >
        <Stack gap="sm">
          <TextInput
            label="Phone Number"
            placeholder="Enter phone number"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phoneNumber: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.currentTarget.value }))
            }
          />
          <Select
            label="Active"
            data={[
              { value: 'Y', label: 'Yes' },
              { value: 'N', label: 'No' },
            ]}
            value={formData.isActive}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, isActive: value || 'Y' }))
            }
          />
          <Group justify="flex-end" gap="xs">
            <Button
              variant="default"
              onClick={() => setFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleSave}
              loading={refreshing}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default PhoneWhitelist;
