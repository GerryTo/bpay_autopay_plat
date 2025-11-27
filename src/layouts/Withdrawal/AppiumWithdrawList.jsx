import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
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
  IconArrowUpCircle,
  IconCalendar,
  IconFilter,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { withdrawAPI, depositAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'assign', label: 'Assign' },
  { value: 'reassign', label: 'Reassign' },
  { value: 'SEND TO AUTOMATION SUCCESS', label: 'In process' },
  { value: 'Withdrawal Success', label: 'Withdraw success' },
  { value: 'AUTOMATION FAILED', label: 'Withdraw need attention' },
  { value: 'finished_checking_history', label: 'Withdraw Finished Checking History' },
  { value: 'Withdrawal Failed', label: 'Withdraw Failed' },
  { value: 'Manual Assign List', label: 'Manual Assign List' },
];

const defaultFilters = {
  id: '',
  transactionid: '',
  duration: '',
  insert: '',
  assignTime: '',
  originaldate: '',
  completedate: '',
  merchantcode: '',
  amount: '',
  bankcode: '',
  dstbankaccount: '',
  dstbankaccountNo: '',
  sourceaccountname: '',
  notes3: '',
  statusAutomation: '',
  statusTransaction: '',
  memo: '',
  SentMqtt: '',
  ReceiveMqtt: '',
  isWithdrawUpload: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const getTransactionHighlight = (item) => {
  if (item.completedate) return undefined;
  if (!item.insert) return undefined;
  const now = dayjs();
  const inserted = dayjs(item.insert);
  if (!inserted.isValid()) return undefined;
  const diffMinutes = now.diff(inserted, 'minute', true);
  return diffMinutes >= 3 ? '#ffe3e3' : undefined;
};

const AppiumWithdrawList = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [status, setStatus] = useState('AUTOMATION FAILED');
  const [agent, setAgent] = useState('');
  const [agentOptions, setAgentOptions] = useState([]);
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
    setColumnFilters(defaultFilters);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'Future ID',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
            style={{ backgroundColor: getTransactionHighlight(item), padding: '2px 4px', borderRadius: 4 }}
          >
            {item.id}
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
        key: 'transactionid',
        label: 'Transaction ID',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            style={{ backgroundColor: getTransactionHighlight(item), padding: '2px 4px', borderRadius: 4 }}
          >
            {item.transactionid || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter transaction..."
            size="xs"
            value={columnFilters.transactionid}
            onChange={(e) =>
              handleFilterChange('transactionid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'duration',
        label: 'Duration',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.duration || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter duration..."
            size="xs"
            value={columnFilters.duration}
            onChange={(e) =>
              handleFilterChange('duration', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'insert',
        label: 'System Timestamp',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.insert}</Text>,
        filter: (
          <TextInput
            placeholder="Filter system ts..."
            size="xs"
            value={columnFilters.insert}
            onChange={(e) => handleFilterChange('insert', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'assignTime',
        label: 'Assign Timestamp',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.assignTime || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter assign..."
            size="xs"
            value={columnFilters.assignTime}
            onChange={(e) =>
              handleFilterChange('assignTime', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'originaldate',
        label: 'Original Timestamp',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.originaldate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter original..."
            size="xs"
            value={columnFilters.originaldate}
            onChange={(e) =>
              handleFilterChange('originaldate', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'completedate',
        label: 'Complete Timestamp',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.completedate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter complete..."
            size="xs"
            value={columnFilters.completedate}
            onChange={(e) =>
              handleFilterChange('completedate', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'merchantcode',
        label: 'Merchant',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.merchantcode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter merchant..."
            size="xs"
            value={columnFilters.merchantcode}
            onChange={(e) =>
              handleFilterChange('merchantcode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.amount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter amount..."
            size="xs"
            value={columnFilters.amount}
            onChange={(e) =>
              handleFilterChange('amount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'bankcode',
        label: 'Bank',
        minWidth: 100,
        render: (item) => (
          <Badge
            color="blue"
            variant="light"
          >
            {item.bankcode || '-'}
          </Badge>
        ),
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
        key: 'dstbankaccount',
        label: 'Dest Account Name',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.dstbankaccount || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dest acc..."
            size="xs"
            value={columnFilters.dstbankaccount}
            onChange={(e) =>
              handleFilterChange('dstbankaccount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dstbankaccountNo',
        label: 'Dest Account No',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.dstbankaccountNo || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dest acc no..."
            size="xs"
            value={columnFilters.dstbankaccountNo}
            onChange={(e) =>
              handleFilterChange('dstbankaccountNo', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'sourceaccountname',
        label: 'Source Account Name',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.sourceaccountname || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter source name..."
            size="xs"
            value={columnFilters.sourceaccountname}
            onChange={(e) =>
              handleFilterChange('sourceaccountname', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'notes3',
        label: 'Notes 3',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.notes3 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter notes 3..."
            size="xs"
            value={columnFilters.notes3}
            onChange={(e) =>
              handleFilterChange('notes3', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'statusAutomation',
        label: 'Status Automation',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.statusAutomation || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter status automation..."
            size="xs"
            value={columnFilters.statusAutomation}
            onChange={(e) =>
              handleFilterChange('statusAutomation', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'statusTransaction',
        label: 'Status Transaction',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.statusTransaction || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter status trx..."
            size="xs"
            value={columnFilters.statusTransaction}
            onChange={(e) =>
              handleFilterChange('statusTransaction', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'memo',
        label: 'Memo',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.memo || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter memo..."
            size="xs"
            value={columnFilters.memo}
            onChange={(e) => handleFilterChange('memo', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'SentMqtt',
        label: 'Sent Mqtt',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.SentMqtt || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter sent..."
            size="xs"
            value={columnFilters.SentMqtt}
            onChange={(e) =>
              handleFilterChange('SentMqtt', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'ReceiveMqtt',
        label: 'Receive Mqtt',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.ReceiveMqtt || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter receive..."
            size="xs"
            value={columnFilters.ReceiveMqtt}
            onChange={(e) =>
              handleFilterChange('ReceiveMqtt', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'isWithdrawUpload',
        label: 'isWithdrawUpload',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.isWithdrawUpload || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter upload..."
            size="xs"
            value={columnFilters.isWithdrawUpload}
            onChange={(e) =>
              handleFilterChange('isWithdrawUpload', e.currentTarget.value)
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
    onResetFilters: () => setColumnFilters(defaultFilters),
  });

  const makeKey = (item) => `${item.id || ''}-${item.transactionid || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.id, columnFilters.id) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.duration, columnFilters.duration) &&
          includesValue(item.insert, columnFilters.insert) &&
          includesValue(item.assignTime, columnFilters.assignTime) &&
          includesValue(item.originaldate, columnFilters.originaldate) &&
          includesValue(item.completedate, columnFilters.completedate) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.amount, columnFilters.amount) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.dstbankaccount, columnFilters.dstbankaccount) &&
          includesValue(item.dstbankaccountNo, columnFilters.dstbankaccountNo) &&
          includesValue(item.sourceaccountname, columnFilters.sourceaccountname) &&
          includesValue(item.notes3, columnFilters.notes3) &&
          includesValue(item.statusAutomation, columnFilters.statusAutomation) &&
          includesValue(item.statusTransaction, columnFilters.statusTransaction) &&
          includesValue(item.memo, columnFilters.memo) &&
          includesValue(item.SentMqtt, columnFilters.SentMqtt) &&
          includesValue(item.ReceiveMqtt, columnFilters.ReceiveMqtt) &&
          includesValue(item.isWithdrawUpload, columnFilters.isWithdrawUpload)
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

  const decodeRecord = (record) =>
    Object.entries(record || {}).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        try {
          acc[key] = decodeURIComponent(value);
        } catch (_) {
          acc[key] = value;
        }
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

  const mapRecords = (records = []) =>
    records.map((item) => ({
      ...item,
      id: item.id ?? item.futuretrxid ?? '',
      amount: Number(item.amount) || 0,
      fee: Number(item.fee) || 0,
    }));

  const fetchAgents = useCallback(async () => {
    const response = await depositAPI.getAutomationAgents();
    if (response.success && response.data) {
      const payload = response.data;
      if ((payload.status || '').toLowerCase() === 'ok') {
        const records = Array.isArray(payload.records) ? payload.records : [];
        const unique = {};
        const options = records.reduce((arr, item) => {
          const value = item.bankAccNo || item.account;
          if (!value || unique[value]) return arr;
          unique[value] = true;
          arr.push({
            value,
            label: `${value} - ${item.bankAccName || item.alias || item.bankCode || ''}`,
          });
          return arr;
        }, []);
        setAgentOptions(options);
      }
    }
  }, []);

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      const start = dateRange?.[0]?.startDate;
      const end = dateRange?.[0]?.endDate;
      if (!start || !end) {
        showNotification({
          title: 'Validation',
          message: 'Please select a date range',
          color: 'yellow',
        });
        return;
      }

      const diffDays = dayjs(end)
        .startOf('day')
        .diff(dayjs(start).startOf('day'), 'day');
      if (diffDays > 30) {
        showNotification({
          title: 'Validation',
          message: 'Maximum date range is 31 days',
          color: 'yellow',
        });
        return;
      }

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const payloadDateFrom = dayjs(start).format('YYYY-MM-DD');
        const payloadDateTo = dayjs(end).format('YYYY-MM-DD');
        const response = await withdrawAPI.getAutomationTransactions(
          payloadDateFrom,
          payloadDateTo,
          status,
          agent
        );

        if (response.success && response.data) {
          const payload = response.data;
          if ((payload.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payload.records)
              ? payload.records
              : [];
            const decoded = records.map(decodeRecord);
            setData(mapRecords(decoded));
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load automation withdraw list',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load automation withdraw list',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Automation withdraw list fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load automation withdraw list',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [agent, dateRange, status]
  );

  useEffect(() => {
    fetchAgents();
    fetchList();
  }, [fetchAgents, fetchList]);

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, item) => {
          acc.amount += Number(item.amount) || 0;
          acc.fee += Number(item.fee) || 0;
          return acc;
        },
        { amount: 0, fee: 0 }
      ),
    [data]
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
                Automation Withdraw List
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Automation withdraw monitoring (styled like Deposit Pending)
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
                  label="Status"
                  data={statusOptions}
                  value={status}
                  onChange={(val) => setStatus(val || 'AUTOMATION FAILED')}
                  style={{ minWidth: 220 }}
                />

                <Select
                  label="Agent"
                  placeholder="All agents"
                  data={agentOptions}
                  value={agent}
                  onChange={(val) => setAgent(val || '')}
                  searchable
                  clearable
                  style={{ minWidth: 240 }}
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

              <Group gap="sm">
                <Badge
                  variant="light"
                  color="gray"
                >
                  Records: {data.length}
                </Badge>
                <Badge
                  variant="light"
                  color="blue"
                >
                  Total Amount: {formatNumber(totals.amount)}
                </Badge>
                <Badge
                  variant="light"
                  color="teal"
                >
                  Total Fee: {formatNumber(totals.fee)}
                </Badge>
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
                    paginatedData.map((item) => (
                      <Table.Tr key={makeKey(item)}>
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

export default AppiumWithdrawList;
