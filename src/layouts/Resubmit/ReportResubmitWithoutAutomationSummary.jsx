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
  Stack,
  Table,
  Text,
  TextInput,
  Select,
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
  totalResubmit: '',
  totalResubmitWithoutAppium: '',
};

const ReportResubmitWithoutAutomationSummary = () => {
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
        key: 'totalResubmit',
        label: 'Total Resubmit Express',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.totalResubmit ?? '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.totalResubmit}
            onChange={(e) =>
              handleColumnFilterChange('totalResubmit', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'totalResubmitWithoutAppium',
        label: 'Total Resubmit Without Automation',
        minWidth: 260,
        render: (item) => (
          <Text size="sm">{item.totalResubmitWithoutAppium ?? '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.totalResubmitWithoutAppium}
            onChange={(e) =>
              handleColumnFilterChange(
                'totalResubmitWithoutAppium',
                e.currentTarget.value
              )
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
    return data.filter((item) => {
      if (
        !includesValue(String(item.totalResubmit), columnFilters.totalResubmit)
      )
        return false;
      if (
        !includesValue(
          String(item.totalResubmitWithoutAppium),
          columnFilters.totalResubmitWithoutAppium
        )
      )
        return false;
      return true;
    });
  }, [data, columnFilters]);

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
      const response = await reportResubmitAPI.getWithoutAutomationSummary(
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
            message: payload.message || 'Failed to load report summary',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load report summary',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Report resubmit summary fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load report summary',
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
                Report Resubmit Without Automation Summary
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Summary of resubmit express vs without automation
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

              {/* <Text
                size="sm"
                c="dimmed"
              >
                Rows: {data.length}
              </Text> */}
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
                    paginatedData.map((item, idx) => (
                      <Table.Tr key={`${item.totalResubmit || 'row'}-${idx}`}>
                        {visibleColumns.map((col) => (
                          <Table.Td key={`${col.key}-${idx}`}>
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

export default ReportResubmitWithoutAutomationSummary;
