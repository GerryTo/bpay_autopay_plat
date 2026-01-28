import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Badge,
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
  IconArrowUpCircle,
  IconBolt,
  IconCalendar,
  IconChecklist,
  IconFilter,
  IconRefresh,
} from '@tabler/icons-react';
import { transactionAPI, withdrawAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  id: '',
  merchantcode: '',
  customercode: '',
  bankcode: '',
  status: '',
  transactionid: '',
  dstbankaccount: '',
  accountname: '',
  accountno: '',
  sourceaccountname: '',
  sourcebankcode: '',
  notes2: '',
  notes3: '',
  memo: '',
  memo2: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const WithdrawList = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
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
        key: 'id',
        label: 'Future ID',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.id}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter id..."
            size="xs"
            value={columnFilters.id}
            onChange={(e) => handleFilterChange('id', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'insert',
        label: 'System Timestamp',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.insert}</Text>,
      },
      {
        key: 'completedate',
        label: 'Complete Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.completedate || '-'}</Text>,
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
        key: 'customercode',
        label: 'Customer',
        minWidth: 120,
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
        minWidth: 90,
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
        key: 'amount',
        label: 'Amount',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.amount)}
          </Text>
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
        key: 'timestamp',
        label: 'Client Timestamp',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.timestamp || '-'}</Text>,
      },
      {
        key: 'originaldate',
        label: 'Original Timestamp',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.originaldate || '-'}</Text>,
      },
      {
        key: 'transactionid',
        label: 'Transaction ID',
        minWidth: 150,
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
        key: 'dstbankaccount',
        label: 'Dest Bank Account',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.dstbankaccount || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dest bank..."
            size="xs"
            value={columnFilters.dstbankaccount}
            onChange={(e) =>
              handleFilterChange('dstbankaccount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountname',
        label: 'Dest Account Name',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.accountname || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dest name..."
            size="xs"
            value={columnFilters.accountname}
            onChange={(e) =>
              handleFilterChange('accountname', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountno',
        label: 'Source Account',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.accountno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter src account..."
            size="xs"
            value={columnFilters.accountno}
            onChange={(e) =>
              handleFilterChange('accountno', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'sourceaccountname',
        label: 'Source Account Name',
        minWidth: 180,
        render: (item) => (
          <Text size="sm">{item.sourceaccountname || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter src name..."
            size="xs"
            value={columnFilters.sourceaccountname}
            onChange={(e) =>
              handleFilterChange('sourceaccountname', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'sourcebankcode',
        label: 'Source Bank',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.sourcebankcode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter src bank..."
            size="xs"
            value={columnFilters.sourcebankcode}
            onChange={(e) =>
              handleFilterChange('sourcebankcode', e.currentTarget.value)
            }
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
        key: 'memo',
        label: 'Memo',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.memo || '-'}</Text>,
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
        key: 'memo2',
        label: 'Memo 2',
        minWidth: 140,
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
        key: 'actions',
        label: 'Action',
        minWidth: 260,
        render: (item) => (
          <Group
            gap="xs"
            wrap="nowrap"
          >
            {item.status === 'Pending' ? (
              <Button
                size="xs"
                variant="light"
                onClick={() => handleCheck(item)}
              >
                Check
              </Button>
            ) : null}
            {item.status === 'Order need to check' ? (
              <>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => handleFail(item)}
                >
                  Fail
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="yellow"
                  onClick={() => handleSuccess(item)}
                >
                  Success
                </Button>
              </>
            ) : null}
            <Button
              size="xs"
              variant="light"
              onClick={() => handleUpdateMemo2(item)}
            >
              Update Memo 2
            </Button>
          </Group>
        ),
      },
    ],
    [
      columnFilters,
      handleCheck,
      handleFail,
      handleFilterChange,
      handleSuccess,
      handleUpdateMemo2,
    ]
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

  const makeKey = (item) => `${item.id || ''}-${item.transactionid || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.id, columnFilters.id) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.customercode, columnFilters.customercode) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.status, columnFilters.status) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.dstbankaccount, columnFilters.dstbankaccount) &&
          includesValue(item.accountname, columnFilters.accountname) &&
          includesValue(item.accountno, columnFilters.accountno) &&
          includesValue(
            item.sourceaccountname,
            columnFilters.sourceaccountname
          ) &&
          includesValue(item.sourcebankcode, columnFilters.sourcebankcode) &&
          includesValue(item.notes2, columnFilters.notes2) &&
          includesValue(item.notes3, columnFilters.notes3) &&
          includesValue(item.memo, columnFilters.memo) &&
          includesValue(item.memo2, columnFilters.memo2)
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

  const mapRecords = (records = []) =>
    records.map((item) => ({
      ...item,
      id: item.id ?? item.futuretrxid ?? '',
      amount: Number(item.amount) || 0,
      fee: Number(item.fee) || 0,
    }));

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
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
      if (diffDays > 30) {
        showNotification({
          title: 'Validation',
          message: 'Maximum date range is 31 days',
          color: 'yellow',
        });
        return;
      }

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const payloadDateFrom = dayjs(start).format('YYYY-MM-DD');
        const payloadDateTo = dayjs(end).format('YYYY-MM-DD');
        const response = await withdrawAPI.getList(
          payloadDateFrom,
          payloadDateTo
        );

        if (response.success && response.data) {
          const payload = response.data;
          if ((payload.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payload.records)
              ? payload.records
              : [];
            const decoded = records.map(decodeRecord);
            setData(mapRecords(decoded));
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load withdraw list',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load withdraw list',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Withdraw list fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load withdraw list',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange]
  );

  const isHistoryDate = (date) => {
    if (!date) return false;
    const selected = dayjs(date).startOf('day');
    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');
    return !selected.isSame(today) && !selected.isSame(yesterday);
  };

  async function handleUpdateMemo2(item) {
    const futuretrxid = item?.id ?? item?.futuretrxid ?? '';
    if (!futuretrxid) {
      showNotification({
        title: 'Validation',
        message: 'Future ID is missing',
        color: 'yellow',
      });
      return;
    }

    const memo2 = window.prompt(
      `Update memo2 for [${futuretrxid}]`,
      String(item?.memo2 ?? '')
    );
    if (memo2 === null) return;

    setLoading(true);
    try {
      const ishistory = isHistoryDate(dateRange?.[0]?.startDate);
      const response = await transactionAPI.updateMemo2ByFutureTrxId({
        futuretrxid,
        memo2,
        ishistory,
      });

      if (response.success && response.data) {
        const status = String(response.data.status ?? '').toLowerCase();
        if (status === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Memo2 updated',
            color: 'green',
          });
          await fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to update memo2',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update memo2',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Update memo2 error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update memo2',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCheck(item) {
    const id = item?.id ?? '';
    if (!id) {
      showNotification({
        title: 'Validation',
        message: 'Future ID is missing',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await withdrawAPI.checkWithdrawList(id);
      if (response.success && response.data) {
        const status = String(response.data.status ?? '').toLowerCase();
        if (status === 'ok') {
          await fetchList({ silent: true });
          showNotification({
            title: 'Success',
            message: response.data.message || 'Withdraw checked',
            color: 'green',
          });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to check withdraw',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to check withdraw',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Withdraw check error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to check withdraw',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleFail(item) {
    const id = item?.id ?? '';
    if (!id) {
      showNotification({
        title: 'Validation',
        message: 'Future ID is missing',
        color: 'yellow',
      });
      return;
    }

    if (!window.confirm(`Are you sure want to fail [${id}]?`)) return;

    const memo = window.prompt('Fail memo (optional)', '');
    if (memo === null) return;

    setLoading(true);
    try {
      const response = await transactionAPI.updateManualTransaction({
        id,
        status: 'C',
        accountdest: '',
        memo,
      });

      if (response.success && response.data) {
        const status = String(response.data.status ?? '').toLowerCase();
        if (status === 'ok') {
          await fetchList({ silent: true });
          showNotification({
            title: 'Success',
            message: response.data.message || 'Withdraw failed',
            color: 'green',
          });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to fail withdraw',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to fail withdraw',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Withdraw fail error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to fail withdraw',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSuccess(item) {
    const id = item?.id ?? '';
    if (!id) {
      showNotification({
        title: 'Validation',
        message: 'Future ID is missing',
        color: 'yellow',
      });
      return;
    }

    const bankcode = window.prompt('Bank code', String(item?.bankcode ?? ''));
    if (bankcode === null) return;
    if (!bankcode.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Bank code is required',
        color: 'yellow',
      });
      return;
    }

    const account = window.prompt(
      'Destination account',
      String(item?.dstbankaccount ?? '')
    );
    if (account === null) return;
    if (!account.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Destination account is required',
        color: 'yellow',
      });
      return;
    }

    const receipt = window.prompt('Receipt (optional)', '') ?? '';

    setLoading(true);
    try {
      const response = await transactionAPI.setTransactionSuccessByFutureTrxId({
        id,
        bankcode,
        account,
        receipt,
      });

      if (response.success && response.data) {
        const status = String(response.data.status ?? '').toLowerCase();
        if (status === 'ok') {
          await fetchList({ silent: true });
          showNotification({
            title: 'Success',
            message: response.data.message || 'Withdraw marked as success',
            color: 'green',
          });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to mark success',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to mark success',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Withdraw success error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to mark success',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, [fetchList]);

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

  const totalAmount = useMemo(
    () => data.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
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
                Withdraw List
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Withdraw monitoring
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

                <Button
                  onClick={() => fetchList()}
                  leftSection={<IconChecklist size={18} />}
                  radius="md"
                  color="blue"
                >
                  Apply
                </Button>
              </Group>

              {/* <Divider />

              <SimpleGrid
                cols={2}
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
                      Total Amount
                    </Text>
                    <IconArrowUpCircle
                      size={16}
                      color="blue"
                    />
                  </Group>
                  <Text
                    fw={700}
                    size="lg"
                  >
                    {formatNumber(totalAmount)}
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
              </SimpleGrid> */}
            </Stack>
          </Card>

          <Group
            justify="space-between"
            align="center"
            wrap="wrap"
          >
            <Group gap="xs">
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
                        style={{ minWidth: col.minWidth || 120, padding: '8px' }}
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

export default WithdrawList;
