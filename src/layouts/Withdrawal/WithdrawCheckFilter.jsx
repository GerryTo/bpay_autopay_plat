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
  MultiSelect,
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
import { withdrawAPI, merchantAPI, transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { AesCtr } from '../../helper/aes-ctr';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'assign', label: 'Assign' },
  { value: 'reassign', label: 'Re-Assign' },
  { value: 'Order need to check', label: 'Order need to check' },
  {
    value: 'Order need to check history',
    label: 'Order need to check history',
  },
  { value: 'Pending history', label: 'Pending history' },
];

const hourOptions = [
  '00:00-23:59',
  '00:00-05:59',
  '06:00-11:59',
  '12:00-17:59',
  '18:00-23:59',
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
  generated: '',
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

const getServerToken = () => {
  try {
    const meta = document.querySelector('meta[name="server_token"]');
    const token = meta?.getAttribute('content') || '';
    if (token.length < 16) return '';
    const publicKey = token.substring(0, 16);
    const data = token.substring(16);
    return AesCtr.decrypt(data, `${publicKey}{([<.?*+-#!,>])}`, 256);
  } catch (error) {
    console.error('Server token decode error:', error);
    return '';
  }
};

const validateServer = (server) => {
  const list = ['development', 'dpay'];
  const value = String(server || '').toLowerCase();
  return list.includes(value);
};

const WithdrawCheckFilter = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [hourRange, setHourRange] = useState(hourOptions[0]);
  const [history, setHistory] = useState(false);
  const [merchantFilter, setMerchantFilter] = useState([]);
  const [merchantOptions, setMerchantOptions] = useState([]);
  const [status, setStatus] = useState(statusOptions[0].value);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const canGenerate = useMemo(() => validateServer(getServerToken()), []);

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
        key: 'generated',
        label: 'Is Generated',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.generated || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter generated..."
            size="xs"
            value={columnFilters.generated}
            onChange={(e) =>
              handleFilterChange('generated', e.currentTarget.value)
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
      {
        key: 'actions',
        label: 'Action',
        minWidth: 320,
        render: (item) => {
          const hasAgent =
            String(item.agentUser || item.agentAlias || '').trim().length > 0;
          return (
            <Group
              gap="xs"
              wrap="nowrap"
            >
              {canGenerate ? (
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => handleGenerate(item)}
                >
                  Generate
                </Button>
              ) : null}
              <Button
                size="xs"
                variant="light"
                color={hasAgent ? 'yellow' : 'blue'}
                onClick={() => handleAssign(item)}
              >
                {hasAgent ? 'Re-Assign' : 'Assign'}
              </Button>
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
            </Group>
          );
        },
        filter: null,
      },
    ],
    [
      canGenerate,
      columnFilters,
      handleAssign,
      handleCheck,
      handleFail,
      handleFilterChange,
      handleGenerate,
      handleSuccess,
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
          includesValue(item.insert, columnFilters.insert) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.customercode, columnFilters.customercode) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.amount, columnFilters.amount) &&
          includesValue(item.timestamp, columnFilters.timestamp) &&
          includesValue(item.dstbankaccount, columnFilters.dstbankaccount) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.generated, columnFilters.generated) &&
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

      const [hourfrom = '00:00', hourto = '23:59'] = (
        hourRange || '00:00-23:59'
      ).split('-');

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const payloadDateFrom = dayjs(start).format('YYYY-MM-DD');
        const payloadDateTo = dayjs(end).format('YYYY-MM-DD');
        const response = await withdrawAPI.getWithdrawNtcFilter({
          datefrom: payloadDateFrom,
          dateto: payloadDateTo,
          hourfrom,
          hourto,
          merchant: merchantFilter.length ? merchantFilter : 'all',
          history,
          filter: status,
        });

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
              message:
                payload.message || 'Failed to load withdraw check filter list',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message:
              response.error || 'Failed to load withdraw check filter list',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Withdraw check filter list fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load withdraw check filter list',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, hourRange, merchantFilter, history, status]
  );

  const buildGenerateText = (item) => {
    const bankCode = String(item?.bankcode ?? '').toUpperCase();
    let text = '';
    switch (bankCode) {
      case 'BKASH':
        text = 'dYO^dYO^BKASHdYO^dYO^';
        break;
      case 'NAGAD':
        text =
          '\u0192~?\u2039,?\u0192~?\u2039,?NAGAD\u0192~?\u2039,?\u0192~?\u2039,?';
        break;
      case 'ROCKET':
        text = 'dYs?dYs?ROCKETdYs?dYs?';
        break;
      case 'UPAY':
        text = 'dYO?dYO?UPAYdYO?dYO?';
        break;
      default:
        text = '';
    }

    const amountText = Number(item?.amount || 0)
      .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      .replace(/\$/g, '');

    return (
      `${text}\n` +
      `WALLET : ${item?.bankcode || ''}\n` +
      `WD ID : ${item?.transactionid || ''}\n` +
      `CASH IN TO : ${item?.dstbankaccount || ''}\n` +
      `AMOUNT : ${amountText}`
    );
  };

  async function handleGenerate(item) {
    const id = item?.id ?? '';
    if (!id) {
      showNotification({
        title: 'Validation',
        message: 'Future ID is missing',
        color: 'yellow',
      });
      return;
    }

    const generatedText = buildGenerateText(item);
    if (generatedText) {
      try {
        await navigator.clipboard.writeText(generatedText);
        showNotification({
          title: 'Success',
          message: 'Generate text copied to clipboard',
          color: 'green',
        });
      } catch (error) {
        console.error('Clipboard copy error:', error);
      }
    }

    setLoading(true);
    try {
      const response = await withdrawAPI.checkWithdrawNtcDuplicate({
        amount: item?.amount ?? '',
        dstbankacc: item?.dstbankaccount ?? '',
        futuretrx: id,
        bankcode: item?.bankcode ?? '',
      });

      if (response.success && response.data) {
        const statusValue = String(response.data.status ?? '').toLowerCase();
        if (statusValue === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Generate check complete',
            color: 'green',
          });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Generate check failed',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Generate check failed',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Generate withdraw check error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to generate withdraw check',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(item) {
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

    const bankCode = window.prompt('Bank Code', String(item?.bankcode ?? ''));
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
      const response = await withdrawAPI.assignWithdraw({
        id,
        accountNo,
        bankCode,
        accountName,
        username,
      });
      if (response.success && response.data) {
        const statusValue = String(response.data.status ?? '').toLowerCase();
        if (statusValue === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Assignment success',
            color: 'green',
          });
          await fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Assignment failed',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Assignment failed',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Assign withdraw error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to assign withdraw',
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
        const statusValue = String(response.data.status ?? '').toLowerCase();
        if (statusValue === 'ok') {
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
        const statusValue = String(response.data.status ?? '').toLowerCase();
        if (statusValue === 'ok') {
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
        const statusValue = String(response.data.status ?? '').toLowerCase();
        if (statusValue === 'ok') {
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
                Withdraw Check Filter
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Filtered withdraw need-to-check monitoring
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
                  label="Hour Range"
                  data={hourOptions.map((opt) => ({ value: opt, label: opt }))}
                  value={hourRange}
                  onChange={(val) => setHourRange(val || hourOptions[0])}
                  style={{ minWidth: 160 }}
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

                <Checkbox
                  label="History"
                  checked={history}
                  onChange={(e) => setHistory(e.currentTarget.checked)}
                />

                <Select
                  label="Status"
                  data={statusOptions}
                  value={status}
                  onChange={(val) => setStatus(val || statusOptions[0].value)}
                  style={{ minWidth: 220 }}
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

export default WithdrawCheckFilter;
