import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Checkbox,
  Group,
  LoadingOverlay,
  Pagination,
  ScrollArea,
  Select,
  SimpleGrid,
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
  IconAlertTriangle,
  IconArrowDownCircle,
  IconBolt,
  IconChecklist,
  IconFilter,
  IconRefresh,
  IconCalendar,
} from '@tabler/icons-react';
import { depositAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const statusOptions = [
  { value: 'A', label: 'All' },
  { value: '9', label: 'Pending' },
  { value: 'T', label: 'Order Need To Check' },
  { value: '0', label: 'Completed' },
  { value: '1', label: 'Failed' },
];

const defaultFilters = {
  futuretrxid: '',
  merchantcode: '',
  customercode: '',
  bankcode: '',
  transactiontype: '',
  status: '',
  callbackresponse: '',
  accountno: '',
  accountdst: '',
  accountsrcname: '',
  accountdstname: '',
  alias: '',
  user: '',
  phonenumber: '',
  transactionid: '',
  reference: '',
  actualAgent: '',
  servername: '',
  serverurl: '',
  notes: '',
  notes2: '',
  notes3: '',
  memo2: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const DepositPendingList = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [status, setStatus] = useState(statusOptions[1].value); // Pending by default
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
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
        minWidth: 160,
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
      },
      {
        key: 'completedate',
        label: 'Complete Date',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.completedate || '-'}</Text>,
      },
      {
        key: 'merchantcode',
        label: 'Merchant',
        minWidth: 150,
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
        minWidth: 140,
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
        key: 'bankcode',
        label: 'Bank',
        minWidth: 140,
        render: (item) => (
          <Badge
            color="blue"
            variant="light"
          >
            {item.bankcode || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bankcode}
            onChange={(e) =>
              handleFilterChange('bankcode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'DB',
        label: 'Debit',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.DB)}
          </Text>
        ),
      },
      {
        key: 'CR',
        label: 'Credit',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.CR)}
          </Text>
        ),
      },
      {
        key: 'transactiontype',
        label: 'Trans Type',
        minWidth: 130,
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
        key: 'callbackresponse',
        label: 'Callback Status',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.callbackresponse || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter callback..."
            size="xs"
            value={columnFilters.callbackresponse}
            onChange={(e) =>
              handleFilterChange('callbackresponse', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountno',
        label: 'Acc Source',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.accountno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter acc source..."
            size="xs"
            value={columnFilters.accountno}
            onChange={(e) =>
              handleFilterChange('accountno', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountsrcname',
        label: 'Acc Source Name',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.accountsrcname || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter source name..."
            size="xs"
            value={columnFilters.accountsrcname}
            onChange={(e) =>
              handleFilterChange('accountsrcname', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountdst',
        label: 'Acc Dest',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.accountdst || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter acc dest..."
            size="xs"
            value={columnFilters.accountdst}
            onChange={(e) =>
              handleFilterChange('accountdst', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountdstname',
        label: 'Acc Dest Name',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.accountdstname || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dest name..."
            size="xs"
            value={columnFilters.accountdstname}
            onChange={(e) =>
              handleFilterChange('accountdstname', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'fee',
        label: 'Fee',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.fee)}
          </Text>
        ),
      },
      {
        key: 'alias',
        label: 'Alias',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.alias || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter alias..."
            size="xs"
            value={columnFilters.alias}
            onChange={(e) => handleFilterChange('alias', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'actualAgent',
        label: 'Actual Agent',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.actualAgent || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.actualAgent}
            onChange={(e) =>
              handleFilterChange('actualAgent', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'user',
        label: 'SMS Agent',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.user || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.user}
            onChange={(e) => handleFilterChange('user', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'phonenumber',
        label: 'SMS Phone',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.phonenumber || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter phone..."
            size="xs"
            value={columnFilters.phonenumber}
            onChange={(e) =>
              handleFilterChange('phonenumber', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'reference',
        label: 'Reference',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.reference || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter reference..."
            size="xs"
            value={columnFilters.reference}
            onChange={(e) =>
              handleFilterChange('reference', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'transactionid',
        label: 'Transaction ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.transactionid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter transaction..."
            size="xs"
            value={columnFilters.transactionid}
            onChange={(e) =>
              handleFilterChange('transactionid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'notes',
        label: 'Notes',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.notes || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter notes..."
            size="xs"
            value={columnFilters.notes}
            onChange={(e) => handleFilterChange('notes', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'notes2',
        label: 'Notes 2',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.notes2 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter notes 2..."
            size="xs"
            value={columnFilters.notes2}
            onChange={(e) =>
              handleFilterChange('notes2', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'notes2',
        label: 'Receipt ID',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.notes2 || '-'}</Text>,
      },
      {
        key: 'memo2',
        label: 'Memo 2',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.memo2 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter memo 2..."
            size="xs"
            value={columnFilters.memo2}
            onChange={(e) => handleFilterChange('memo2', e.currentTarget.value)}
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
        key: 'servername',
        label: 'Server Name',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.servername || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter server..."
            size="xs"
            value={columnFilters.servername}
            onChange={(e) =>
              handleFilterChange('servername', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'serverurl',
        label: 'Server URL',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.serverurl || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter URL..."
            size="xs"
            value={columnFilters.serverurl}
            onChange={(e) =>
              handleFilterChange('serverurl', e.currentTarget.value)
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
    handleResetAll,
  } = useTableControls(columns, {
    onResetFilters: () => setColumnFilters(defaultFilters),
    onResetSelection: () => setSelectedKeys([]),
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
        return (
          includesValue(item.futuretrxid, columnFilters.futuretrxid) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.customercode, columnFilters.customercode) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.transactiontype, columnFilters.transactiontype) &&
          includesValue(item.status, columnFilters.status) &&
          includesValue(
            item.callbackresponse,
            columnFilters.callbackresponse
          ) &&
          includesValue(item.accountno, columnFilters.accountno) &&
          includesValue(item.accountdst, columnFilters.accountdst) &&
          includesValue(item.accountsrcname, columnFilters.accountsrcname) &&
          includesValue(item.accountdstname, columnFilters.accountdstname) &&
          includesValue(item.alias, columnFilters.alias) &&
          includesValue(item.actualAgent, columnFilters.actualAgent) &&
          includesValue(item.user, columnFilters.user) &&
          includesValue(item.phonenumber, columnFilters.phonenumber) &&
          includesValue(item.reference, columnFilters.reference) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.notes, columnFilters.notes) &&
          includesValue(item.notes2, columnFilters.notes2) &&
          includesValue(item.notes3, columnFilters.notes3) &&
          includesValue(item.memo2, columnFilters.memo2) &&
          includesValue(item.servername, columnFilters.servername) &&
          includesValue(item.serverurl, columnFilters.serverurl)
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

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const mapRecords = (records = []) =>
    records.map((item) => {
      const transactiontype = item.transactiontype;
      const amount = Number(item.amount) || 0;
      const isDebit = ['D', 'Topup', 'Y', 'I'].includes(transactiontype);
      return {
        ...item,
        DB: isDebit ? amount : 0,
        CR: isDebit ? 0 : amount,
        fee: Number(item.fee) || 0,
      };
    });

  const decodeRecord = (record) =>
    Object.entries(record || {}).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        try {
          acc[key] = decodeURIComponent(value);
        } catch (_) {
          acc[key] = value;
        }
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

  const fetchList = async ({ silent = false } = {}) => {
    const start = dateRange?.[0]?.startDate;
    const end = dateRange?.[0]?.endDate;
    if (!start || !end) {
      showNotification({
        title: 'Validation',
        message: 'Please select a date range',
        color: 'yellow',
      });
      return;
    }

    const diffDays = dayjs(end)
      .startOf('day')
      .diff(dayjs(start).startOf('day'), 'day');
    if (diffDays > 1) {
      showNotification({
        title: 'Validation',
        message: 'The selected day range is maximum of 2 days',
        color: 'yellow',
      });
      return;
    }

    silent ? setRefreshing(true) : setLoading(true);

    try {
      const payloadDate = dayjs(start).format('YYYY-MM-DD');
      const payloadDateTo = dayjs(end).format('YYYY-MM-DD');
      const response = await depositAPI.getPendingList(
        payloadDate,
        payloadDateTo,
        status
      );

      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(payload.records) ? payload.records : [];
          const decoded = records.map(decodeRecord);
          setData(mapRecords(decoded));
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load deposit list',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load deposit list',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Deposit list fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load deposit list',
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

  const handleFailSelected = async () => {
    if (selectedKeys.length === 0) {
      showNotification({
        title: 'Info',
        message: 'Select at least one row first',
        color: 'blue',
      });
      return;
    }

    const items = data.filter((item) => selectedKeys.includes(makeKey(item)));

    setLoading(true);
    try {
      const response = await depositAPI.failBulk(items);
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: payload.message || 'Selected items marked as failed',
            color: 'green',
          });
          fetchList({ silent: true });
          setSelectedKeys([]);
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to update selected items',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update selected items',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Fail selected error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update selected items',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalDebit = useMemo(
    () => data.reduce((acc, curr) => acc + (Number(curr.DB) || 0), 0),
    [data]
  );
  const totalCredit = useMemo(
    () => data.reduce((acc, curr) => acc + (Number(curr.CR) || 0), 0),
    [data]
  );
  const totalFee = useMemo(
    () => data.reduce((acc, curr) => acc + (Number(curr.fee) || 0), 0),
    [data]
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
                Deposit List
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Pending and recent deposits
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
                  label="Status"
                  data={statusOptions}
                  value={status}
                  onChange={(val) => setStatus(val || 'A')}
                  style={{ minWidth: 180 }}
                />
                <Button
                  onClick={() => fetchList()}
                  leftSection={<IconChecklist size={18} />}
                  radius="md"
                  color="blue"
                >
                  Apply
                </Button>
              </Group>

              <Divider />

              <SimpleGrid
                cols={3}
                spacing="sm"
                breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
              >
                <Card
                  withBorder
                  padding="md"
                  radius="md"
                  shadow="xs"
                >
                  <Group
                    justify="space-between"
                    align="center"
                  >
                    <Text
                      size="sm"
                      c="dimmed"
                    >
                      Total Debit
                    </Text>
                    <IconArrowDownCircle
                      size={16}
                      color="blue"
                    />
                  </Group>
                  <Text
                    fw={700}
                    size="lg"
                  >
                    {formatNumber(totalDebit)}
                  </Text>
                </Card>
                <Card
                  withBorder
                  padding="md"
                  radius="md"
                  shadow="xs"
                >
                  <Group
                    justify="space-between"
                    align="center"
                  >
                    <Text
                      size="sm"
                      c="dimmed"
                    >
                      Total Credit
                    </Text>
                    <IconArrowDownCircle
                      size={16}
                      color="teal"
                    />
                  </Group>
                  <Text
                    fw={700}
                    size="lg"
                  >
                    {formatNumber(totalCredit)}
                  </Text>
                </Card>
                <Card
                  withBorder
                  padding="md"
                  radius="md"
                  shadow="xs"
                >
                  <Group
                    justify="space-between"
                    align="center"
                  >
                    <Text
                      size="sm"
                      c="dimmed"
                    >
                      Total Fee
                    </Text>
                    <IconBolt
                      size={16}
                      color="orange"
                    />
                  </Group>
                  <Text
                    fw={700}
                    size="lg"
                  >
                    {formatNumber(totalFee)}
                  </Text>
                </Card>
              </SimpleGrid>
            </Stack>
          </Card>

          <Group
            justify="space-between"
            align="center"
            wrap="wrap"
          >
            <Group gap="xs">
              <Button
                leftSection={<IconAlertTriangle size={18} />}
                variant="light"
                color="red"
                radius="md"
                onClick={handleFailSelected}
              >
                Fail Selected
              </Button>
              <Badge
                variant="light"
                color="gray"
              >
                Selected: {selectedKeys.length}
              </Badge>
              <Badge
                variant="light"
                color="blue"
              >
                Rows: {data.length}
              </Badge>
            </Group>
          </Group>

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

export default DepositPendingList;
