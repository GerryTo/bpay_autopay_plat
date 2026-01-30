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
  markerror: '',
  mybankerror: '',
  date: '',
  successoboard: '',
  user: '',
  bankCode: '',
  accountno: '',
  automationstatus: '',
};

const formatPhaseOptions = [
  { value: '1', label: 'Phase 1 & 3 Opening' },
  { value: '2', label: 'Phase 2 Closing' },
];

const makeKey = (item) =>
  `${item.accountno || ''}-${item.bankCode || ''}-${item.user || ''}`;

const ListAgentFailedSummary = () => {
  const [dateRange, setDateRange] = useState(buildDefaultRange());
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [phase, setPhase] = useState('1');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState([]);

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
        key: 'markerror',
        label: 'Mark Error',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.markerror || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter mark error..."
            size="xs"
            value={columnFilters.markerror}
            onChange={(e) =>
              handleFilterChange('markerror', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'mybankerror',
        label: 'Error Mybank',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.mybankerror || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter mybank error..."
            size="xs"
            value={columnFilters.mybankerror}
            onChange={(e) =>
              handleFilterChange('mybankerror', e.currentTarget.value)
            }
          />
        ),
      },
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
        key: 'successoboard',
        label: 'Success Onboard',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.successoboard || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter success..."
            size="xs"
            value={columnFilters.successoboard}
            onChange={(e) =>
              handleFilterChange('successoboard', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'user',
        label: 'Username',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.user || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter username..."
            size="xs"
            value={columnFilters.user}
            onChange={(e) => handleFilterChange('user', e.currentTarget.value)}
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
            onChange={(e) =>
              handleFilterChange('bankCode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountno',
        label: 'Account No',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.accountno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter account..."
            size="xs"
            value={columnFilters.accountno}
            onChange={(e) =>
              handleFilterChange('accountno', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'automationstatus',
        label: 'Automation Status',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.automationstatus || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter automation status..."
            size="xs"
            value={columnFilters.automationstatus}
            onChange={(e) =>
              handleFilterChange('automationstatus', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'actions',
        label: 'Action',
        minWidth: 140,
        render: (item) => (
          <Button
            size="xs"
            variant="light"
            color="blue"
            onClick={() => handleRecrawlSingle(item)}
          >
            Recrawl
          </Button>
        ),
      },
    ],
    [columnFilters]
  );

  const {
    visibleColumns,
    sortConfig,
    handleHideColumn,
    handleSort,
    handleResetAll: resetTableControls,
  } = useTableControls(columns, {
    onResetFilters: handleClearFilters,
    onResetSelection: () => setSelectedKeys([]),
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.markerror, columnFilters.markerror) &&
          includesValue(item.mybankerror, columnFilters.mybankerror) &&
          includesValue(item.date, columnFilters.date) &&
          includesValue(item.successoboard, columnFilters.successoboard) &&
          includesValue(item.user, columnFilters.user) &&
          includesValue(item.bankCode, columnFilters.bankCode) &&
          includesValue(item.accountno, columnFilters.accountno) &&
          includesValue(item.automationstatus, columnFilters.automationstatus)
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

  const pageKeys = paginatedData.map((item) => makeKey(item));
  const pageFullySelected =
    pageKeys.length > 0 && pageKeys.every((key) => selectedKeys.includes(key));
  const pagePartiallySelected =
    pageKeys.some((key) => selectedKeys.includes(key)) && !pageFullySelected;

  

  

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
        const response = await crawlerAPI.getAgentFailedSummary({
          date: payloadDate,
          type: phase,
        });

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
              message: payload.message || 'Failed to load failed summary',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load failed summary',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Failed summary fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load failed summary',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, phase]
  );

  

  const toggleRow = (item) => {
    const key = makeKey(item);
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key]
    );
  };

  const toggleAllOnPage = () => {
    if (pageFullySelected) {
      setSelectedKeys((current) =>
        current.filter((key) => !pageKeys.includes(key))
      );
    } else {
      setSelectedKeys((current) => [
        ...current,
        ...pageKeys.filter((key) => !current.includes(key)),
      ]);
    }
  };

  const handleRecrawlSingle = async (item) => {
    setLoading(true);
    try {
      const response = await crawlerAPI.recrawlAccount(item.accountno);
      const payload = response.data || {};
      if ((payload.status || '').toLowerCase() === 'ok') {
        showNotification({
          title: 'Success',
          message: payload.messages || 'Recrawl requested',
          color: 'green',
        });
        fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: payload.messages || 'Failed to recrawl',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Recrawl error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to recrawl account',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRecrawl = async () => {
    if (selectedKeys.length === 0) {
      showNotification({
        title: 'Info',
        message: 'Select at least one row',
        color: 'blue',
      });
      return;
    }
    const items = filteredData
      .filter((item) => selectedKeys.includes(makeKey(item)))
      .map((item) => ({
        account: item.accountno,
        bank: item.bankCode,
        user: item.user,
      }));

    setLoading(true);
    try {
      const response = await crawlerAPI.recrawlBulkAccounts(
        items,
        'defaultGroup'
      );
      const payload = response.data || {};
      if ((payload.status || '').toLowerCase() === 'ok') {
        showNotification({
          title: 'Success',
          message: payload.message || 'Recrawl queued',
          color: 'green',
        });
        fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: payload.message || 'Failed to recrawl',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Bulk recrawl error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to recrawl selected',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkError = async () => {
    if (selectedKeys.length === 0) {
      showNotification({
        title: 'Info',
        message: 'Select at least one row',
        color: 'blue',
      });
      return;
    }
    const groupname = window.prompt('Enter error group name (optional)', '');
    if (groupname === null) return;
    const items = filteredData
      .filter((item) => selectedKeys.includes(makeKey(item)))
      .map((item) => ({
        account: item.accountno,
        bank: item.bankCode,
        user: item.user,
      }));

    setLoading(true);
    try {
      const response = await crawlerAPI.markAccountsError(
        items,
        groupname || ''
      );
      const payload = response.data || {};
      if ((payload.status || '').toLowerCase() === 'ok') {
        showNotification({
          title: 'Success',
          message: payload.message || 'Marked as error',
          color: 'green',
        });
        fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: payload.message || 'Failed to mark error',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Mark error bulk:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to mark selected',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = () => {
    handleClearFilters();
    setPhase('1');
    setDateRange(buildDefaultRange());
    setCurrentPage(1);
    setSelectedKeys([]);
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
                List Agent Failed Summary
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Agent failure overview
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
                      maxDate={new Date()}
                    />
                  </Popover.Dropdown>
                </Popover>

                <Select
                  label="Phase"
                  data={formatPhaseOptions}
                  value={phase}
                  onChange={(val) => setPhase(val || '1')}
                  style={{ minWidth: 200 }}
                />

                <Button
                  onClick={() => fetchList()}
                  leftSection={<IconSearch size={18} />}
                  radius="md"
                  color="blue"
                >
                  Apply
                </Button>
              </Group>

              <Group gap="xs">
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={handleMarkError}
                >
                  Mark Error
                </Button>
                <Button
                  variant="light"
                  color="green"
                  size="sm"
                  onClick={handleBulkRecrawl}
                >
                  Recrawl Selected
                </Button>
                <Badge
                  variant="light"
                  color="gray"
                >
                  Selected: {selectedKeys.length}
                </Badge>
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
                    <Table.Th w={40}>
                      <Checkbox
                        checked={pageFullySelected}
                        indeterminate={pagePartiallySelected}
                        onChange={toggleAllOnPage}
                      />
                    </Table.Th>
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
                    <Table.Th w={40} />
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
                    paginatedData.map((item) => {
                      const key = makeKey(item);
                      return (
                        <Table.Tr key={key}>
                          <Table.Td>
                            <Checkbox
                              checked={selectedKeys.includes(key)}
                              onChange={() => toggleRow(item)}
                            />
                          </Table.Td>
                          {visibleColumns.map((col) => (
                            <Table.Td key={col.key}>
                              {col.render(item)}
                            </Table.Td>
                          ))}
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={visibleColumns.length + 1}>
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

export default ListAgentFailedSummary;
