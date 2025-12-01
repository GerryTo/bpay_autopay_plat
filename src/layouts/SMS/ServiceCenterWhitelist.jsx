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
  serviceCenter: '',
  description: '',
  maxAmountAllowed: '',
  isActive: '',
};

const ServiceCenterWhitelist = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceCenter: '',
    description: '',
    maxAmountAllowed: '',
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
        key: 'serviceCenter',
        label: 'Service Center',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.serviceCenter || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter service center..."
            size="xs"
            value={columnFilters.serviceCenter}
            onChange={(e) =>
              handleFilterChange('serviceCenter', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'description',
        label: 'Description',
        minWidth: 220,
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
        key: 'maxAmountAllowed',
        label: 'Amount',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.maxAmountAllowed ?? '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter amount..."
            size="xs"
            value={columnFilters.maxAmountAllowed}
            onChange={(e) =>
              handleFilterChange('maxAmountAllowed', e.currentTarget.value)
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
          includesValue(item.serviceCenter, columnFilters.serviceCenter) &&
          includesValue(item.description, columnFilters.description) &&
          includesValue(
            item.maxAmountAllowed,
            columnFilters.maxAmountAllowed
          ) &&
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
      const response = await smsAPI.getServiceCenterWhitelist();

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
              response.data.message ||
              'Failed to load service center whitelist',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load service center whitelist',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Service center whitelist fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load service center whitelist',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      serviceCenter: '',
      description: '',
      maxAmountAllowed: '',
      isActive: 'Y',
    });
    setFormModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.serviceCenter.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Service Center is required',
        color: 'yellow',
      });
      return;
    }

    setRefreshing(true);
    try {
      const response = await smsAPI.saveServiceCenterWhitelist({
        serviceCenter: formData.serviceCenter.trim(),
        description: formData.description.trim(),
        maxAmountAllowed: Number(formData.maxAmountAllowed) || 0,
        isActive: formData.isActive,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: 'Service center saved',
            color: 'green',
          });
          setFormModalOpen(false);
          fetchData({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to save service center',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to save service center',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Service center whitelist save error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to save service center',
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
                  Service Center Whitelist
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage allowed service centers and limits. Totals are shown in
                the footer.
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
              {/* <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                onClick={() => fetchData()}
              >
                Refresh
              </Button> */}
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
                      <Table.Tr key={`${item.serviceCenter || idx}-${idx}`}>
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

                {/* <Table.Tfoot>
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
                </Table.Tfoot> */}
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
                Total Rows: {paginatedData.length}
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
        title="Add Service Center"
        centered
      >
        <Stack gap="sm">
          <TextInput
            label="Service Center"
            placeholder="Enter service center"
            value={formData.serviceCenter}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                serviceCenter: e.currentTarget.value,
              }))
            }
            required
          />
          <TextInput
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.currentTarget.value,
              }))
            }
          />
          <TextInput
            label="Max Amount Allowed"
            placeholder="Enter max amount"
            value={formData.maxAmountAllowed}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxAmountAllowed: e.currentTarget.value,
              }))
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
          <Group
            justify="flex-end"
            gap="xs"
          >
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

export default ServiceCenterWhitelist;
