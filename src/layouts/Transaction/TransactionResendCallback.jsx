import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  Popover,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  IconBrandTelegram,
  IconCalendar,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  futuretrxid: '',
  insert: '',
  completedate: '',
  merchantcode: '',
  customercode: '',
  transactiontype: '',
  ccy: '',
  status: '',
  transactionid: '',
  notes3: '',
  merchantcallbackresponse: '',
};

const defaultDateRange = () => [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  },
];
const formatDateForApi = (value) =>
  value ? dayjs(value).format('YYYY-MM-DD') : '';

const TransactionResendCallback = () => {
  const [dateRange, setDateRange] = useState(defaultDateRange());
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
        key: 'insert',
        label: 'Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.insert}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date..."
            size="xs"
            value={columnFilters.insert}
            onChange={(e) =>
              handleFilterChange('insert', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'completedate',
        label: 'Complete Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.completedate}</Text>,
        filter: (
          <TextInput
            placeholder="Filter complete date..."
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
        key: 'customercode',
        label: 'Customer',
        minWidth: 150,
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
        key: 'transactiontype',
        label: 'Trans Type',
        minWidth: 110,
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
        key: 'ccy',
        label: 'CCY',
        minWidth: 80,
        render: (item) => <Text size="sm">{item.ccy || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter ccy..."
            size="xs"
            value={columnFilters.ccy}
            onChange={(e) => handleFilterChange('ccy', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'status',
        label: 'Status',
        minWidth: 140,
        render: (item) => (
          <Badge
            color="gray"
            variant="outline"
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
        key: 'transactionid',
        label: 'Trans ID',
        minWidth: 130,
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
        key: 'merchantcallbackresponse',
        label: 'Callback Status',
        minWidth: 200,
        render: (item) => (
          <Text size="sm">{item.merchantcallbackresponse || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter callback..."
            size="xs"
            value={columnFilters.merchantcallbackresponse}
            onChange={(e) =>
              handleFilterChange(
                'merchantcallbackresponse',
                e.currentTarget.value,
              )
            }
          />
        ),
      },
    ],
    [columnFilters, handleFilterChange],
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
        return Object.keys(defaultFilters).every((key) =>
          includesValue(item[key], columnFilters[key]),
        );
      }),
    [data, columnFilters],
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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const fetchData = async ({ silent = false } = {}) => {
    const startDate = dateRange?.[0]?.startDate;
    if (!startDate) {
      showNotification({
        title: 'Validation',
        message: 'Please select a date',
        Color: 'yellow',
      });
      return;
    }

    silent ? setRefreshing(true) : setLoading(true);

    try {
      const response = await transactionAPI.getTransactionCallbackEmpty(
        formatDateForApi(startDate),
      );

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records)
            ? response.data.records
            : [];
          const mapped = records.map((item) => ({
            ...item,
            merchantcallbackresponse:
              item.merchantcallbackresponse || item.callbackresponse,
          }));
          setData(mapped);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load data',
            Color: 'red',
          });
          setData([]);
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load data',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Callback empty fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load callback data',
        Color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleResend = async () => {
    if (!data.length) {
      showNotification({
        title: 'Info',
        message: 'No rows to resend',
        Color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = data.map((item) => ({ id: item.futuretrxid }));
      const response =
        await transactionAPI.resendTransactionCallbackEmpty(payload);
      if (response.success && response.data) {
        showNotification({
          title:
            (response.data.status || '').toLowerCase() === 'ok'
              ? 'Success'
              : 'Info',
          message: response.data.message || 'Resend callback completed',
          Color:
            (response.data.status || '').toLowerCase() === 'ok'
              ? 'green'
              : 'yellow',
        });
        fetchData({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to resend callback',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Resend callback error:', error);
      showNotification({
        title: 'Error',
        message: 'Resend callback failed',
        Color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDateRange(defaultDateRange());
    setData([]);
    handleClearFilters();
    setCurrentPage(1);
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
        />

        <Stack gap="lg">
          <Group
            justify="space-between"
            align="center"
          >
            <Box>
              <Group gap={8}>
                <IconBrandTelegram
                  size={22}
                  color="#1d4ed8"
                />
                <Text
                  size="xl"
                  fw={700}
                >
                  Transaction Resend Callback
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
                mt={4}
              >
                Transaction list without callback, ready to be resend.
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
                onClick={handleReset}
              >
                Reset
              </Button>
              {/* <Button
                variant="filled"
                color="teal"
                radius="md"
                size="sm"
                leftSection={<IconShieldCheck size={18} />}
                onClick={handleResend}
              >
                Resend Callback
              </Button> */}
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
              <Button
                leftSection={<IconSearch size={18} />}
                color="blue"
                radius="md"
                onClick={() => fetchData()}
              >
                Search
              </Button>
              {/* <Stack gap={4}>
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Total Rows
                </Text>
                <Text fw={700}>{data.length}</Text>
              </Stack> */}
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

            <Group gap="xs">
              {/* <Button
                variant="light"
                size="xs"
                onClick={handleResetAll}
                leftSection={<IconRefresh size={14} />}
              >
                Reset Columns/Sort
              </Button> */}
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                size="sm"
                radius="md"
                withEdges
              />
            </Group>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
};

export default TransactionResendCallback;
