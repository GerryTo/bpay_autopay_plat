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
  IconCheck,
  IconDotsVertical,
  IconFilter,
  IconPencil,
  IconRefresh,
  IconSearch,
  IconTransfer,
  IconX,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  futuretrxid: '',
  timestamp: '',
  originaldate: '',
  merchantcode: '',
  customercode: '',
  bankcode: '',
  DB: '',
  transactiontype: '',
  status: '',
  fee: '',
  notes: '',
  notes2: '',
  notes3: '',
  memo: '',
  transactionid: '',
  reference: '',
  accountno: '',
  accountsrcname: '',
  accountdst: '',
  accountdstname: '',
  servername: '',
  serverurl: '',
  disable: '',
  flag: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const TransactionFlagM = () => {
  const [accountValue, setAccountValue] = useState('0');
  const [accounts, setAccounts] = useState([]);
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

  const runRowAction = useCallback(async (futuretrxid, action) => {
    setActionLoadingId(futuretrxid);
    try {
      await action();
    } finally {
      setActionLoadingId('');
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await transactionAPI.getMyBankList();
      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          setAccounts(response.data.records || []);
        }
      }
    } catch (error) {
      console.error('Account list fetch error:', error);
    }
  }, []);

  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      silent ? setRefreshing(true) : setLoading(true);

      try {
        const [accountno = '0', bank = ''] = accountValue.split('||');

        const response = await transactionAPI.getTransactionFlagM({
          accountno,
          bank,
        });

        if (response.success && response.data) {
          if ((response.data.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(response.data.records)
              ? response.data.records
              : [];
            setData(records);
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
        console.error('Transaction Flag M fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load Transaction Flag M',
          Color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountValue]
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
        key: 'originaldate',
        label: 'Original Date',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.originaldate}</Text>,
        filter: (
          <TextInput
            placeholder="Filter original date..."
            size="xs"
            value={columnFilters.originaldate}
            onChange={(e) =>
              handleFilterChange('originaldate', e.currentTarget.value)
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
        label: 'Amount',
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
            placeholder="Filter amount..."
            size="xs"
            value={columnFilters.DB}
            onChange={(e) => handleFilterChange('DB', e.currentTarget.value)}
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
        minWidth: 120,
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
        key: 'flag',
        label: 'Flag',
        minWidth: 100,
        render: (item) => <Text size="sm">{item.flag || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter flag..."
            size="xs"
            value={columnFilters.flag}
            onChange={(e) => handleFilterChange('flag', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 180,
        render: (item) => {
          const isOrderNeedCheck = item.status === 'Order need to check';
          const busy = actionLoadingId === item.futuretrxid;

          const parseIds = (raw) =>
            String(raw || '')
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean);

          const handleEdit = async () => {
            const amountInput = window.prompt(
              `New amount for [${item.futuretrxid}]`,
              String(item.amount ?? item.DB ?? '')
            );
            if (amountInput === null) return;

            const amount = Number(amountInput);
            if (!Number.isFinite(amount)) {
              showNotification({
                title: 'Validation',
                message: 'Amount must be a number',
                Color: 'yellow',
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
                  Color: 'red',
                });
                return;
              }

              showNotification({
                title: 'Success',
                message: 'Edit amount success',
                Color: 'green',
              });
              await fetchData({ silent: true });
            });
          };

          const handleCheck = async () => {
            const choice = window.prompt(
              [
                'Check (legacy modal replacement)',
                '1 = Match SMS (depositQueue_matchedSms)',
                '2 = Match Mutasi (depositQueue_matchedMutasi)',
                '3 = Fail (updateManualTransaction)',
                '4 = Success Deposit (changeStatusSuccessTransactionAccountByCompany)',
                '',
                'Input number:',
              ].join('\n'),
              '1'
            );
            if (choice === null) return;

            const pick = String(choice).trim();

            if (pick === '1') {
              const idsRaw = window.prompt(
                'Input deposit queue SMS id(s), comma separated',
                ''
              );
              if (idsRaw === null) return;
              const ids = parseIds(idsRaw);
              if (ids.length === 0) return;

              await runRowAction(item.futuretrxid, async () => {
                const res = await transactionAPI.matchDepositQueueSms({
                  futuretrxid: item.futuretrxid,
                  ids,
                });
                const status = String(res.data?.status ?? '').toLowerCase();
                if (!res.success || status !== 'ok') {
                  showNotification({
                    title: 'Error',
                    message:
                      res.data?.message || res.error || 'Failed to match SMS',
                    Color: 'red',
                  });
                  return;
                }

                showNotification({
                  title: 'Success',
                  message: 'SMS Matching Success!',
                  Color: 'green',
                });
                await fetchData({ silent: true });
              });
              return;
            }

            if (pick === '2') {
              const idsRaw = window.prompt(
                'Input deposit queue mutasi id(s), comma separated',
                ''
              );
              if (idsRaw === null) return;
              const ids = parseIds(idsRaw);
              if (ids.length === 0) return;

              await runRowAction(item.futuretrxid, async () => {
                const res = await transactionAPI.matchDepositQueueMutasi({
                  futuretrxid: item.futuretrxid,
                  ids,
                });
                const status = String(res.data?.status ?? '').toLowerCase();
                if (!res.success || status !== 'ok') {
                  showNotification({
                    title: 'Error',
                    message:
                      res.data?.message ||
                      res.error ||
                      'Failed to match mutasi',
                    Color: 'red',
                  });
                  return;
                }

                showNotification({
                  title: 'Success',
                  message: 'Mutasi Matching Success!',
                  Color: 'green',
                });
                await fetchData({ silent: true });
              });
              return;
            }

            if (pick === '3') {
              const ok = window.confirm(
                `Fail this transaction [${item.futuretrxid}]?`
              );
              if (!ok) return;
              await runRowAction(item.futuretrxid, async () => {
                const res = await transactionAPI.updateManualTransaction({
                  id: item.futuretrxid,
                  status: 'C',
                  accountdest: '',
                });
                const status = String(res.data?.status ?? '').toLowerCase();
                if (!res.success || status !== 'ok') {
                  showNotification({
                    title: 'Error',
                    message:
                      res.data?.message ||
                      res.error ||
                      'Failed to fail transaction',
                    Color: 'red',
                  });
                  return;
                }
                showNotification({
                  title: 'Success',
                  message: 'Data Saved',
                  Color: 'green',
                });
                await fetchData({ silent: true });
              });
              return;
            }

            if (pick === '4') {
              const transid = window.prompt('Trans ID (bank trx id)', '') ?? '';
              if (!transid.trim()) return;

              await runRowAction(item.futuretrxid, async () => {
                const res =
                  await transactionAPI.setTransactionSuccessByFutureTrxId({
                    id: item.futuretrxid,
                    transid,
                  });
                const status = String(res.data?.status ?? '').toLowerCase();
                if (!res.success || status !== 'ok') {
                  showNotification({
                    title: 'Error',
                    message:
                      res.data?.message ||
                      res.error ||
                      'Failed to mark success',
                    Color: 'red',
                  });
                  return;
                }
                showNotification({
                  title: 'Success',
                  message: 'Success!',
                  Color: 'green',
                });
                await fetchData({ silent: true });
              });
              return;
            }

            showNotification({
              title: 'Info',
              message: 'No action selected',
              Color: 'yellow',
            });
          };

          if (!isOrderNeedCheck) {
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
            <Menu
              shadow="sm"
              withinPortal
            >
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
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={handleCheck}
                  disabled={busy}
                >
                  Check
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconPencil size={14} />}
                  onClick={handleEdit}
                  disabled={busy}
                >
                  Edit
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconX size={14} />}
                  color="red"
                  onClick={() => {
                    runRowAction(item.futuretrxid, async () => {
                      const res = await transactionAPI.updateManualTransaction({
                        id: item.futuretrxid,
                        status: 'C',
                        accountdest: '',
                      });
                      const status = String(
                        res.data?.status ?? ''
                      ).toLowerCase();
                      if (!res.success || status !== 'ok') {
                        showNotification({
                          title: 'Error',
                          message:
                            res.data?.message ||
                            res.error ||
                            'Failed to fail transaction',
                          Color: 'red',
                        });
                        return;
                      }
                      showNotification({
                        title: 'Success',
                        message: 'Data Saved',
                        Color: 'green',
                      });
                      await fetchData({ silent: true });
                    });
                  }}
                  disabled={busy}
                >
                  Fail
                </Menu.Item>
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
    fetchAccounts();
    fetchData({ silent: true });
  }, [fetchAccounts, fetchData]);

  const handleReset = () => {
    setAccountValue('0');
    setData([]);
    handleClearFilters();
    setCurrentPage(1);
  };

  const accountOptions = useMemo(() => {
    const base = [{ value: '0', label: '- ALL ACCOUNT -' }];
    const mapped =
      accounts?.map((acc) => ({
        value: `${acc.bankaccountno}||${acc.bankcode}`,
        label: `${acc.bankaccountname} | ${acc.bankcode}`,
      })) || [];
    return [...base, ...mapped];
  }, [accounts]);

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
                  Transaction Flag by M
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
                mt={4}
              >
                Flagged transactions.
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
                label="Account"
                data={accountOptions}
                value={accountValue}
                onChange={(value) => setAccountValue(value || '0')}
                searchable
                style={{ minWidth: 260 }}
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
                <Text size="sm" c="dimmed">
                  Total Rows
                </Text>
                <Text fw={700}>{data.length}</Text>
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

export default TransactionFlagM;
