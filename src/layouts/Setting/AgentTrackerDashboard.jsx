import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
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
  offlineReason: '',
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

const offlineReasonOptions = [
  { value: 'PIN LOCK', label: 'PIN LOCK' },
  { value: 'MAX OTP', label: 'MAX OTP' },
  { value: 'OTP OFFLINE', label: 'OTP OFFLINE' },
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
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonMode, setReasonMode] = useState('single');
  const [reasonTarget, setReasonTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [savingReason, setSavingReason] = useState(false);

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

  const makeKey = useCallback(
    (item) => `${item.bankcode || ''}-${item.accountNo || ''}`,
    []
  );

  const selectedRecords = useMemo(
    () => data.filter((item) => selectedKeys.includes(makeKey(item))),
    [data, selectedKeys, makeKey]
  );

  const offlineSelectedRecords = useMemo(
    () => selectedRecords.filter((item) => !item.isOnline),
    [selectedRecords]
  );

  const onlineCount = useMemo(
    () => data.filter((item) => item.isOnline).length,
    [data]
  );

  const offlineCount = useMemo(
    () => data.filter((item) => !item.isOnline).length,
    [data]
  );

  const unmarkedOfflineCount = useMemo(
    () => data.filter((item) => !item.isOnline && !item.offlineReason).length,
    [data]
  );

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

    if (columnFilters.isOnline === 'true') {
      list = list.filter((item) => item.isOnline);
    } else if (columnFilters.isOnline === 'false') {
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
          item.offlineReason,
        ]
          .filter(Boolean)
          .some((val) => val.toString().toLowerCase().includes(term))
      );
    }

    return list.filter((item) => {
      return (
        includesValue(item.offlineReason, columnFilters.offlineReason) &&
        includesValue(item.bankcode, columnFilters.bankcode) &&
        includesValue(item.username, columnFilters.username) &&
        includesValue(item.accountNo, columnFilters.accountNo) &&
        includesValue(item.state, columnFilters.state) &&
        includesValue(item.lastHeartbeat, columnFilters.lastHeartbeat) &&
        includesValue(
          item.lastTransactionSuccess,
          columnFilters.lastTransactionSuccess
        ) &&
        includesValue(item.lastTransactionId, columnFilters.lastTransactionId)
      );
    });
  }, [data, statusFilter, search, columnFilters]);

  useEffect(() => {
    setSelectedKeys((prev) =>
      prev.filter((key) => data.some((item) => makeKey(item) === key))
    );
  }, [data, makeKey]);

  const getReasonColor = (reason) => {
    const reasonMap = {
      'PIN LOCK': 'red',
      'MAX OTP': 'yellow',
      'OTP OFFLINE': 'blue',
    };
    return reasonMap[reason] || 'gray';
  };

  const getDisconnectColor = (count) => {
    if (count > 3) return 'red';
    if (count > 1) return 'yellow';
    return 'green';
  };

  const columns = useMemo(
    () => [
      {
        key: 'isOnline',
        label: 'Status',
        minWidth: 110,
        render: (item) => (
          <Badge
            color={item.isOnline ? 'green' : 'red'}
            variant="filled"
          >
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
        key: 'offlineDuration',
        label: 'Offline Duration',
        minWidth: 140,
        render: (item) => {
          const durationText =
            typeof item.offlineDuration === 'string'
              ? item.offlineDuration
              : item.offlineDuration?.text;
          return (
            <Text
              size="sm"
              c={item.isOnline ? 'dimmed' : 'red'}
              fw={item.isOnline ? 400 : 600}
            >
              {item.isOnline ? '-' : durationText || '-'}
            </Text>
          );
        },
      },
      {
        key: 'disconnectCountToday',
        label: 'Disconnect Today',
        minWidth: 150,
        render: (item) => (
          <Badge
            color={getDisconnectColor(item.disconnectCountToday || 0)}
            variant="light"
          >
            {item.disconnectCountToday || 0}
          </Badge>
        ),
      },
      {
        key: 'offlineReason',
        label: 'Offline Reason',
        minWidth: 150,
        render: (item) => {
          if (item.isOnline) {
            return (
              <Text
                size="sm"
                c="dimmed"
              >
                -
              </Text>
            );
          }
          if (!item.offlineReason) {
            return (
              <Text
                size="sm"
                c="dimmed"
              >
                -
              </Text>
            );
          }
          return (
            <Badge
              color={getReasonColor(item.offlineReason)}
              variant="light"
            >
              {item.offlineReason}
            </Badge>
          );
        },
        filter: (
          <TextInput
            placeholder="Filter reason..."
            size="xs"
            value={columnFilters.offlineReason}
            onChange={(e) =>
              handleFilterChange('offlineReason', e.currentTarget.value)
            }
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
            onChange={(e) =>
              handleFilterChange('bankcode', e.currentTarget.value)
            }
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
            onChange={(e) =>
              handleFilterChange('username', e.currentTarget.value)
            }
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
            onChange={(e) =>
              handleFilterChange('accountNo', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'state',
        label: 'State',
        minWidth: 120,
        render: (item) => (
          <Badge
            variant="light"
            color={stateColors[item.state] || 'gray'}
          >
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
            onChange={(e) =>
              handleFilterChange('lastHeartbeat', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastTransactionSuccess',
        label: 'Last Trx Success',
        minWidth: 180,
        render: (item) => (
          <Text size="sm">{item.lastTransactionSuccess || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter last success..."
            size="xs"
            value={columnFilters.lastTransactionSuccess}
            onChange={(e) =>
              handleFilterChange(
                'lastTransactionSuccess',
                e.currentTarget.value
              )
            }
          />
        ),
      },
      {
        key: 'lastTransactionId',
        label: 'Last Trx ID',
        minWidth: 150,
        render: (item) => (
          <Text size="sm">{item.lastTransactionId || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter last trx id..."
            size="xs"
            value={columnFilters.lastTransactionId}
            onChange={(e) =>
              handleFilterChange('lastTransactionId', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 120,
        render: (item) => (
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => openDetail(item)}
            >
              Detail
            </Button>
            {!item.isOnline && (
              <Button
                size="xs"
                variant="light"
                color="orange"
                onClick={() => openReasonModal(item)}
              >
                Reason
              </Button>
            )}
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
    onResetSelection: () => setSelectedKeys([]),
  });

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const dir = direction === 'desc' ? -1 : 1;
    return [...filteredData].sort((a, b) => {
      const av =
        key === 'offlineDuration'
          ? a.offlineDuration?.seconds || 0
          : a[key] ?? '';
      const bv =
        key === 'offlineDuration'
          ? b.offlineDuration?.seconds || 0
          : b[key] ?? '';
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);
  const pageKeys = paginatedData.map((item) => makeKey(item));
  const pageFullySelected =
    pageKeys.length > 0 && pageKeys.every((key) => selectedKeys.includes(key));
  const pagePartiallySelected =
    pageKeys.some((key) => selectedKeys.includes(key)) && !pageFullySelected;

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, statusFilter, search, selectedBank]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const toggleRow = (item) => {
    const key = makeKey(item);
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key]
    );
  };

  const toggleAllOnPage = () => {
    if (pageFullySelected) {
      setSelectedKeys((current) =>
        current.filter((key) => !pageKeys.includes(key))
      );
    } else {
      setSelectedKeys((current) => [
        ...current,
        ...pageKeys.filter((key) => !current.includes(key)),
      ]);
    }
  };

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
            const records = Array.isArray(payload.records)
              ? payload.records
              : [];
            const withKeys = records.map((item, idx) => ({
              ...item,
              _rowKey: `${item.bankcode || 'bank'}-${
                item.accountNo || 'acct'
              }-${idx}`,
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
    setSelectedKeys([]);
    handleResetAll();
  };

  const openReasonModal = (item) => {
    setReasonMode('single');
    setReasonTarget(item);
    setSelectedReason(item?.offlineReason || '');
    setReasonModalOpen(true);
  };

  const openBulkReasonModal = () => {
    if (offlineSelectedRecords.length === 0) {
      showNotification({
        title: 'Warning',
        message: 'Select at least one offline agent',
        color: 'yellow',
      });
      return;
    }
    setReasonMode('bulk');
    setReasonTarget(null);
    setSelectedReason('');
    setReasonModalOpen(true);
  };

  const closeReasonModal = () => {
    setReasonModalOpen(false);
    setReasonTarget(null);
    setSelectedReason('');
  };

  const isSuccessStatus = (payload) => {
    const status = (
      payload?.status ||
      payload?.data?.status ||
      ''
    ).toLowerCase();
    return status === 'success' || status === 'ok';
  };

  const submitReason = async ({ clear = false } = {}) => {
    if (!clear && !selectedReason) {
      showNotification({
        title: 'Warning',
        message: 'Please select an offline reason',
        color: 'yellow',
      });
      return;
    }

    setSavingReason(true);
    try {
      if (reasonMode === 'single') {
        const response = await agentTrackerAPI.setOfflineReason({
          bankcode: reasonTarget?.bankcode,
          accountNo: reasonTarget?.accountNo,
          reason: clear ? '' : selectedReason,
        });
        if (response.success && isSuccessStatus(response.data)) {
          showNotification({
            title: 'Success',
            message: 'Offline reason updated',
            color: 'green',
          });
          closeReasonModal();
          fetchDashboard();
          fetchAgents({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data?.message || 'Failed to update reason',
            color: 'red',
          });
        }
      } else {
        const agentKeys = offlineSelectedRecords
          .map((agent) =>
            `${agent.bankcode || ''}-${agent.accountNo || ''}`.trim()
          )
          .filter((key) => key && key !== '-');
        if (agentKeys.length === 0) {
          showNotification({
            title: 'Warning',
            message: 'No valid offline agents selected',
            color: 'yellow',
          });
          return;
        }
        const response = await agentTrackerAPI.bulkSetOfflineReason({
          agentKeys,
          reason: clear ? '' : selectedReason,
        });
        if (response.success && isSuccessStatus(response.data)) {
          showNotification({
            title: 'Success',
            message: 'Offline reasons updated',
            color: 'green',
          });
          closeReasonModal();
          fetchDashboard();
          fetchAgents({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data?.message || 'Failed to update reasons',
            color: 'red',
          });
        }
      }
    } catch (error) {
      console.error('Offline reason update error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update offline reason',
        color: 'red',
      });
    } finally {
      setSavingReason(false);
    }
  };

  const formatDetailValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'object') {
      if (value?.text) return value.text;
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return value;
  };

  const detailFields = useMemo(() => {
    if (!detailData) return [];

    const lastAmount =
      detailData.lastTransactionAmount ??
      detailData.lastTrxAmount ??
      detailData.lastAmount ??
      detailData.lastTrx ??
      detailData.lastTransactionValue;
    const todayTransactions =
      detailData.todayTransactions ??
      detailData.todaysTransactions ??
      detailData.todayTransactionCount ??
      detailData.todayTrxCount;

    const baseFields = [
      { key: 'username', label: 'Username', value: detailData.username },
      { key: 'accountNo', label: 'Account No', value: detailData.accountNo },
      { key: 'bankcode', label: 'Bank Code', value: detailData.bankcode },
      { key: 'isOnline', label: 'Status', value: detailData.isOnline },
      {
        key: 'disconnectCountToday',
        label: 'Disconnect Count Today',
        value: detailData.disconnectCountToday ?? 0,
      },
      { key: 'state', label: 'Current State', value: detailData.state },
      {
        key: 'lastHeartbeat',
        label: 'Last Heartbeat',
        value: detailData.lastHeartbeat,
      },
      {
        key: 'lastTransactionSuccess',
        label: 'Last Trx Success',
        value: detailData.lastTransactionSuccess,
      },
      {
        key: 'lastTransactionId',
        label: 'Last Trx Id',
        value: detailData.lastTransactionId,
      },
      {
        key: 'lastTransactionAmount',
        label: 'Last Trx Amount',
        value: lastAmount,
      },
      {
        key: 'todayTransactions',
        label: "Today's Transactions",
        value: todayTransactions,
      },
    ];

    const extraFields = [];
    if (!detailData.isOnline) {
      extraFields.push({
        key: 'offlineDuration',
        label: 'Offline Duration',
        value: detailData.offlineDuration,
      });
      if (detailData.offlineReason) {
        extraFields.push({
          key: 'offlineReason',
          label: 'Offline Reason',
          value: detailData.offlineReason,
        });
      }
    }

    return [...baseFields, ...extraFields];
  }, [detailData]);

  const openDetail = async (item) => {
    try {
      const response = await agentTrackerAPI.getDetail({
        bankcode: item.bankcode,
        accountNo: item.accountNo,
      });
      const payload = response.data || {};
      const agent = payload.agent || payload.data?.agent || {};
      if (response.success && isSuccessStatus(payload)) {
        setDetailData(agent);
        setDetailModalOpen(true);
      } else {
        showNotification({
          title: 'Error',
          message: payload.message || 'Failed to load agent detail',
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
                Monitor agent status and activity. Last update:{' '}
                {lastUpdate || '-'}
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
                color="orange"
                radius="md"
                size="sm"
                leftSection={<IconAlertTriangle size={18} />}
                onClick={openBulkReasonModal}
                disabled={offlineSelectedRecords.length === 0}
              >
                Bulk Reason ({offlineSelectedRecords.length})
              </Button>
              <Button
                variant="light"
                color={autoRefresh ? 'green' : 'gray'}
                radius="md"
                size="sm"
                leftSection={
                  autoRefresh ? (
                    <IconPlayerStop size={18} />
                  ) : (
                    <IconPlayerPlay size={18} />
                  )
                }
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

          <SimpleGrid
            cols={4}
            spacing="sm"
            breakpoints={[{ maxWidth: 'md', cols: 2 }]}
          >
            <Card
              withBorder
              padding="md"
              radius="md"
              shadow="xs"
            >
              <Group
                justify="space-between"
                align="center"
              >
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Total Agents
                </Text>
                <IconUsers
                  size={16}
                  color="#2563eb"
                />
              </Group>
              <Text
                fw={700}
                size="lg"
              >
                {stats.totalAgents}
              </Text>
            </Card>
            <Card
              withBorder
              padding="md"
              radius="md"
              shadow="xs"
            >
              <Group
                justify="space-between"
                align="center"
              >
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Online
                </Text>
                <IconActivity
                  size={16}
                  color="green"
                />
              </Group>
              <Text
                fw={700}
                size="lg"
              >
                {stats.totalOnline}
              </Text>
            </Card>
            <Card
              withBorder
              padding="md"
              radius="md"
              shadow="xs"
            >
              <Group
                justify="space-between"
                align="center"
              >
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Offline
                </Text>
                <IconActivity
                  size={16}
                  color="red"
                />
              </Group>
              <Text
                fw={700}
                size="lg"
              >
                {stats.totalOffline}
              </Text>
            </Card>
            <Card
              withBorder
              padding="md"
              radius="md"
              shadow="xs"
            >
              <Group
                justify="space-between"
                align="center"
              >
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Online %
                </Text>
                <IconActivity
                  size={16}
                  color="#7c3aed"
                />
              </Group>
              <Text
                fw={700}
                size="lg"
              >
                {stats.onlinePercentage}%
              </Text>
            </Card>
          </SimpleGrid>

          <Card
            withBorder
            radius="md"
            padding="md"
            shadow="xs"
          >
            <Stack gap="md">
              <Group
                gap="md"
                wrap="wrap"
                align="flex-end"
              >
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
                      label: `${b.bankcode || b.bankCode} (${b.online || 0}/${
                        b.total || 0
                      })`,
                    })),
                  ]}
                  value={selectedBank}
                  onChange={(val) => setSelectedBank(val || '')}
                  style={{ minWidth: 220 }}
                />
                {/* <TextInput
                  label="Search"
                  placeholder="Search username, account, bank, state, reason..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  style={{ minWidth: 280 }}
                /> */}
                <Badge
                  variant="light"
                  color="gray"
                >
                  Last update: {lastUpdate || '-'}
                </Badge>
              </Group>
              <Group
                gap="xs"
                wrap="wrap"
              >
                <Badge
                  variant="light"
                  color="gray"
                >
                  All: {data.length}
                </Badge>
                <Badge
                  variant="light"
                  color="green"
                >
                  Online: {onlineCount}
                </Badge>
                <Badge
                  variant="light"
                  color="red"
                >
                  Offline: {offlineCount}
                </Badge>
                {unmarkedOfflineCount > 0 && (
                  <Badge
                    variant="light"
                    color="orange"
                  >
                    Unmarked Offline: {unmarkedOfflineCount}
                  </Badge>
                )}
              </Group>
            </Stack>
          </Card>

          {bankOverview.length > 0 && (
            <Card
              withBorder
              radius="md"
              padding="md"
              shadow="xs"
            >
              <Stack gap="sm">
                <Group
                  justify="space-between"
                  align="center"
                >
                  <Text fw={700}>Bank Overview</Text>
                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    Online and total agents per bank
                  </Text>
                </Group>
                <SimpleGrid
                  cols={4}
                  spacing="sm"
                  breakpoints={[{ maxWidth: 'md', cols: 2 }]}
                >
                  {bankOverview.map((bank) => (
                    <Card
                      key={bank.key}
                      withBorder
                      padding="md"
                      radius="md"
                      shadow="xs"
                    >
                      <Group
                        justify="space-between"
                        align="center"
                        mb={6}
                      >
                        <Text fw={700}>{bank.bankCode}</Text>
                        <Badge
                          color={bank.online > 0 ? 'green' : 'red'}
                          variant="light"
                        >
                          {bank.online} online
                        </Badge>
                      </Group>
                      <Group
                        justify="space-between"
                        align="center"
                      >
                        <Text
                          size="sm"
                          c="dimmed"
                        >
                          Offline
                        </Text>
                        <Text fw={600}>{bank.offline}</Text>
                      </Group>
                      <Group
                        justify="space-between"
                        align="center"
                      >
                        <Text
                          size="sm"
                          c="dimmed"
                        >
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
                    <Table.Th style={{ width: 48 }}>
                      <Checkbox
                        checked={pageFullySelected}
                        indeterminate={pagePartiallySelected}
                        onChange={toggleAllOnPage}
                        aria-label="Select all rows"
                      />
                    </Table.Th>
                    {visibleColumns.map((col) => (
                      <Table.Th
                        key={col.key}
                        style={{ minWidth: col.minWidth || 120 }}
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
                    <Table.Th>
                      <Checkbox
                        checked={pageFullySelected}
                        indeterminate={pagePartiallySelected}
                        onChange={toggleAllOnPage}
                        aria-label="Select all rows"
                      />
                    </Table.Th>
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
                      <Table.Tr
                        key={item._rowKey || `${idx}-row`}
                        bg={
                          selectedKeys.includes(makeKey(item))
                            ? 'rgba(34, 139, 230, 0.08)'
                            : !item.isOnline
                            ? 'rgba(239, 68, 68, 0.06)'
                            : undefined
                        }
                      >
                        <Table.Td>
                          <Checkbox
                            checked={selectedKeys.includes(makeKey(item))}
                            onChange={() => toggleRow(item)}
                            aria-label="Select row"
                          />
                        </Table.Td>
                        {visibleColumns.map((col) => (
                          <Table.Td key={col.key}>{col.render(item)}</Table.Td>
                        ))}
                      </Table.Tr>
                    ))
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
                {/* <Table.Tfoot>
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
                fw={600}
              >
                Rows: {paginatedData.length}
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Selected: {selectedKeys.length}
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
        title="Agent Details"
        centered
        size="lg"
      >
        {detailData ? (
          <Stack gap="md">
            <SimpleGrid
              cols={2}
              spacing="md"
              breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
            >
              {detailFields.map(({ key, label, value }) => {
                const lowerKey = key.toLowerCase();
                if (lowerKey === 'isonline') {
                  return (
                    <Box key={key}>
                      <Text
                        size="xs"
                        c="dimmed"
                        fw={600}
                      >
                        {label.toUpperCase()}
                      </Text>
                      <Badge
                        color={detailData.isOnline ? 'green' : 'red'}
                        variant="filled"
                      >
                        {detailData.isOnline ? 'ONLINE' : 'OFFLINE'}
                      </Badge>
                    </Box>
                  );
                }

                if (lowerKey === 'state') {
                  return (
                    <Box key={key}>
                      <Text
                        size="xs"
                        c="dimmed"
                        fw={600}
                      >
                        {label.toUpperCase()}
                      </Text>
                      <Badge
                        color={stateColors[detailData.state] || 'gray'}
                        variant="light"
                      >
                        {detailData.state || 'IDLE'}
                      </Badge>
                    </Box>
                  );
                }

                if (lowerKey === 'disconnectcounttoday') {
                  return (
                    <Box key={key}>
                      <Text
                        size="xs"
                        c="dimmed"
                        fw={600}
                      >
                        {label.toUpperCase()}
                      </Text>
                      <Badge
                        color={getDisconnectColor(value || 0)}
                        variant="light"
                      >
                        {value || 0}
                      </Badge>
                    </Box>
                  );
                }

                return (
                  <Box key={key}>
                    <Text
                      size="xs"
                      c="dimmed"
                      fw={600}
                    >
                      {label.toUpperCase()}
                    </Text>
                    <Text
                      size="sm"
                      fw={600}
                    >
                      {formatDetailValue(value)}
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>

            <Divider />

            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => setDetailModalOpen(false)}
              >
                Close
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text size="sm">No detail available</Text>
        )}
      </Modal>

      <Modal
        opened={reasonModalOpen}
        onClose={closeReasonModal}
        title={
          reasonMode === 'single'
            ? 'Mark Offline Reason'
            : 'Bulk Offline Reason'
        }
        centered
      >
        <Stack gap="md">
          <Text
            size="sm"
            c="dimmed"
          >
            {reasonMode === 'single'
              ? `Agent: ${
                  reasonTarget?.username || reasonTarget?.accountNo || '-'
                }`
              : `Apply to ${offlineSelectedRecords.length} offline agents`}
          </Text>

          <Select
            label="Offline Reason"
            placeholder="Select reason"
            data={offlineReasonOptions}
            value={selectedReason}
            onChange={(val) => setSelectedReason(val || '')}
            searchable
          />

          <Group gap="xs">
            {offlineReasonOptions.map((option) => (
              <Button
                key={option.value}
                size="xs"
                variant={selectedReason === option.value ? 'filled' : 'light'}
                onClick={() => setSelectedReason(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </Group>

          <Group
            justify="flex-end"
            gap="sm"
          >
            <Button
              variant="default"
              onClick={() => submitReason({ clear: true })}
              disabled={savingReason}
            >
              {reasonMode === 'single' ? 'Clear Reason' : 'Clear Selected'}
            </Button>
            <Button
              variant="default"
              onClick={closeReasonModal}
            >
              Cancel
            </Button>
            <Button
              loading={savingReason}
              onClick={() => submitReason()}
              color="blue"
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default AgentTrackerDashboard;
