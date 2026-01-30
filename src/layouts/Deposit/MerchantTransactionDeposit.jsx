import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
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
  IconArrowDownCircle,
  IconCalendar,
  IconFilter,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconCash,
} from '@tabler/icons-react';
import { merchantAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const statusOptions = [
  { value: '', label: 'All' },
  { value: '9', label: 'Pending' },
  { value: '0', label: 'Accepted' },
  { value: '8', label: 'Failed' },
];

const defaultFilters = {
  futuretrxid: '',
  timestamp: '',
  originaldate: '',
  insert: '',
  accountno: '',
  customercode: '',
  bankcode: '',
  transactiontype: '',
  status: '',
  notes: '',
  notes2: '',
  notes3: '',
  transactionid: '',
  reference: '',
  ip: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0.00';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const MerchantTransactionDeposit = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [status, setStatus] = useState(statusOptions[0].value);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [balance, setBalance] = useState({ opening: 0, current: 0 });
  const [summary, setSummary] = useState({
    pendingDB: 0,
    pendingCR: 0,
    DB: 0,
    CR: 0,
    fee: 0,
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

  const columns = useMemo(
    () => [
      {
        key: 'futuretrxid',
        label: 'Future Trx ID',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.futuretrxid}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={columnFilters.futuretrxid}
            onChange={(e) =>
              handleFilterChange('futuretrxid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'timestamp',
        label: 'Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.timestamp}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date..."
            size="xs"
            value={columnFilters.timestamp}
            onChange={(e) =>
              handleFilterChange('timestamp', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'originaldate',
        label: 'Original Date',
        minWidth: 150,
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
        key: 'insert',
        label: 'Insert Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.insert || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter insert..."
            size="xs"
            value={columnFilters.insert}
            onChange={(e) =>
              handleFilterChange('insert', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountno',
        label: 'Account No',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.accountno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter account..."
            size="xs"
            value={columnFilters.accountno}
            onChange={(e) =>
              handleFilterChange('accountno', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'customercode',
        label: 'Customer Code',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.customercode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter customer..."
            size="xs"
            value={columnFilters.customercode}
            onChange={(e) =>
              handleFilterChange('customercode', e.currentTarget.value)
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
        key: 'DB',
        label: 'Debit',
        minWidth: 110,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.DB)}
          </Text>
        ),
      },
      {
        key: 'CR',
        label: 'Credit',
        minWidth: 110,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.CR)}
          </Text>
        ),
      },
      {
        key: 'ip',
        label: 'IP',
        minWidth: 130,
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
        key: 'transactiontype',
        label: 'Trans Type',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.transactiontype || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter type..."
            size="xs"
            value={columnFilters.transactiontype}
            onChange={(e) =>
              handleFilterChange('transactiontype', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'status',
        label: 'Status',
        minWidth: 150,
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
        key: 'fee',
        label: 'Fee',
        minWidth: 110,
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
        filter: (
          <TextInput
            placeholder="Filter notes..."
            size="xs"
            value={columnFilters.notes}
            onChange={(e) => handleFilterChange('notes', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'notes2',
        label: 'Notes 2',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.notes2 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter notes 2..."
            size="xs"
            value={columnFilters.notes2}
            onChange={(e) =>
              handleFilterChange('notes2', e.currentTarget.value)
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
        key: 'transactionid',
        label: 'Trans ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.transactionid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trans id..."
            size="xs"
            value={columnFilters.transactionid}
            onChange={(e) =>
              handleFilterChange('transactionid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'reference',
        label: 'Reference',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.reference || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter reference..."
            size="xs"
            value={columnFilters.reference}
            onChange={(e) =>
              handleFilterChange('reference', e.currentTarget.value)
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
          includesValue(item.insert, columnFilters.insert) &&
          includesValue(item.accountno, columnFilters.accountno) &&
          includesValue(item.customercode, columnFilters.customercode) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.transactiontype, columnFilters.transactiontype) &&
          includesValue(item.status, columnFilters.status) &&
          includesValue(item.notes, columnFilters.notes) &&
          includesValue(item.notes2, columnFilters.notes2) &&
          includesValue(item.notes3, columnFilters.notes3) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.reference, columnFilters.reference) &&
          includesValue(item.ip, columnFilters.ip)
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

  const mapRecords = (records = []) =>
    records.map((item) => {
      const transType = item.transactiontype;
      const amount = Number(item.amount) || 0;
      const isDebit = ['D', 'M', 'Y'].includes(transType);
      const DB = isDebit ? amount : 0;
      const CR = isDebit ? 0 : amount;
      return {
        ...item,
        DB,
        CR,
        fee: Number(item.fee) || 0,
      };
    });

  const calculateSummary = (records = []) => {
    const summaryCalc = records.reduce(
      (acc, item) => {
        const statusVal = item.status;
        acc.fee += Number(item.fee) || 0;
        if (statusVal === 'Pending') {
          acc.pendingDB += Number(item.DB) || 0;
          acc.pendingCR += Number(item.CR) || 0;
        } else if (statusVal === 'Transaction Success') {
          acc.DB += Number(item.DB) || 0;
          acc.CR += Number(item.CR) || 0;
        }
        return acc;
      },
      { pendingDB: 0, pendingCR: 0, DB: 0, CR: 0, fee: 0 }
    );
    setSummary(summaryCalc);
  };

  const loadBalance = async (fromDate) => {
    const response = await merchantAPI.getMerchantBalance(fromDate);
    if (response.success && response.data?.status?.toLowerCase() === 'ok') {
      const bal = response.data.records?.[0] || {};
      setBalance({
        opening: Number(bal.opening || 0),
        current: Number(bal.current || 0),
      });
    }
  };

  const fetchData = useCallback(
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
        const datefrom = dayjs(start).format('YYYY-MM-DD') + ' 00:00:00';
        const dateto = dayjs(end).format('YYYY-MM-DD') + ' 23:59:59';
        const statusValue = status === '' ? null : status;

        const response = await merchantAPI.getTransactionByMerchant(
          datefrom,
          dateto,
          statusValue,
          'D'
        );

        if (response.success && response.data) {
          if (response.data.status?.toLowerCase() === 'ok') {
            const records = Array.isArray(response.data.records)
              ? response.data.records
              : [];
            const mapped = mapRecords(records);
            setData(mapped);
            calculateSummary(mapped);
            await loadBalance(datefrom);
          } else {
            showNotification({
              title: 'Error',
              message: response.data.message || 'Failed to load data',
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
        console.error('Error fetching merchant deposit:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load merchant deposit data',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, status]
  );

  const summaryCards = [
    {
      label: 'Opening Balance',
      value: formatNumber(balance.opening),
      icon: (
        <IconTrendingDown
          size={16}
          color="blue"
        />
      ),
    },
    {
      label: 'Current Balance',
      value: formatNumber(balance.current),
      icon: (
        <IconTrendingUp
          size={16}
          color="teal"
        />
      ),
    },
    {
      label: 'Fee',
      value: formatNumber(summary.fee),
      icon: (
        <IconCash
          size={16}
          color="orange"
        />
      ),
    },
  ];

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
                Merchant Transaction Deposit
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Deposit-only transactions
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
                onClick={() => {
                  handleClearFilters();
                  setStatus(statusOptions[0].value);
                }}
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
                  onChange={(val) => setStatus(val ?? '')}
                  style={{ minWidth: 180 }}
                />

                <Button
                  onClick={() => fetchData()}
                  leftSection={<IconRefresh size={18} />}
                  radius="md"
                  color="blue"
                >
                  Apply
                </Button>
              </Group>

              <Divider />

              <SimpleGrid
                cols={3}
                spacing="sm"
                breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
              >
                {summaryCards.map((card) => (
                  <Card
                    key={card.label}
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
                        {card.label}
                      </Text>
                      {card.icon}
                    </Group>
                    <Text
                      fw={700}
                      size="lg"
                    >
                      {card.value}
                    </Text>
                  </Card>
                ))}
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
                  </Group>
                  <Text
                    fw={700}
                    size="lg"
                  >
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
                  </Group>
                  <Text
                    fw={700}
                    size="lg"
                  >
                    {formatNumber(summary.DB)} / {formatNumber(summary.CR)}
                  </Text>
                </Card>
              </SimpleGrid>
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
                        <Divider my={4} />
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

export default MerchantTransactionDeposit;
