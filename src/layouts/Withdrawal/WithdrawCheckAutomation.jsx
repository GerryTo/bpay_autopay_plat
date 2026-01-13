import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  Menu,
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
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  IconCheck,
  IconDotsVertical,
  IconCalendar,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';
import { withdrawAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

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
  memo: '',
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
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const formatGenerateAmount = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? '');
  return num
    .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    .replace(/\$/, '');
};

const getTransactionHighlight = (item) => {
  if (!item.insert) return undefined;

  const now = new Date();
  const nowUtcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const nowGmt8Ms = nowUtcMs + 8 * 60 * 60 * 1000;

  const insertedMs = new Date(item.insert).getTime();
  if (!Number.isFinite(insertedMs)) return undefined;

  const diffMs = nowGmt8Ms - insertedMs;
  return diffMs >= 180000 ? '#ffe3e3' : undefined;
};

const WithdrawCheckAutomation = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [history, setHistory] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const runRowAction = useCallback(async (id, action) => {
    setActionLoadingId(String(id || ''));
    try {
      await action();
    } finally {
      setActionLoadingId('');
    }
  }, []);

  const copyGenerateText = useCallback(async (row) => {
    const bankPrefix = {
      BKASH: 'ƒ~?‹,?ƒ~?‹,?BKASHƒ~?‹,?ƒ~?‹,?',
      NAGAD: 'ƒ~?‹,?ƒ~?‹,?NAGADƒ~?‹,?ƒ~?‹,?',
      ROCKET: 'dYs?dYs?ROCKETdYs?dYs?',
      UPAY: 'dYO?dYO?UPAYdYO?dYO?',
    }[String(row.bankcode || '').toUpperCase()] || '';

    const legacyPrefix = {
      BKASH: 'dYO^dYO^BKASHdYO^dYO^',
      NAGAD: 'ƒ~?‹,?ƒ~?‹,?NAGADƒ~?‹,?ƒ~?‹,?',
      ROCKET: 'dYs?dYs?ROCKETdYs?dYs?',
      UPAY: 'dYO?dYO?UPAYdYO?dYO?',
    }[String(row.bankcode || '').toUpperCase()] || '';

    const text =
      (legacyPrefix || bankPrefix) +
      `\nWALLET : ${row.bankcode || ''}` +
      `\nWD ID : ${row.transactionid || ''}` +
      `\nCASH IN TO : ${row.dstbankaccount || ''}` +
      `\nAMOUNT : ${formatGenerateAmount(row.amount || 0)}`;

    try {
      await navigator.clipboard.writeText(text);
      showNotification({
        title: 'Copied',
        message: 'Generate text copied to clipboard',
        Color: 'green',
      });
    } catch {
      window.prompt('Copy text:', text);
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
          Color: 'yellow',
        });
        return;
      }

      const hourfrom = '00:00';
      const hourto = '23:59';

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const payloadDateFrom = dayjs(start).format('YYYY-MM-DD');
        const payloadDateTo = dayjs(end).format('YYYY-MM-DD');
        const response = await withdrawAPI.getAutomationWithdrawNtc({
          datefrom: payloadDateFrom,
          dateto: payloadDateTo,
          hourfrom,
          hourto,
          merchant: 'all',
          history,
        });

        if (!response.success || !response.data) {
          showNotification({
            title: 'Error',
            message:
              response.error || 'Failed to load automation withdraw check list',
            Color: 'red',
          });
          return;
        }

        const payload = response.data;
        if ((payload.status || '').toLowerCase() !== 'ok') {
          showNotification({
            title: 'Error',
            message:
              payload.message || 'Failed to load automation withdraw check list',
            Color: 'red',
          });
          return;
        }

        const decodeRecord = (record) =>
          Object.entries(record || {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
              try {
                acc[key] = decodeURIComponent(value);
              } catch {
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

        const records = Array.isArray(payload.records) ? payload.records : [];
        const decoded = records.map(decodeRecord);
        setData(mapRecords(decoded));
      } catch (error) {
        console.error('Automation withdraw check list fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load automation withdraw check list',
          Color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange, history]
  );

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
        render: (item) => (
          <Text
            size="sm"
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
        key: 'memo',
        label: 'Memo',
        minWidth: 150,
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
        key: 'action',
        label: 'Action',
        minWidth: 120,
        render: (item) => {
          const id = item.id ?? item.futuretrxid ?? '';
          const busy = actionLoadingId === String(id);

          const status = String(item.status || '');
          const note = String(item.note || '');
          const agentUser = String(item.agentUser || '');

          const canAssign = agentUser === '';
          const canReassign =
            agentUser !== '' && !note.includes('AUTOMATION FAILED') && status !== '';

          const canCheck = status === 'Pending';
          const canFail = status === 'Order need to check';
          const canSuccess = status === 'Order need to check';

          const onAssign = async () => {
            const accountNo = window.prompt('Account No', '') ?? '';
            if (!accountNo.trim()) return;

            const bankCode =
              window.prompt('Bank Code', String(item.bankcode || '')) ?? '';
            const accountName = window.prompt('Account Name', '') ?? '';
            const username = window.prompt('Username', '') ?? '';

            await runRowAction(id, async () => {
              const res = await withdrawAPI.assignAutomationWithdraw({
                id,
                accountNo,
                bankCode,
                accountName,
                username,
              });

              const ok = String(res.data?.status || '').toLowerCase() === 'ok';
              if (!res.success || !ok) {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message || res.error || 'Assignment failed',
                  Color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Assignment Success!',
                Color: 'green',
              });
              await fetchList({ silent: true });
            });
          };

          const onCheck = async () => {
            await runRowAction(id, async () => {
              const res = await withdrawAPI.checkWithdrawList(id);
              const ok = String(res.data?.status || '').toLowerCase() === 'ok';
              if (!res.success || !ok) {
                showNotification({
                  title: 'Error',
                  message: res.data?.message || res.error || 'Check failed',
                  Color: 'red',
                });
                return;
              }
              await fetchList({ silent: true });
            });
          };

          const onFail = async () => {
            const confirmed = window.confirm(
              `Are you sure want to fail this transaction [${id}]?`
            );
            if (!confirmed) return;

            const memo = window.prompt('Memo / Reason', '') ?? '';

            await runRowAction(id, async () => {
              const res = await withdrawAPI.updateAutomationWithdrawTransaction({
                id,
                status: 'C',
                accountdest: '',
                memo,
              });
              const ok = String(res.data?.status || '').toLowerCase() === 'ok';
              if (!res.success || !ok) {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message || res.error || 'Fail transaction failed',
                  Color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Data Saved',
                Color: 'green',
              });
              await fetchList({ silent: true });
            });
          };

          const onSuccess = async () => {
            const account = window.prompt('Account Dest', '') ?? '';
            if (!account.trim()) return;

            const bankcode =
              window.prompt('Bank Code', String(item.bankcode || '')) ?? '';
            const receipt = window.prompt('Receipt (optional)', '') ?? '';

            await runRowAction(id, async () => {
              const res = await withdrawAPI.setAutomationWithdrawSuccess({
                id,
                account,
                bankcode,
                receipt,
              });
              const ok = String(res.data?.status || '').toLowerCase() === 'ok';
              if (!res.success || !ok) {
                showNotification({
                  title: 'Error',
                  message: res.data?.message || res.error || 'Success failed',
                  Color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Success!',
                Color: 'green',
              });
              await fetchList({ silent: true });
            });
          };

          return (
            <Menu shadow="sm" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  title="Row Actions"
                  disabled={busy}
                >
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconSearch size={14} />}
                  onClick={() => copyGenerateText(item)}
                  disabled={busy}
                >
                  Generate
                </Menu.Item>
                {canAssign ? (
                  <Menu.Item
                    leftSection={<IconUserPlus size={14} />}
                    onClick={onAssign}
                    disabled={busy}
                  >
                    Assign
                  </Menu.Item>
                ) : null}
                {canReassign ? (
                  <Menu.Item
                    leftSection={<IconUserPlus size={14} />}
                    onClick={onAssign}
                    disabled={busy}
                  >
                    Re-Assign
                  </Menu.Item>
                ) : null}
                {canCheck ? (
                  <Menu.Item
                    leftSection={<IconSearch size={14} />}
                    onClick={onCheck}
                    disabled={busy}
                  >
                    Check
                  </Menu.Item>
                ) : null}
                {canFail ? (
                  <Menu.Item
                    leftSection={<IconX size={14} />}
                    color="red"
                    onClick={onFail}
                    disabled={busy}
                  >
                    Fail
                  </Menu.Item>
                ) : null}
                {canSuccess ? (
                  <Menu.Item
                    leftSection={<IconCheck size={14} />}
                    color="green"
                    onClick={onSuccess}
                    disabled={busy}
                  >
                    Success
                  </Menu.Item>
                ) : null}
              </Menu.Dropdown>
            </Menu>
          );
        },
        filter: null,
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
    ],
    [
      actionLoadingId,
      columnFilters,
      copyGenerateText,
      fetchList,
      handleFilterChange,
      runRowAction,
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
          includesValue(item.memo, columnFilters.memo) &&
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
          includesValue(item.assignStatusDesc, columnFilters.assignStatusDesc)
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

  useEffect(() => {
    fetchList();
    const timerId = setTimeout(() => fetchList({ silent: true }), 60 * 1000);
    return () => clearTimeout(timerId);
  }, [fetchList]);

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
                Withdraw Check Automation
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Automation withdraw need-to-check monitoring
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

                <Checkbox
                  label="History"
                  checked={history}
                  onChange={(e) => setHistory(e.currentTarget.checked)}
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
                      <Table.Tr
                        key={makeKey(item)}
                        style={{ backgroundColor: getTransactionHighlight(item) }}
                      >
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

export default WithdrawCheckAutomation;
