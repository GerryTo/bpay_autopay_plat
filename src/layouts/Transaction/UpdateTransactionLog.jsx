import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { DateRangePicker } from 'react-date-range';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  Popover,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Select,
} from '@mantine/core';
import { IconCalendar, IconFilter, IconRefresh, IconSearch, IconTransfer } from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const defaultFilters = {
  timestamp: '',
  notes3: '',
  status: '',
  amount: '',
  logStatus: '',
};

const UpdateTransactionLog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: 'selection' },
  ]);

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const handleClearFilters = () => setColumnFilters(defaultFilters);

  const selectedDateLabel = format(dateRange[0].startDate, 'yyyy-MM-dd');

  const columns = useMemo(
    () => [
      {
        key: 'timestamp',
        label: 'Timestamp',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.timestamp || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp..."
            size="xs"
            value={columnFilters.timestamp}
            onChange={(e) => handleFilterChange('timestamp', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'notes3',
        label: 'Trans ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.notes3 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trans id..."
            size="xs"
            value={columnFilters.notes3}
            onChange={(e) => handleFilterChange('notes3', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'status',
        label: 'Status Requested',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.status || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter status..."
            size="xs"
            value={columnFilters.status}
            onChange={(e) => handleFilterChange('status', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'amount',
        label: 'Amount Requested',
        minWidth: 160,
        render: (item) => (
          <Text size="sm" className="grid-alignright">
            {formatNumber(item.amount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter amount..."
            size="xs"
            value={columnFilters.amount}
            onChange={(e) => handleFilterChange('amount', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'logStatus',
        label: 'Status',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.logStatus || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter status..."
            size="xs"
            value={columnFilters.logStatus}
            onChange={(e) => handleFilterChange('logStatus', e.currentTarget.value)}
          />
        ),
      },
    ],
    [columnFilters]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } = useTableControls(columns, {
    onResetFilters: () => setColumnFilters(defaultFilters),
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) =>
        Object.keys(defaultFilters).every((key) => includesValue(item[key], columnFilters[key]))
      ),
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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => setCurrentPage(1), [columnFilters]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [totalPages, currentPage]);

  const fetchData = async ({ silent = false } = {}) => {
    const dateValue = dateRange[0]?.startDate;
    if (!dateValue) {
      showNotification({ title: 'Validation', message: 'Please choose a date', Color: 'yellow' });
      return;
    }
    const formattedDate = `${format(dateValue, 'yyyy-MM-dd')} 00:00:00`;

    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await transactionAPI.getUpdateTransactionLog({ date: formattedDate });
      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records) ? response.data.records : [];
          setData(records);
        } else {
          showNotification({ title: 'Error', message: response.data.message || 'Failed to load data', Color: 'red' });
          setData([]);
        }
      } else {
        showNotification({ title: 'Error', message: response.error || 'Failed to load data', Color: 'red' });
      }
    } catch (error) {
      console.error('Update transaction log fetch error:', error);
      showNotification({ title: 'Error', message: 'Unable to load update transaction log', Color: 'red' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData({ silent: true });
  }, []);

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'md', blur: 2 }} />
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Group gap={8} align="center">
              <IconTransfer size={22} color="#2563eb" />
              <Text size="xl" fw={700}>
                Update Transaction Log
              </Text>
            </Group>

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
                  setData([]);
                }}
              >
                Reset
              </Button>
            </Group>
          </Group>

          <Card withBorder radius="md" padding="md" shadow="xs">
            <Group align="flex-end" gap="md" wrap="wrap">
              <Popover opened={datePickerOpened} onChange={setDatePickerOpened} width={320} position="bottom-start" shadow="md">
                <Popover.Target>
                  <Button
                    variant="light"
                    color="blue"
                    leftSection={<IconCalendar size={18} />}
                    onClick={() => setDatePickerOpened((o) => !o)}
                  >
                    {selectedDateLabel}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown p={0}>
                  <DateRangePicker
                    ranges={dateRange}
                    onChange={(ranges) => setDateRange([ranges.selection])}
                    showSelectionPreview
                    moveRangeOnFirstSelection={false}
                    rangeColors={['#1d4ed8']}
                    months={1}
                    direction="horizontal"
                  />
                </Popover.Dropdown>
              </Popover>
              <Button leftSection={<IconSearch size={18} />} color="blue" radius="md" onClick={() => fetchData()}>
                Search
              </Button>
            </Group>
          </Card>

          <Box pos="relative">
            <ScrollArea type="auto" h="60vh">
              <Table
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="sm"
                verticalSpacing="xs"
                styles={{ th: { backgroundColor: '#f8f9fa', fontWeight: 600 } }}
              >
                <Table.Thead>
                  <Table.Tr>
                    {visibleColumns.map((col) => (
                      <Table.Th key={col.key} style={{ minWidth: col.minWidth || 120 }}>
                        <Group gap={6} align="center">
                          <Text size="sm" fw={600}>
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
                      <Table.Th key={`${col.key}-filter`} style={{ minWidth: col.minWidth || 120, padding: '8px' }}>
                        {col.filter || null}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, idx) => (
                      <Table.Tr key={`${item.timestamp || ''}-${idx}`}>
                        {visibleColumns.map((col) => (
                          <Table.Td key={col.key}>{col.render(item)}</Table.Td>
                        ))}
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={visibleColumns.length}>
                        <Text ta="center" c="dimmed">
                          No data available
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>

          <Group justify="space-between" align="center">
            <Group gap="md" align="center">
              <Group gap="sm" align="center">
                <Text size="sm" c="dimmed">
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
              <Group gap={6} align="center">
                <Text size="sm" c="dimmed">
                  Total rows:
                </Text>
                <Text size="sm" fw={600}>
                  {data.length}
                </Text>
              </Group>
            </Group>

            <Group gap="xs">
              <Button variant="light" size="xs" onClick={handleResetAll} leftSection={<IconRefresh size={14} />}>
                Reset Columns/Sort
              </Button>
              <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="sm" radius="md" withEdges />
            </Group>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
};

export default UpdateTransactionLog;
