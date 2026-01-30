import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Card,
  Divider,
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
import {
  IconCalendar,
  IconChecklist,
  IconFilter,
  IconRefresh,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { useTableControls } from '../../hooks/useTableControls';
import { reportResubmitAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const createDefaultRange = () => [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  },
];

const buildDateFilter = (range) => {
  const start = range?.[0]?.startDate;
  const end = range?.[0]?.endDate;
  return {
    from: start ? dayjs(start).format('YYYY-MM-DD') : '',
    to: end ? dayjs(end).format('YYYY-MM-DD') : '',
  };
};

const defaultColumnFilters = {
  resubmitTimestamp: '',
  smsTimestamp: '',
  transTimestamp: '',
  futureTrxId: '',
  merchantCode: '',
  customerCode: '',
  phonenumber: '',
  bankCode: '',
  user: '',
  amount: '',
  trxId: '',
  transactionType: '',
  isSuccessManually: '',
  memo: '',
  memo3: '',
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  if (parsed.isValid()) return parsed;
  const replaced = dayjs(String(value).replace(' ', 'T'));
  return replaced.isValid() ? replaced : null;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const ReportResubmitWithoutAutomation = () => {
  const initialRange = createDefaultRange();
  const initialDateFilter = buildDateFilter(initialRange);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerRange, setPickerRange] = useState(initialRange);
  const [activeRange, setActiveRange] = useState(initialRange);
  const [filterUsed, setFilterUsed] = useState(initialDateFilter);
  const [columnFilters, setColumnFilters] = useState(defaultColumnFilters);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleColumnFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setColumnFilters(defaultColumnFilters);
    const freshRange = createDefaultRange();
    setPickerRange(freshRange);
    setActiveRange(freshRange);
    setFilterUsed(buildDateFilter(freshRange));
  }, []);

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const columns = useMemo(
    () => [
      {
        key: 'resubmitTimestamp',
        label: 'Resubmit Time',
        minWidth: 160,
        render: (item) => {
          const parsed = parseDate(item.resubmitTimestamp);
          const display = parsed
            ? parsed.format('DD MMM YYYY HH:mm')
            : item.resubmitTimestamp || '-';
          return <Text size="sm">{display}</Text>;
        },
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.resubmitTimestamp}
            onChange={(e) =>
              handleColumnFilterChange(
                'resubmitTimestamp',
                e.currentTarget.value
              )
            }
          />
        ),
      },
      {
        key: 'smsTimestamp',
        label: 'SMS Timestamp',
        minWidth: 160,
        render: (item) => {
          const parsed = parseDate(item.smsTimestamp);
          const display = parsed
            ? parsed.format('DD MMM YYYY HH:mm')
            : item.smsTimestamp || '-';
          return <Text size="sm">{display}</Text>;
        },
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.smsTimestamp}
            onChange={(e) =>
              handleColumnFilterChange('smsTimestamp', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'transTimestamp',
        label: 'Transaction Timestamp',
        minWidth: 170,
        render: (item) => {
          const parsed = parseDate(item.transTimestamp);
          const display = parsed
            ? parsed.format('DD MMM YYYY HH:mm')
            : item.transTimestamp || '-';
          return <Text size="sm">{display}</Text>;
        },
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.transTimestamp}
            onChange={(e) =>
              handleColumnFilterChange('transTimestamp', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'futureTrxId',
        label: 'Future Trx Id',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.futureTrxId || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.futureTrxId}
            onChange={(e) =>
              handleColumnFilterChange('futureTrxId', e.currentTarget.value)
            }
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
            placeholder="Filter..."
            size="xs"
            value={columnFilters.merchantCode}
            onChange={(e) =>
              handleColumnFilterChange('merchantCode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'customerCode',
        label: 'Customer',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.customerCode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.customerCode}
            onChange={(e) =>
              handleColumnFilterChange('customerCode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'phonenumber',
        label: 'Customer Phone',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.phonenumber || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.phonenumber}
            onChange={(e) =>
              handleColumnFilterChange('phonenumber', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'bankCode',
        label: 'Bank',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.bankCode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.bankCode}
            onChange={(e) =>
              handleColumnFilterChange('bankCode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'user',
        label: 'User',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.user || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.user}
            onChange={(e) =>
              handleColumnFilterChange('user', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        minWidth: 130,
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
            placeholder="Filter..."
            size="xs"
            value={columnFilters.amount}
            onChange={(e) =>
              handleColumnFilterChange('amount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'trxId',
        label: 'Trx ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.trxId || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.trxId}
            onChange={(e) =>
              handleColumnFilterChange('trxId', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'transactionType',
        label: 'Transaction Type',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.transactionType || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.transactionType}
            onChange={(e) =>
              handleColumnFilterChange('transactionType', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'isSuccessManually',
        label: 'Match Manually',
        minWidth: 140,
        render: (item) => (
          <Text size="sm">{item.isSuccessManually || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.isSuccessManually}
            onChange={(e) =>
              handleColumnFilterChange(
                'isSuccessManually',
                e.currentTarget.value
              )
            }
          />
        ),
      },
      {
        key: 'memo',
        label: 'Memo',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
            title={item.memo}
          >
            {item.memo || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.memo}
            onChange={(e) =>
              handleColumnFilterChange('memo', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'memo3',
        label: 'Memo3',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
            title={item.memo3}
          >
            {item.memo3 || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.memo3}
            onChange={(e) =>
              handleColumnFilterChange('memo3', e.currentTarget.value)
            }
          />
        ),
      },
    ],
    [columnFilters, handleColumnFilterChange]
  );

  const {
    visibleColumns,
    sortConfig,
    handleHideColumn,
    handleSort,
    handleResetAll,
  } = useTableControls(columns, {
    onResetFilters: handleResetFilters,
  });

  const filteredData = useMemo(() => {
    const start = activeRange
      ? dayjs(activeRange[0].startDate).startOf('day')
      : null;
    const end = activeRange ? dayjs(activeRange[0].endDate).endOf('day') : null;

    return data.filter((item) => {
      if (
        !includesValue(item.resubmitTimestamp, columnFilters.resubmitTimestamp)
      )
        return false;
      if (!includesValue(item.smsTimestamp, columnFilters.smsTimestamp))
        return false;
      if (!includesValue(item.transTimestamp, columnFilters.transTimestamp))
        return false;
      if (!includesValue(item.futureTrxId, columnFilters.futureTrxId))
        return false;
      if (!includesValue(item.merchantCode, columnFilters.merchantCode))
        return false;
      if (!includesValue(item.customerCode, columnFilters.customerCode))
        return false;
      if (!includesValue(item.phonenumber, columnFilters.phonenumber))
        return false;
      if (!includesValue(item.bankCode, columnFilters.bankCode)) return false;
      if (!includesValue(item.user, columnFilters.user)) return false;
      if (!includesValue(String(item.amount), columnFilters.amount))
        return false;
      if (!includesValue(item.trxId, columnFilters.trxId)) return false;
      if (!includesValue(item.transactionType, columnFilters.transactionType))
        return false;
      if (
        !includesValue(item.isSuccessManually, columnFilters.isSuccessManually)
      )
        return false;
      if (!includesValue(item.memo, columnFilters.memo)) return false;
      if (!includesValue(item.memo3, columnFilters.memo3)) return false;

      if (start && end) {
        const parsed = parseDate(item.smsTimestamp);
        if (!parsed) return false;
        const value = parsed.valueOf();
        if (value < start.valueOf() || value > end.valueOf()) return false;
      }

      return true;
    });
  }, [activeRange, columnFilters, data]);

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

  const fetchList = async ({ silent = false, payloadFilter } = {}) => {
    const targetFilter = payloadFilter || filterUsed;
    if (!targetFilter.from || !targetFilter.to) {
      showNotification({
        title: 'Validation',
        message: 'Please select a date range',
        color: 'yellow',
      });
      return;
    }

    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await reportResubmitAPI.getWithoutAutomationList(
        targetFilter
      );
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(payload.records) ? payload.records : [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load report',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load report',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Report resubmit list fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load report',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApplyFilter = () => {
    const nextRange = activeRange || pickerRange;
    const start = nextRange?.[0]?.startDate;
    const end = nextRange?.[0]?.endDate;
    if (!start || !end) {
      showNotification({
        title: 'Validation',
        message: 'Please select a date range',
        color: 'yellow',
      });
      return;
    }
    const nextFilter = buildDateFilter(nextRange);
    setFilterUsed(nextFilter);
    fetchList({ payloadFilter: nextFilter });
  };

  const applyDateRange = () => {
    setActiveRange([...pickerRange]);
  };

  const clearDateRange = () => {
    const freshRange = createDefaultRange();
    setActiveRange(freshRange);
    setPickerRange(freshRange);
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
            wrap="wrap"
          >
            <Box>
              <Text
                size="xl"
                fw={700}
              >
                Report Resubmit Without Automation
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Transactions resubmitted without automation
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
                onClick={() => {
                  handleResetAll();
                  handleResetFilters();
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
                      {activeRange
                        ? `${format(
                            activeRange[0].startDate,
                            'dd MMM yyyy'
                          )} - ${format(activeRange[0].endDate, 'dd MMM yyyy')}`
                        : 'Select date range'}
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown p="sm">
                    <DateRangePicker
                      onChange={(ranges) => {
                        const selection = ranges.selection;
                        setPickerRange([selection]);
                      }}
                      moveRangeOnFirstSelection={false}
                      ranges={pickerRange}
                      maxDate={new Date()}
                    />
                    <Group
                      gap="xs"
                      mt="xs"
                      justify="flex-end"
                    >
                      <Button
                        variant="light"
                        color="gray"
                        size="xs"
                        onClick={clearDateRange}
                      >
                        Clear
                      </Button>
                      <Button
                        variant="filled"
                        color="blue"
                        size="xs"
                        onClick={() => {
                          applyDateRange();
                          setDatePickerOpened(false);
                        }}
                      >
                        Apply
                      </Button>
                    </Group>
                  </Popover.Dropdown>
                </Popover>

                <Button
                  onClick={handleApplyFilter}
                  leftSection={<IconChecklist size={18} />}
                  radius="md"
                  color="blue"
                >
                  Apply
                </Button>
              </Group>

              <Divider />

              <Text
                size="sm"
                c="dimmed"
              >
                Rows: {data.length}
              </Text>
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
                      <Table.Tr
                        key={
                          item.trxId ||
                          item.smsTimestamp ||
                          item.resubmitTimestamp
                        }
                      >
                        {visibleColumns.map((col) => (
                          <Table.Td
                            key={`${col.key}-${
                              item.trxId ||
                              item.smsTimestamp ||
                              item.resubmitTimestamp
                            }`}
                          >
                            {col.render
                              ? col.render(item)
                              : item[col.key] || '-'}
                          </Table.Td>
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
                    <Table.Td colSpan={visibleColumns.length}>
                      <Group
                        justify="space-between"
                        align="center"
                      >
                        <Text
                          size="sm"
                          c="dimmed"
                        >
                          Total rows: {filteredData.length}
                          {filteredData.length !== data.length
                            ? ` (filtered from ${data.length})`
                            : ''}
                        </Text>
                        <Text
                          size="sm"
                          c="dimmed"
                        >
                          Showing{' '}
                          {paginatedData.length > 0 ? startIndex + 1 : 0}-
                          {Math.min(endIndex, filteredData.length)} of{' '}
                          {filteredData.length}
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

export default ReportResubmitWithoutAutomation;
