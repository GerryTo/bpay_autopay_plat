import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  Card,
  Checkbox,
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
  IconSend,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { useTableControls } from '../../hooks/useTableControls';
import { resubmitExpressAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const typeOptions = [
  { value: '0', label: 'Amount less than' },
  { value: '1', label: 'Phone number does not match' },
  { value: '2', label: 'SMS needs review' },
  { value: '3', label: 'Different Trx ID' },
  { value: '4', label: 'Different amount' },
];

const defaultFilter = {
  type: '2',
  amount: 1000,
};

const defaultColumnFilters = {
  resubmitTime: '',
  matchDate: '',
  from: '',
  username: '',
  phonenumber: '',
  type: '',
  securitycode: '',
  customerphone: '',
  customerphoneTRX: '',
  servicecenter: '',
  amount: '',
  transAmount: '',
  message: '',
  transactiontype: '',
  smsid: '',
  futuretrxid: '',
  suspectedreason: '',
  balance: '',
  balancecalculate: '',
  balancediff: '',
  matchmanually: '',
  matchdate: '',
};

const createDefaultRange = () => [
  {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  },
];

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

const ResubmitExpress = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(defaultFilter);
  const [filterUsed, setFilterUsed] = useState(defaultFilter);
  const [columnFilters, setColumnFilters] = useState(defaultColumnFilters);
  const [pickerRange, setPickerRange] = useState(createDefaultRange());
  const [activeRange, setActiveRange] = useState(null);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const handleColumnFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setColumnFilters(defaultColumnFilters);
    setPickerRange(createDefaultRange());
    setActiveRange(null);
  }, []);

  const makeKey = (item) =>
    `${item.smsid || ''}-${item.securitycode || ''}-${item.resubmitTime || item.matchDate || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const columns = useMemo(
    () => [
      {
        key: 'resubmitTime',
        label: 'Resubmit Time',
        minWidth: 160,
        render: (item) => {
          const parsed = parseDate(item.resubmitTime);
          const display = parsed ? parsed.format('DD MMM YYYY HH:mm') : item.resubmitTime || '-';
          return <Text size="sm">{display}</Text>;
        },
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.resubmitTime}
            onChange={(e) => handleColumnFilterChange('resubmitTime', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'matchDate',
        label: 'Match Sms Timestamp',
        minWidth: 160,
        render: (item) => {
          const parsed = parseDate(item.matchDate);
          const display = parsed ? parsed.format('DD MMM YYYY HH:mm') : item.matchDate || '-';
          return <Text size="sm">{display}</Text>;
        },
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.matchDate}
            onChange={(e) => handleColumnFilterChange('matchDate', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'from',
        label: 'From',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.from || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.from}
            onChange={(e) => handleColumnFilterChange('from', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'username',
        label: 'Username',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.username || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.username}
            onChange={(e) => handleColumnFilterChange('username', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'phonenumber',
        label: 'Phone Number',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.phonenumber || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.phonenumber}
            onChange={(e) => handleColumnFilterChange('phonenumber', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'type',
        label: 'Bank',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.type || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.type}
            onChange={(e) => handleColumnFilterChange('type', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'securitycode',
        label: 'Trx ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.securitycode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.securitycode}
            onChange={(e) => handleColumnFilterChange('securitycode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'customerphone',
        label: 'Customer Phone',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.customerphone || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.customerphone}
            onChange={(e) => handleColumnFilterChange('customerphone', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'customerphoneTRX',
        label: 'Trx Customer Phone',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.customerphoneTRX || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.customerphoneTRX}
            onChange={(e) => handleColumnFilterChange('customerphoneTRX', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'servicecenter',
        label: 'Service Center',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.servicecenter || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.servicecenter}
            onChange={(e) => handleColumnFilterChange('servicecenter', e.currentTarget.value)}
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
            onChange={(e) => handleColumnFilterChange('amount', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'transAmount',
        label: 'Trans. Amount',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.transAmount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.transAmount}
            onChange={(e) => handleColumnFilterChange('transAmount', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'message',
        label: 'Message',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
            title={item.message}
          >
            {item.message || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.message}
            onChange={(e) => handleColumnFilterChange('message', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'transactiontype',
        label: 'Transaction Type',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.transactiontype || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.transactiontype}
            onChange={(e) =>
              handleColumnFilterChange('transactiontype', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'smsid',
        label: 'SMS ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.smsid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.smsid}
            onChange={(e) => handleColumnFilterChange('smsid', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'futuretrxid',
        label: 'Future Trx ID',
        minWidth: 140,
        render: (item) => (
          <Text size="sm">{item.futuretrxid === -1 ? 'Expired' : item.futuretrxid || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.futuretrxid}
            onChange={(e) => handleColumnFilterChange('futuretrxid', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'suspectedreason',
        label: 'Suspect Reason',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
            title={item.suspectedreason}
          >
            {item.suspectedreason || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.suspectedreason}
            onChange={(e) => handleColumnFilterChange('suspectedreason', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'balance',
        label: 'Balance',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.balance)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.balance}
            onChange={(e) => handleColumnFilterChange('balance', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'balancecalculate',
        label: 'Balance Calculate',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.balancecalculate)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.balancecalculate}
            onChange={(e) => handleColumnFilterChange('balancecalculate', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'balancediff',
        label: 'Balance Different',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.balancediff)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.balancediff}
            onChange={(e) => handleColumnFilterChange('balancediff', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'matchmanually',
        label: 'Match Manually',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.matchmanually || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.matchmanually}
            onChange={(e) => handleColumnFilterChange('matchmanually', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'matchdate',
        label: 'Match Date',
        minWidth: 140,
        render: (item) => {
          const parsed = parseDate(item.matchdate);
          const display = parsed ? parsed.format('DD MMM YYYY HH:mm') : item.matchdate || '-';
          return <Text size="sm">{display}</Text>;
        },
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.matchdate}
            onChange={(e) => handleColumnFilterChange('matchdate', e.currentTarget.value)}
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
    onResetSelection: () => setSelectedKeys([]),
  });

  const filteredData = useMemo(() => {
    const start = activeRange ? dayjs(activeRange[0].startDate).startOf('day') : null;
    const end = activeRange ? dayjs(activeRange[0].endDate).endOf('day') : null;

    return data.filter((item) => {
      if (!includesValue(item.resubmitTime, columnFilters.resubmitTime)) return false;
      if (!includesValue(item.matchDate, columnFilters.matchDate)) return false;
      if (!includesValue(item.from, columnFilters.from)) return false;
      if (!includesValue(item.username, columnFilters.username)) return false;
      if (!includesValue(item.phonenumber, columnFilters.phonenumber)) return false;
      if (!includesValue(item.type, columnFilters.type)) return false;
      if (!includesValue(item.securitycode, columnFilters.securitycode)) return false;
      if (!includesValue(item.customerphone, columnFilters.customerphone)) return false;
      if (!includesValue(item.customerphoneTRX, columnFilters.customerphoneTRX)) return false;
      if (!includesValue(item.servicecenter, columnFilters.servicecenter)) return false;
      if (!includesValue(String(item.amount), columnFilters.amount)) return false;
      if (!includesValue(String(item.transAmount), columnFilters.transAmount)) return false;
      if (!includesValue(item.message, columnFilters.message)) return false;
      if (!includesValue(item.transactiontype, columnFilters.transactiontype)) return false;
      if (!includesValue(item.smsid, columnFilters.smsid)) return false;
      if (!includesValue(String(item.futuretrxid), columnFilters.futuretrxid)) return false;
      if (!includesValue(item.suspectedreason, columnFilters.suspectedreason)) return false;
      if (!includesValue(String(item.balance), columnFilters.balance)) return false;
      if (!includesValue(String(item.balancecalculate), columnFilters.balancecalculate)) return false;
      if (!includesValue(String(item.balancediff), columnFilters.balancediff)) return false;
      if (!includesValue(item.matchmanually, columnFilters.matchmanually)) return false;
      if (!includesValue(item.matchdate, columnFilters.matchdate)) return false;

      if (start && end) {
        const parsed = parseDate(item.resubmitTime);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, activeRange]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);
  const pageKeys = paginatedData.map((item) => makeKey(item));
  const pageFullySelected =
    pageKeys.length > 0 && pageKeys.every((key) => selectedKeys.includes(key));
  const pagePartiallySelected =
    pageKeys.some((key) => selectedKeys.includes(key)) && !pageFullySelected;

  const fetchList = async ({ silent = false, payloadFilter } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await resubmitExpressAPI.getList(payloadFilter || filterUsed);
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(payload.records) ? payload.records : [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load resubmit list',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load resubmit list',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Resubmit express list fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load resubmit list',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilter = () => {
    setFilterUsed(filter);
    fetchList({ payloadFilter: filter });
  };

  const toggleRow = (item) => {
    const key = makeKey(item);
    setSelectedKeys((current) => {
      const exists = current.includes(key);
      if (exists) {
        return current.filter((k) => k !== key);
      }
      if (current.length >= 50) {
        showNotification({
          title: 'Limit',
          message: 'Select up to 50 rows only',
          color: 'yellow',
        });
        return current;
      }
      return [...current, key];
    });
  };

  const toggleAllOnPage = () => {
    if (pageFullySelected) {
      setSelectedKeys((current) => current.filter((key) => !pageKeys.includes(key)));
    } else {
      const toAdd = pageKeys.filter((key) => !selectedKeys.includes(key));
      if (selectedKeys.length + toAdd.length > 50) {
        showNotification({
          title: 'Limit',
          message: 'Select up to 50 rows only',
          color: 'yellow',
        });
        return;
      }
      setSelectedKeys((current) => [...current, ...toAdd]);
    }
  };

  const handleSubmit = async () => {
    const selectedRecords = sortedData.filter((item) => selectedKeys.includes(makeKey(item)));

    if (selectedRecords.length === 0) {
      showNotification({
        title: 'Info',
        message: 'Select at least one row before submitting',
        color: 'blue',
      });
      return;
    }

    if (selectedRecords.length > 50) {
      showNotification({
        title: 'Limit',
        message: 'Select up to 50 rows only',
        color: 'yellow',
      });
      return;
    }

    const confirmed = window.confirm(`Submit ${selectedRecords.length} SMS?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      const payload = { ...filterUsed, list: selectedRecords };
      const response = await resubmitExpressAPI.submit(payload);
      if (response.success && response.data) {
        const payloadData = response.data;
        if ((payloadData.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: payloadData.message || 'Matching is in progress. Please refresh the list.',
            color: 'green',
          });
          setData([]);
          setSelectedKeys([]);
        } else {
          showNotification({
            title: 'Error',
            message: payloadData.message || 'Failed to submit selected SMS',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to submit selected SMS',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Resubmit express submit error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to submit selected SMS',
        color: 'red',
      });
    } finally {
      setLoading(false);
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
                Resubmit Express
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Quick resubmit list for suspicious SMS
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
                  setFilter(defaultFilter);
                  setFilterUsed(defaultFilter);
                  setSelectedKeys([]);
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
                <Select
                  label="Type"
                  size="sm"
                  data={typeOptions}
                  value={filter.type}
                  onChange={(val) => setFilter((prev) => ({ ...prev, type: val || '2' }))}
                  style={{ minWidth: 220 }}
                />
                {filter.type === '0' && (
                  <TextInput
                    label="Amount less than"
                    size="sm"
                    type="number"
                    value={filter.amount}
                    onChange={(e) =>
                      setFilter((prev) => ({ ...prev, amount: Number(e.currentTarget.value) }))
                    }
                    style={{ minWidth: 200 }}
                  />
                )}

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

              <Group
                gap="xs"
                align="center"
              >
                <Button
                  variant="filled"
                  color="blue"
                  leftSection={<IconSend size={16} />}
                  size="sm"
                  onClick={handleSubmit}
                >
                  Submit Selected
                </Button>
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Selected: {selectedKeys.length} / 50 max
                </Text>
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Rows: {data.length}
                </Text>
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
                    <Table.Th />
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
                      const selected = selectedKeys.includes(key);
                      return (
                        <Table.Tr
                          key={key}
                          bg={selected ? 'rgba(34, 139, 230, 0.06)' : undefined}
                        >
                          <Table.Td>
                            <Checkbox
                              checked={selected}
                              onChange={() => toggleRow(item)}
                            />
                          </Table.Td>
                          {visibleColumns.map((col) => (
                            <Table.Td key={`${col.key}-${key}`}>
                              {col.render ? col.render(item) : item[col.key] || '-'}
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
                <Table.Tfoot>
                  <Table.Tr>
                    <Table.Td colSpan={visibleColumns.length + 1}>
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

export default ResubmitExpress;
