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
  IconArrowUpCircle,
  IconCalendar,
  IconFilter,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { transactionAPI, withdrawAPI, depositAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'assign', label: 'Assign' },
  { value: 'reassign', label: 'Reassign' },
  { value: 'SEND TO AUTOMATION SUCCESS', label: 'In process' },
  { value: 'Withdrawal Success', label: 'Withdraw success' },
  { value: 'AUTOMATION FAILED', label: 'Withdraw need attention' },
  {
    value: 'finished_checking_history',
    label: 'Withdraw Finished Checking History',
  },
  { value: 'Withdrawal Failed', label: 'Withdraw Failed' },
  { value: 'Manual Assign List', label: 'Manual Assign List' },
];

const defaultFilters = {
  id: '',
  transactionid: '',
  duration: '',
  insert: '',
  assignTime: '',
  originaldate: '',
  completedate: '',
  merchantcode: '',
  amount: '',
  bankcode: '',
  dstbankaccount: '',
  dstbankaccountNo: '',
  sourceaccountname: '',
  notes3: '',
  statusAutomation: '',
  statusTransaction: '',
  memo: '',
  SentMqtt: '',
  ReceiveMqtt: '',
  isWithdrawUpload: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const getTransactionHighlight = (item) => {
  if (item.completedate) return undefined;
  if (!item.insert) return undefined;
  const now = dayjs();
  const inserted = dayjs(item.insert);
  if (!inserted.isValid()) return undefined;
  const diffMinutes = now.diff(inserted, 'minute', true);
  return diffMinutes >= 3 ? '#ffe3e3' : undefined;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatAgentLabel = (item) => {
  const rawLabel =
    item.bankAccName ||
    item.alias ||
    item.bankCode ||
    item.bankAccNo ||
    item.account ||
    '';
  const accountNo = item.bankAccNo || item.account || '';

  if (!rawLabel || !accountNo) return rawLabel;

  const prefixPattern = new RegExp(
    `^\\s*${escapeRegex(accountNo)}\\s*-\\s*`
  );
  return rawLabel.replace(prefixPattern, '');
};

const AppiumWithdrawList = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [status, setStatus] = useState('AUTOMATION FAILED');
  const [agent, setAgent] = useState('');
  const [agentOptions, setAgentOptions] = useState([]);
  const [dataFilter, setDataFilter] = useState('');
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

  const isPending = useMemo(() => {
    const filter = dataFilter || status;
    return (
      filter === 'SEND TO AUTOMATION SUCCESS' ||
      filter === 'assign' ||
      filter === 'reassign' ||
      filter === 'pending'
    );
  }, [dataFilter, status]);

  const isWithdrawAttention = useMemo(() => {
    const filter = dataFilter || status;
    return (
      filter === 'AUTOMATION FAILED 2' ||
      filter === 'finished_checking_history' ||
      filter === 'AUTOMATION FAILED'
    );
  }, [dataFilter, status]);

  const isFinishCheckingHistory = useMemo(() => {
    const filter = dataFilter || status;
    return filter === 'finished_checking_history';
  }, [dataFilter, status]);

  const successAndFailed = useMemo(() => {
    const filter = dataFilter || status;
    return filter !== 'Withdrawal Failed' && filter !== 'Withdrawal Success';
  }, [dataFilter, status]);

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
            style={{
              backgroundColor: getTransactionHighlight(item),
              padding: '2px 4px',
              borderRadius: 4,
            }}
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
        key: 'transactionid',
        label: 'Transaction ID',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            style={{
              backgroundColor: getTransactionHighlight(item),
              padding: '2px 4px',
              borderRadius: 4,
            }}
          >
            {item.transactionid || '-'}
          </Text>
        ),
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
        key: 'duration',
        label: 'Duration',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.duration || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter duration..."
            size="xs"
            value={columnFilters.duration}
            onChange={(e) =>
              handleFilterChange('duration', e.currentTarget.value)
            }
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
            placeholder="Filter system ts..."
            size="xs"
            value={columnFilters.insert}
            onChange={(e) =>
              handleFilterChange('insert', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'assignTime',
        label: 'Assign Timestamp',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.assignTime || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter assign..."
            size="xs"
            value={columnFilters.assignTime}
            onChange={(e) =>
              handleFilterChange('assignTime', e.currentTarget.value)
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
        key: 'completedate',
        label: 'Complete Timestamp',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.completedate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter complete..."
            size="xs"
            value={columnFilters.completedate}
            onChange={(e) =>
              handleFilterChange('completedate', e.currentTarget.value)
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
        key: 'dstbankaccount',
        label: 'Dest Account Name',
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
        key: 'dstbankaccountNo',
        label: 'Dest Account No',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.dstbankaccountNo || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dest acc no..."
            size="xs"
            value={columnFilters.dstbankaccountNo}
            onChange={(e) =>
              handleFilterChange('dstbankaccountNo', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'sourceaccountname',
        label: 'Source Account Name',
        minWidth: 170,
        render: (item) => (
          <Text size="sm">{item.sourceaccountname || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter source name..."
            size="xs"
            value={columnFilters.sourceaccountname}
            onChange={(e) =>
              handleFilterChange('sourceaccountname', e.currentTarget.value)
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
        key: 'statusAutomation',
        label: 'Status Automation',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.statusAutomation || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter status automation..."
            size="xs"
            value={columnFilters.statusAutomation}
            onChange={(e) =>
              handleFilterChange('statusAutomation', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'statusTransaction',
        label: 'Status Transaction',
        minWidth: 150,
        render: (item) => (
          <Text size="sm">{item.statusTransaction || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter status trx..."
            size="xs"
            value={columnFilters.statusTransaction}
            onChange={(e) =>
              handleFilterChange('statusTransaction', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'memo',
        label: 'Memo',
        minWidth: 180,
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
        key: 'SentMqtt',
        label: 'Sent Mqtt',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.SentMqtt || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter sent..."
            size="xs"
            value={columnFilters.SentMqtt}
            onChange={(e) =>
              handleFilterChange('SentMqtt', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'ReceiveMqtt',
        label: 'Receive Mqtt',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.ReceiveMqtt || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter receive..."
            size="xs"
            value={columnFilters.ReceiveMqtt}
            onChange={(e) =>
              handleFilterChange('ReceiveMqtt', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'isWithdrawUpload',
        label: 'isWithdrawUpload',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.isWithdrawUpload || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter upload..."
            size="xs"
            value={columnFilters.isWithdrawUpload}
            onChange={(e) =>
              handleFilterChange('isWithdrawUpload', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'actions',
        label: 'Action',
        minWidth: 320,
        render: (item) => {
          const uploadStatus = String(item.isWithdrawUpload ?? '');
          const showReassign =
            isWithdrawAttention &&
            (successAndFailed || isFinishCheckingHistory) &&
            uploadStatus === '0';
          const showManualReassign =
            isWithdrawAttention &&
            successAndFailed &&
            !isFinishCheckingHistory &&
            (uploadStatus === '0' || uploadStatus === '2');
          const showReassignUpload =
            uploadStatus === '1' || uploadStatus === '3';

          return (
            <Group
              gap="xs"
              wrap="nowrap"
            >
              {isFinishCheckingHistory ? (
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => handleResend(item)}
                >
                  Resend
                </Button>
              ) : null}
              {showReassign ? (
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => handleReassign(item)}
                >
                  Reassign
                </Button>
              ) : null}
              {showManualReassign ? (
                <Button
                  size="xs"
                  variant="light"
                  color="gray"
                  onClick={() => handleManualReassign(item)}
                >
                  Manual Reassign
                </Button>
              ) : null}
              {showReassignUpload ? (
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  onClick={() => handleReassignUpload(item)}
                >
                  Reassign Upload Withdraw
                </Button>
              ) : null}
              {isWithdrawAttention && successAndFailed ? (
                <>
                  <Button
                    size="xs"
                    variant="light"
                    color="yellow"
                    onClick={() => handleFail(item)}
                  >
                    Fail
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="green"
                    onClick={() => handleSuccess(item)}
                  >
                    Success
                  </Button>
                </>
              ) : null}
              {isPending && successAndFailed ? (
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => handleCancelAutomation(item)}
                >
                  Cancel
                </Button>
              ) : null}
              {successAndFailed ? (
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => handleSendToAutoAssign(item)}
                >
                  Send To Auto Assign
                </Button>
              ) : null}
            </Group>
          );
        },
      },
    ],
    [
      columnFilters,
      handleFilterChange,
      handleResend,
      handleReassign,
      handleManualReassign,
      handleReassignUpload,
      handleFail,
      handleSuccess,
      handleCancelAutomation,
      handleSendToAutoAssign,
      isFinishCheckingHistory,
      isPending,
      isWithdrawAttention,
      successAndFailed,
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
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.duration, columnFilters.duration) &&
          includesValue(item.insert, columnFilters.insert) &&
          includesValue(item.assignTime, columnFilters.assignTime) &&
          includesValue(item.originaldate, columnFilters.originaldate) &&
          includesValue(item.completedate, columnFilters.completedate) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.amount, columnFilters.amount) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.dstbankaccount, columnFilters.dstbankaccount) &&
          includesValue(
            item.dstbankaccountNo,
            columnFilters.dstbankaccountNo
          ) &&
          includesValue(
            item.sourceaccountname,
            columnFilters.sourceaccountname
          ) &&
          includesValue(item.notes3, columnFilters.notes3) &&
          includesValue(
            item.statusAutomation,
            columnFilters.statusAutomation
          ) &&
          includesValue(
            item.statusTransaction,
            columnFilters.statusTransaction
          ) &&
          includesValue(item.memo, columnFilters.memo) &&
          includesValue(item.SentMqtt, columnFilters.SentMqtt) &&
          includesValue(item.ReceiveMqtt, columnFilters.ReceiveMqtt) &&
          includesValue(item.isWithdrawUpload, columnFilters.isWithdrawUpload)
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

  const fetchAgents = useCallback(async () => {
    const response = await depositAPI.getAutomationAgents();
    if (response.success && response.data) {
      const payload = response.data;
      if ((payload.status || '').toLowerCase() === 'ok') {
        const records = Array.isArray(payload.records) ? payload.records : [];
        const unique = {};
        const options = records.reduce((arr, item) => {
          const value = item.bankAccNo || item.account;
          if (!value || unique[value]) return arr;
          unique[value] = true;
          arr.push({
            value,
            label: formatAgentLabel(item),
          });
          return arr;
        }, []);
        setAgentOptions(options);
      }
    }
  }, []);

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
        const response = await withdrawAPI.getAutomationTransactions(
          payloadDateFrom,
          payloadDateTo,
          status,
          agent
        );

        if (response.success && response.data) {
          const payload = response.data;
          if ((payload.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payload.records)
              ? payload.records
              : [];
            setDataFilter(payload.filter || status);
            const decoded = records.map(decodeRecord);
            setData(mapRecords(decoded));
          } else {
            showNotification({
              title: 'Error',
              message:
                payload.message || 'Failed to load automation withdraw list',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message:
              response.error || 'Failed to load automation withdraw list',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Automation withdraw list fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load automation withdraw list',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [agent, dateRange, status]
  );

  async function handleResend(item) {
    const queueId = item?.queue ?? '';
    if (!queueId) {
      showNotification({
        title: 'Validation',
        message: 'Queue ID is missing',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await withdrawAPI.resendWithdrawQueue(queueId);
      if (response.success && response.data) {
        const status = String(response.data.status ?? '').toLowerCase();
        if (status === 'ok') {
          showNotification({
            title: 'Success',
            message: 'Success send to automation',
            color: 'green',
          });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to resend',
            color: 'red',
          });
        }
        await fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to resend',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Resend withdraw queue error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to resend',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleReassign(item) {
    const queueId = item?.queue ?? '';
    if (!queueId) {
      showNotification({
        title: 'Validation',
        message: 'Queue ID is missing',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await withdrawAPI.reassignAppiumWithdraw({
        queueId,
        assign: item?.assignTime ?? '',
        isAutoReassign: 0,
      });
      if (response.success && response.data) {
        const status = String(response.data.status ?? '').toLowerCase();
        if (status === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.messages || 'Reassign success',
            color: 'green',
          });
          await fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.messages || 'Failed to reassign',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to reassign',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Reassign withdraw error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to reassign',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleManualReassign(item) {
    const id = item?.id ?? '';
    if (!id) {
      showNotification({
        title: 'Validation',
        message: 'Future ID is missing',
        color: 'yellow',
      });
      return;
    }

    const accountNo = window.prompt('Account No', '');
    if (accountNo === null) return;
    if (!accountNo.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Account No is required',
        color: 'yellow',
      });
      return;
    }

    const bankCode = window.prompt('Bank Code', '');
    if (bankCode === null) return;
    if (!bankCode.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Bank Code is required',
        color: 'yellow',
      });
      return;
    }

    const accountName = window.prompt('Account Name', '');
    if (accountName === null) return;

    const username = window.prompt('Username', '');
    if (username === null) return;

    setLoading(true);
    try {
      const response = await withdrawAPI.manualReassignWithdraw({
        id,
        accountNo,
        bankCode,
        accountName,
        username,
        queueId: item?.queue ?? '',
        assign: item?.assignTime ?? '',
      });
      if (response.success && response.data) {
        const status = String(response.data.status ?? '').toLowerCase();
        if (status === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Manual reassign success',
            color: 'green',
          });
          await fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to manual reassign',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to manual reassign',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Manual reassign withdraw error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to manual reassign',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleReassignUpload(item) {
    const id = item?.id ?? '';
    if (!id) {
      showNotification({
        title: 'Validation',
        message: 'Future ID is missing',
        color: 'yellow',
      });
      return;
    }

    const accountNo = window.prompt('Account No', '');
    if (accountNo === null) return;
    if (!accountNo.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Account No is required',
        color: 'yellow',
      });
      return;
    }

    const bankCode = window.prompt(
      'Bank Code',
      String(item?.bankcode ?? '')
    );
    if (bankCode === null) return;
    if (!bankCode.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Bank Code is required',
        color: 'yellow',
      });
      return;
    }

    const accountName = window.prompt('Account Name', '');
    if (accountName === null) return;

    const username = window.prompt('Username', '');
    if (username === null) return;

    setLoading(true);
    try {
      const response = await withdrawAPI.reassignWithdrawForUpload({
        id,
        accountNo,
        bankCode,
        accountName,
        username,
      });
      if (response.success && response.data) {
        const status = String(response.data.status ?? '').toLowerCase();
        if (status === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Assignment success',
            color: 'green',
          });
          await fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to reassign upload',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to reassign upload',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Reassign upload withdraw error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to reassign upload',
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
        const statusValue = String(response.data.status ?? '').toLowerCase();
        if (statusValue === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Withdraw failed',
            color: 'green',
          });
          await fetchList({ silent: true });
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
      console.error('Fail withdraw error:', error);
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

    const bankcode = window.prompt(
      'Bank code',
      String(item?.bankcode ?? '')
    );
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
        const statusValue = String(response.data.status ?? '').toLowerCase();
        if (statusValue === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Withdraw marked as success',
            color: 'green',
          });
          await fetchList({ silent: true });
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
      console.error('Success withdraw error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to mark success',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelAutomation(item) {
    const queueId = item?.queue ?? '';
    if (!queueId) {
      showNotification({
        title: 'Validation',
        message: 'Queue ID is missing',
        color: 'yellow',
      });
      return;
    }

    if (
      !window.confirm(
        `Are you sure want to cancel automation [${item.id ?? ''}]?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await withdrawAPI.cancelAutomationWithdraw({ queueId });
      if (response.success && response.data) {
        if (String(response.data.status ?? '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Success cancel automation',
            color: 'green',
          });
          await fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to cancel automation',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to cancel automation',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Cancel automation error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to cancel automation',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendToAutoAssign(item) {
    const id = item?.id ?? '';
    if (!id) {
      showNotification({
        title: 'Validation',
        message: 'Future ID is missing',
        color: 'yellow',
      });
      return;
    }

    if (
      !window.confirm(
        `Are you sure want to send this transaction to auto assign [${id}]?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await withdrawAPI.sendToAutoAssign({ id });
      if (response.success && response.data) {
        if (String(response.data.status ?? '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Sent to auto assign',
            color: 'green',
          });
          await fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to send to auto assign',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to send to auto assign',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Send to auto assign error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to send to auto assign',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, item) => {
          acc.amount += Number(item.amount) || 0;
          acc.fee += Number(item.fee) || 0;
          return acc;
        },
        { amount: 0, fee: 0 }
      ),
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
                Automation Withdraw List
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Automation withdraw monitoring
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
                  onChange={(val) => setStatus(val || 'AUTOMATION FAILED')}
                  style={{ minWidth: 220 }}
                />

                <Select
                  label="Agent"
                  placeholder="All agents"
                  data={agentOptions}
                  value={agent}
                  onChange={(val) => setAgent(val || '')}
                  searchable
                  clearable
                  style={{ minWidth: 240 }}
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
                  color="gray"
                >
                  Records: {data.length}
                </Badge>
                <Badge
                  variant="light"
                  color="blue"
                >
                  Total Amount: {formatNumber(totals.amount)}
                </Badge>
                <Badge
                  variant="light"
                  color="teal"
                >
                  Total Fee: {formatNumber(totals.fee)}
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
                    paginatedData.map((item) => (
                      <Table.Tr key={makeKey(item)}>
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

export default AppiumWithdrawList;
