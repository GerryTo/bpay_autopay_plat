import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconFilter, IconPlus, IconRefresh, IconShieldLock, IconTrash } from '@tabler/icons-react';
import { whitelistMerchantIpAPI, userAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  merchantCode: '',
  ip: '',
};

const WhitelistMerchantIp = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ id: null, merchantCode: '', ip: '' });
  const [merchantOptions, setMerchantOptions] = useState([]);

  const handleFilterChange = useCallback((key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.merchantCode, columnFilters.merchantCode) &&
          includesValue(item.ip, columnFilters.ip)
        );
      }),
    [data, columnFilters]
  );

  const columns = useMemo(
    () => [
      {
        key: 'merchantCode',
        label: 'Merchant',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.merchantCode || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter merchant..."
            size="xs"
            value={columnFilters.merchantCode}
            onChange={(e) => handleFilterChange('merchantCode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'ip',
        label: 'Server IP',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.ip || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter IP..."
            size="xs"
            value={columnFilters.ip}
            onChange={(e) => handleFilterChange('ip', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 160,
        render: (item) => (
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => openEdit(item)}
            >
              Edit
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={() => handleDelete(item)}
            >
              Delete
            </Button>
          </Group>
        ),
      },
    ],
    [columnFilters, handleFilterChange]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } = useTableControls(
    columns,
    {
      onResetFilters: () => setColumnFilters(defaultFilters),
    }
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

  const loadMerchantOptions = useCallback(async () => {
    const response = await userAPI.getMasterMerchantList();
    if (response.success && response.data?.status?.toLowerCase() === 'ok') {
      const options = (response.data.records || []).map((item) => ({
        value: item.merchantCode || item.merchantcode || '',
        label: item.merchantCode || item.merchantcode || '',
      }));
      setMerchantOptions(options);
      if (options.length > 0 && !formData.merchantCode) {
        setFormData((prev) => ({ ...prev, merchantCode: options[0].value }));
      }
    } else {
      showNotification({
        title: 'Error',
        message: response.error || response.data?.message || 'Failed to load merchants',
        color: 'red',
      });
    }
  }, [formData.merchantCode]);

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      silent ? setRefreshing(true) : setLoading(true);
      try {
        const response = await whitelistMerchantIpAPI.getList();
        if (response.success && response.data) {
          const payload = response.data;
          const status = (payload.status || '').toLowerCase();
          if (!payload.status || status === 'ok') {
            const records = Array.isArray(payload.records) ? payload.records : [];
            setData(records);
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load whitelist',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load whitelist',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Whitelist merchant IP fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load whitelist',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchList();
    loadMerchantOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAll = () => {
    setColumnFilters(defaultFilters);
    setCurrentPage(1);
    setItemsPerPage(10);
    handleResetAll();
  };

  const openNew = () => {
    setFormData({ id: null, merchantCode: merchantOptions[0]?.value || '', ip: '' });
    setFormModalOpen(true);
  };

  const openEdit = (item) => {
    setFormData({
      id: item.id ?? null,
      merchantCode: item.merchantCode || '',
      ip: item.ip || '',
    });
    setFormModalOpen(true);
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete whitelist entry for ${item.merchantCode} - ${item.ip}?`);
    if (!confirmed) return;
    try {
      const response = await whitelistMerchantIpAPI.delete(item.id);
      if (response.success && response.data) {
        const status = (response.data.status || '').toLowerCase();
        const message = response.data.message || 'Deleted';
        showNotification({
          title: status === 'ok' ? 'Success' : 'Info',
          message,
          color: status === 'ok' ? 'green' : 'blue',
        });
        if (status === 'ok') {
          fetchList({ silent: true });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to delete entry',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Delete whitelist error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to delete entry',
        color: 'red',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.merchantCode) {
      showNotification({ title: 'Validation', message: 'Please select merchant', color: 'yellow' });
      return;
    }
    if (!formData.ip) {
      showNotification({ title: 'Validation', message: 'Please input IP', color: 'yellow' });
      return;
    }

    setSaving(true);
    try {
      const response = await whitelistMerchantIpAPI.save(formData);
      if (response.success && response.data) {
        const status = (response.data.status || '').toLowerCase();
        const message = response.data.message || 'Data saved';
        showNotification({
          title: status === 'ok' ? 'Success' : 'Info',
          message,
          color: status === 'ok' ? 'green' : 'blue',
        });
        if (status === 'ok') {
          setFormModalOpen(false);
          fetchList({ silent: true });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to save data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Save whitelist error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to save data',
        color: 'red',
      });
    } finally {
      setSaving(false);
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
        <LoadingOverlay
          visible={loading}
          overlayProps={{ radius: 'md', blur: 2 }}
          loaderProps={{ color: 'blue', type: 'dots' }}
        />

        <Stack gap="lg">
          <Group
            justify="space-between"
            align="center"
          >
            <Box>
              <Group gap={8}>
                <IconShieldLock
                  size={22}
                  color="#1d4ed8"
                />
                <Text
                  size="xl"
                  fw={700}
                >
                  Whitelist Merchant IP
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage merchant IP whitelist entries.
              </Text>
            </Box>

            <Group gap="xs">
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                radius="md"
                onClick={openNew}
              >
                Add New
              </Button>
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing}
                onClick={() => fetchList({ silent: true })}
              >
                Refresh
              </Button>
              <Button
                variant="light"
                color="gray"
                radius="md"
                size="sm"
                leftSection={<IconFilter size={18} />}
                onClick={resetAll}
              >
                Reset
              </Button>
            </Group>
          </Group>

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
                        style={{ minWidth: col.minWidth || 140 }}
                      >
                        <Group
                          gap={8}
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
                          minWidth: col.minWidth || 140,
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
                      <Table.Tr key={`${item.id || 'row'}-${idx}`}>
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
                    <Table.Td colSpan={visibleColumns.length}>
                      <Group
                        justify="space-between"
                        align="center"
                      >
                        <Text
                          size="sm"
                          fw={600}
                        >
                          Total rows: {filteredData.length}
                        </Text>
                        <Text
                          size="sm"
                          c="dimmed"
                        >
                          Totals stay in the footer.
                        </Text>
                      </Group>
                    </Table.Td>
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
                fw={600}
              >
                Rows: {paginatedData.length}
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
        title={formData.id ? 'Edit Whitelist Entry' : 'Add Whitelist Entry'}
        centered
      >
        <Stack gap="md">
          <Select
            label="Merchant"
            placeholder="Select merchant"
            data={merchantOptions}
            value={formData.merchantCode}
            onChange={(value) => setFormData((prev) => ({ ...prev, merchantCode: value || '' }))}
            searchable
            nothingFoundMessage="No merchant"
          />
          <TextInput
            label="Server IP"
            placeholder="e.g. 192.168.0.1"
            value={formData.ip}
            onChange={(e) => setFormData((prev) => ({ ...prev, ip: e.currentTarget.value }))}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              color="gray"
              onClick={() => setFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              loading={saving}
              onClick={handleSave}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default WhitelistMerchantIp;
