import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
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
  futuretrxid: '',
  insert: '',
  merchantcode: '',
  transactionid: '',
  bankcode: '',
  trxid: '',
  phonenumber: '',
  amount: '',
  smsbank: '',
  smsinsert: '',
  customerphone: '',
  servicecenter: '',
  transactionType: '',
  smsamount: '',
  actualagent: '',
  reason: '',
  suspectedReason: '',
  memo: '',
  memo3: '',
  flag3: '',
};

const formatNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value || '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const SmsFailedMatch = () => {
  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: 'selection' },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [history, setHistory] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState(new Set());

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
    setHistory(false);
    setData([]);
    setSelectedKeys(new Set());
  };

  const makeKey = (item) =>
    `${item.futuretrxid || ''}-${item.trxid || ''}-${item.transactionid || ''}`;

  const toggleSelect = (item) => {
    const key = makeKey(item);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (next.size >= 20) {
          showNotification({
            title: 'Limit',
            message: 'Selection is limited to 20 items.',
            color: 'yellow',
          });
          return next;
        }
        next.add(key);
      }
      return next;
    });
  };

  const columns = useMemo(
    () => [
      {
        key: 'select',
        label: '',
        minWidth: 70,
        render: (item) => (
          <Checkbox
            aria-label="Select row"
            checked={selectedKeys.has(makeKey(item))}
            onChange={() => toggleSelect(item)}
          />
        ),
      },
      {
        key: 'futuretrxid',
        label: 'Future Trx ID',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.futuretrxid || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter future trx..."
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
        label: 'Timestamp',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.insert || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp..."
            size="xs"
            value={columnFilters.insert}
            onChange={(e) =>
              handleFilterChange('insert', e.currentTarget.value)
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
        key: 'transactionid',
        label: 'TransactionID/Reference',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.transactionid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter transaction/ref..."
            size="xs"
            value={columnFilters.transactionid}
            onChange={(e) =>
              handleFilterChange('transactionid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'bankcode',
        label: 'Bank',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.bankcode || '-'}</Text>,
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
        key: 'trxid',
        label: 'Trx ID',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.trxid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={columnFilters.trxid}
            onChange={(e) => handleFilterChange('trxid', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'phonenumber',
        label: 'Customer Phone (Trans)',
        minWidth: 150,
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
        key: 'amount',
        label: 'Amount',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.amount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter amount..."
            size="xs"
            value={columnFilters.amount}
            onChange={(e) =>
              handleFilterChange('amount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'smsbank',
        label: 'Bank (SMS)',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.smsbank || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter SMS bank..."
            size="xs"
            value={columnFilters.smsbank}
            onChange={(e) =>
              handleFilterChange('smsbank', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'smsinsert',
        label: 'Timestamp (SMS)',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.smsinsert || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter SMS timestamp..."
            size="xs"
            value={columnFilters.smsinsert}
            onChange={(e) =>
              handleFilterChange('smsinsert', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'customerphone',
        label: 'Customer Phone (SMS)',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.customerphone || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter SMS phone..."
            size="xs"
            value={columnFilters.customerphone}
            onChange={(e) =>
              handleFilterChange('customerphone', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'servicecenter',
        label: 'Service Center (SMS)',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.servicecenter || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter service center..."
            size="xs"
            value={columnFilters.servicecenter}
            onChange={(e) =>
              handleFilterChange('servicecenter', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'transactionType',
        label: 'Trans. Type',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.transactionType || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trans type..."
            size="xs"
            value={columnFilters.transactionType}
            onChange={(e) =>
              handleFilterChange('transactionType', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'smsamount',
        label: 'Amount (SMS)',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.smsamount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter SMS amount..."
            size="xs"
            value={columnFilters.smsamount}
            onChange={(e) =>
              handleFilterChange('smsamount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'actualagent',
        label: 'Actual Agent',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.actualagent || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.actualagent}
            onChange={(e) =>
              handleFilterChange('actualagent', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'reason',
        label: 'Reason',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
          >
            {item.reason || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter reason..."
            size="xs"
            value={columnFilters.reason}
            onChange={(e) =>
              handleFilterChange('reason', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'suspectedReason',
        label: 'Suspected Reason',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
          >
            {item.suspectedReason || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter suspected reason..."
            size="xs"
            value={columnFilters.suspectedReason}
            onChange={(e) =>
              handleFilterChange('suspectedReason', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'memo',
        label: 'Memo',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
          >
            {item.memo || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter memo..."
            size="xs"
            value={columnFilters.memo}
            onChange={(e) => handleFilterChange('memo', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'memo3',
        label: 'Matching Detail',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
          >
            {item.memo3 || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter matching detail..."
            size="xs"
            value={columnFilters.memo3}
            onChange={(e) => handleFilterChange('memo3', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'flag3',
        label: 'Reason Matching',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
          >
            {item.flag3 || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter reason matching..."
            size="xs"
            value={columnFilters.flag3}
            onChange={(e) => handleFilterChange('flag3', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: 200,
        render: (item) => (
          <Group
            gap={6}
            wrap="wrap"
          >
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => handleMatch(item)}
            >
              Match
            </Button>
            <Button
              size="xs"
              variant="light"
              color="orange"
              disabled={item.futuretrxid && item.futuretrxid !== ''}
              onClick={() => handleExpire(item)}
            >
              Expire
            </Button>
          </Group>
        ),
      },
    ],
    [columnFilters, handleFilterChange, selectedKeys],
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
          includesValue(item.futuretrxid, columnFilters.futuretrxid) &&
          includesValue(item.insert, columnFilters.insert) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.trxid, columnFilters.trxid) &&
          includesValue(item.phonenumber, columnFilters.phonenumber) &&
          includesValue(item.amount, columnFilters.amount) &&
          includesValue(item.smsbank, columnFilters.smsbank) &&
          includesValue(item.smsinsert, columnFilters.smsinsert) &&
          includesValue(item.customerphone, columnFilters.customerphone) &&
          includesValue(item.servicecenter, columnFilters.servicecenter) &&
          includesValue(item.transactionType, columnFilters.transactionType) &&
          includesValue(item.smsamount, columnFilters.smsamount) &&
          includesValue(item.actualagent, columnFilters.actualagent) &&
          includesValue(item.reason, columnFilters.reason) &&
          includesValue(item.suspectedReason, columnFilters.suspectedReason) &&
          includesValue(item.memo, columnFilters.memo) &&
          includesValue(item.memo3, columnFilters.memo3) &&
          includesValue(item.flag3, columnFilters.flag3)
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
      'YYYY-MM-DD',
    )} 00:00:00`;
    const to = `${dayjs(dateRange[0].endDate).format('YYYY-MM-DD')} 23:59:59`;

    silent ? setRefreshing(true) : setLoading(true);

    try {
      const response = await smsAPI.getFailedMatchList({
        datefrom: from,
        dateto: to,
        history,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records)
            ? response.data.records
            : [];
          setData(records);
          setSelectedKeys(new Set());
        } else {
          showNotification({
            title: 'Error',
            message:
              response.data.message || 'Failed to load SMS failed match data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load SMS failed match data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('SMS failed match fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load SMS failed match data',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const selectedItems = useMemo(() => {
    const map = new Map();
    data.forEach((item) => {
      const key = makeKey(item);
      if (selectedKeys.has(key)) {
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  }, [data, selectedKeys]);

  const handleBulkFail = async () => {
    if (selectedItems.length === 0) {
      showNotification({
        title: 'Validation',
        message: 'Please select at least one row',
        color: 'yellow',
      });
      return;
    }
    const confirmed = window.confirm(
      `Fail ${selectedItems.length} transaction(s)?`,
    );
    if (!confirmed) return;
    setRefreshing(true);
    try {
      const response = await smsAPI.bulkFailFailedMatch(selectedItems);
      const status =
        response.data?.status || response.data?.status?.toLowerCase?.();
      if ((status || '').toLowerCase() === 'ok') {
        showNotification({
          title: 'Success',
          message: 'Bulk fail completed',
          color: 'green',
        });
        fetchData({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: response.data?.message || 'Failed bulk fail',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Bulk fail error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to run bulk fail',
        color: 'red',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleBulkSuccess = async () => {
    if (selectedItems.length === 0) {
      showNotification({
        title: 'Validation',
        message: 'Please select at least one row',
        color: 'yellow',
      });
      return;
    }
    const confirmed = window.confirm(
      `Mark ${selectedItems.length} transaction(s) as success?`,
    );
    if (!confirmed) return;
    setRefreshing(true);
    try {
      const response = await smsAPI.bulkSuccessFailedMatch(selectedItems);
      const status =
        response.data?.status || response.data?.status?.toLowerCase?.();
      if ((status || '').toLowerCase() === 'ok') {
        showNotification({
          title: 'Success',
          message: 'Bulk success completed',
          color: 'green',
        });
        fetchData({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: response.data?.message || 'Failed bulk success',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Bulk success error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to run bulk success',
        color: 'red',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExpire = async (item) => {
    const confirmed = window.confirm('Expire this SMS?');
    if (!confirmed) return;

    setRefreshing(true);
    try {
      const response = await smsAPI.expireSms({
        amount: item.smsamount,
        bank: item.smsbank,
        trxid: item.trxid,
        phonenumber: item.customerphone,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: 'SMS expired',
            color: 'green',
          });
          fetchData({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to expire SMS',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to expire SMS',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('SMS expire error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to expire SMS',
        color: 'red',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleMatch = async (item) => {
    const futuretrxid = window.prompt('Enter Future Trx ID to match with');
    if (!futuretrxid) return;

    setRefreshing(true);
    try {
      const response = await smsAPI.matchSms({
        futuretrxid,
        amount: item.amount,
        bank: item.bankcode,
        trxid: item.trxid,
        phonenumber: item.customerphone,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: 'SMS matched successfully',
            color: 'green',
          });
          fetchData({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to match SMS',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to match SMS',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('SMS match error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to match SMS',
        color: 'red',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, item) => {
          acc.rows += 1;
          acc.amount += Number(item.amount) || 0;
          acc.smsamount += Number(item.smsamount) || 0;
          return acc;
        },
        { rows: 0, amount: 0, smsamount: 0 },
      ),
    [filteredData],
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
                  SMS Failed Match
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Review failed SMS matches by date range. Totals are shown in the
                footer.
              </Text>
            </Stack>

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
                onClick={handleResetAll}
              >
                Reset Filters
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

              <Checkbox
                label="Include History"
                checked={history}
                onChange={(e) => setHistory(e.currentTarget.checked)}
              />
              {/* <Group gap="xs">
                <Button
                  leftSection={<IconSearch size={18} />}
                  color="blue"
                  radius="md"
                  onClick={() => fetchData()}
                >
                  Search
                </Button>
                <Button
                  variant="light"
                  color="orange"
                  radius="md"
                  size="sm"
                  onClick={handleBulkFail}
                >
                  Bulk Fail
                </Button>
                <Button
                  variant="light"
                  color="green"
                  radius="md"
                  size="sm"
                  onClick={handleBulkSuccess}
                >
                  Bulk Success
                </Button>
              </Group> */}
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
                          {col.key !== 'select' && (
                            <ColumnActionMenu
                              columnKey={col.key}
                              sortConfig={sortConfig}
                              onSort={handleSort}
                              onHide={handleHideColumn}
                            />
                          )}
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
                      <Table.Tr key={`${makeKey(item)}-${idx}`}>
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
                    {visibleColumns.map((col, index) => {
                      if (col.key === 'amount') {
                        return (
                          <Table.Th key={`${col.key}-footer`} style={{ textAlign: 'right' }}>
                            {formatNumber(totals.amount)}
                          </Table.Th>
                        );
                      }
                      if (col.key === 'smsamount') {
                        return (
                          <Table.Th key={`${col.key}-footer`} style={{ textAlign: 'right' }}>
                            {formatNumber(totals.smsamount)}
                          </Table.Th>
                        );
                      }
                      if (index === 0) {
                        return <Table.Th key={`${col.key}-footer`}>Totals (Rows: {totals.rows})</Table.Th>;
                      }
                      return <Table.Th key={`${col.key}-footer`} />;
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

export default SmsFailedMatch;
