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
  v_username: '',
  v_mainuser: '',
  v_bankcode: '',
  n_cashIn_diff: '',
  n_ciTransactions_diff: '',
  total_transaction: '',
  count_transaction: '',
  total_different: '',
  count_different: '',
};

const numericFields = [
  'n_cashIn_diff',
  'n_ciTransactions_diff',
  'total_transaction',
  'count_transaction',
  'total_different',
  'count_different',
];

const formatNumber = (value, digits = 2) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: digits });
};

const ReportDifference = () => {
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
        key: 'v_username',
        label: 'Username',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.v_username || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter username..."
            size="xs"
            value={columnFilters.v_username}
            onChange={(e) =>
              handleFilterChange('v_username', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'v_mainuser',
        label: 'Main User',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.v_mainuser || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter main user..."
            size="xs"
            value={columnFilters.v_mainuser}
            onChange={(e) =>
              handleFilterChange('v_mainuser', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'v_bankcode',
        label: 'Bank',
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
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.v_bankcode}
            onChange={(e) =>
              handleFilterChange('v_bankcode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_cashIn_diff',
        label: 'Cash In Summary',
        minWidth: 160,
        render: (item) => {
          const value = Number(item.n_cashIn_diff) || 0;
          const color = value === 0 ? 'gray' : value > 0 ? 'green' : 'red';
          return (
            <Text
              size="sm"
              c={color}
              className="grid-alignright"
            >
              {formatNumber(item.n_cashIn_diff, 0)}
            </Text>
          );
        },
        filter: (
          <TextInput
            placeholder="Filter cash in sum..."
            size="xs"
            value={columnFilters.n_cashIn_diff}
            onChange={(e) =>
              handleFilterChange('n_cashIn_diff', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'n_ciTransactions_diff',
        label: 'Count Transactions Summary',
        minWidth: 190,
        render: (item) => {
          const value = Number(item.n_ciTransactions_diff) || 0;
          const color = value === 0 ? 'gray' : value > 0 ? 'green' : 'red';
          return (
            <Text
              size="sm"
              c={color}
              className="grid-alignright"
            >
              {formatNumber(item.n_ciTransactions_diff, 0)}
            </Text>
          );
        },
        filter: (
          <TextInput
            placeholder="Filter count summary..."
            size="xs"
            value={columnFilters.n_ciTransactions_diff}
            onChange={(e) =>
              handleFilterChange('n_ciTransactions_diff', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_transaction',
        label: 'Total Transaction',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.total_transaction, 0)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter total trx..."
            size="xs"
            value={columnFilters.total_transaction}
            onChange={(e) =>
              handleFilterChange('total_transaction', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'count_transaction',
        label: 'Count Transaction',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.count_transaction, 0)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter count trx..."
            size="xs"
            value={columnFilters.count_transaction}
            onChange={(e) =>
              handleFilterChange('count_transaction', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total_different',
        label: 'Total Different',
        minWidth: 160,
        render: (item) => {
          const value = Number(item.total_different) || 0;
          const color =
            Math.abs(value) > 0.01 ? (value < 0 ? 'red' : 'orange') : 'green';
          return (
            <Text
              size="sm"
              c={color}
              className="grid-alignright"
            >
              {formatNumber(item.total_different, 0)}
            </Text>
          );
        },
        filter: (
          <TextInput
            placeholder="Filter total diff..."
            size="xs"
            value={columnFilters.total_different}
            onChange={(e) =>
              handleFilterChange('total_different', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'count_different',
        label: 'Count Different',
        minWidth: 150,
        render: (item) => {
          const value = Number(item.count_different) || 0;
          const color = value !== 0 ? (value < 0 ? 'red' : 'orange') : 'green';
          return (
            <Text
              size="sm"
              c={color}
              className="grid-alignright"
            >
              {formatNumber(item.count_different, 0)}
            </Text>
          );
        },
        filter: (
          <TextInput
            placeholder="Filter count diff..."
            size="xs"
            value={columnFilters.count_different}
            onChange={(e) =>
              handleFilterChange('count_different', e.currentTarget.value)
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
          includesValue(item.v_username, columnFilters.v_username) &&
          includesValue(item.v_mainuser, columnFilters.v_mainuser) &&
          includesValue(item.v_bankcode, columnFilters.v_bankcode) &&
          includesValue(item.n_cashIn_diff, columnFilters.n_cashIn_diff) &&
          includesValue(
            item.n_ciTransactions_diff,
            columnFilters.n_ciTransactions_diff
          ) &&
          includesValue(
            item.total_transaction,
            columnFilters.total_transaction
          ) &&
          includesValue(
            item.count_transaction,
            columnFilters.count_transaction
          ) &&
          includesValue(item.total_different, columnFilters.total_different) &&
          includesValue(item.count_different, columnFilters.count_different)
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
        const response = await crawlerAPI.getReportDifference(payloadDate);

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
              message: payload.message || 'Failed to load report difference',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load report difference',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Report difference fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load report difference',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange]
  );

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                Report Difference
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Daily difference summary
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
                      maxDate={new Date()}
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
                        key={`${item.v_username || 'row'}-${
                          item.v_bankcode || ''
                        }-${idx}`}
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
                              {totals[col.key] === 0 ? '-' : formatNumber(totals[col.key], 0)}
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

export default ReportDifference;
