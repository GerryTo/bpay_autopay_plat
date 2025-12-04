import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { Popover } from '@mantine/core';
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  IconCalendar,
  IconFilter,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { crawlerAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const buildDefaultRange = () => [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  },
];

const defaultFilters = {
  d_insert: '',
  d_timestamp: '',
  v_user: '',
  v_bankaccountno: '',
  v_bankcode: '',
  n_startingBalance: '',
  n_nowBalance: '',
  n_currentBalance: '',
  n_cashOut: '',
  n_coCommission: '',
  n_coTransactions: '',
  n_cashIn: '',
  n_ciCommission: '',
  n_ciTransactions: '',
  n_b2bReceive: '',
  n_brTransactions: '',
  n_b2bReceiveBankCount: '',
  n_b2bReceiveBankTransaction: '',
  n_b2bSend: '',
  n_bsTransactions: '',
  n_b2bSendBankCount: '',
  n_b2bSendBankTransaction: '',
  n_agentCashout: '',
  n_agentCashoutComm: '',
  n_agentCashoutTrans: '',
};

const typeOptions = [
  { value: '1', label: 'Phase 1 Opening' },
  { value: '2', label: 'Phase 2 Closing' },
  { value: '3', label: 'Phase 3 Recrawl' },
];

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const numericFields = [
  'n_startingBalance',
  'n_currentBalance',
  'n_cashOut',
  'n_coCommission',
  'n_coTransactions',
  'n_cashIn',
  'n_ciCommission',
  'n_ciTransactions',
  'n_b2bReceive',
  'n_brTransactions',
  'n_b2bReceiveBankCount',
  'n_b2bReceiveBankTransaction',
  'n_b2bSend',
  'n_bsTransactions',
  'n_b2bSendBankCount',
  'n_b2bSendBankTransaction',
  'n_agentCashout',
  'n_agentCashoutComm',
  'n_agentCashoutTrans',
];

const AccountBalanceLog = () => {
  const [dateRange, setDateRange] = useState(buildDefaultRange());
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [type, setType] = useState('1');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters({ ...defaultFilters });
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'd_insert',
        label: 'Date Insert',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.d_insert || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date insert..."
            size="xs"
            value={columnFilters.d_insert}
            onChange={(e) =>
              handleFilterChange('d_insert', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'd_timestamp',
        label: 'Date Timestamp',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.d_timestamp || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp..."
            size="xs"
            value={columnFilters.d_timestamp}
            onChange={(e) =>
              handleFilterChange('d_timestamp', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'v_user',
        label: 'User',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.v_user || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter user..."
            size="xs"
            value={columnFilters.v_user}
            onChange={(e) =>
              handleFilterChange('v_user', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'v_bankaccountno',
        label: 'Bank Acc No',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.v_bankaccountno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank acc..."
            size="xs"
            value={columnFilters.v_bankaccountno}
            onChange={(e) =>
              handleFilterChange('v_bankaccountno', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'v_bankcode',
        label: 'Bank Code',
        minWidth: 120,
        render: (item) => (
          <Badge
            color="blue"
            variant="light"
          >
            {item.v_bankcode || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter bank code..."
            size="xs"
            value={columnFilters.v_bankcode}
            onChange={(e) =>
              handleFilterChange('v_bankcode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_startingBalance',
        label: 'Starting Balance',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_startingBalance)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter starting..."
            size="xs"
            value={columnFilters.n_startingBalance}
            onChange={(e) =>
              handleFilterChange('n_startingBalance', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_nowBalance',
        label: 'Main Page',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_nowBalance)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter main page..."
            size="xs"
            value={columnFilters.n_nowBalance}
            onChange={(e) =>
              handleFilterChange('n_nowBalance', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_currentBalance',
        label: 'Current Balance',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_currentBalance)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter current..."
            size="xs"
            value={columnFilters.n_currentBalance}
            onChange={(e) =>
              handleFilterChange('n_currentBalance', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_cashOut',
        label: 'Cash Out',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_cashOut)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter cash out..."
            size="xs"
            value={columnFilters.n_cashOut}
            onChange={(e) =>
              handleFilterChange('n_cashOut', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_coCommission',
        label: 'Cash Out Comm',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_coCommission)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter CO comm..."
            size="xs"
            value={columnFilters.n_coCommission}
            onChange={(e) =>
              handleFilterChange('n_coCommission', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_coTransactions',
        label: 'Cash Out Transaction',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_coTransactions)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter CO trx..."
            size="xs"
            value={columnFilters.n_coTransactions}
            onChange={(e) =>
              handleFilterChange('n_coTransactions', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_cashIn',
        label: 'Cash In',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_cashIn)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter cash in..."
            size="xs"
            value={columnFilters.n_cashIn}
            onChange={(e) =>
              handleFilterChange('n_cashIn', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_ciCommission',
        label: 'Cash In Comm',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_ciCommission)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter CI comm..."
            size="xs"
            value={columnFilters.n_ciCommission}
            onChange={(e) =>
              handleFilterChange('n_ciCommission', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_ciTransactions',
        label: 'Cash In Transaction',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_ciTransactions)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter CI trx..."
            size="xs"
            value={columnFilters.n_ciTransactions}
            onChange={(e) =>
              handleFilterChange('n_ciTransactions', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_b2bReceive',
        label: 'B2B Receive',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_b2bReceive)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B recv..."
            size="xs"
            value={columnFilters.n_b2bReceive}
            onChange={(e) =>
              handleFilterChange('n_b2bReceive', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_brTransactions',
        label: 'B2B Receive Transaction',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_brTransactions)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B recv trx..."
            size="xs"
            value={columnFilters.n_brTransactions}
            onChange={(e) =>
              handleFilterChange('n_brTransactions', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_b2bReceiveBankCount',
        label: 'B2B Receive Bank Count',
        minWidth: 220,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_b2bReceiveBankCount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B recv bank count..."
            size="xs"
            value={columnFilters.n_b2bReceiveBankCount}
            onChange={(e) =>
              handleFilterChange('n_b2bReceiveBankCount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_b2bReceiveBankTransaction',
        label: 'B2B Receive Bank Transaction',
        minWidth: 240,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_b2bReceiveBankTransaction)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B recv bank trx..."
            size="xs"
            value={columnFilters.n_b2bReceiveBankTransaction}
            onChange={(e) =>
              handleFilterChange(
                'n_b2bReceiveBankTransaction',
                e.currentTarget.value
              )
            }
          />
        ),
      },
      {
        key: 'n_b2bSend',
        label: 'B2B Send',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_b2bSend)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B send..."
            size="xs"
            value={columnFilters.n_b2bSend}
            onChange={(e) =>
              handleFilterChange('n_b2bSend', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_bsTransactions',
        label: 'B2B Send Transaction',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_bsTransactions)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B send trx..."
            size="xs"
            value={columnFilters.n_bsTransactions}
            onChange={(e) =>
              handleFilterChange('n_bsTransactions', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_b2bSendBankCount',
        label: 'B2B Send Bank Count',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_b2bSendBankCount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B send bank count..."
            size="xs"
            value={columnFilters.n_b2bSendBankCount}
            onChange={(e) =>
              handleFilterChange('n_b2bSendBankCount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_b2bSendBankTransaction',
        label: 'B2B Send Bank Transaction',
        minWidth: 240,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_b2bSendBankTransaction)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B send bank trx..."
            size="xs"
            value={columnFilters.n_b2bSendBankTransaction}
            onChange={(e) =>
              handleFilterChange(
                'n_b2bSendBankTransaction',
                e.currentTarget.value
              )
            }
          />
        ),
      },
      {
        key: 'n_agentCashout',
        label: 'Agent Cashout',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_agentCashout)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter agent cashout..."
            size="xs"
            value={columnFilters.n_agentCashout}
            onChange={(e) =>
              handleFilterChange('n_agentCashout', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_agentCashoutComm',
        label: 'Agent Cashout Comm',
        minWidth: 190,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_agentCashoutComm)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter agent cashout comm..."
            size="xs"
            value={columnFilters.n_agentCashoutComm}
            onChange={(e) =>
              handleFilterChange('n_agentCashoutComm', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_agentCashoutTrans',
        label: 'Agent Cashout Transaction',
        minWidth: 220,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_agentCashoutTrans)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter agent cashout trx..."
            size="xs"
            value={columnFilters.n_agentCashoutTrans}
            onChange={(e) =>
              handleFilterChange('n_agentCashoutTrans', e.currentTarget.value)
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
    handleResetAll: resetTableControls,
  } = useTableControls(columns, {
    onResetFilters: handleClearFilters,
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.d_insert, columnFilters.d_insert) &&
          includesValue(item.d_timestamp, columnFilters.d_timestamp) &&
          includesValue(item.v_user, columnFilters.v_user) &&
          includesValue(item.v_bankaccountno, columnFilters.v_bankaccountno) &&
          includesValue(item.v_bankcode, columnFilters.v_bankcode) &&
          includesValue(
            item.n_startingBalance,
            columnFilters.n_startingBalance
          ) &&
          includesValue(item.n_nowBalance, columnFilters.n_nowBalance) &&
          includesValue(
            item.n_currentBalance,
            columnFilters.n_currentBalance
          ) &&
          includesValue(item.n_cashOut, columnFilters.n_cashOut) &&
          includesValue(item.n_coCommission, columnFilters.n_coCommission) &&
          includesValue(
            item.n_coTransactions,
            columnFilters.n_coTransactions
          ) &&
          includesValue(item.n_cashIn, columnFilters.n_cashIn) &&
          includesValue(item.n_ciCommission, columnFilters.n_ciCommission) &&
          includesValue(
            item.n_ciTransactions,
            columnFilters.n_ciTransactions
          ) &&
          includesValue(item.n_b2bReceive, columnFilters.n_b2bReceive) &&
          includesValue(
            item.n_brTransactions,
            columnFilters.n_brTransactions
          ) &&
          includesValue(
            item.n_b2bReceiveBankCount,
            columnFilters.n_b2bReceiveBankCount
          ) &&
          includesValue(
            item.n_b2bReceiveBankTransaction,
            columnFilters.n_b2bReceiveBankTransaction
          ) &&
          includesValue(item.n_b2bSend, columnFilters.n_b2bSend) &&
          includesValue(
            item.n_bsTransactions,
            columnFilters.n_bsTransactions
          ) &&
          includesValue(
            item.n_b2bSendBankCount,
            columnFilters.n_b2bSendBankCount
          ) &&
          includesValue(
            item.n_b2bSendBankTransaction,
            columnFilters.n_b2bSendBankTransaction
          ) &&
          includesValue(item.n_agentCashout, columnFilters.n_agentCashout) &&
          includesValue(
            item.n_agentCashoutComm,
            columnFilters.n_agentCashoutComm
          ) &&
          includesValue(
            item.n_agentCashoutTrans,
            columnFilters.n_agentCashoutTrans
          )
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

  const totals = useMemo(() => {
    return numericFields.reduce((acc, field) => {
      acc[field] = filteredData.reduce(
        (sum, item) => sum + (Number(item[field]) || 0),
        0
      );
      return acc;
    }, {});
  }, [filteredData]);

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

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      const start = dateRange?.[0]?.startDate;
      if (!start) {
        showNotification({
          title: 'Validation',
          message: 'Please choose a date',
          color: 'yellow',
        });
        return;
      }

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const payloadDate = dayjs(start).format('YYYY-MM-DD');
        const response = await crawlerAPI.getAccountBalanceLog({
          date: payloadDate,
          type,
        });

        if (response.success && response.data) {
          const payload = response.data;
          if ((payload.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payload.records)
              ? payload.records
              : [];
            setData(records);
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load account balance log',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load account balance log',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Account balance log fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load account balance log',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, type]
  );

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetAll = () => {
    handleClearFilters();
    setType('1');
    setDateRange(buildDefaultRange());
    setCurrentPage(1);
    resetTableControls();
  };

  const getRowStyle = (item) => {
    if (item.n_missmatch === '1' || item.n_missmatch === 1) {
      return { backgroundColor: '#ffe3e3' };
    }
    return undefined;
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
              <Text
                size="xl"
                fw={700}
              >
                Account Balance Log
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Balance and transaction aggregates by account
              </Text>
            </Box>

            <Group gap="xs">
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
                onClick={handleResetAll}
              >
                Reset
              </Button>
            </Group>
          </Group>

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
                <Popover
                  position="bottom-start"
                  opened={datePickerOpened}
                  onChange={setDatePickerOpened}
                  width="auto"
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    <Button
                      variant="light"
                      color="blue"
                      leftSection={<IconCalendar size={18} />}
                      onClick={() => setDatePickerOpened((o) => !o)}
                    >
                      {format(dateRange[0].startDate, 'dd MMM yyyy')} -{' '}
                      {format(dateRange[0].endDate, 'dd MMM yyyy')}
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown p="sm">
                    <DateRangePicker
                      onChange={(ranges) => {
                        const selection = ranges.selection;
                        setDateRange([selection]);
                      }}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      maxDate={new Date()}
                    />
                  </Popover.Dropdown>
                </Popover>

                <Select
                  label="Phase"
                  data={typeOptions}
                  value={type}
                  onChange={(val) => setType(val || '1')}
                  style={{ minWidth: 200 }}
                />

                <Button
                  onClick={() => fetchList()}
                  leftSection={<IconSearch size={18} />}
                  radius="md"
                  color="blue"
                >
                  Apply
                </Button>
              </Group>
            </Stack>
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
                      <Table.Tr
                        key={`${item.v_user || 'row'}-${
                          item.v_bankaccountno || ''
                        }-${startIndex + idx}`}
                        style={getRowStyle(item)}
                      >
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
                    {visibleColumns.map((col, idx) => {
                      if (idx === 0) {
                        return (
                          <Table.Td key={`${col.key}-footer`}>
                            <Text fw={700}>Rows: {paginatedData.length}</Text>
                          </Table.Td>
                        );
                      }
                      if (numericFields.includes(col.key)) {
                        return (
                          <Table.Td key={`${col.key}-footer`}>
                            <Text
                              fw={700}
                              className="grid-alignright"
                            >
                              {totals[col.key] === 0 ? '-' : formatNumber(totals[col.key])}
                            </Text>
                          </Table.Td>
                        );
                      }
                      return <Table.Td key={`${col.key}-footer`} />;
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

export default AccountBalanceLog;
