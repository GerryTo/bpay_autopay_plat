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
  IconArrowDownCircle,
  IconBolt,
  IconCalendar,
  IconChecklist,
  IconFilter,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { depositAPI, transactionAPI } from '../../helper/api';
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
  insertGmt6: '',
  completedateGmt6: '',
  merchantcode: '',
  customercode: '',
  ccy: '',
  bankcode: '',
  ip: '',
  transactiontype: '',
  status: '',
  callbackresponse: '',
  accountsrc: '',
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
  memo: '',
  memo3: '',
  memo2: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const AutomationDepositList = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [status, setStatus] = useState(statusOptions[2].value);
  const [agent, setAgent] = useState('');
  const [agentOptions, setAgentOptions] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const agentSelectData = useMemo(() => {
    if (!agentOptions.length) return [{ value: '', label: 'All' }];
    const withAll = [{ value: '', label: 'All' }, ...agentOptions];
    const seen = new Set();
    return withAll.filter((option) => {
      if (!option.value && option.value !== '') return false;
      if (seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });
  }, [agentOptions]);

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
  }, []);

  const isHistoryDate = (date) => {
    if (!date) return false;
    const selected = dayjs(date).startOf('day');
    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');
    return !selected.isSame(today) && !selected.isSame(yesterday);
  };

  const handleUpdateMemo2 = async (item) => {
    const futuretrxid = item?.futuretrxid ?? '';
    if (!futuretrxid) {
      showNotification({
        title: 'Validation',
        message: 'Future Trx ID is missing',
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
  };

  const handleEdit = async (item) => {
    const futuretrxid = item?.futuretrxid ?? '';
    if (!futuretrxid) {
      showNotification({
        title: 'Validation',
        message: 'Future Trx ID is missing',
        color: 'yellow',
      });
      return;
    }

    const amountInput = window.prompt(
      `Edit amount for [${futuretrxid}]`,
      String(item?.amount ?? '')
    );
    if (amountInput === null) return;

    const amount = Number(amountInput);
    if (Number.isNaN(amount)) {
      showNotification({
        title: 'Validation',
        message: 'Amount must be a number',
        color: 'yellow',
      });
      return;
    }

    const note = window.prompt(
      `Edit note for [${futuretrxid}]`,
      String(item?.notes ?? '')
    );
    if (note === null) return;

    setLoading(true);
    try {
      const response = await transactionAPI.editTransactionByFutureTrxId({
        id: futuretrxid,
        amount,
        note,
      });

      if (response.success && response.data) {
        const status = String(response.data.status ?? '').toLowerCase();
        if (status === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Transaction updated',
            color: 'green',
          });
          await fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to update transaction',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update transaction',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Edit transaction error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update transaction',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    showNotification({
      title: 'Info',
      message: 'Analyze action is not available in the React view yet',
      color: 'yellow',
    });
  };

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
        key: 'insertGmt6',
        label: 'Date GMT+6',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.insertGmt6 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date GMT+6..."
            size="xs"
            value={columnFilters.insertGmt6}
            onChange={(e) =>
              handleFilterChange('insertGmt6', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'completedate',
        label: 'Complete Date',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.completedate || '-'}</Text>,
      },
      {
        key: 'completedateGmt6',
        label: 'Complete Date GMT+6',
        minWidth: 190,
        render: (item) => <Text size="sm">{item.completedateGmt6 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter complete GMT+6..."
            size="xs"
            value={columnFilters.completedateGmt6}
            onChange={(e) =>
              handleFilterChange('completedateGmt6', e.currentTarget.value)
            }
          />
        ),
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
        key: 'ccy',
        label: 'CCY',
        minWidth: 80,
        render: (item) => <Text size="sm">{item.ccy || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter ccy..."
            size="xs"
            value={columnFilters.ccy}
            onChange={(e) => handleFilterChange('ccy', e.currentTarget.value)}
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
        key: 'ip',
        label: 'IP',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.ip || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter IP..."
            size="xs"
            value={columnFilters.ip}
            onChange={(e) => handleFilterChange('ip', e.currentTarget.value)}
          />
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
        key: 'accountsrc',
        label: 'Account Src',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.accountsrc || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter account src..."
            size="xs"
            value={columnFilters.accountsrc}
            onChange={(e) =>
              handleFilterChange('accountsrc', e.currentTarget.value)
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
        minWidth: 120,
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
        key: 'receiptid',
        label: 'Receipt ID',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.notes2 || '-'}</Text>,
      },
      {
        key: 'memo',
        label: 'Matching Source',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.memo || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter matching..."
            size="xs"
            value={columnFilters.memo}
            onChange={(e) => handleFilterChange('memo', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'memo3',
        label: 'Matching Details',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.memo3 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter details..."
            size="xs"
            value={columnFilters.memo3}
            onChange={(e) => handleFilterChange('memo3', e.currentTarget.value)}
          />
        ),
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
      {
        key: 'actions',
        label: 'Action',
        minWidth: 240,
        render: (item) => (
          <Group
            gap="xs"
            wrap="nowrap"
          >
            <Button
              size="xs"
              variant="light"
              onClick={() => handleUpdateMemo2(item)}
            >
              Update Memo 2
            </Button>
            {item.status === 'Order need to check' ? (
              <>
                <Button
                  size="xs"
                  variant="light"
                  color="yellow"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={handleAnalyze}
                >
                  Analyze
                </Button>
              </>
            ) : null}
          </Group>
        ),
      },
    ],
    [
      columnFilters,
      handleFilterChange,
      handleAnalyze,
      handleEdit,
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
          includesValue(item.insertGmt6, columnFilters.insertGmt6) &&
          includesValue(
            item.completedateGmt6,
            columnFilters.completedateGmt6
          ) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.customercode, columnFilters.customercode) &&
          includesValue(item.ccy, columnFilters.ccy) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.ip, columnFilters.ip) &&
          includesValue(item.transactiontype, columnFilters.transactiontype) &&
          includesValue(item.status, columnFilters.status) &&
          includesValue(
            item.callbackresponse,
            columnFilters.callbackresponse
          ) &&
          includesValue(item.accountsrc, columnFilters.accountsrc) &&
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
          includesValue(item.memo, columnFilters.memo) &&
          includesValue(item.memo3, columnFilters.memo3) &&
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

  const fetchAgents = useCallback(async () => {
    const response = await depositAPI.getAutomationAgents();
    if (response.success && response.data) {
      const payload = response.data;
      if ((payload.status || '').toLowerCase() === 'ok') {
        const records = Array.isArray(payload.records) ? payload.records : [];
        const unique = {};
        const deduped = records.filter((item) => {
          const key = item.bankAccNo || item.account;
          if (!key || unique[key]) return false;
          unique[key] = true;
          return true;
        });
        const options = deduped.map((item) => ({
          value: item.bankAccNo || item.account,
          label:
            item.bankAccName ||
            item.alias ||
            item.bankCode ||
            item.bankAccNo ||
            item.account ||
            '',
        }));
        setAgentOptions(options);
      }
    }
  }, []);

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      if (agentOptions.length === 0) {
        await fetchAgents();
      }
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
        const response = await depositAPI.getAutomationList(
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
            const decoded = records.map(decodeRecord);
            setData(mapRecords(decoded));
          } else {
            showNotification({
              title: 'Error',
              message:
                payload.message || 'Failed to load automation deposit list',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load automation deposit list',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Automation deposit list fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load automation deposit list',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [agent, agentOptions.length, dateRange, fetchAgents, status]
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

  const handleBulkFail = useCallback(async () => {
    if (selectedKeys.length === 0) {
      showNotification({
        title: 'Validation',
        message: 'Select at least one transaction to proceed',
        color: 'yellow',
      });
      return;
    }

    const memoInput = window.prompt(
      'Enter memo for failing selected deposits',
      ''
    );
    if (memoInput === null) return;

    const memo = memoInput.trim();
    if (!memo) {
      showNotification({
        title: 'Validation',
        message: 'Memo is required for bulk fail',
        color: 'yellow',
      });
      return;
    }

    const items = data
      .filter((item) => selectedKeys.includes(makeKey(item)))
      .map((item) => ({
        futuretrxid: item.futuretrxid,
        memo,
      }));

    if (items.length === 0) {
      showNotification({
        title: 'Validation',
        message: 'Selected rows are no longer available in the current list',
        color: 'yellow',
      });
      setSelectedKeys([]);
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to fail all selected transactions?'
      )
    ) {
      return;
    }

    try {
      const response = await depositAPI.bulkFailAutomationDeposit(items);
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Bulk Fail',
            message: payload.message || 'Selected deposits marked as failed',
            color: 'green',
          });
          setSelectedKeys([]);
          await fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Bulk Fail',
            message: payload.message || 'Failed to update selected deposits',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Bulk Fail',
          message: response.error || 'Failed to update selected deposits',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Automation deposit bulk fail error:', error);
      showNotification({
        title: 'Bulk Fail',
        message: 'Unable to process bulk fail',
        color: 'red',
      });
    }
  }, [data, fetchList, selectedKeys]);

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
                Automation Deposit List
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Automation deposit monitoring
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

                <Select
                  label="Agent"
                  placeholder="Choose agent"
                  data={agentSelectData}
                  value={agent}
                  onChange={(val) => setAgent(val || '')}
                  onDropdownOpen={() => {
                    if (agentOptions.length === 0) {
                      fetchAgents();
                    }
                  }}
                  searchable
                  style={{ minWidth: 240 }}
                />

                {/* <Button
                  onClick={() => fetchList()}
                  leftSection={<IconChecklist size={18} />}
                  radius="md"
                  color="blue"
                >
                  Apply
                </Button> */}
                <Group gap="xs">
                  <Button
                    leftSection={<IconX size={18} />}
                    color="red"
                    radius="md"
                    variant="light"
                    disabled={selectedKeys.length === 0}
                    onClick={handleBulkFail}
                  >
                    Bulk Fail
                  </Button>
                </Group>
              </Group>

              {/* <Divider />

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

export default AutomationDepositList;
