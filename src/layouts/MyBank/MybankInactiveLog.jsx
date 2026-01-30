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
import { IconCalendar, IconFilter, IconRefresh } from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { useTableControls } from '../../hooks/useTableControls';
import { myBankAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const defaultFilters = {
  d_insert: '',
  v_agent: '',
  v_bankcode: '',
  v_action: '',
};

const createDefaultRange = () => [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  },
];

const parseDate = (value) => {
  const parsed = dayjs(value);
  if (parsed.isValid()) return parsed;
  if (typeof value === 'string') {
    const replaced = dayjs(value.replace(' ', 'T'));
    if (replaced.isValid()) return replaced;
  }
  return null;
};

const MybankInactiveLog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [pickerRange, setPickerRange] = useState(createDefaultRange());
  const [activeRange, setActiveRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
    setPickerRange(createDefaultRange());
    setActiveRange(null);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'd_insert',
        label: 'Date Insert',
        minWidth: 180,
        render: (item) => {
          const parsed = parseDate(item.d_insert);
          const display = parsed ? parsed.format('DD MMM YYYY HH:mm') : item.d_insert || '-';
          return <Text size="sm">{display}</Text>;
        },
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
        key: 'v_agent',
        label: 'Agent',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.v_agent || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.v_agent}
            onChange={(e) => handleFilterChange('v_agent', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'v_bankcode',
        label: 'Bank',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.v_bankcode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.v_bankcode}
            onChange={(e) => handleFilterChange('v_bankcode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'v_action',
        label: 'Status',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.v_action || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter status..."
            size="xs"
            value={columnFilters.v_action}
            onChange={(e) => handleFilterChange('v_action', e.currentTarget.value)}
          />
        ),
      },
    ],
    [columnFilters, handleFilterChange]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } =
    useTableControls(columns, {
      onResetFilters: handleResetFilters,
      onResetSelection: () => {},
    });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(() => {
    const start = activeRange ? dayjs(activeRange[0].startDate).startOf('day') : null;
    const end = activeRange ? dayjs(activeRange[0].endDate).endOf('day') : null;

    return data.filter((item) => {
      if (!includesValue(item.d_insert, columnFilters.d_insert)) return false;
      if (!includesValue(item.v_agent, columnFilters.v_agent)) return false;
      if (!includesValue(item.v_bankcode, columnFilters.v_bankcode)) return false;
      if (!includesValue(item.v_action, columnFilters.v_action)) return false;

      if (start && end) {
        const parsed = parseDate(item.d_insert);
        if (!parsed) return false;
        const timeValue = parsed.valueOf();
        if (timeValue < start.valueOf() || timeValue > end.valueOf()) {
          return false;
        }
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

  const fetchData = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await myBankAPI.getInactiveLog();
      if (response.success && response.data) {
        const payload = response.data.data || response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          setData(payload.records || []);
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load inactive log',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load inactive log',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Inactive log fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load inactive log',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyDateRange = () => {
    setActiveRange([...pickerRange]);
  };

  const clearDateRange = () => {
    setActiveRange(null);
    setPickerRange(createDefaultRange());
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
                Mybank Inactive Log
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Review inactive status changes by agent and bank
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
                        ? `${format(activeRange[0].startDate, 'dd MMM yyyy')} - ${format(
                          activeRange[0].endDate,
                          'dd MMM yyyy'
                        )}`
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
              </Group>

              <Divider />

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
                        paginatedData.map((item, idx) => (
                          <Table.Tr key={`${item.d_insert || ''}-${idx}`}>
                            {visibleColumns.map((col) => (
                              <Table.Td key={`${col.key}-${idx}`}>
                                {col.render ? col.render(item) : item[col.key]}
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
                              Showing {paginatedData.length > 0 ? startIndex + 1 : 0}-
                              {Math.min(endIndex, filteredData.length)} of {filteredData.length}
                            </Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tfoot>
                  </Table>
                </ScrollArea>
              </Box>
            </Stack>
          </Card>

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

export default MybankInactiveLog;
