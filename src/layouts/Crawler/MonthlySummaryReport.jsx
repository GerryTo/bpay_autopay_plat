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
import { IconCalendar, IconFilter, IconRefresh, IconSearch } from '@tabler/icons-react';
import { crawlerAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const buildDefaultRange = () => {
  const now = dayjs();
  const prevMonth = now.subtract(1, 'month').startOf('month').toDate();
  return [
    {
      startDate: prevMonth,
      endDate: prevMonth,
      key: 'selection',
    },
  ];
};

const defaultFilters = {
  agent: '',
  bankCode: '',
  accountNo: '',
  startingBalance: '',
  currentBalance: '',
  cashOut: '',
  cashOutCommission: '',
  cashOutTransaction: '',
  cashIn: '',
  cashInCommission: '',
  cashInTransaction: '',
  b2bReceive: '',
  b2bReceiveTransaction: '',
  b2bSend: '',
  b2bSendTransaction: '',
  agentCashout: '',
  agentCashoutCommission: '',
  agentCashoutTransaction: '',
  commission: '',
};

const numericFields = [
  'startingBalance',
  'currentBalance',
  'cashOut',
  'cashOutCommission',
  'cashOutTransaction',
  'cashIn',
  'cashInCommission',
  'cashInTransaction',
  'b2bReceive',
  'b2bReceiveTransaction',
  'b2bSend',
  'b2bSendTransaction',
  'agentCashout',
  'agentCashoutCommission',
  'agentCashoutTransaction',
  'commission',
];

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const MonthlySummaryReport = () => {
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
        key: 'agent',
        label: 'Agent',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.agent || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.agent}
            onChange={(e) => handleFilterChange('agent', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'bankCode',
        label: 'Bank',
        minWidth: 120,
        render: (item) => (
          <Badge
            color="blue"
            variant="light"
          >
            {item.bankCode || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bankCode}
            onChange={(e) => handleFilterChange('bankCode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'accountNo',
        label: 'Account No',
        minWidth: 160,
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
        key: 'startingBalance',
        label: 'Starting Balance',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.startingBalance)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter starting..."
            size="xs"
            value={columnFilters.startingBalance}
            onChange={(e) => handleFilterChange('startingBalance', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'currentBalance',
        label: 'Current Balance',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.currentBalance)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter current..."
            size="xs"
            value={columnFilters.currentBalance}
            onChange={(e) => handleFilterChange('currentBalance', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'cashOut',
        label: 'Cash Out',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.cashOut)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter cash out..."
            size="xs"
            value={columnFilters.cashOut}
            onChange={(e) => handleFilterChange('cashOut', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'cashOutCommission',
        label: 'Cash Out Comm.',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.cashOutCommission)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter CO comm..."
            size="xs"
            value={columnFilters.cashOutCommission}
            onChange={(e) => handleFilterChange('cashOutCommission', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'cashOutTransaction',
        label: 'Cash Out Transaction',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.cashOutTransaction)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter CO trx..."
            size="xs"
            value={columnFilters.cashOutTransaction}
            onChange={(e) => handleFilterChange('cashOutTransaction', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'cashIn',
        label: 'Cash In',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.cashIn)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter cash in..."
            size="xs"
            value={columnFilters.cashIn}
            onChange={(e) => handleFilterChange('cashIn', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'cashInCommission',
        label: 'Cash In Comm.',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.cashInCommission)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter CI comm..."
            size="xs"
            value={columnFilters.cashInCommission}
            onChange={(e) => handleFilterChange('cashInCommission', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'cashInTransaction',
        label: 'Cash In Transaction',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.cashInTransaction)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter CI trx..."
            size="xs"
            value={columnFilters.cashInTransaction}
            onChange={(e) => handleFilterChange('cashInTransaction', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'b2bReceive',
        label: 'B2B Receive',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.b2bReceive)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B recv..."
            size="xs"
            value={columnFilters.b2bReceive}
            onChange={(e) => handleFilterChange('b2bReceive', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'b2bReceiveTransaction',
        label: 'B2B Receive Transaction',
        minWidth: 210,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.b2bReceiveTransaction)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B recv trx..."
            size="xs"
            value={columnFilters.b2bReceiveTransaction}
            onChange={(e) => handleFilterChange('b2bReceiveTransaction', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'b2bSend',
        label: 'B2B Send',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.b2bSend)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B send..."
            size="xs"
            value={columnFilters.b2bSend}
            onChange={(e) => handleFilterChange('b2bSend', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'b2bSendTransaction',
        label: 'B2B Send Transaction',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.b2bSendTransaction)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter B2B send trx..."
            size="xs"
            value={columnFilters.b2bSendTransaction}
            onChange={(e) => handleFilterChange('b2bSendTransaction', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'agentCashout',
        label: 'Agent Cash Out',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.agentCashout)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter agent cash out..."
            size="xs"
            value={columnFilters.agentCashout}
            onChange={(e) => handleFilterChange('agentCashout', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'agentCashoutCommission',
        label: 'Agent Cash Out Comm.',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.agentCashoutCommission)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter agent CO comm..."
            size="xs"
            value={columnFilters.agentCashoutCommission}
            onChange={(e) => handleFilterChange('agentCashoutCommission', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'agentCashoutTransaction',
        label: 'Agent Cash Out Transaction',
        minWidth: 230,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.agentCashoutTransaction)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter agent CO trx..."
            size="xs"
            value={columnFilters.agentCashoutTransaction}
            onChange={(e) => handleFilterChange('agentCashoutTransaction', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'commission',
        label: 'Commission',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.commission)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter commission..."
            size="xs"
            value={columnFilters.commission}
            onChange={(e) => handleFilterChange('commission', e.currentTarget.value)}
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
          includesValue(item.agent, columnFilters.agent) &&
          includesValue(item.bankCode, columnFilters.bankCode) &&
          includesValue(item.accountNo, columnFilters.accountNo) &&
          includesValue(item.startingBalance, columnFilters.startingBalance) &&
          includesValue(item.currentBalance, columnFilters.currentBalance) &&
          includesValue(item.cashOut, columnFilters.cashOut) &&
          includesValue(item.cashOutCommission, columnFilters.cashOutCommission) &&
          includesValue(item.cashOutTransaction, columnFilters.cashOutTransaction) &&
          includesValue(item.cashIn, columnFilters.cashIn) &&
          includesValue(item.cashInCommission, columnFilters.cashInCommission) &&
          includesValue(item.cashInTransaction, columnFilters.cashInTransaction) &&
          includesValue(item.b2bReceive, columnFilters.b2bReceive) &&
          includesValue(item.b2bReceiveTransaction, columnFilters.b2bReceiveTransaction) &&
          includesValue(item.b2bSend, columnFilters.b2bSend) &&
          includesValue(item.b2bSendTransaction, columnFilters.b2bSendTransaction) &&
          includesValue(item.agentCashout, columnFilters.agentCashout) &&
          includesValue(item.agentCashoutCommission, columnFilters.agentCashoutCommission) &&
          includesValue(item.agentCashoutTransaction, columnFilters.agentCashoutTransaction) &&
          includesValue(item.commission, columnFilters.commission)
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
      acc[field] = filteredData.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
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
          message: 'Please choose a month',
          color: 'yellow',
        });
        return;
      }

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const payloadDate = dayjs(start).startOf('month').format('YYYY-MM-DD');
        const response = await crawlerAPI.getMonthlySummary(payloadDate);

        if (response.success && response.data) {
          const payload = response.data;
          if ((payload.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payload.records) ? payload.records : [];
            setData(records);
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load monthly summary',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load monthly summary',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Monthly summary fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load monthly summary',
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
                Monthly Summary Report
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Monthly aggregates per agent
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
                      {format(dateRange[0].startDate, 'MM yyyy')}
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
                      maxDate={dayjs().subtract(1, 'month').endOf('month').toDate()}
                      minDate={new Date(2000, 0, 1)}
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
                      <Table.Tr key={`${item.agent || 'row'}-${item.bankCode || ''}-${idx}`}>
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

export default MonthlySummaryReport;
