import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import {
  IconCalendar,
  IconFilter,
  IconMessage,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { smsAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  trxId: '',
  duplicate: '',
};

const DuplicateSms = () => {
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: 'selection' },
  ]);
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

  const handleResetAllFilters = () => {
    handleClearFilters();
    setDateRange([
      { startDate: new Date(), endDate: new Date(), key: 'selection' },
    ]);
    setDatePickerOpened(false);
    setData([]);
  };

  const columns = useMemo(
    () => [
      {
        key: 'trxId',
        label: 'Trx ID',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.trxId || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={columnFilters.trxId}
            onChange={(e) => handleFilterChange('trxId', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'duplicate',
        label: 'Duplicate Count',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.duplicate ?? '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter duplicate..."
            size="xs"
            value={columnFilters.duplicate}
            onChange={(e) =>
              handleFilterChange('duplicate', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: 160,
        render: (item) => (
          <Button
            size="xs"
            variant="light"
            color="blue"
            onClick={() => handleShow(item)}
          >
            Show SMS
          </Button>
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
    handleResetAll,
  } = useTableControls(columns, {
    onResetFilters: handleResetAllFilters,
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.trxId, columnFilters.trxId) &&
          includesValue(item.duplicate, columnFilters.duplicate)
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

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const fetchData = async ({ silent = false } = {}) => {
    if (!dateRange[0]?.startDate || !dateRange[0]?.endDate) {
      showNotification({
        title: 'Validation',
        message: 'Please select From and To dates',
        color: 'yellow',
      });
      return;
    }

    const from = `${dayjs(dateRange[0].startDate).format(
      'YYYY-MM-DD'
    )} 00:00:00`;
    const to = `${dayjs(dateRange[0].endDate).format('YYYY-MM-DD')} 23:59:59`;

    silent ? setRefreshing(true) : setLoading(true);

    try {
      const response = await smsAPI.getDuplicateSmsList({
        datefrom: from,
        dateto: to,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records)
            ? response.data.records
            : [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message:
              response.data.message || 'Failed to load duplicate SMS data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load duplicate SMS data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Duplicate SMS fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load duplicate SMS data',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleShow = (item) => {
    showNotification({
      title: 'Info',
      message: `Show SMS for trx ${item.trxId} (modal not implemented)`,
      color: 'blue',
    });
  };

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, item) => {
          acc.rows += 1;
          acc.duplicate += Number(item.duplicate) || 0;
          return acc;
        },
        { rows: 0, duplicate: 0 }
      ),
    [filteredData]
  );

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
            align="flex-start"
          >
            <Stack gap={4}>
              <Group gap={8}>
                <IconMessage size={22} />
                <Text
                  size="xl"
                  fw={700}
                >
                  Duplicate SMS
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Find duplicate SMS by date range. Totals are shown in the
                footer.
              </Text>
            </Stack>

            <Group gap="xs">
              <Button
                variant="light"
                color="gray"
                radius="md"
                size="sm"
                leftSection={<IconFilter size={18} />}
                onClick={handleResetAll}
              >
                Reset Filters
              </Button>
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

              <Group gap="xs">
                <Button
                  leftSection={<IconSearch size={18} />}
                  color="blue"
                  radius="md"
                  onClick={() => fetchData()}
                >
                  Search
                </Button>
              </Group>
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
                    paginatedData.map((item, idx) => (
                      <Table.Tr key={`${item.trxId || idx}-${idx}`}>
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
                    {visibleColumns.map((col, index) => {
                      if (col.key === 'duplicate') {
                        return (
                          <Table.Th
                            key={`${col.key}-footer`}
                            style={{ textAlign: 'right' }}
                          >
                            {totals.duplicate}
                          </Table.Th>
                        );
                      }
                      if (index === 0) {
                        return (
                          <Table.Th key={`${col.key}-footer`}>
                            Totals (Rows: {totals.rows})
                          </Table.Th>
                        );
                      }
                      return <Table.Th key={`${col.key}-footer`} />;
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
                c="dimmed"
              >
                Total Rows: {totals.rows}
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

export default DuplicateSms;
