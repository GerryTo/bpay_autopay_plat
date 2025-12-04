import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconActivity,
  IconAlertTriangle,
  IconFilter,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconUsers,
} from '@tabler/icons-react';
import { agentTrackerAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  isOnline: '',
  bankcode: '',
  username: '',
  accountNo: '',
  state: '',
  lastHeartbeat: '',
  lastTransactionSuccess: '',
  lastTransactionId: '',
};

const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
];

const stateColors = {
  IDLE: 'green',
  DEPOSIT: 'blue',
  WITHDRAW: 'orange',
  BUSY: 'teal',
};

const AgentTrackerDashboard = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalOnline: 0,
    totalOffline: 0,
    onlinePercentage: 0,
  });
  const [bankStats, setBankStats] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  const bankOverview = useMemo(() => {
    return (bankStats || []).map((item, idx) => {
      const bankCode = item.bankcode || item.bankCode || '-';
      const total = Number(item.total || item.Total || 0);
      const online = Number(item.online || item.Online || 0);
      const offline = Math.max(total - online, 0);
      return {
        key: `${bankCode}-${idx}`,
        bankCode,
        total,
        online,
        offline,
      };
    });
  }, [bankStats]);

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

  const filteredData = useMemo(() => {
    let list = data;
    if (statusFilter === 'online') {
      list = list.filter((item) => item.isOnline);
    } else if (statusFilter === 'offline') {
      list = list.filter((item) => !item.isOnline);
    }

    if (search) {
      const term = search.toLowerCase();
      list = list.filter((item) =>
        [
          item.username,
          item.accountNo,
          item.bankcode,
          item.state,
          item.lastTransactionId,
        ]
          .filter(Boolean)
          .some((val) => val.toString().toLowerCase().includes(term))
      );
    }

    return list.filter((item) => {
      return (
        includesValue(item.bankcode, columnFilters.bankcode) &&
        includesValue(item.username, columnFilters.username) &&
        includesValue(item.accountNo, columnFilters.accountNo) &&
        includesValue(item.state, columnFilters.state) &&
        includesValue(item.lastHeartbeat, columnFilters.lastHeartbeat) &&
        includesValue(item.lastTransactionSuccess, columnFilters.lastTransactionSuccess) &&
        includesValue(item.lastTransactionId, columnFilters.lastTransactionId)
      );
    });
  }, [data, statusFilter, search, columnFilters]);

  const columns = useMemo(
    () => [
      {
        key: 'isOnline',
        label: 'Status',
        minWidth: 110,
        render: (item) => (
          <Badge color={item.isOnline ? 'green' : 'red'} variant="filled">
            {item.isOnline ? 'ONLINE' : 'OFFLINE'}
          </Badge>
        ),
        filter: (
          <Select
            data={[
              { value: '', label: 'All' },
              { value: 'true', label: 'Online' },
              { value: 'false', label: 'Offline' },
            ]}
            size="xs"
            value={columnFilters.isOnline}
            onChange={(val) => handleFilterChange('isOnline', val || '')}
          />
        ),
      },
      {
        key: 'bankcode',
        label: 'Bank Code',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.bankcode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bankcode}
            onChange={(e) => handleFilterChange('bankcode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'username',
        label: 'Username',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.username || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter username..."
            size="xs"
            value={columnFilters.username}
            onChange={(e) => handleFilterChange('username', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'accountNo',
        label: 'Account No',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.accountNo || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter account..."
            size="xs"
            value={columnFilters.accountNo}
            onChange={(e) => handleFilterChange('accountNo', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'state',
        label: 'State',
        minWidth: 120,
        render: (item) => (
          <Badge variant="light" color={stateColors[item.state] || 'gray'}>
            {item.state || 'IDLE'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter state..."
            size="xs"
            value={columnFilters.state}
            onChange={(e) => handleFilterChange('state', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'lastHeartbeat',
        label: 'Last Heartbeat',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.lastHeartbeat || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter heartbeat..."
            size="xs"
            value={columnFilters.lastHeartbeat}
            onChange={(e) => handleFilterChange('lastHeartbeat', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'lastTransactionSuccess',
        label: 'Last Trx Success',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.lastTransactionSuccess || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter last success..."
            size="xs"
            value={columnFilters.lastTransactionSuccess}
            onChange={(e) =>
              handleFilterChange('lastTransactionSuccess', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastTransactionId',
        label: 'Last Trx ID',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.lastTransactionId || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter last trx id..."
            size="xs"
            value={columnFilters.lastTransactionId}
            onChange={(e) => handleFilterChange('lastTransactionId', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 120,
        render: (item) => (
          <Button
            size="xs"
            variant="light"
            color="blue"
            onClick={() => openDetail(item)}
          >
            Detail
          </Button>
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
  }, [columnFilters, statusFilter, search, selectedBank]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await agentTrackerAPI.getDashboard();
      if (response.success && response.data?.status === 'success') {
        const payload = response.data.data || {};
        setStats({
          totalAgents: payload.totalAgents || 0,
          totalOnline: payload.totalOnline || 0,
          totalOffline: payload.totalOffline || 0,
          onlinePercentage: payload.onlinePercentage || 0,
        });
        setBankStats(payload.bankStats || []);
        setLastUpdate(payload.lastUpdate || '');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  }, []);

  const fetchAgents = useCallback(
    async ({ silent = false } = {}) => {
      silent ? setRefreshing(true) : setLoading(true);
      try {
        const response = await agentTrackerAPI.getAgents(selectedBank);
        if (response.success && response.data) {
          const payload = response.data;
          const status = (payload.status || '').toLowerCase();
          if (!payload.status || status === 'success' || status === 'ok') {
            const records = Array.isArray(payload.records) ? payload.records : [];
            const withKeys = records.map((item, idx) => ({
              ...item,
              _rowKey: `${item.bankcode || 'bank'}-${item.accountNo || 'acct'}-${idx}`,
            }));
            setData(withKeys);
            setLastUpdate(payload.lastUpdate || '');
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load agents',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load agents',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Agents fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load agents',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedBank]
  );

  useEffect(() => {
    fetchDashboard();
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBank]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchDashboard();
        fetchAgents({ silent: true });
      }, 10000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchDashboard, fetchAgents]);

  const resetAll = () => {
    setColumnFilters(defaultFilters);
    setCurrentPage(1);
    setItemsPerPage(10);
    setStatusFilter('all');
    setSearch('');
    setSelectedBank('');
    handleResetAll();
  };

  const openDetail = async (item) => {
    try {
      const response = await agentTrackerAPI.getDetail({
        bankcode: item.bankcode,
        accountNo: item.accountNo,
      });
      if (response.success && response.data?.status === 'success') {
        setDetailData(response.data.agent || {});
        setDetailModalOpen(true);
      } else {
        showNotification({
          title: 'Error',
          message: response.data?.message || 'Failed to load agent detail',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Detail fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load agent detail',
        color: 'red',
      });
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
                <IconUsers
                  size={22}
                  color="#1d4ed8"
                />
                <Text
                  size="xl"
                  fw={700}
                >
                  Agent Tracker Dashboard
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Monitor agent status and activity. Last update: {lastUpdate || '-'}
              </Text>
            </Box>

            <Group gap="xs">
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing}
                onClick={() => {
                  fetchDashboard();
                  fetchAgents({ silent: true });
                }}
              >
                Refresh
              </Button>
              <Button
                variant="light"
                color={autoRefresh ? 'green' : 'gray'}
                radius="md"
                size="sm"
                leftSection={autoRefresh ? <IconPlayerStop size={18} /> : <IconPlayerPlay size={18} />}
                onClick={() => setAutoRefresh((prev) => !prev)}
              >
                {autoRefresh ? 'Stop Auto Refresh' : 'Start Auto Refresh'}
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

          <SimpleGrid cols={4} spacing="sm" breakpoints={[{ maxWidth: 'md', cols: 2 }]}>
            <Card withBorder padding="md" radius="md" shadow="xs">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Total Agents
                </Text>
                <IconUsers size={16} color="#2563eb" />
              </Group>
              <Text fw={700} size="lg">
                {stats.totalAgents}
              </Text>
            </Card>
            <Card withBorder padding="md" radius="md" shadow="xs">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Online
                </Text>
                <IconActivity size={16} color="green" />
              </Group>
              <Text fw={700} size="lg">
                {stats.totalOnline}
              </Text>
            </Card>
            <Card withBorder padding="md" radius="md" shadow="xs">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Offline
                </Text>
                <IconActivity size={16} color="red" />
              </Group>
              <Text fw={700} size="lg">
                {stats.totalOffline}
              </Text>
            </Card>
            <Card withBorder padding="md" radius="md" shadow="xs">
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  Online %
                </Text>
                <IconActivity size={16} color="#7c3aed" />
              </Group>
              <Text fw={700} size="lg">
                {stats.onlinePercentage}%
              </Text>
            </Card>
          </SimpleGrid>

          <Card withBorder radius="md" padding="md" shadow="xs">
            <Stack gap="md">
              <Group gap="md" wrap="wrap" align="flex-end">
                <Select
                  label="Status"
                  data={statusFilterOptions}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val || 'all')}
                  style={{ minWidth: 180 }}
                />
                <Select
                  label="Bank"
                  placeholder="All banks"
                  data={[
                    { value: '', label: 'All Banks' },
                    ...bankStats.map((b) => ({
                      value: b.bankcode || b.bankCode || '',
                      label: `${b.bankcode || b.bankCode} (${b.online || 0}/${b.total || 0})`,
                    })),
                  ]}
                  value={selectedBank}
                  onChange={(val) => setSelectedBank(val || '')}
                  style={{ minWidth: 220 }}
                />
                <TextInput
                  label="Search"
                  placeholder="Search username, account, bank, state..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  style={{ minWidth: 280 }}
                />
                <Badge variant="light" color="gray">
                  Last update: {lastUpdate || '-'}
                </Badge>
              </Group>
            </Stack>
          </Card>

          {bankOverview.length > 0 && (
            <Card withBorder radius="md" padding="md" shadow="xs">
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Text fw={700}>Bank Overview</Text>
                  <Text size="sm" c="dimmed">
                    Online and total agents per bank
                  </Text>
                </Group>
                <SimpleGrid cols={4} spacing="sm" breakpoints={[{ maxWidth: 'md', cols: 2 }]}>
                  {bankOverview.map((bank) => (
                    <Card key={bank.key} withBorder padding="md" radius="md" shadow="xs">
                      <Group justify="space-between" align="center" mb={6}>
                        <Text fw={700}>{bank.bankCode}</Text>
                        <Badge color={bank.online > 0 ? 'green' : 'red'} variant="light">
                          {bank.online} online
                        </Badge>
                      </Group>
                      <Group justify="space-between" align="center">
                        <Text size="sm" c="dimmed">
                          Offline
                        </Text>
                        <Text fw={600}>{bank.offline}</Text>
                      </Group>
                      <Group justify="space-between" align="center">
                        <Text size="sm" c="dimmed">
                          Total
                        </Text>
                        <Text fw={600}>{bank.total}</Text>
                      </Group>
                    </Card>
                  ))}
                </SimpleGrid>
              </Stack>
            </Card>
          )}

          <Box pos="relative">
            <ScrollArea type="auto" h="60vh">
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
                      <Table.Th key={col.key} style={{ minWidth: col.minWidth || 120 }}>
                        <Group gap={8} align="center">
                          <Text size="sm" fw={600}>
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
                      <Table.Tr key={item._rowKey || `${idx}-row`}>
                        {visibleColumns.map((col) => (
                          <Table.Td key={col.key}>{col.render(item)}</Table.Td>
                        ))}
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={visibleColumns.length}>
                        <Text ta="center" c="dimmed">
                          No data available
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
                <Table.Tfoot>
                  <Table.Tr>
                    <Table.Td colSpan={visibleColumns.length}>
                      <Group justify="space-between" align="center">
                        <Text size="sm" fw={600}>
                          Total rows: {filteredData.length}
                        </Text>
                        <Text size="sm" c="dimmed">
                          Totals stay in the footer.
                        </Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </ScrollArea>
          </Box>

          <Group justify="space-between" align="center">
            <Group gap="sm" align="center">
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
                style={{ width: 90 }}
                size="sm"
              />
              <Text size="sm" fw={600}>
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
        opened={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Agent Detail"
        centered
      >
        {detailData ? (
          <Stack gap="xs">
            {Object.entries(detailData).map(([key, value]) => (
              <Group key={key} justify="space-between">
                <Text size="sm" c="dimmed">
                  {key}
                </Text>
                <Text size="sm" fw={600}>
                  {value ?? '-'}
                </Text>
              </Group>
            ))}
          </Stack>
        ) : (
          <Text size="sm">No detail available</Text>
        )}
      </Modal>
    </Box>
  );
};

export default AgentTrackerDashboard;
