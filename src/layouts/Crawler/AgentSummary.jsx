import { useCallback, useMemo, useState } from 'react';
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
    startDate: dayjs().subtract(1, 'day').toDate(),
    endDate: dayjs().subtract(1, 'day').toDate(),
    key: 'selection',
  },
];

const defaultFilters = {
  user: '',
  bank: '',
  dailyStarting: '',
  monthlyStarting: '',
  dailyCurrent: '',
  monthlyCurrent: '',
  credit: '',
  dailyCashout: '',
  dailyCashoutCount: '',
  dailyCashin: '',
  dailyCashinCount: '',
  dailyB2bReceive: '',
  dailyB2bReceiveCount: '',
  dailyB2bSend: '',
  dailyB2bSendCount: '',
  dailyAM: '',
  monthlyAM: '',
  creditTopup: '',
  creditAdjustmentOut: '',
  creditAdjustment: '',
  dailyCashoutComm: '',
  dailyCashinComm: '',
  totalComm: '',
  totalVariance: '',
};

const numericFields = [
  'dailyStarting',
  'monthlyStarting',
  'dailyCurrent',
  'monthlyCurrent',
  'credit',
  'dailyCashout',
  'dailyCashoutCount',
  'dailyCashin',
  'dailyCashinCount',
  'dailyB2bReceive',
  'dailyB2bReceiveCount',
  'dailyB2bSend',
  'dailyB2bSendCount',
  'dailyAM',
  'monthlyAM',
  'creditTopup',
  'creditAdjustmentOut',
  'creditAdjustment',
  'dailyCashoutComm',
  'dailyCashinComm',
  'totalComm',
  'totalVariance',
];

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const AgentSummary = () => {
  const [dateRange, setDateRange] = useState(buildDefaultRange());
  const [datePickerOpened, setDatePickerOpened] = useState(false);
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
        key: 'user',
        label: 'Agent',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.user || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.user}
            onChange={(e) => handleFilterChange('user', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'bank',
        label: 'Wallet Type',
        minWidth: 160,
        render: (item) => (
          <Badge
            color="blue"
            variant="light"
          >
            {item.bank || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter wallet..."
            size="xs"
            value={columnFilters.bank}
            onChange={(e) => handleFilterChange('bank', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'dailyStarting',
        label: 'Starting Daily Balance',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyStarting)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter daily start..."
            size="xs"
            value={columnFilters.dailyStarting}
            onChange={(e) =>
              handleFilterChange('dailyStarting', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'monthlyStarting',
        label: 'Starting Monthly Balance',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.monthlyStarting)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter monthly start..."
            size="xs"
            value={columnFilters.monthlyStarting}
            onChange={(e) =>
              handleFilterChange('monthlyStarting', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyCurrent',
        label: 'Daily Balance',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyCurrent)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter daily balance..."
            size="xs"
            value={columnFilters.dailyCurrent}
            onChange={(e) =>
              handleFilterChange('dailyCurrent', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'monthlyCurrent',
        label: 'Monthly Balance',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.monthlyCurrent)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter monthly balance..."
            size="xs"
            value={columnFilters.monthlyCurrent}
            onChange={(e) =>
              handleFilterChange('monthlyCurrent', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'credit',
        label: 'System Credit Balance',
        minWidth: 190,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.credit)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter credit..."
            size="xs"
            value={columnFilters.credit}
            onChange={(e) =>
              handleFilterChange('credit', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyCashout',
        label: 'Daily Deposit Amount',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyCashout)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter deposit amt..."
            size="xs"
            value={columnFilters.dailyCashout}
            onChange={(e) =>
              handleFilterChange('dailyCashout', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyCashoutCount',
        label: 'DP Count',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyCashoutCount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter DP count..."
            size="xs"
            value={columnFilters.dailyCashoutCount}
            onChange={(e) =>
              handleFilterChange('dailyCashoutCount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyCashin',
        label: 'Daily Withdrawal Amount',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyCashin)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter withdrawal amt..."
            size="xs"
            value={columnFilters.dailyCashin}
            onChange={(e) =>
              handleFilterChange('dailyCashin', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyCashinCount',
        label: 'WD Count',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyCashinCount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter WD count..."
            size="xs"
            value={columnFilters.dailyCashinCount}
            onChange={(e) =>
              handleFilterChange('dailyCashinCount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyB2bReceive',
        label: 'B2B Received Amount',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyB2bReceive)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B recv amt..."
            size="xs"
            value={columnFilters.dailyB2bReceive}
            onChange={(e) =>
              handleFilterChange('dailyB2bReceive', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyB2bReceiveCount',
        label: 'B2B Received Count',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyB2bReceiveCount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B recv count..."
            size="xs"
            value={columnFilters.dailyB2bReceiveCount}
            onChange={(e) =>
              handleFilterChange('dailyB2bReceiveCount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyB2bSend',
        label: 'B2B Send Amount',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyB2bSend)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B send amt..."
            size="xs"
            value={columnFilters.dailyB2bSend}
            onChange={(e) =>
              handleFilterChange('dailyB2bSend', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyB2bSendCount',
        label: 'B2B Send Count',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyB2bSendCount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B send count..."
            size="xs"
            value={columnFilters.dailyB2bSendCount}
            onChange={(e) =>
              handleFilterChange('dailyB2bSendCount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyAM',
        label: 'APP Miscellaneous Daily',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyAM)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter daily AM..."
            size="xs"
            value={columnFilters.dailyAM}
            onChange={(e) =>
              handleFilterChange('dailyAM', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'monthlyAM',
        label: 'APP Miscellaneous Monthly',
        minWidth: 220,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.monthlyAM)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter monthly AM..."
            size="xs"
            value={columnFilters.monthlyAM}
            onChange={(e) =>
              handleFilterChange('monthlyAM', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'creditTopup',
        label: 'Topup',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.creditTopup)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter topup..."
            size="xs"
            value={columnFilters.creditTopup}
            onChange={(e) =>
              handleFilterChange('creditTopup', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'creditAdjustmentOut',
        label: 'Settlement',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.creditAdjustmentOut)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter settlement..."
            size="xs"
            value={columnFilters.creditAdjustmentOut}
            onChange={(e) =>
              handleFilterChange('creditAdjustmentOut', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'creditAdjustment',
        label: 'Credit Adjustment',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.creditAdjustment)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter credit adj..."
            size="xs"
            value={columnFilters.creditAdjustment}
            onChange={(e) =>
              handleFilterChange('creditAdjustment', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyCashoutComm',
        label: 'DP Comm.',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyCashoutComm)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter DP comm..."
            size="xs"
            value={columnFilters.dailyCashoutComm}
            onChange={(e) =>
              handleFilterChange('dailyCashoutComm', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dailyCashinComm',
        label: 'WD Comm.',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.dailyCashinComm)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter WD comm..."
            size="xs"
            value={columnFilters.dailyCashinComm}
            onChange={(e) =>
              handleFilterChange('dailyCashinComm', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'totalComm',
        label: 'Total Comm.',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.totalComm)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter total comm..."
            size="xs"
            value={columnFilters.totalComm}
            onChange={(e) =>
              handleFilterChange('totalComm', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'totalVariance',
        label: 'Variance Amount',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.totalVariance)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter variance..."
            size="xs"
            value={columnFilters.totalVariance}
            onChange={(e) =>
              handleFilterChange('totalVariance', e.currentTarget.value)
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
          includesValue(item.user, columnFilters.user) &&
          includesValue(item.bank, columnFilters.bank) &&
          includesValue(item.dailyStarting, columnFilters.dailyStarting) &&
          includesValue(item.monthlyStarting, columnFilters.monthlyStarting) &&
          includesValue(item.dailyCurrent, columnFilters.dailyCurrent) &&
          includesValue(item.monthlyCurrent, columnFilters.monthlyCurrent) &&
          includesValue(item.credit, columnFilters.credit) &&
          includesValue(item.dailyCashout, columnFilters.dailyCashout) &&
          includesValue(
            item.dailyCashoutCount,
            columnFilters.dailyCashoutCount
          ) &&
          includesValue(item.dailyCashin, columnFilters.dailyCashin) &&
          includesValue(
            item.dailyCashinCount,
            columnFilters.dailyCashinCount
          ) &&
          includesValue(item.dailyB2bReceive, columnFilters.dailyB2bReceive) &&
          includesValue(
            item.dailyB2bReceiveCount,
            columnFilters.dailyB2bReceiveCount
          ) &&
          includesValue(item.dailyB2bSend, columnFilters.dailyB2bSend) &&
          includesValue(
            item.dailyB2bSendCount,
            columnFilters.dailyB2bSendCount
          ) &&
          includesValue(item.dailyAM, columnFilters.dailyAM) &&
          includesValue(item.monthlyAM, columnFilters.monthlyAM) &&
          includesValue(item.creditTopup, columnFilters.creditTopup) &&
          includesValue(
            item.creditAdjustmentOut,
            columnFilters.creditAdjustmentOut
          ) &&
          includesValue(
            item.creditAdjustment,
            columnFilters.creditAdjustment
          ) &&
          includesValue(
            item.dailyCashoutComm,
            columnFilters.dailyCashoutComm
          ) &&
          includesValue(item.dailyCashinComm, columnFilters.dailyCashinComm) &&
          includesValue(item.totalComm, columnFilters.totalComm) &&
          includesValue(item.totalVariance, columnFilters.totalVariance)
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
        const response = await crawlerAPI.getAgentSummary(payloadDate);

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
              message: payload.message || 'Failed to load agent summary',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load agent summary',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Agent summary fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load agent summary',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange]
  );

  

  const handleResetAll = () => {
    handleClearFilters();
    setDateRange(buildDefaultRange());
    setCurrentPage(1);
    resetTableControls();
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
                Agent Summary
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Daily agent balance and transaction summary
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
                      {format(dateRange[0].startDate, 'dd MMM yyyy')}
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
                      maxDate={dayjs().subtract(1, 'day').toDate()}
                    />
                  </Popover.Dropdown>
                </Popover>

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
                        key={`${item.user || 'row'}-${item.bank || ''}-${idx}`}
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

export default AgentSummary;
