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
  SimpleGrid,
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
  IconRefresh,
  IconFilter,
  IconCash,
  IconArrowDownCircle,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';
import { depositAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  futuretrxid: '',
  timestamp: '',
  originaldate: '',
  merchantcode: '',
  bankcode: '',
  amount: '',
  transactiontype: '',
  status: '',
  accountno: '',
  accountsrcname: '',
  accountdst: '',
  accountdstname: '',
  notes: '',
  notes2: '',
  notes3: '',
  memo: '',
  transactionid: '',
  reference: '',
  servername: '',
  serverurl: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const DepositQueue = () => {
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState('');
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filterInput = (key, placeholder) => (
    <TextInput
      placeholder={placeholder}
      size="xs"
      value={columnFilters[key]}
      onChange={(e) => handleFilterChange(key, e.currentTarget.value)}
      leftSection={<IconFilter size={14} />}
      leftSectionPointerEvents="none"
    />
  );

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
    setAccount(accounts[0]?.value || '');
  }, [accounts]);

  const columns = useMemo(
    () => [
      {
        key: 'futuretrxid',
        label: 'Future Trx ID',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.futuretrxid}
          </Text>
        ),
        filter: filterInput('futuretrxid', 'Filter trx id...'),
      },
      {
        key: 'timestamp',
        label: 'Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.timestamp}</Text>,
        filter: filterInput('timestamp', 'Filter date...'),
      },
      {
        key: 'originaldate',
        label: 'Original Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.originaldate || '-'}</Text>,
        filter: filterInput('originaldate', 'Filter original...'),
      },
      {
        key: 'merchantcode',
        label: 'Merchant',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.merchantcode || '-'}</Text>,
        filter: filterInput('merchantcode', 'Filter merchant...'),
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
        filter: filterInput('bankcode', 'Filter bank...'),
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
        filter: filterInput('amount', 'Filter amount...'),
      },
      {
        key: 'transactiontype',
        label: 'Trans Type',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.transactiontype || '-'}</Text>,
        filter: filterInput('transactiontype', 'Filter type...'),
      },
      {
        key: 'status',
        label: 'Status',
        minWidth: 140,
        render: (item) => (
          <Badge
            color={
              item.status === 'Transaction Success'
                ? 'green'
                : item.status === 'Pending'
                ? 'orange'
                : 'red'
            }
          >
            {item.status || '-'}
          </Badge>
        ),
        filter: filterInput('status', 'Filter status...'),
      },
      {
        key: 'accountno',
        label: 'Acc Source',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.accountno || '-'}</Text>,
        filter: filterInput('accountno', 'Filter acc source...'),
      },
      {
        key: 'accountsrcname',
        label: 'Acc Source Name',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.accountsrcname || '-'}</Text>,
        filter: filterInput('accountsrcname', 'Filter source name...'),
      },
      {
        key: 'accountdst',
        label: 'Acc Dest',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.accountdst || '-'}</Text>,
        filter: filterInput('accountdst', 'Filter acc dest...'),
      },
      {
        key: 'accountdstname',
        label: 'Acc Dest Name',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.accountdstname || '-'}</Text>,
        filter: filterInput('accountdstname', 'Filter dest name...'),
      },
      {
        key: 'fee',
        label: 'Fee',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.fee)}
          </Text>
        ),
      },
      {
        key: 'notes',
        label: 'Notes',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.notes || '-'}</Text>,
        filter: filterInput('notes', 'Filter notes...'),
      },
      {
        key: 'notes2',
        label: 'Notes 2',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.notes2 || '-'}</Text>,
        filter: filterInput('notes2', 'Filter notes 2...'),
      },
      {
        key: 'notes3',
        label: 'Notes 3',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.notes3 || '-'}</Text>,
        filter: filterInput('notes3', 'Filter notes 3...'),
      },
      {
        key: 'memo',
        label: 'Memo',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.memo || '-'}</Text>,
        filter: filterInput('memo', 'Filter memo...'),
      },
      {
        key: 'transactionid',
        label: 'Trans ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.transactionid || '-'}</Text>,
        filter: filterInput('transactionid', 'Filter trans id...'),
      },
      {
        key: 'reference',
        label: 'Reference',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.reference || '-'}</Text>,
        filter: filterInput('reference', 'Filter reference...'),
      },
      {
        key: 'servername',
        label: 'Server Name',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.servername || '-'}</Text>,
        filter: filterInput('servername', 'Filter server...'),
      },
      {
        key: 'serverurl',
        label: 'Server URL',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.serverurl || '-'}</Text>,
        filter: filterInput('serverurl', 'Filter URL...'),
      },
    ],
    [columnFilters]
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

  const makeKey = (item) =>
    `${item.futuretrxid || ''}-${item.transactionid || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.futuretrxid, columnFilters.futuretrxid) &&
          includesValue(item.timestamp, columnFilters.timestamp) &&
          includesValue(item.originaldate, columnFilters.originaldate) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.amount, columnFilters.amount) &&
          includesValue(item.transactiontype, columnFilters.transactiontype) &&
          includesValue(item.status, columnFilters.status) &&
          includesValue(item.accountno, columnFilters.accountno) &&
          includesValue(item.accountsrcname, columnFilters.accountsrcname) &&
          includesValue(item.accountdst, columnFilters.accountdst) &&
          includesValue(item.accountdstname, columnFilters.accountdstname) &&
          includesValue(item.notes, columnFilters.notes) &&
          includesValue(item.notes2, columnFilters.notes2) &&
          includesValue(item.notes3, columnFilters.notes3) &&
          includesValue(item.memo, columnFilters.memo) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.reference, columnFilters.reference) &&
          includesValue(item.servername, columnFilters.servername) &&
          includesValue(item.serverurl, columnFilters.serverurl)
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

  const fetchAccounts = useCallback(async () => {
    const response = await depositAPI.getAutomationAgents();
    if (response.success && response.data) {
      const payload = response.data;
      if ((payload.status || '').toLowerCase() === 'ok') {
        const records = Array.isArray(payload.records) ? payload.records : [];
        const unique = {};
        const opts = records
          .filter((item) => {
            const key = `${item.bankAccNo || item.account}||${
              item.bankCode || ''
            }`;
            if (!key || unique[key]) return false;
            unique[key] = true;
            return true;
          })
          .map((item) => ({
            value: `${item.bankAccNo || item.account}||${item.bankCode || ''}`,
            label: `${item.bankAccNo || item.account} - ${
              item.bankAccName || item.alias || item.bankCode || ''
            }`,
          }));
        setAccounts(opts);
        if (opts[0]) setAccount(opts[0].value);
      }
    }
  }, []);

  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      if (!account) {
        showNotification({
          title: 'Validation',
          message: 'Please select an account first',
          color: 'yellow',
        });
        return;
      }

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
      if (diffDays > 31) {
        showNotification({
          title: 'Validation',
          message: 'Maximum date range is 32 days',
          color: 'yellow',
        });
        return;
      }

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const [accountno, bank] = account.split('||');
        const datefrom = dayjs(start).format('YYYY-MM-DD') + ' 00:00:00';
        const dateto = dayjs(end).format('YYYY-MM-DD') + ' 23:59:59';
        const response = await depositAPI.getDepositQueueByDate({
          accountno: accountno || '',
          bank: bank || '',
          datefrom,
          dateto,
        });

        if (response.success && response.data) {
          const payloadData = response.data;
          if ((payloadData.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payloadData.records)
              ? payloadData.records
              : [];
            setData(records);
          } else {
            showNotification({
              title: 'Error',
              message: payloadData.message || 'Failed to load data',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load data',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Deposit queue fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load deposit queue',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [account, dateRange]
  );

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (account) {
      fetchData();
    }
  }, [account, fetchData]);

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

  const summary = useMemo(
    () =>
      data.reduce(
        (acc, item) => {
          const isPending = item.status === 'Pending';
          const isSuccess = item.status === 'Transaction Success';
          const transType = item.transactiontype;
          const amount = Number(item.amount) || 0;
          const fee = Number(item.fee) || 0;
          const isDebit = ['D', 'Topup', 'Y', 'I'].includes(transType);
          const db = isDebit ? amount : 0;
          const cr = isDebit ? 0 : amount;

          if (isPending) {
            acc.pendingDB += db;
            acc.pendingCR += cr;
          } else if (isSuccess) {
            acc.DB += db;
            acc.CR += cr;
            acc.fee += fee;
          }

          return acc;
        },
        { pendingDB: 0, pendingCR: 0, DB: 0, CR: 0, fee: 0 }
      ),
    [data]
  );

  const dateLabel = `${format(
    dateRange[0].startDate,
    'dd MMM yyyy'
  )} - ${format(dateRange[0].endDate, 'dd MMM yyyy')}`;

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
                Deposit Queue (Unmatched by Date)
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Queue transactions by date range
              </Text>
            </Box>

            <Group gap="xs">
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
            <Group
              align="flex-end"
              gap="md"
              wrap="wrap"
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
                    {dateLabel}
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
                label="Account"
                placeholder="Select account"
                data={accounts}
                value={account}
                onChange={(val) => setAccount(val || '')}
                searchable
                style={{ minWidth: 260 }}
              />

              <SimpleGrid
                cols={3}
                spacing="sm"
                breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
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
                      Pending DB / CR
                    </Text>
                    <IconTrendingDown
                      size={16}
                      color="orange"
                    />
                  </Group>
                  <Text fw={700}>
                    {formatNumber(summary.pendingDB)} /{' '}
                    {formatNumber(summary.pendingCR)}
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
                      Total DB / CR
                    </Text>
                    <IconTrendingUp
                      size={16}
                      color="teal"
                    />
                  </Group>
                  <Text fw={700}>
                    {formatNumber(summary.DB)} / {formatNumber(summary.CR)}
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
                      Total Fee
                    </Text>
                    <IconCash
                      size={16}
                      color="orange"
                    />
                  </Group>
                  <Text fw={700}>{formatNumber(summary.fee)}</Text>
                </Card>
              </SimpleGrid>
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

export default DepositQueue;
