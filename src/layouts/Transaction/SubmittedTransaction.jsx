import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Menu,
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
  IconCash,
  IconCheck,
  IconDotsVertical,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconTransfer,
  IconX,
} from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  futuretrxid: '',
  timestamp: '',
  completedate: '',
  merchantcode: '',
  customercode: '',
  bankcode: '',
  DB: '',
  CR: '',
  transactiontype: '',
  status: '',
  fee: '',
  notes: '',
  notes2: '',
  notes3: '',
  transactionid: '',
  reference: '',
  accountno: '',
  accountsrcname: '',
  accountdst: '',
  accountdstname: '',
  servername: '',
  serverurl: '',
  disable: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const SubmittedTransaction = () => {
  const loginUser = useSelector((state) => state.loginUser);
  const [transType, setTransType] = useState('');
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

  const handleClearFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
  }, []);

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
          status
        ) &&
        transactiontype === 'D' &&
        disable === '1' &&
        loginUserType === 'S'
      );
    },
    [loginUserType]
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
      silent ? setRefreshing(true) : setLoading(true);

      try {
        const response = await transactionAPI.getSubmittedTransactions(transType);

        if (response.success && response.data) {
          if ((response.data.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(response.data.records)
              ? response.data.records
              : [];
            const mapped = records.map((item) => {
              const amount = Number(item.amount) || 0;
              const isDeposit = ['D', 'Topup', 'Y', 'I'].includes(
                item.transactiontype
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
              Color: 'red',
            });
            setData([]);
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load data',
            Color: 'red',
          });
        }
      } catch (error) {
        console.error('Submitted transaction fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load submitted transactions',
          Color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [transType]
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
        key: 'timestamp',
        label: 'Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.timestamp}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date..."
            size="xs"
            value={columnFilters.timestamp}
            onChange={(e) =>
              handleFilterChange('timestamp', e.currentTarget.value)
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
        minWidth: 120,
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
          const canApprove = validateApprove(item);
          const canSuccessDeposit = isOrderNeedCheck && item.transactiontype === 'D';
          const canSuccessWithdraw = isOrderNeedCheck && item.transactiontype === 'W';

          const busy = actionLoadingId === item.futuretrxid;

          const handleFail = async () => {
            const ok = window.confirm(
              `Fail this transaction [${item.futuretrxid}]?`
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
                    res.data?.message || res.error || 'Failed to fail transaction',
                  Color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Transaction failed (manual)',
                Color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleSuccessDeposit = async () => {
            const ok = window.confirm(
              `Mark success deposit [${item.futuretrxid}]?`
            );
            if (!ok) return;

            const transid = window.prompt('Trans ID (bank trx id)', '') ?? '';
            if (!transid.trim()) {
              showNotification({
                title: 'Validation',
                message: 'Trans ID is required',
                Color: 'yellow',
              });
              return;
            }

            await runRowAction(item.futuretrxid, async () => {
              const res = await transactionAPI.setTransactionSuccessByFutureTrxId({
                id: item.futuretrxid,
                transid,
              });
              const status = String(res.data?.status ?? '').toLowerCase();
              if (!res.success || status !== 'ok') {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message || res.error || 'Failed to mark success',
                  Color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Transaction marked as success',
                Color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleSuccessWithdraw = async () => {
            const ok = window.confirm(
              `Mark success withdraw [${item.futuretrxid}]?`
            );
            if (!ok) return;

            const accountNo = window.prompt('Account destination', '') ?? '';
            const bankcode = window.prompt('Bank code', String(item.bankcode ?? '')) ?? '';
            const receipt = window.prompt('Receipt (optional)', '') ?? '';

            if (!accountNo.trim() || !bankcode.trim()) {
              showNotification({
                title: 'Validation',
                message: 'Account destination and bank code are required',
                Color: 'yellow',
              });
              return;
            }

            await runRowAction(item.futuretrxid, async () => {
              const res = await transactionAPI.setTransactionSuccessByFutureTrxId({
                id: item.futuretrxid,
                accountNo,
                bankcode,
                receipt,
              });
              const status = String(res.data?.status ?? '').toLowerCase();
              if (!res.success || status !== 'ok') {
                showNotification({
                  title: 'Error',
                  message:
                    res.data?.message || res.error || 'Failed to mark success',
                  Color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Transaction marked as success',
                Color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleApprove = async () => {
            const wasabi = window.confirm(
              'Approve to Wasabi?\nOK = Yes, Cancel = No'
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
                    res.data?.message || res.error || 'Failed to approve transaction',
                  Color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Approve success',
                Color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const hasAnyAction =
            isOrderNeedCheck || canApprove || canSuccessDeposit || canSuccessWithdraw;

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
            <Menu shadow="sm" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  title="Row Actions"
                >
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {isOrderNeedCheck ? (
                  <>
                    <Menu.Item
                      leftSection={<IconX size={14} />}
                      color="red"
                      onClick={handleFail}
                      disabled={busy}
                    >
                      Fail
                    </Menu.Item>
                    {canSuccessDeposit ? (
                      <Menu.Item
                        leftSection={<IconCheck size={14} />}
                        color="green"
                        onClick={handleSuccessDeposit}
                        disabled={busy || isDisabled}
                      >
                        Success (Deposit)
                      </Menu.Item>
                    ) : null}
                    {canSuccessWithdraw ? (
                      <Menu.Item
                        leftSection={<IconCheck size={14} />}
                        color="green"
                        onClick={handleSuccessWithdraw}
                        disabled={busy || isDisabled}
                      >
                        Success (Withdraw)
                      </Menu.Item>
                    ) : null}
                    {canApprove ? <Menu.Divider /> : null}
                  </>
                ) : null}

                {canApprove ? (
                  <Menu.Item
                    leftSection={<IconShieldCheck size={14} />}
                    color="red"
                    onClick={handleApprove}
                    disabled={busy}
                  >
                    Approve
                  </Menu.Item>
                ) : null}
              </Menu.Dropdown>
            </Menu>
          );
        },
      },
    ],
    [
      actionLoadingId,
      columnFilters,
      fetchData,
      handleFilterChange,
      runRowAction,
      validateApprove,
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

  const makeKey = (item) =>
    `${item.futuretrxid || ''}-${item.transactionid || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return Object.keys(defaultFilters).every((key) =>
          includesValue(item[key], columnFilters[key])
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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
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
    fetchData({ silent: true });
  }, [fetchData]);

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, item) => {
          acc.debit += Number(item.DB) || 0;
          acc.credit += Number(item.CR) || 0;
          acc.fee += Number(item.fee) || 0;
          return acc;
        },
        { debit: 0, credit: 0, fee: 0 }
      ),
    [data]
  );

  const handleReset = () => {
    setTransType('');
    setData([]);
    handleClearFilters();
    setCurrentPage(1);
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
                  Submitted Transaction
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
                mt={4}
              >
                Submitted transactions styled like Deposit Pending.
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
              <Button
                variant="light"
                color="gray"
                radius="md"
                size="sm"
                leftSection={<IconFilter size={18} />}
                onClick={handleReset}
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
            <Group
              align="flex-end"
              gap="md"
              wrap="wrap"
            >
              <Select
                label="Transaction Type"
                placeholder="All"
                data={[
                  { value: '', label: 'All' },
                  { value: 'D', label: 'Deposit (D)' },
                  { value: 'W', label: 'Withdraw (W)' },
                  { value: 'Topup', label: 'Topup' },
                  { value: 'Y', label: 'Y' },
                  { value: 'I', label: 'I' },
                ]}
                value={transType}
                onChange={(value) => setTransType(value || '')}
                style={{ minWidth: 220 }}
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
                  <IconArrowDownCircle size={16} color="blue" />
                  <Text size="sm" c="dimmed">
                    Total Debit
                  </Text>
                </Group>
                <Text fw={700}>{formatNumber(totals.debit)}</Text>
              </Stack>
              <Stack gap={4}>
                <Group gap={6}>
                  <IconCash size={16} color="orange" />
                  <Text size="sm" c="dimmed">
                    Total Credit
                  </Text>
                </Group>
                <Text fw={700}>{formatNumber(totals.credit)}</Text>
              </Stack>
              <Stack gap={4}>
                <Group gap={6}>
                  <IconCash size={16} color="teal" />
                  <Text size="sm" c="dimmed">
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
              gap="md"
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
              <Group
                gap={6}
                align="center"
              >
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Total rows:
                </Text>
                <Text
                  size="sm"
                  fw={600}
                >
                  {data.length}
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Total DB: {formatNumber(totals.debit)} | Total CR:{' '}
                {formatNumber(totals.credit)} | Total Fee:{' '}
                {formatNumber(totals.fee)}
              </Text>
            </Group>

            <Group gap="xs">
              <Button
                variant="light"
                size="xs"
                onClick={handleResetAll}
                leftSection={<IconRefresh size={14} />}
              >
                Reset Columns/Sort
              </Button>
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

export default SubmittedTransaction;
