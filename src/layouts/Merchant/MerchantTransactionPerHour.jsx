import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  LoadingOverlay,
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
  IconFilter,
  IconRefresh,
  IconReportMoney,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { merchantAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const defaultFilters = {
  d_insert: '',
  v_merchantcode: '',
  total_transaction_bkash_wd: '',
  total_amount_bkash_wd: '',
  total_transaction_nagad_wd: '',
  total_amount_nagad_wd: '',
  total_transaction_rocket_wd: '',
  total_amount_rocket_wd: '',
  total_transaction_upay_wd: '',
  total_amount_upay_wd: '',
};

const formatNumber = (value, fraction = 2) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: fraction, minimumFractionDigits: fraction });
};

const MerchantTransactionPerHour = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [merchantList, setMerchantList] = useState([]);
  const [merchantCode, setMerchantCode] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);

  const handleFilterChange = useCallback((key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
  }, []);

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const fetchMerchants = useCallback(async () => {
    try {
      const response = await merchantAPI.getMerchantWithAccount();
      if (response.success && response.data) {
        const records = Array.isArray(response.data.records) ? response.data.records : [];
        const options = records.map((item) => ({
          value: item.merchantcode,
          label: `${item.merchantcode} - ${item.merchantname || ''}`.trim(),
        }));
        setMerchantList(options);
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load merchants',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Merchant list load error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load merchant list',
        Color: 'red',
      });
    }
  }, []);

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      const start = dateRange?.[0]?.startDate;
      if (!start) {
        showNotification({
          title: 'Validation',
          message: 'Please select a date first',
          Color: 'yellow',
        });
        return;
      }
      if (!merchantCode) {
        showNotification({
          title: 'Validation',
          message: 'Please choose a merchant',
          Color: 'yellow',
        });
        return;
      }

      const datefrom = dayjs(start).format('YYYY-MM-DD');
      silent ? setRefreshing(true) : setLoading(true);

      try {
        const response = await merchantAPI.getMerchantTransactionPerHour({
          datefrom,
          merchantcode: merchantCode,
        });

        if (response.success && response.data) {
          const payload = response.data;
          const statusOk = (payload.status || '').toLowerCase?.() === 'ok' || payload.status === 'OK';
          if (statusOk) {
            const records = Array.isArray(payload.records) ? payload.records : [];
            const normalized = records.map((item) => ({
              ...item,
              d_insert: item.d_insert || item.date || '',
              v_merchantcode: item.v_merchantcode || item.merchantcode || '',
              total_transaction_bkash_wd: Number(item.total_transaction_bkash_wd || 0),
              total_amount_bkash_wd: Number(item.total_amount_bkash_wd || 0),
              total_transaction_nagad_wd: Number(item.total_transaction_nagad_wd || 0),
              total_amount_nagad_wd: Number(item.total_amount_nagad_wd || 0),
              total_transaction_rocket_wd: Number(item.total_transaction_rocket_wd || 0),
              total_amount_rocket_wd: Number(item.total_amount_rocket_wd || 0),
              total_transaction_upay_wd: Number(item.total_transaction_upay_wd || 0),
              total_amount_upay_wd: Number(item.total_amount_upay_wd || 0),
            }));
            setData(normalized);
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load transactions',
              Color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load transactions',
            Color: 'red',
          });
        }
      } catch (error) {
        console.error('Merchant transaction per hour fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load transactions',
          Color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, merchantCode]
  );

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const columns = useMemo(
    () => [
      {
        key: 'd_insert',
        label: 'Date',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.d_insert || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date..."
            size="xs"
            value={columnFilters.d_insert}
            onChange={(e) => handleFilterChange('d_insert', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'v_merchantcode',
        label: 'Merchant Code',
        minWidth: 140,
        render: (item) => (
          <Badge
            color="blue"
            variant="light"
          >
            {item.v_merchantcode || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter merchant..."
            size="xs"
            value={columnFilters.v_merchantcode}
            onChange={(e) =>
              handleFilterChange('v_merchantcode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_transaction_bkash_wd',
        label: 'Total Trans Bkash',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.total_transaction_bkash_wd, 0)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.total_transaction_bkash_wd}
            onChange={(e) =>
              handleFilterChange('total_transaction_bkash_wd', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_amount_bkash_wd',
        label: 'Total Amount Bkash',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.total_amount_bkash_wd)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.total_amount_bkash_wd}
            onChange={(e) =>
              handleFilterChange('total_amount_bkash_wd', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_transaction_nagad_wd',
        label: 'Total Trans Nagad',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.total_transaction_nagad_wd, 0)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.total_transaction_nagad_wd}
            onChange={(e) =>
              handleFilterChange('total_transaction_nagad_wd', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_amount_nagad_wd',
        label: 'Total Amount Nagad',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.total_amount_nagad_wd)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.total_amount_nagad_wd}
            onChange={(e) =>
              handleFilterChange('total_amount_nagad_wd', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_transaction_rocket_wd',
        label: 'Total Trans Rocket',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.total_transaction_rocket_wd, 0)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.total_transaction_rocket_wd}
            onChange={(e) =>
              handleFilterChange('total_transaction_rocket_wd', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_amount_rocket_wd',
        label: 'Total Amount Rocket',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.total_amount_rocket_wd)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.total_amount_rocket_wd}
            onChange={(e) =>
              handleFilterChange('total_amount_rocket_wd', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_transaction_upay_wd',
        label: 'Total Trans Upay',
        minWidth: 150,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.total_transaction_upay_wd, 0)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.total_transaction_upay_wd}
            onChange={(e) =>
              handleFilterChange('total_transaction_upay_wd', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_amount_upay_wd',
        label: 'Total Amount Upay',
        minWidth: 170,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.total_amount_upay_wd)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.total_amount_upay_wd}
            onChange={(e) =>
              handleFilterChange('total_amount_upay_wd', e.currentTarget.value)
            }
          />
        ),
      },
    ],
    [columnFilters, handleFilterChange]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } =
    useTableControls(columns, {
      onResetFilters: resetFilters,
    });

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.d_insert, columnFilters.d_insert) &&
          includesValue(item.v_merchantcode, columnFilters.v_merchantcode) &&
          includesValue(
            item.total_transaction_bkash_wd,
            columnFilters.total_transaction_bkash_wd
          ) &&
          includesValue(item.total_amount_bkash_wd, columnFilters.total_amount_bkash_wd) &&
          includesValue(
            item.total_transaction_nagad_wd,
            columnFilters.total_transaction_nagad_wd
          ) &&
          includesValue(item.total_amount_nagad_wd, columnFilters.total_amount_nagad_wd) &&
          includesValue(
            item.total_transaction_rocket_wd,
            columnFilters.total_transaction_rocket_wd
          ) &&
          includesValue(item.total_amount_rocket_wd, columnFilters.total_amount_rocket_wd) &&
          includesValue(
            item.total_transaction_upay_wd,
            columnFilters.total_transaction_upay_wd
          ) &&
          includesValue(item.total_amount_upay_wd, columnFilters.total_amount_upay_wd)
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
    const sum = (key) =>
      sortedData.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
    return {
      rows: sortedData.length,
      total_transaction_bkash_wd: sum('total_transaction_bkash_wd'),
      total_amount_bkash_wd: sum('total_amount_bkash_wd'),
      total_transaction_nagad_wd: sum('total_transaction_nagad_wd'),
      total_amount_nagad_wd: sum('total_amount_nagad_wd'),
      total_transaction_rocket_wd: sum('total_transaction_rocket_wd'),
      total_amount_rocket_wd: sum('total_amount_rocket_wd'),
      total_transaction_upay_wd: sum('total_transaction_upay_wd'),
      total_amount_upay_wd: sum('total_amount_upay_wd'),
    };
  }, [sortedData]);

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
                Transaction Merchant Per Hour
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Withdraw transactions grouped by hour per merchant
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
                  resetFilters();
                  setMerchantCode('');
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
                      maxDate={new Date()}
                    />
                  </Popover.Dropdown>
                </Popover>

                <Select
                  label="Merchant"
                  placeholder="Choose merchant"
                  data={merchantList}
                  searchable
                  nothingFoundMessage="No merchant found"
                  value={merchantCode}
                  onChange={(val) => setMerchantCode(val || '')}
                  style={{ minWidth: 260 }}
                />

                <Button
                  onClick={() => fetchList()}
                  leftSection={<IconReportMoney size={18} />}
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
                Filters are available per column; totals are shown at the table footer.
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
                  {sortedData.length > 0 ? (
                    sortedData.map((item, idx) => (
                      <Table.Tr key={`${item.d_insert || idx}-${item.v_merchantcode || idx}`}>
                        {visibleColumns.map((col) => (
                          <Table.Td key={`${col.key}-${idx}`}>{col.render(item)}</Table.Td>
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
                    {visibleColumns.map((col) => {
                      switch (col.key) {
                        case 'd_insert':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              Totals ({totals.rows} {totals.rows === 1 ? 'row' : 'rows'})
                            </Table.Th>
                          );
                        case 'v_merchantcode':
                          return <Table.Th key={`foot-${col.key}`}>-</Table.Th>;
                        case 'total_transaction_bkash_wd':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.total_transaction_bkash_wd, 0)}
                            </Table.Th>
                          );
                        case 'total_amount_bkash_wd':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.total_amount_bkash_wd)}
                            </Table.Th>
                          );
                        case 'total_transaction_nagad_wd':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.total_transaction_nagad_wd, 0)}
                            </Table.Th>
                          );
                        case 'total_amount_nagad_wd':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.total_amount_nagad_wd)}
                            </Table.Th>
                          );
                        case 'total_transaction_rocket_wd':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.total_transaction_rocket_wd, 0)}
                            </Table.Th>
                          );
                        case 'total_amount_rocket_wd':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.total_amount_rocket_wd)}
                            </Table.Th>
                          );
                        case 'total_transaction_upay_wd':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.total_transaction_upay_wd, 0)}
                            </Table.Th>
                          );
                        case 'total_amount_upay_wd':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.total_amount_upay_wd)}
                            </Table.Th>
                          );
                        default:
                          return <Table.Th key={`foot-${col.key}`}>-</Table.Th>;
                      }
                    })}
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </ScrollArea>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default MerchantTransactionPerHour;
