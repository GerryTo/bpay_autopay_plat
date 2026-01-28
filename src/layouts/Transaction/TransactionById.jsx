import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  IconArrowDownCircle,
  IconCheck,
  IconPencil,
  IconRefresh,
  IconRepeat,
  IconSearch,
  IconShieldCheck,
  IconTransfer,
  IconX,
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const TransactionById = () => {
  const loginUser = useSelector((state) => state.loginUser);
  const [transId, setTransId] = useState('');
  const [history, setHistory] = useState(false);
  const [similarSearch, setSimilarSearch] = useState(false);
  const [data, setData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearch, setLastSearch] = useState({
    transId: '',
    history: false,
    similarSearch: false,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [columnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFilterChange = useCallback(() => {}, []);

  const loginUserType = useMemo(() => {
    const raw =
      loginUser?.type ??
      loginUser?.userType ??
      loginUser?.usertype ??
      loginUser?.role ??
      '';
    return String(raw || '');
  }, [loginUser]);

  const validateApprove = useCallback(
    (row) => {
      const status = row?.status ?? '';
      const transactiontype = row?.transactiontype ?? '';
      const disable = String(row?.disable ?? '');
      return (
        ['Order need to check', 'Pending', 'Transaction Failed'].includes(
          status,
        ) &&
        transactiontype === 'D' &&
        disable === '1' &&
        loginUserType === 'S'
      );
    },
    [loginUserType],
  );

  const runRowAction = useCallback(async (futuretrxid, action) => {
    setActionLoadingId(futuretrxid);
    try {
      await action();
    } finally {
      setActionLoadingId('');
    }
  }, []);

  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      if (!transId.trim()) {
        showNotification({
          title: 'Validation',
          message: 'Please input Transaction ID first',
          color: 'yellow',
        });
        return;
      }

      setHasSearched(true);
      setLastSearch({
        transId: transId.trim(),
        history,
        similarSearch,
      });

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const response = await transactionAPI.getByTransactionId({
          transId: transId.trim(),
          history,
          similarSearch,
        });

        if (response.success && response.data) {
          if ((response.data.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(response.data.records)
              ? response.data.records
              : [];

            if (records.length === 0) {
              showNotification({
                title: 'Not Found',
                message: `No transaction found for ID: ${transId.trim()}`,
                color: 'yellow',
              });
            }

            const mapped = records.map((item) => {
              const amount = Number(item.amount) || 0;
              const isDeposit = ['D', 'Topup', 'Y', 'I'].includes(
                item.transactiontype,
              );
              return {
                ...item,
                amount,
                DB: isDeposit ? amount : 0,
                CR: isDeposit ? 0 : amount,
                fee: Number(item.fee) || 0,
              };
            });
            setData(mapped);
          } else {
            showNotification({
              title: 'Error',
              message: response.data.message || 'Failed to load data',
              color: 'red',
            });
            setData([]);
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load data',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Transaction by ID fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load transaction data',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [history, similarSearch, transId],
  );

  const columns = useMemo(
    () => [
      {
        key: 'futuretrxid',
        label: 'Future Trx ID',
        minWidth: 140,
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
        filter: (
          <TextInput
            placeholder="Filter date..."
            size="xs"
            value={columnFilters.insert}
            onChange={(e) =>
              handleFilterChange('insert', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'insertBD',
        label: 'Date (BDT)',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.insertBD}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date (BDT)..."
            size="xs"
            value={columnFilters.insertBD}
            onChange={(e) =>
              handleFilterChange('insertBD', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastresend',
        label: 'Last Callback Date',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.lastresend}</Text>,
        filter: (
          <TextInput
            placeholder="Filter last callback..."
            size="xs"
            value={columnFilters.lastresend}
            onChange={(e) =>
              handleFilterChange('lastresend', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'insertBD',
        label: 'Date (BDT)',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.insertBD}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date BDT..."
            size="xs"
            value={columnFilters.insertBD}
            onChange={(e) =>
              handleFilterChange('insertBD', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'completedate',
        label: 'Complete Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.completedate}</Text>,
        filter: (
          <TextInput
            placeholder="Filter complete date..."
            size="xs"
            value={columnFilters.completedate}
            onChange={(e) =>
              handleFilterChange('completedate', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastresend',
        label: 'Last Callback',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.lastresend}</Text>,
        filter: (
          <TextInput
            placeholder="Filter callback date..."
            size="xs"
            value={columnFilters.lastresend}
            onChange={(e) =>
              handleFilterChange('lastresend', e.currentTarget.value)
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
        key: 'customercode',
        label: 'Customer',
        minWidth: 150,
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
        filter: (
          <TextInput
            placeholder="Filter debit..."
            size="xs"
            value={columnFilters.DB}
            onChange={(e) => handleFilterChange('DB', e.currentTarget.value)}
          />
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
        filter: (
          <TextInput
            placeholder="Filter credit..."
            size="xs"
            value={columnFilters.CR}
            onChange={(e) => handleFilterChange('CR', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'transactiontype',
        label: 'Trans Type',
        minWidth: 110,
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
        minWidth: 180,
        render: (item) => (
          <Badge
            color="green"
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
        minWidth: 160,
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
        label: 'Receipt ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.notes2 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter receipt id..."
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
        label: 'Matching Source',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.memo || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter matching source..."
            size="xs"
            value={columnFilters.memo}
            onChange={(e) => handleFilterChange('memo', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'memo3',
        label: 'Matching Details',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.memo3 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter matching details..."
            size="xs"
            value={columnFilters.memo3}
            onChange={(e) => handleFilterChange('memo3', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'flag3',
        label: 'Suspected Memo',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.flag3 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter suspected memo..."
            size="xs"
            value={columnFilters.flag3}
            onChange={(e) => handleFilterChange('flag3', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'flag4',
        label: 'Changes Agent',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.flag4 || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter changes agent..."
            size="xs"
            value={columnFilters.flag4}
            onChange={(e) => handleFilterChange('flag4', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'phonenumber',
        label: 'Sms Phone',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.phonenumber || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter sms phone..."
            size="xs"
            value={columnFilters.phonenumber}
            onChange={(e) =>
              handleFilterChange('phonenumber', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'user',
        label: 'Sms Agent',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.user || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter sms agent..."
            size="xs"
            value={columnFilters.user}
            onChange={(e) => handleFilterChange('user', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'transactionid',
        label: 'Trans ID',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.transactionid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trans id..."
            size="xs"
            value={columnFilters.transactionid}
            onChange={(e) =>
              handleFilterChange('transactionid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'reference',
        label: 'Reference',
        minWidth: 130,
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
        minWidth: 150,
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
        minWidth: 150,
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
        key: 'servername',
        label: 'Server Name',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.servername || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter server name..."
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
            placeholder="Filter server URL..."
            size="xs"
            value={columnFilters.serverurl}
            onChange={(e) =>
              handleFilterChange('serverurl', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'disable',
        label: 'Disable',
        minWidth: 100,
        render: (item) => <Text size="sm">{item.disable || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter disable..."
            size="xs"
            value={columnFilters.disable}
            onChange={(e) =>
              handleFilterChange('disable', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 180,
        render: (item) => {
          const isOrderNeedCheck = item.status === 'Order need to check';
          const isDisabled = String(item.disable ?? '') === '1';
          const isDeposit = item.transactiontype === 'D';
          const isWithdraw = item.transactiontype === 'W';
          const canApprove = validateApprove(item);
          const canResendCallback = [
            'Transaction Success',
            'Transaction Failed',
          ].includes(item.status);

          const busy = actionLoadingId === item.futuretrxid;

          const handleResendCallback = async () => {
            await runRowAction(item.futuretrxid, async () => {
              const res = await transactionAPI.resendCallbackByFutureTrxId(
                item.futuretrxid,
              );
              const status = String(res.data?.status ?? '').toLowerCase();
              if (!res.success || status !== 'ok') {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message ||
                    res.error ||
                    'Failed to resend callback',
                  color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Resend callback success',
                color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleEdit = async () => {
            const amountInput = window.prompt(
              `New amount for [${item.futuretrxid}]`,
              String(item.amount ?? item.DB ?? item.CR ?? ''),
            );
            if (amountInput === null) return;

            const amount = Number(amountInput);
            if (!Number.isFinite(amount)) {
              showNotification({
                title: 'Validation',
                message: 'Amount must be a number',
                color: 'yellow',
              });
              return;
            }

            const note =
              window.prompt(`Note for [${item.futuretrxid}]`, '') ?? '';

            await runRowAction(item.futuretrxid, async () => {
              const res = await transactionAPI.editTransactionByFutureTrxId({
                id: item.futuretrxid,
                amount,
                note,
              });
              const status = String(res.data?.status ?? '').toLowerCase();
              if (!res.success || status !== 'ok') {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message ||
                    res.error ||
                    'Failed to edit transaction',
                  color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Edit amount success',
                color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleFail = async () => {
            const ok = window.confirm(
              `Fail this transaction [${item.futuretrxid}]?`,
            );
            if (!ok) return;

            const memo = window.prompt('Fail reason (memo)', '') ?? '';

            await runRowAction(item.futuretrxid, async () => {
              const res = await transactionAPI.updateManualTransaction({
                id: item.futuretrxid,
                status: 'C',
                accountdest: '',
                memo,
              });
              const status = String(res.data?.status ?? '').toLowerCase();
              if (!res.success || status !== 'ok') {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message ||
                    res.error ||
                    'Failed to fail transaction',
                  color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Transaction failed (manual)',
                color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleRematchTrxId = async () => {
            const notes3 = window.prompt(
              `Notes3 / Trx ID for [${item.futuretrxid}]`,
              String(item.notes3 ?? ''),
            );
            if (notes3 === null) return;

            await runRowAction(item.futuretrxid, async () => {
              const res = await transactionAPI.updateTransactionNotesById({
                id: item.futuretrxid,
                notes: notes3,
                history,
              });

              const status = String(res.data?.status ?? '').toLowerCase();
              if (!res.success || status !== 'ok') {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message || res.error || 'Failed to update Notes3',
                  color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Notes3 updated',
                color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleApprove = async () => {
            const wasabi = window.confirm(
              'Approve to Wasabi?\nOK = Yes, Cancel = No',
            );

            await runRowAction(item.futuretrxid, async () => {
              const res = await transactionAPI.approveTransactionByFutureTrxId({
                id: item.futuretrxid,
                wasabi,
              });
              const status = String(res.data?.status ?? '').toLowerCase();
              if (!res.success || status !== 'ok') {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message ||
                    res.error ||
                    'Failed to approve transaction',
                  color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Approve success',
                color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleUpdateMemo2 = async () => {
            const memo2 = window.prompt(
              `Update memo2 for [${item.futuretrxid}]`,
              String(item.memo2 ?? ''),
            );
            if (memo2 === null) return;

            await runRowAction(item.futuretrxid, async () => {
              const res = await transactionAPI.updateMemo2ByFutureTrxId({
                futuretrxid: item.futuretrxid,
                memo2,
                ishistory: history,
              });

              const status = String(res.data?.status ?? '').toLowerCase();
              if (!res.success || status !== 'ok') {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message || res.error || 'Failed to update memo2',
                  color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: res.data?.message || 'Memo2 updated',
                color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleSuccess = async () => {
            const ok = window.confirm(`Mark success [${item.futuretrxid}]?`);
            if (!ok) return;

            const transid = window.prompt(
              'Trans ID (bank trx id)',
              String(item.notes3 ?? item.transactionid ?? ''),
            );
            if (transid === null) return;

            const bankcode =
              window.prompt('Bank code', String(item.bankcode ?? '')) ?? '';
            const account =
              window.prompt(
                'Account name',
                String(item.accountdstname ?? ''),
              ) ?? '';
            const accountNo =
              window.prompt('Account number', String(item.accountdst ?? '')) ??
              '';
            const receipt = isWithdraw
              ? (window.prompt('Receipt (optional)', '') ?? '')
              : '';

            await runRowAction(item.futuretrxid, async () => {
              const res =
                await transactionAPI.setTransactionSuccessByFutureTrxId({
                  id: item.futuretrxid,
                  transid,
                  bankcode,
                  account,
                  accountNo,
                  receipt,
                });

              const status = String(res.data?.status ?? '').toLowerCase();
              if (!res.success || status !== 'ok') {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message || res.error || 'Failed to mark success',
                  color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Transaction marked as success',
                color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const showLegacyOnly = () => {
            showNotification({
              title: 'Info',
              message: 'This action is only available in legacy view',
              color: 'yellow',
            });
          };

          const hasAnyAction =
            isOrderNeedCheck || canResendCallback || canApprove || true; // memo2 always available

          if (!hasAnyAction) {
            return (
              <Badge
                color="gray"
                variant="light"
              >
                -
              </Badge>
            );
          }

          return (
            <Group
              gap="xs"
              wrap="nowrap"
            >
              {isOrderNeedCheck ? (
                <>
                  <Button
                    variant="light"
                    color="blue"
                    size="xs"
                    leftSection={<IconPencil size={14} />}
                    onClick={handleEdit}
                    disabled={busy}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    size="xs"
                    leftSection={<IconX size={14} />}
                    onClick={handleFail}
                    disabled={busy}
                  >
                    Fail
                  </Button>
                  {isDeposit || isWithdraw ? (
                    <Button
                      variant="light"
                      color="green"
                      size="xs"
                      leftSection={<IconCheck size={14} />}
                      onClick={handleSuccess}
                      disabled={busy || isDisabled}
                    >
                      Success
                    </Button>
                  ) : null}
                  {isDeposit ? (
                    <Button
                      variant="light"
                      color="orange"
                      size="xs"
                      leftSection={<IconRepeat size={14} />}
                      onClick={handleRematchTrxId}
                      disabled={busy || isDisabled}
                    >
                      Rematch Trx ID
                    </Button>
                  ) : null}
                  {canApprove ? (
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      leftSection={<IconShieldCheck size={14} />}
                      onClick={handleApprove}
                      disabled={busy}
                    >
                      Approve
                    </Button>
                  ) : null}
                </>
              ) : null}

              {canResendCallback ? (
                <Button
                  variant="light"
                  color="grape"
                  size="xs"
                  leftSection={<IconRepeat size={14} />}
                  onClick={handleResendCallback}
                  disabled={busy}
                >
                  Resend Callback
                </Button>
              ) : null}

              <Button
                variant="light"
                color="gray"
                size="xs"
                leftSection={<IconPencil size={14} />}
                onClick={handleUpdateMemo2}
                disabled={busy}
              >
                Update Memo2
              </Button>

              <Button
                variant="light"
                color="gray"
                size="xs"
                leftSection={<IconArrowDownCircle size={14} />}
                onClick={showLegacyOnly}
                disabled={busy}
              >
                Date TRXID
              </Button>
            </Group>
          );
        },
      },
    ],
    [
      actionLoadingId,
      columnFilters,
      fetchData,
      handleFilterChange,
      history,
      runRowAction,
      validateApprove,
    ],
  );

  const { visibleColumns } = useTableControls(columns);

  const makeKey = (item) =>
    `${item.futuretrxid || ''}-${item.transactionid || ''}`;

  const filteredData = useMemo(() => data, [data]);

  const sortedData = useMemo(() => filteredData, [filteredData]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, item) => {
          acc.debit += Number(item.DB) || 0;
          acc.credit += Number(item.CR) || 0;
          acc.fee += Number(item.fee) || 0;
          return acc;
        },
        { debit: 0, credit: 0, fee: 0 },
      ),
    [data],
  );

  const emptyStateMessage = useMemo(() => {
    if (!hasSearched) return 'Input Transaction ID then click Search.';
    if (data.length === 0) return `Not found: ${lastSearch.transId || '-'}`;
    if (filteredData.length === 0) return 'No results match your filters.';
    return 'No data available';
  }, [data.length, filteredData.length, hasSearched, lastSearch.transId]);

  const footerStatus = useMemo(() => {
    if (!hasSearched) return '';
    if (data.length === 0) return `Not found: ${lastSearch.transId || '-'}`;
    if (data.length > 0 && filteredData.length === 0)
      return 'No results (filtered).';
    return '';
  }, [data.length, filteredData.length, hasSearched, lastSearch.transId]);

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
            align="center"
          >
            <Box>
              <Group gap={8}>
                <IconTransfer
                  size={22}
                  color="#1d4ed8"
                />
                <Text
                  size="xl"
                  fw={700}
                >
                  Transaction by ID
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
                mt={4}
              >
                Search for transactions based on Transaction ID
              </Text>
            </Box>

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
              <TextInput
                label="Transaction ID"
                placeholder="Enter Transaction ID"
                value={transId}
                onChange={(e) => setTransId(e.currentTarget.value)}
                style={{ minWidth: 260 }}
              />
              <Checkbox
                label="Similar Search"
                checked={similarSearch}
                onChange={(e) => setSimilarSearch(e.currentTarget.checked)}
              />
              <Checkbox
                label="History"
                checked={history}
                onChange={(e) => setHistory(e.currentTarget.checked)}
              />
              <Button
                leftSection={<IconSearch size={18} />}
                color="blue"
                radius="md"
                onClick={() => fetchData()}
              >
                Search
              </Button>
              {/* <Stack gap={4}>
                <Group gap={6}>
                  <IconArrowDownCircle
                    size={16}
                    color="blue"
                  />
                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    Total Debit
                  </Text>
                </Group>
                <Text fw={700}>{formatNumber(totals.debit)}</Text>
              </Stack>
              <Stack gap={4}>
                <Group gap={6}>
                  <IconCash
                    size={16}
                    color="orange"
                  />
                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    Total Credit
                  </Text>
                </Group>
                <Text fw={700}>{formatNumber(totals.credit)}</Text>
              </Stack>
              <Stack gap={4}>
                <Group gap={6}>
                  <IconCash
                    size={16}
                    color="teal"
                  />
                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    Total Fee
                  </Text>
                </Group>
                <Text fw={700}>{formatNumber(totals.fee)}</Text>
              </Stack> */}
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
                  thead: {
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                  },
                  th: {
                    background:
                      'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
                    fontWeight: 700,
                    fontSize: '12px',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    color: '#1f2937',
                    borderBottom: '1px solid #e5e7eb',
                    whiteSpace: 'nowrap',
                  },
                  td: {
                    borderBottom: '1px solid #f1f3f5',
                    whiteSpace: 'nowrap',
                  },
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
                        </Group>
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
                        <Stack
                          align="center"
                          py="xl"
                          gap={6}
                          style={{ width: '100%' }}
                        >
                          <IconSearch
                            size={22}
                            color="#868e96"
                          />
                          <Text
                            ta="left"
                            fw={600}
                          >
                            {hasSearched && data.length === 0
                              ? 'Not Found'
                              : hasSearched && filteredData.length === 0
                                ? 'No Results'
                                : 'Search'}
                          </Text>
                          <Text
                            ta="left"
                            c="dimmed"
                            size="sm"
                          >
                            {emptyStateMessage}
                          </Text>
                          {hasSearched &&
                          data.length === 0 &&
                          lastSearch.transId ? (
                            <Text
                              ta="left"
                              c="dimmed"
                              size="sm"
                            >
                              ID: {lastSearch.transId} (history:{' '}
                              {lastSearch.history ? 'yes' : 'no'}, similar:{' '}
                              {lastSearch.similarSearch ? 'yes' : 'no'})
                            </Text>
                          ) : null}
                        </Stack>
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
              {footerStatus ? (
                <Text
                  size="sm"
                  c="dimmed"
                >
                  {footerStatus}
                </Text>
              ) : null}
            </Group>

            <Group gap="xs">
              {/* <Button
                variant="light"
                size="xs"
                onClick={handleResetAll}
                leftSection={<IconRefresh size={14} />}
              >
                Reset Columns/Sort
              </Button> */}
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setCurrentPage}
                size="sm"
                radius="md"
                withEdges
              />
            </Group>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
};

export default TransactionById;
