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

const batchSize = 25;
const batchDelay = 1000;

const initialBulkProgress = {
  isRunning: false,
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  currentBatch: 0,
  totalBatches: 0,
};

const ServiceNagadApi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [saving, setSaving] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [bulkProgress, setBulkProgress] = useState(initialBulkProgress);

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
    [data, columnFilters],
  );

  const sortAccessors = useMemo(
    () => ({
      user: (item) => item.v_user ?? '',
      counter: (item) => item.v_atc ?? '',
      sessionId: (item) => item.v_mpaid ?? '',
      operator: (item) => item.v_operator ?? '',
    }),
    [],
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
        minWidth: 360,
        render: (item) => (
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="green"
              onClick={() => handleAddCounter(item)}
              disabled={saving || bulkProgress.isRunning}
            >
              +1
            </Button>
            <Button
              size="xs"
              variant="light"
              color="orange"
              onClick={() => handleExecute(item, 'restart')}
              disabled={saving || bulkProgress.isRunning}
            >
              Restart
            </Button>
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => handleExecute(item, 'start')}
              disabled={saving || bulkProgress.isRunning}
            >
              Start
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => handleExecute(item, 'stop')}
              disabled={saving || bulkProgress.isRunning}
            >
              Stop
            </Button>
            {/* <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => handleDeleteSession(item)}
              disabled={saving || bulkProgress.isRunning}
            >
              Delete
            </Button> */}
          </Group>
        ),
      },
    ],
    [columnFilters, handleFilterChange, saving, bulkProgress.isRunning],
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
    const accessor = sortAccessors[key];
    if (!accessor) return filteredData;

    const dir = direction === 'desc' ? -1 : 1;
    return [...filteredData].sort((a, b) => {
      const avRaw = accessor(a);
      const bvRaw = accessor(b);

      const avNum = Number(avRaw);
      const bvNum = Number(bvRaw);
      const bothNumeric = Number.isFinite(avNum) && Number.isFinite(bvNum);
      if (bothNumeric) {
        if (avNum === bvNum) return 0;
        return avNum > bvNum ? dir : -dir;
      }

      const av = (avRaw ?? '').toString().toLowerCase();
      const bv = (bvRaw ?? '').toString().toLowerCase();
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }, [filteredData, sortConfig, sortAccessors]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  

  

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
            _rowKey: `${item.v_user || 'service'}-${item.v_mpaid || idx}`,
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

  

  const resetAll = () => {
    setColumnFilters(defaultFilters);
    setCurrentPage(1);
    setItemsPerPage(10);
    setSelectedKeys([]);
    setBulkProgress(initialBulkProgress);
    handleResetAll();
  };

  const makeKey = (item) =>
    item._rowKey || `${item.v_user || 'user'}-${item.v_mpaid || 'session'}`;

  const toggleRow = (item) => {
    const key = makeKey(item);
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );
  };

  const pageKeys = useMemo(
    () => paginatedData.map((item) => makeKey(item)).filter(Boolean),
    [paginatedData],
  );
  const pageFullySelected =
    pageKeys.length > 0 && pageKeys.every((key) => selectedKeys.includes(key));
  const pagePartiallySelected =
    pageKeys.some((key) => selectedKeys.includes(key)) && !pageFullySelected;
  const totalSelectedOnPage = paginatedData.filter((item) =>
    selectedKeys.includes(makeKey(item)),
  ).length;

  const toggleAllOnPage = () => {
    if (pageFullySelected) {
      setSelectedKeys((current) =>
        current.filter((key) => !pageKeys.includes(key)),
      );
    } else {
      setSelectedKeys((current) => {
        const newKeys = pageKeys.filter((key) => !current.includes(key));
        return [...current, ...newKeys];
      });
    }
  };

  const selectedItems = useMemo(
    () => data.filter((item) => selectedKeys.includes(makeKey(item))),
    [data, selectedKeys],
  );

  async function handleExecute(item, statement) {
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
  }

  async function handleAddCounter(item) {
    setSaving(true);
    try {
      const response = await serviceNagadAPI.addCounter(item.v_user);
      const status = (response.data?.status || '').toLowerCase();
      if (response.success && (status === 'success' || status === 'ok')) {
        showNotification({
          title: 'Success',
          message: response.data?.message || 'Counter updated',
          color: 'green',
        });
        fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message:
            response.error || response.data?.message || 'Failed to add counter',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Add counter error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to add counter',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSession(item) {
    if (
      !window.confirm(
        `Are you sure you want to delete the MPAID for the user ${item.v_user}?`,
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const response = await serviceNagadAPI.deleteSession(item.v_mpaid);
      const status = (response.data?.status || '').toLowerCase();
      if (response.success && (status === 'success' || status === 'ok')) {
        showNotification({
          title: 'Success',
          message: response.data?.message || 'Session deleted',
          color: 'green',
        });
        fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message:
            response.error ||
            response.data?.message ||
            'Failed to delete session',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Delete session error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to delete session',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleBulkExecute = async (statement) => {
    if (selectedItems.length === 0) {
      showNotification({
        title: 'Info',
        message: 'Please select at least one service',
        color: 'blue',
      });
      return;
    }

    const total = selectedItems.length;
    const totalBatches = Math.ceil(total / batchSize);
    const actionLabel = statement.toUpperCase();

    if (
      !window.confirm(
        `Are you sure want to ${actionLabel} ${total} service(s)?\n\nBatch: ${totalBatches}`,
      )
    ) {
      return;
    }

    setBulkProgress({
      isRunning: true,
      total,
      processed: 0,
      success: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches,
    });
    setSaving(true);

    let localSuccess = 0;
    let localFailed = 0;

    const batches = [];
    for (let i = 0; i < total; i += batchSize) {
      batches.push(selectedItems.slice(i, i + batchSize));
    }

    for (let index = 0; index < batches.length; index += 1) {
      setBulkProgress((prev) => ({
        ...prev,
        currentBatch: index + 1,
      }));

      await Promise.all(
        batches[index].map(async (row) => {
          try {
            const response = await serviceNagadAPI.execute({
              statment: statement,
              servicename: row.v_user,
            });
            const status = (response.data?.status || '').toLowerCase();
            const success = status === 'success' || status === 'ok';
            if (success) {
              localSuccess += 1;
            } else {
              localFailed += 1;
            }
            setBulkProgress((prev) => ({
              ...prev,
              processed: prev.processed + 1,
              success: prev.success + (success ? 1 : 0),
              failed: prev.failed + (success ? 0 : 1),
            }));
          } catch (error) {
            localFailed += 1;
            setBulkProgress((prev) => ({
              ...prev,
              processed: prev.processed + 1,
              failed: prev.failed + 1,
            }));
          }
        }),
      );

      if (index < batches.length - 1) {
        await sleep(batchDelay);
      }
    }

    setBulkProgress((prev) => ({
      ...prev,
      isRunning: false,
    }));
    setSaving(false);
    showNotification({
      title: `Bulk ${actionLabel} completed`,
      message: `Success: ${localSuccess} | Failed: ${localFailed}`,
      color: localFailed > 0 ? 'yellow' : 'green',
    });
    setSelectedKeys([]);
    fetchList({ silent: true });
  };

  const handleBulkAddCounter = async () => {
    if (selectedItems.length === 0) {
      showNotification({
        title: 'Info',
        message: 'Please select at least one service',
        color: 'blue',
      });
      return;
    }

    const total = selectedItems.length;
    const totalBatches = Math.ceil(total / batchSize);

    if (
      !window.confirm(
        `Are you sure want to ADD COUNTER for ${total} service(s)?\n\nBatch: ${totalBatches}`,
      )
    ) {
      return;
    }

    setBulkProgress({
      isRunning: true,
      total,
      processed: 0,
      success: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches,
    });
    setSaving(true);

    let localSuccess = 0;
    let localFailed = 0;

    const batches = [];
    for (let i = 0; i < total; i += batchSize) {
      batches.push(selectedItems.slice(i, i + batchSize));
    }

    for (let index = 0; index < batches.length; index += 1) {
      setBulkProgress((prev) => ({
        ...prev,
        currentBatch: index + 1,
      }));

      await Promise.all(
        batches[index].map(async (row) => {
          try {
            const response = await serviceNagadAPI.addCounter(row.v_user);
            const status = (response.data?.status || '').toLowerCase();
            const success = status === 'success' || status === 'ok';
            if (success) {
              localSuccess += 1;
            } else {
              localFailed += 1;
            }
            setBulkProgress((prev) => ({
              ...prev,
              processed: prev.processed + 1,
              success: prev.success + (success ? 1 : 0),
              failed: prev.failed + (success ? 0 : 1),
            }));
          } catch (error) {
            localFailed += 1;
            setBulkProgress((prev) => ({
              ...prev,
              processed: prev.processed + 1,
              failed: prev.failed + 1,
            }));
          }
        }),
      );

      if (index < batches.length - 1) {
        await sleep(batchDelay);
      }
    }

    setBulkProgress((prev) => ({
      ...prev,
      isRunning: false,
    }));
    setSaving(false);
    showNotification({
      title: 'Bulk ADD COUNTER completed',
      message: `Success: ${localSuccess} | Failed: ${localFailed}`,
      color: localFailed > 0 ? 'yellow' : 'green',
    });
    setSelectedKeys([]);
    fetchList({ silent: true });
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
          visible={loading || bulkProgress.isRunning}
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
                loading={refreshing || saving || bulkProgress.isRunning}
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
                disabled={bulkProgress.isRunning}
              >
                Reset
              </Button>
            </Group>
          </Group>

          <Group
            justify="space-between"
            align="center"
            wrap="wrap"
          >
            <Group gap="xs">
              {selectedKeys.length > 0 && !bulkProgress.isRunning ? (
                <Text size="sm">
                  <strong>Selected: {selectedKeys.length}</strong>
                </Text>
              ) : null}
              <Button
                size="xs"
                variant="light"
                color="green"
                onClick={handleBulkAddCounter}
                disabled={bulkProgress.isRunning || selectedKeys.length === 0}
              >
                Add Counter Selected
              </Button>
              <Button
                size="xs"
                variant="light"
                color="orange"
                onClick={() => handleBulkExecute('restart')}
                disabled={bulkProgress.isRunning || selectedKeys.length === 0}
              >
                Restart Selected
              </Button>
              <Button
                size="xs"
                variant="light"
                color="blue"
                onClick={() => handleBulkExecute('start')}
                disabled={bulkProgress.isRunning || selectedKeys.length === 0}
              >
                Start Selected
              </Button>
              <Button
                size="xs"
                variant="light"
                color="red"
                onClick={() => handleBulkExecute('stop')}
                disabled={bulkProgress.isRunning || selectedKeys.length === 0}
              >
                Stop Selected
              </Button>
            </Group>

            {bulkProgress.isRunning ? (
              <Text
                size="sm"
                c="dimmed"
              >
                Batch {bulkProgress.currentBatch}/{bulkProgress.totalBatches} -
                Processed {bulkProgress.processed}/{bulkProgress.total}
              </Text>
            ) : null}
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
                    <Table.Th
                      w={60}
                      style={{ textAlign: 'center' }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={pageFullySelected}
                          ref={(el) => {
                            if (el) el.indeterminate = pagePartiallySelected;
                          }}
                          onChange={toggleAllOnPage}
                          disabled={bulkProgress.isRunning}
                        />
                      </Box>
                    </Table.Th>
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
                    <Table.Th
                      w={60}
                      style={{ textAlign: 'center' }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Badge
                          variant="light"
                          color="gray"
                          style={{ minWidth: 28, justifyContent: 'center' }}
                        >
                          {totalSelectedOnPage}
                        </Badge>
                      </Box>
                    </Table.Th>
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
                    paginatedData.map((item, idx) => {
                      const rowKey = makeKey(item);
                      return (
                        <Table.Tr key={rowKey || `${idx}-row`}>
                          <Table.Td>
                            <Box
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedKeys.includes(rowKey)}
                                onChange={() => toggleRow(item)}
                                disabled={bulkProgress.isRunning}
                              />
                            </Box>
                          </Table.Td>
                          {visibleColumns.map((col) => (
                            <Table.Td key={col.key}>
                              {col.render(item)}
                            </Table.Td>
                          ))}
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={visibleColumns.length + 1}>
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
                    <Table.Td colSpan={visibleColumns.length + 1}>
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
