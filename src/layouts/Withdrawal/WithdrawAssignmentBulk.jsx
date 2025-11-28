import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  MultiSelect,
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
  IconUserShield,
} from '@tabler/icons-react';
import { withdrawAPI, merchantAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const hourOptions = [
  '00.00-00.29',
  '00.30-00.59',
  '01.00-01.29',
  '01.30-01.59',
  '02.00-02.29',
  '02.30-02.59',
  '03.00-03.29',
  '03.30-03.59',
  '04.00-04.29',
  '04.30-04.59',
  '05.00-05.29',
  '05.30-05.59',
  '06.00-06.29',
  '06.30-06.59',
  '07.00-07.29',
  '07.30-07.59',
  '08.00-08.29',
  '08.30-08.59',
  '09.00-09.29',
  '09.30-09.59',
  '10.00-10.29',
  '10.30-10.59',
  '11.00-11.29',
  '11.30-11.59',
  '12.00-12.29',
  '12.30-12.59',
  '13.00-13.29',
  '13.30-13.59',
  '14.00-14.29',
  '14.30-14.59',
  '15.00-15.29',
  '15.30-15.59',
  '16.00-16.29',
  '16.30-16.59',
  '17.00-17.29',
  '17.30-17.59',
  '18.00-18.29',
  '18.30-18.59',
  '19.00-19.29',
  '19.30-19.59',
  '20.00-20.29',
  '20.30-20.59',
  '21.00-21.29',
  '21.30-21.59',
  '22.00-22.29',
  '22.30-22.59',
  '23.00-23.29',
  '23.30-23.59',
];

const defaultFilters = {
  id: '',
  insert: '',
  merchantcode: '',
  customercode: '',
  bankcode: '',
  amount: '',
  timestamp: '',
  dstbankaccount: '',
  transactionid: '',
  accountname: '',
  sourcebankcode: '',
  accountno: '',
  sourceaccountname: '',
  originaldate: '',
  fee: '',
  status: '',
  notes2: '',
  notes3: '',
  finalstatusdesc: '',
  agentAlias: '',
  assignStatusDesc: '',
  note: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const WithdrawAssignmentBulk = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [hourRange, setHourRange] = useState(hourOptions[0]);
  const [merchantFilter, setMerchantFilter] = useState([]);
  const [merchantOptions, setMerchantOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [bankCode, setBankCode] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignForm, setAssignForm] = useState({
    accountNo: '',
    bankCode: '',
    accountName: '',
    username: '',
  });

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'Future ID',
        minWidth: 120,
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
        minWidth: 130,
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
        minWidth: 100,
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
        minWidth: 120,
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
        key: 'timestamp',
        label: 'Client Timestamp',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.timestamp || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter client ts..."
            size="xs"
            value={columnFilters.timestamp}
            onChange={(e) =>
              handleFilterChange('timestamp', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'dstbankaccount',
        label: 'Dest Bank Account',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.dstbankaccount || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dest acc..."
            size="xs"
            value={columnFilters.dstbankaccount}
            onChange={(e) =>
              handleFilterChange('dstbankaccount', e.currentTarget.value)
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
        key: 'accountname',
        label: 'Dest Account Name',
        minWidth: 170,
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
        key: 'originaldate',
        label: 'Original Timestamp',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.originaldate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter original..."
            size="xs"
            value={columnFilters.originaldate}
            onChange={(e) =>
              handleFilterChange('originaldate', e.currentTarget.value)
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
        filter: (
          <TextInput
            placeholder="Filter fee..."
            size="xs"
            value={columnFilters.fee}
            onChange={(e) => handleFilterChange('fee', e.currentTarget.value)}
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
        key: 'finalstatusdesc',
        label: 'Final Status',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.finalstatusdesc || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter final status..."
            size="xs"
            value={columnFilters.finalstatusdesc}
            onChange={(e) =>
              handleFilterChange('finalstatusdesc', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'agentAlias',
        label: 'Agent Assign',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.agentAlias || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.agentAlias}
            onChange={(e) =>
              handleFilterChange('agentAlias', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'assignStatusDesc',
        label: 'Status Assign',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.assignStatusDesc || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter status assign..."
            size="xs"
            value={columnFilters.assignStatusDesc}
            onChange={(e) =>
              handleFilterChange('assignStatusDesc', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'note',
        label: 'Note',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.note || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter note..."
            size="xs"
            value={columnFilters.note}
            onChange={(e) => handleFilterChange('note', e.currentTarget.value)}
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
          includesValue(item.insert, columnFilters.insert) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.customercode, columnFilters.customercode) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.amount, columnFilters.amount) &&
          includesValue(item.timestamp, columnFilters.timestamp) &&
          includesValue(item.dstbankaccount, columnFilters.dstbankaccount) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.accountname, columnFilters.accountname) &&
          includesValue(item.sourcebankcode, columnFilters.sourcebankcode) &&
          includesValue(item.accountno, columnFilters.accountno) &&
          includesValue(
            item.sourceaccountname,
            columnFilters.sourceaccountname
          ) &&
          includesValue(item.originaldate, columnFilters.originaldate) &&
          includesValue(item.fee, columnFilters.fee) &&
          includesValue(item.status, columnFilters.status) &&
          includesValue(item.notes2, columnFilters.notes2) &&
          includesValue(item.notes3, columnFilters.notes3) &&
          includesValue(item.finalstatusdesc, columnFilters.finalstatusdesc) &&
          includesValue(item.agentAlias, columnFilters.agentAlias) &&
          includesValue(
            item.assignStatusDesc,
            columnFilters.assignStatusDesc
          ) &&
          includesValue(item.note, columnFilters.note)
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

  const toggleRow = (item) => {
    const key = makeKey(item);
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleAllOnPage = () => {
    setSelectedKeys((prev) => {
      if (pageFullySelected) {
        return prev.filter((key) => !pageKeys.includes(key));
      }
      const additions = pageKeys.filter((key) => !prev.includes(key));
      return [...prev, ...additions];
    });
  };

  const resetSelections = () => setSelectedKeys([]);

  const selectedItems = useMemo(
    () => data.filter((item) => selectedKeys.includes(makeKey(item))),
    [data, selectedKeys]
  );

  const handleResetFiltersAll = () => {
    const now = new Date();
    setDateRange([
      {
        startDate: now,
        endDate: now,
        key: 'selection',
      },
    ]);
    setHourRange(hourOptions[0]);
    setMerchantFilter([]);
    setBankCode('');
    handleResetAll();
  };

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

  const fetchMerchants = useCallback(async () => {
    const response = await merchantAPI.getMerchantList();
    if (response.success && response.data) {
      const payload = response.data;
      if ((payload.status || '').toLowerCase() === 'ok') {
        const options = (payload.records || []).map((item) => ({
          value: item.merchantcode,
          label: `${item.merchantcode} - ${item.merchantname}`,
        }));
        setMerchantOptions(options);
      }
    }
  }, []);

  const fetchBanks = useCallback(async () => {
    const response = await withdrawAPI.getWithdrawBanks();
    if (response.success && response.data) {
      const payload = response.data;
      if ((payload.status || '').toLowerCase() === 'ok') {
        const options = (payload.records || []).map((item) => ({
          value: item.bankCode || item.bankcode || item.bank_code,
          label: item.bankCode || item.bankcode || item.bank_code,
        }));
        setBankOptions(options.filter((opt) => opt.value));
      }
    }
  }, []);

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      const start = dateRange?.[0]?.startDate;
      if (!start) {
        showNotification({
          title: 'Validation',
          message: 'Please select a date',
          color: 'yellow',
        });
        return;
      }
      if (!bankCode) {
        showNotification({
          title: 'Validation',
          message: 'Please choose bank code',
          color: 'yellow',
        });
        return;
      }

      const [hourfromRaw = '00.00', hourtoRaw = '23.59'] = (
        hourRange || '00.00-23.59'
      ).split('-');
      const hourfrom = hourfromRaw.replace('.', ':');
      const hourto = hourtoRaw.replace('.', ':');

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const payloadDate = dayjs(start).format('YYYY-MM-DD');
        const response = await withdrawAPI.getWithdrawNtcFilter({
          datefrom: payloadDate,
          dateto: payloadDate,
          hourfrom,
          hourto,
          merchant: merchantFilter.length ? merchantFilter : 'all',
          history: false,
          filter: 'pending',
          bankCode,
        });

        if (response.success && response.data) {
          const payload = response.data;
          if ((payload.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payload.records)
              ? payload.records
              : [];
            const decoded = records.map(decodeRecord);
            setData(mapRecords(decoded));
            setSelectedKeys([]);
          } else {
            showNotification({
              title: 'Error',
              message:
                payload.message ||
                'Failed to load withdraw assignment bulk list',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message:
              response.error || 'Failed to load withdraw assignment bulk list',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Withdraw assignment bulk list fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load withdraw assignment bulk list',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, hourRange, merchantFilter, bankCode]
  );

  useEffect(() => {
    fetchMerchants();
    fetchBanks();
  }, [fetchMerchants, fetchBanks]);

  useEffect(() => {
    if (bankCode) {
      fetchList();
    }
  }, [fetchList, bankCode]);

  const openAssignModal = () => {
    if (selectedKeys.length === 0) {
      showNotification({
        title: 'Validation',
        message: 'Please select withdraw rows first',
        color: 'yellow',
      });
      return;
    }
    setAssignForm((prev) => ({
      accountNo: '',
      bankCode: bankCode || '',
      accountName: '',
      username: '',
    }));
    setAssignModalOpen(true);
  };

  const handleBulkAssign = async () => {
    const {
      accountNo,
      bankCode: assignBank,
      accountName,
      username,
    } = assignForm;
    if (!accountNo || !assignBank || !accountName || !username) {
      showNotification({
        title: 'Validation',
        message: 'Please complete assignment fields',
        color: 'yellow',
      });
      return;
    }
    if (selectedItems.length === 0) {
      showNotification({
        title: 'Validation',
        message: 'No selected rows to assign',
        color: 'yellow',
      });
      return;
    }

    setAssigning(true);
    try {
      const jobs = selectedItems.map((item) =>
        withdrawAPI.assignWithdraw({
          id: item.id,
          accountNo,
          bankCode: assignBank,
          accountName,
          username,
        })
      );
      const results = await Promise.all(jobs);

      const failures = results.filter(
        (res) =>
          !res.success ||
          !res.data ||
          (res.data.status || '').toLowerCase() !== 'ok'
      );

      if (failures.length) {
        const message =
          failures[0]?.data?.message ||
          failures[0]?.error ||
          'Some assignments failed';
        showNotification({
          title: 'Partial Error',
          message,
          color: 'red',
        });
      } else {
        showNotification({
          title: 'Success',
          message: 'Assignment saved for selected rows',
          color: 'green',
        });
        setAssignModalOpen(false);
        setSelectedKeys([]);
        fetchList({ silent: true });
      }
    } catch (error) {
      console.error('Bulk assign withdraw error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to assign selected withdraw rows',
        color: 'red',
      });
    } finally {
      setAssigning(false);
    }
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
                Withdraw Assignment Bulk
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Assign multiple withdraw need-to-check items
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
                onClick={handleResetFiltersAll}
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

                <Select
                  label="Hour Range"
                  data={hourOptions.map((opt) => ({ value: opt, label: opt }))}
                  value={hourRange}
                  onChange={(val) => setHourRange(val || hourOptions[0])}
                  style={{ minWidth: 180 }}
                />

                <Select
                  label="Bank"
                  placeholder="Select bank"
                  data={bankOptions}
                  value={bankCode}
                  onChange={(val) => setBankCode(val || '')}
                  searchable
                  clearable
                  style={{ minWidth: 200 }}
                />

                <MultiSelect
                  label="Merchant"
                  placeholder="All merchants"
                  data={merchantOptions}
                  value={merchantFilter}
                  onChange={setMerchantFilter}
                  searchable
                  clearable
                  style={{ minWidth: 260 }}
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

              <Group gap="sm">
                <Badge
                  variant="light"
                  color="blue"
                >
                  Selected: {selectedKeys.length}
                </Badge>
                <Badge
                  variant="light"
                  color="gray"
                >
                  Records: {data.length}
                </Badge>
              </Group>
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
                color="blue"
              >
                Selected: {selectedKeys.length}
              </Badge>
              <Badge
                variant="light"
                color="gray"
              >
                Rows: {data.length}
              </Badge>
            </Group>

            <Group gap="xs">
              <Button
                variant="light"
                color="red"
                size="sm"
                onClick={resetSelections}
              >
                Clear Selection
              </Button>
              <Button
                leftSection={<IconUserShield size={18} />}
                color="blue"
                onClick={openAssignModal}
              >
                Assign Selected
              </Button>
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

      <Modal
        opened={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Selected Withdraw"
        centered
      >
        <Stack gap="sm">
          <Text
            size="sm"
            c="dimmed"
          >
            Items selected: {selectedItems.length}
          </Text>
          <TextInput
            label="Account No"
            value={assignForm.accountNo}
            onChange={(e) =>
              setAssignForm((prev) => ({
                ...prev,
                accountNo: e.currentTarget.value,
              }))
            }
            required
          />
          <TextInput
            label="Bank Code"
            value={assignForm.bankCode}
            onChange={(e) =>
              setAssignForm((prev) => ({
                ...prev,
                bankCode: e.currentTarget.value,
              }))
            }
            required
          />
          <TextInput
            label="Account Name"
            value={assignForm.accountName}
            onChange={(e) =>
              setAssignForm((prev) => ({
                ...prev,
                accountName: e.currentTarget.value,
              }))
            }
            required
          />
          <TextInput
            label="Username"
            value={assignForm.username}
            onChange={(e) =>
              setAssignForm((prev) => ({
                ...prev,
                username: e.currentTarget.value,
              }))
            }
            required
          />
          <Group
            justify="flex-end"
            mt="sm"
          >
            <Button
              variant="light"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              loading={assigning}
              onClick={handleBulkAssign}
              leftSection={<IconUserShield size={16} />}
            >
              Assign
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default WithdrawAssignmentBulk;
