import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Checkbox,
} from '@mantine/core';
import { IconFilter, IconRefresh, IconSearch, IconTransfer, IconSend } from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  resubmitTime: '',
  timestamp: '',
  timestampBdt: '',
  from: '',
  username: '',
  phonenumber: '',
  type: '',
  merchantCode: '',
  securitycode: '',
  customerphone: '',
  customerphoneTRX: '',
  servicecenter: '',
  amount: '',
  message: '',
  transactiontype: '',
  smsid: '',
  futuretrxid: '',
  suspectedreason: '',
  balance: '',
  balancecalculate: '',
  balancediff: '',
  matchmanually: '',
  matchdate: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const typeOptions = [
  { value: '6', label: 'Balance Different is not allowed' },
  { value: '7', label: 'Service Center is not registered' },
  { value: '0', label: 'Amount less than (legacy)' },
];

const TransactionResubmit = () => {
  const [filterType, setFilterType] = useState('6');
  const [amount, setAmount] = useState(1000);
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
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

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 50) {
          showNotification({
            title: 'Limit',
            message: 'You can select up to 50 rows',
            Color: 'yellow',
          });
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const columns = useMemo(
    () => [
      {
        key: 'select',
        label: '',
        minWidth: 50,
        render: (item) => (
          <Checkbox
            aria-label="Select row"
            checked={selectedIds.has(item.securitycode)}
            onChange={() => toggleSelect(item.securitycode)}
          />
        ),
      },
      {
        key: 'resubmitTime',
        label: 'Resubmit Time',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.resubmitTime || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter resubmit..."
            size="xs"
            value={columnFilters.resubmitTime}
            onChange={(e) => handleFilterChange('resubmitTime', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'timestamp',
        label: 'Timestamp',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.timestamp}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp..."
            size="xs"
            value={columnFilters.timestamp}
            onChange={(e) => handleFilterChange('timestamp', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'timestampBdt',
        label: 'Timestamp (BDT)',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.timestampBdt}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp BDT..."
            size="xs"
            value={columnFilters.timestampBdt}
            onChange={(e) => handleFilterChange('timestampBdt', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'from',
        label: 'From',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.from || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter from..."
            size="xs"
            value={columnFilters.from}
            onChange={(e) => handleFilterChange('from', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'username',
        label: 'Username',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.username || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter username..."
            size="xs"
            value={columnFilters.username}
            onChange={(e) => handleFilterChange('username', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'phonenumber',
        label: 'Phone Number',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.phonenumber || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter phone..."
            size="xs"
            value={columnFilters.phonenumber}
            onChange={(e) => handleFilterChange('phonenumber', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'type',
        label: 'Bank',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.type || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.type}
            onChange={(e) => handleFilterChange('type', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'merchantCode',
        label: 'Merchant',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.merchantCode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter merchant..."
            size="xs"
            value={columnFilters.merchantCode}
            onChange={(e) => handleFilterChange('merchantCode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'securitycode',
        label: 'Trx ID',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.securitycode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={columnFilters.securitycode}
            onChange={(e) => handleFilterChange('securitycode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'customerphone',
        label: 'Customer Phone',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.customerphone || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter customer phone..."
            size="xs"
            value={columnFilters.customerphone}
            onChange={(e) => handleFilterChange('customerphone', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'customerphoneTRX',
        label: 'Trx Customer Phone',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.customerphoneTRX || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trx phone..."
            size="xs"
            value={columnFilters.customerphoneTRX}
            onChange={(e) => handleFilterChange('customerphoneTRX', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'servicecenter',
        label: 'Service Center',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.servicecenter || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter service center..."
            size="xs"
            value={columnFilters.servicecenter}
            onChange={(e) => handleFilterChange('servicecenter', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        minWidth: 120,
        render: (item) => (
          <Text size="sm" className="grid-alignright">
            {formatNumber(item.amount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter amount..."
            size="xs"
            value={columnFilters.amount}
            onChange={(e) => handleFilterChange('amount', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'message',
        label: 'Message',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.message || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter message..."
            size="xs"
            value={columnFilters.message}
            onChange={(e) => handleFilterChange('message', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'transactiontype',
        label: 'Transaction Type',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.transactiontype || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter type..."
            size="xs"
            value={columnFilters.transactiontype}
            onChange={(e) => handleFilterChange('transactiontype', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'smsid',
        label: 'SMS ID',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.smsid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter sms id..."
            size="xs"
            value={columnFilters.smsid}
            onChange={(e) => handleFilterChange('smsid', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'futuretrxid',
        label: 'Future Trx ID',
        minWidth: 140,
        render: (item) => (
          <Text size="sm">{item.futuretrxid === '-1' ? 'Expired' : item.futuretrxid || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter future trx id..."
            size="xs"
            value={columnFilters.futuretrxid}
            onChange={(e) => handleFilterChange('futuretrxid', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'suspectedreason',
        label: 'Suspect Reason',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.suspectedreason || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter suspect reason..."
            size="xs"
            value={columnFilters.suspectedreason}
            onChange={(e) => handleFilterChange('suspectedreason', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'balance',
        label: 'Balance',
        minWidth: 120,
        render: (item) => (
          <Text size="sm" className="grid-alignright">
            {formatNumber(item.balance)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter balance..."
            size="xs"
            value={columnFilters.balance}
            onChange={(e) => handleFilterChange('balance', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'balancecalculate',
        label: 'Balance Calculate',
        minWidth: 140,
        render: (item) => (
          <Text size="sm" className="grid-alignright">
            {formatNumber(item.balancecalculate)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter balance calc..."
            size="xs"
            value={columnFilters.balancecalculate}
            onChange={(e) => handleFilterChange('balancecalculate', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'balancediff',
        label: 'Balance Different',
        minWidth: 140,
        render: (item) => (
          <Text size="sm" className="grid-alignright">
            {formatNumber(item.balancediff)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter balance diff..."
            size="xs"
            value={columnFilters.balancediff}
            onChange={(e) => handleFilterChange('balancediff', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'matchmanually',
        label: 'Match Manually',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.matchmanually || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter match manually..."
            size="xs"
            value={columnFilters.matchmanually}
            onChange={(e) => handleFilterChange('matchmanually', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'matchdate',
        label: 'Match Date',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.matchdate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter match date..."
            size="xs"
            value={columnFilters.matchdate}
            onChange={(e) => handleFilterChange('matchdate', e.currentTarget.value)}
          />
        ),
      },
    ],
    [columnFilters, handleFilterChange, selectedIds]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } =
    useTableControls(columns, {
      onResetFilters: () => setColumnFilters(defaultFilters),
    });

  const makeKey = (item) => `${item.securitycode || ''}-${item.timestamp || ''}`;

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

  const fetchData = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const payload = { type: filterType, amount };
      const response = await transactionAPI.getResubmitTransactionList(payload);

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records) ? response.data.records : [];
          const mapped = records.map((item) => ({
            ...item,
            message: decodeURIComponent(item.message || ''),
            from: decodeURIComponent(item.from || ''),
          }));
          setData(mapped);
          setSelectedIds(new Set());
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
      console.error('Resubmit transaction fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load resubmit transactions',
        Color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData({ silent: true });
  }, []);

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      showNotification({
        title: 'Validation',
        message: 'Please select at least one row to submit',
        Color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const selectedList = data.filter((item) => selectedIds.has(item.securitycode));
      const payload = { type: filterType, amount, list: selectedList };
      const response = await transactionAPI.submitResubmitTransactions(payload);

      if (response.success && response.data) {
        const ok = (response.data.status || '').toLowerCase() === 'ok';
        showNotification({
          title: ok ? 'Success' : 'Info',
          message: response.data.message || 'Submit completed',
          Color: ok ? 'green' : 'yellow',
        });
        if (ok) {
          setData([]);
          setSelectedIds(new Set());
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to submit',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Submit resubmit transactions error:', error);
      showNotification({
        title: 'Error',
        message: 'Submit failed',
        Color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilterType('6');
    setAmount(1000);
    setData([]);
    setSelectedIds(new Set());
    handleClearFilters();
    setCurrentPage(1);
  };

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'md', blur: 2 }} />

        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Box>
              <Group gap={8}>
                <IconTransfer size={22} color="#1d4ed8" />
                <Text size="xl" fw={700}>
                  Resubmit Transaction
                </Text>
              </Group>
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
              <Button
                variant="filled"
                color="teal"
                radius="md"
                size="sm"
                leftSection={<IconSend size={18} />}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Group>
          </Group>

          <Card withBorder radius="md" padding="md" shadow="xs">
            <Group align="flex-end" gap="md" wrap="wrap">
              <Select
                label="Filter Type"
                data={typeOptions}
                value={filterType}
                onChange={(value) => setFilterType(value || '6')}
                style={{ minWidth: 260 }}
              />
              {filterType === '0' && (
                <TextInput
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.currentTarget.value))}
                  style={{ minWidth: 160 }}
                />
              )}
              <Button leftSection={<IconSearch size={18} />} color="blue" radius="md" onClick={() => fetchData()}>
                Search
              </Button>
            </Group>
          </Card>

          <Box pos="relative">
            <ScrollArea type="auto" h="60vh">
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
                      <Table.Th key={col.key} style={{ minWidth: col.minWidth || 120 }}>
                        <Group gap={6} align="center">
                          <Text size="sm" fw={600}>
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
                        <Text ta="center" c="dimmed">
                          No data available
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>

          <Group justify="space-between" align="center">
            <Group gap="md" align="center">
              <Group gap="sm" align="center">
                <Text size="sm" c="dimmed">
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
              <Group gap={6} align="center">
                <Text size="sm" c="dimmed">
                  Total rows:
                </Text>
                <Text size="sm" fw={600}>
                  {data.length}
                </Text>
              </Group>
            </Group>

            <Group gap="xs">
              <Button variant="light" size="xs" onClick={handleResetAll} leftSection={<IconRefresh size={14} />}>
                Reset Columns/Sort
              </Button>
              <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="sm" radius="md" withEdges />
            </Group>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
};

export default TransactionResubmit;
