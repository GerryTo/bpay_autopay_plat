import { useCallback, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
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
  IconRefresh,
  IconServer,
  IconRepeat,
} from '@tabler/icons-react';
import { serviceResendCallbackAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  id: '',
  status: '',
  date: '',
};

const ServiceResendCallback = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
          includesValue(item.n_id, columnFilters.id) &&
          includesValue(item.v_status, columnFilters.status) &&
          includesValue(item.d_insert, columnFilters.date)
        );
      }),
    [data, columnFilters]
  );

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'ID',
        minWidth: 100,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.n_id}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter id..."
            size="xs"
            value={columnFilters.id}
            onChange={(e) => handleFilterChange('id', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'status',
        label: 'Status',
        minWidth: 220,
        render: (item) => (
          <Badge
            variant="light"
            color={
              (item.v_status || '').toLowerCase().includes('success')
                ? 'green'
                : 'gray'
            }
          >
            {item.v_status || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter status..."
            size="xs"
            value={columnFilters.status}
            onChange={(e) =>
              handleFilterChange('status', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'date',
        label: 'Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.d_insert || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date..."
            size="xs"
            value={columnFilters.date}
            onChange={(e) => handleFilterChange('date', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 140,
        render: (item) => (
          <Button
            size="xs"
            variant="light"
            color="orange"
            leftSection={<IconRepeat size={14} />}
            onClick={() => handleExecute(item)}
          >
            Rerun
          </Button>
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
    onResetFilters: () => setColumnFilters(defaultFilters),
  });

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

  

  

  const fetchList = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await serviceResendCallbackAPI.getList();
      if (response.success && response.data) {
        const payload = response.data;
        const status = (payload.status || '').toLowerCase();
        if (!payload.status || status === 'success' || status === 'ok') {
          const records = Array.isArray(payload.records) ? payload.records : [];
          const withKeys = records.map((item, idx) => ({
            ...item,
            _rowKey: `${item.n_id || 'row'}-${idx}`,
          }));
          setData(withKeys);
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load services',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load services',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Resend callback fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load service list',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  

  const resetAll = () => {
    setColumnFilters(defaultFilters);
    setCurrentPage(1);
    setItemsPerPage(10);
    handleResetAll();
  };

  const handleExecute = async (item) => {
    if (!item?.n_id) return;
    const confirmed = window.confirm('Rerun this callback?');
    if (!confirmed) return;
    setSaving(true);
    try {
      const response = await serviceResendCallbackAPI.execute(item.n_id);
      if (response.success && response.data) {
        const status = (response.data.status || '').toLowerCase();
        showNotification({
          title: status === 'success' || status === 'ok' ? 'Success' : 'Info',
          message: response.data.message || 'Request submitted',
          color: status === 'success' || status === 'ok' ? 'green' : 'blue',
        });
        fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to execute service',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Execute resend callback error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to execute service',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const confirmed = window.confirm('Add resend callback batch?');
    if (!confirmed) return;
    setSaving(true);
    try {
      const response = await serviceResendCallbackAPI.addResendCallback();
      if (response.success && response.data) {
        const status = (response.data.status || '').toLowerCase();
        showNotification({
          title: status === 'ok' ? 'Success' : 'Info',
          message: response.data.message || 'Resend callback added',
          color: status === 'ok' ? 'green' : 'blue',
        });
        fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to add resend callback',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Add resend callback error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to add resend callback',
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
                <IconServer
                  size={22}
                  color="#1d4ed8"
                />
                <Text
                  size="xl"
                  fw={700}
                >
                  Service Resend Callback
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Monitor and rerun resend callback services.
              </Text>
            </Box>

            <Group gap="xs">
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing || saving}
                onClick={() => fetchList({ silent: true })}
              >
                Refresh
              </Button>
              <Button
                leftSection={<IconRepeat size={18} />}
                color="blue"
                radius="md"
                onClick={handleAdd}
                loading={saving}
              >
                Resend Callback
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
                      <Table.Tr key={item._rowKey || `${idx}-row`}>
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
    </Box>
  );
};

export default ServiceResendCallback;
