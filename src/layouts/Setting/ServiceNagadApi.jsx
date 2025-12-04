import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import { IconFilter, IconRefresh, IconServer } from '@tabler/icons-react';
import { serviceNagadAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  user: '',
  counter: '',
  sessionId: '',
  operator: '',
};

const ServiceNagadApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [saving, setSaving] = useState(false);

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
          includesValue(item.v_user, columnFilters.user) &&
          includesValue(item.v_atc, columnFilters.counter) &&
          includesValue(item.v_mpaid, columnFilters.sessionId) &&
          includesValue(item.v_operator, columnFilters.operator)
        );
      }),
    [data, columnFilters]
  );

  const columns = useMemo(
    () => [
      {
        key: 'user',
        label: 'User',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.v_user || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter user..."
            size="xs"
            value={columnFilters.user}
            onChange={(e) => handleFilterChange('user', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'counter',
        label: 'Counter',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.v_atc || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter counter..."
            size="xs"
            value={columnFilters.counter}
            onChange={(e) =>
              handleFilterChange('counter', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'sessionId',
        label: 'Session ID',
        minWidth: 220,
        render: (item) => <Text size="sm">{item.v_mpaid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter session..."
            size="xs"
            value={columnFilters.sessionId}
            onChange={(e) =>
              handleFilterChange('sessionId', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'operator',
        label: 'Operator',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.v_operator || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter operator..."
            size="xs"
            value={columnFilters.operator}
            onChange={(e) =>
              handleFilterChange('operator', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 220,
        render: (item) => (
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="orange"
              onClick={() => handleExecute(item, 'restart')}
            >
              Restart
            </Button>
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => handleExecute(item, 'start')}
            >
              Start
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => handleExecute(item, 'stop')}
            >
              Stop
            </Button>
          </Group>
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

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const fetchList = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await serviceNagadAPI.getList();
      if (response.success && response.data) {
        const payload = response.data;
        const status = (payload.status || '').toLowerCase();
        if (!payload.status || status === 'success' || status === 'ok') {
          const records = Array.isArray(payload.records) ? payload.records : [];
          const withKeys = records.map((item, idx) => ({
            ...item,
            _rowKey: `${item.v_user || 'service'}-${idx}`,
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
      console.error('Service Nagad fetch error:', error);
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

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAll = () => {
    setColumnFilters(defaultFilters);
    setCurrentPage(1);
    setItemsPerPage(10);
    handleResetAll();
  };

  const handleExecute = async (item, statement) => {
    setSaving(true);
    try {
      const payload = {
        statment: statement,
        servicename: item.v_user,
      };
      const response = await serviceNagadAPI.execute(payload);
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
      console.error('Execute Nagad service error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to execute service',
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
                  Service Nagad API
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage Nagad services (start/stop/restart).
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

export default ServiceNagadApi;
