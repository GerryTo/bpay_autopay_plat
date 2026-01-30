import { useCallback, useMemo, useState } from 'react';
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
import { IconCalendar, IconFilter, IconRefresh, IconSearch } from '@tabler/icons-react';
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
  date: '',
  dateTransacton: '',
  futureTrxId: '',
  transactionId: '',
  merchantCode: '',
  user: '',
  bank: '',
  srcAccountNo: '',
  srcAccountName: '',
  dstAccountNo: '',
  dstAccountName: '',
  isSend: '',
  sendDate: '',
  isReceived: '',
  isDone: '',
  note: '',
};

const AppiumWithdrawQueue = () => {
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
        key: 'date',
        label: 'Date',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.date || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date..."
            size="xs"
            value={columnFilters.date}
            onChange={(e) => handleFilterChange('date', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'dateTransacton',
        label: 'Date Transaction',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.dateTransacton || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date trx..."
            size="xs"
            value={columnFilters.dateTransacton}
            onChange={(e) => handleFilterChange('dateTransacton', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'futureTrxId',
        label: 'Future Trx ID',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.futureTrxId || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter future trx..."
            size="xs"
            value={columnFilters.futureTrxId}
            onChange={(e) => handleFilterChange('futureTrxId', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'transactionId',
        label: 'Transaction ID',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.transactionId || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter transaction..."
            size="xs"
            value={columnFilters.transactionId}
            onChange={(e) => handleFilterChange('transactionId', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'merchantCode',
        label: 'Merchant',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.merchantCode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter merchant..."
            size="xs"
            value={columnFilters.merchantCode}
            onChange={(e) => handleFilterChange('merchantCode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'user',
        label: 'User',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.user || '-'}</Text>,
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
        key: 'bank',
        label: 'Bank',
        minWidth: 100,
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
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bank}
            onChange={(e) => handleFilterChange('bank', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'srcAccountNo',
        label: 'Src Acc No',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.srcAccountNo || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter src acc no..."
            size="xs"
            value={columnFilters.srcAccountNo}
            onChange={(e) => handleFilterChange('srcAccountNo', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'srcAccountName',
        label: 'Src Acc Name',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.srcAccountName || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter src acc name..."
            size="xs"
            value={columnFilters.srcAccountName}
            onChange={(e) => handleFilterChange('srcAccountName', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'dstAccountNo',
        label: 'Dst Acc No',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.dstAccountNo || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dst acc no..."
            size="xs"
            value={columnFilters.dstAccountNo}
            onChange={(e) => handleFilterChange('dstAccountNo', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'dstAccountName',
        label: 'Dst Acc Name',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.dstAccountName || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dst acc name..."
            size="xs"
            value={columnFilters.dstAccountName}
            onChange={(e) => handleFilterChange('dstAccountName', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'isSend',
        label: 'Sent Mqtt',
        minWidth: 100,
        render: (item) => <Text size="sm">{item.isSend || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter sent..."
            size="xs"
            value={columnFilters.isSend}
            onChange={(e) => handleFilterChange('isSend', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'sendDate',
        label: 'Sent Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.sendDate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter sent date..."
            size="xs"
            value={columnFilters.sendDate}
            onChange={(e) => handleFilterChange('sendDate', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'isReceived',
        label: 'Received Mqtt',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.isReceived || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter received..."
            size="xs"
            value={columnFilters.isReceived}
            onChange={(e) => handleFilterChange('isReceived', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'isDone',
        label: 'Done Mqtt',
        minWidth: 100,
        render: (item) => <Text size="sm">{item.isDone || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter done..."
            size="xs"
            value={columnFilters.isDone}
            onChange={(e) => handleFilterChange('isDone', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'note',
        label: 'Note',
        minWidth: 240,
        render: (item) => <Text size="sm">{item.note || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter note..."
            size="xs"
            value={columnFilters.note}
            onChange={(e) => handleFilterChange('note', e.currentTarget.value)}
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
          includesValue(item.date, columnFilters.date) &&
          includesValue(item.dateTransacton, columnFilters.dateTransacton) &&
          includesValue(item.futureTrxId, columnFilters.futureTrxId) &&
          includesValue(item.transactionId, columnFilters.transactionId) &&
          includesValue(item.merchantCode, columnFilters.merchantCode) &&
          includesValue(item.user, columnFilters.user) &&
          includesValue(item.bank, columnFilters.bank) &&
          includesValue(item.srcAccountNo, columnFilters.srcAccountNo) &&
          includesValue(item.srcAccountName, columnFilters.srcAccountName) &&
          includesValue(item.dstAccountNo, columnFilters.dstAccountNo) &&
          includesValue(item.dstAccountName, columnFilters.dstAccountName) &&
          includesValue(item.isSend, columnFilters.isSend) &&
          includesValue(item.sendDate, columnFilters.sendDate) &&
          includesValue(item.isReceived, columnFilters.isReceived) &&
          includesValue(item.isDone, columnFilters.isDone) &&
          includesValue(item.note, columnFilters.note)
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

  

  

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      const start = dateRange?.[0]?.startDate;
      const end = dateRange?.[0]?.endDate;
      if (!start || !end) {
        showNotification({
          title: 'Validation',
          message: 'Please choose a date range',
          color: 'yellow',
        });
        return;
      }

      if (dayjs(end).isBefore(dayjs(start), 'day')) {
        showNotification({
          title: 'Validation',
          message: 'End date cannot be before start date',
          color: 'yellow',
        });
        return;
      }

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const payloadDateFrom = dayjs(start).format('YYYY-MM-DD');
        const payloadDateTo = dayjs(end).format('YYYY-MM-DD');
        const response = await crawlerAPI.getWithdrawQueue({
          datefrom: payloadDateFrom,
          dateto: payloadDateTo,
        });

        if (response.success && response.data) {
          const payload = response.data;
          if ((payload.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payload.records) ? payload.records : [];
            setData(records);
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load withdraw queue',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load withdraw queue',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Withdraw queue fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load withdraw queue',
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
                Withdraw Queue
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Appium withdraw queue monitoring
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
                      maxDate={dayjs().add(1, 'day').toDate()}
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
                      <Table.Tr key={`${item.futureTrxId || item.transactionId || 'row'}-${startIndex + idx}`}>
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
                    {visibleColumns.map((col) => (
                      <Table.Td key={`${col.key}-footer`} />
                    ))}
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
                Total rows: {paginatedData.length}
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

export default AppiumWithdrawQueue;
