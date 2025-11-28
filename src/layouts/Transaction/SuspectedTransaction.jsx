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
} from '@mantine/core';
import { IconAlertTriangle, IconFilter, IconRefresh, IconSearch, IconShieldCheck } from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  futuretrxid: '',
  timestamp: '',
  merchantcode: '',
  customercode: '',
  bankcode: '',
  amount: '',
  status: '',
  notes2: '',
  notes3: '',
  phonenumber: '',
  user: '',
  matchedsms: '',
  smsdate: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const SuspectedTransaction = () => {
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

  const columns = useMemo(
    () => [
      {
        key: 'futuretrxid',
        label: 'Future Trx ID',
        minWidth: 140,
        render: (item) => (
          <Text size="sm" fw={600}>
            {item.futuretrxid}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={columnFilters.futuretrxid}
            onChange={(e) => handleFilterChange('futuretrxid', e.currentTarget.value)}
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
            onChange={(e) => handleFilterChange('timestamp', e.currentTarget.value)}
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
            onChange={(e) => handleFilterChange('merchantcode', e.currentTarget.value)}
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
            onChange={(e) => handleFilterChange('customercode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'bankcode',
        label: 'Bank',
        minWidth: 100,
        render: (item) => (
          <Badge color="blue" variant="light">
            {item.bankcode || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bankcode}
            onChange={(e) => handleFilterChange('bankcode', e.currentTarget.value)}
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
        key: 'status',
        label: 'Status',
        minWidth: 140,
        render: (item) => (
          <Badge color="gray" variant="outline">
            {item.status || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter status..."
            size="xs"
            value={columnFilters.status}
            onChange={(e) => handleFilterChange('status', e.currentTarget.value)}
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
            onChange={(e) => handleFilterChange('notes2', e.currentTarget.value)}
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
            onChange={(e) => handleFilterChange('notes3', e.currentTarget.value)}
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
            onChange={(e) => handleFilterChange('phonenumber', e.currentTarget.value)}
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
        key: 'matchedsms',
        label: 'Sms Matched',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.matchedsms || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter sms matched..."
            size="xs"
            value={columnFilters.matchedsms}
            onChange={(e) => handleFilterChange('matchedsms', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'smsdate',
        label: 'Sms Date',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.smsdate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter sms date..."
            size="xs"
            value={columnFilters.smsdate}
            onChange={(e) => handleFilterChange('smsdate', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 140,
        render: (item) => (
          <Button
            size="xs"
            variant="filled"
            color="teal"
            onClick={() => handleProcess(item.futuretrxid)}
          >
            Process
          </Button>
        ),
      },
    ],
    [columnFilters, handleFilterChange]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } =
    useTableControls(columns, {
      onResetFilters: () => setColumnFilters(defaultFilters),
    });

  const makeKey = (item) => `${item.futuretrxid || ''}-${item.transactionid || ''}`;

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
      const response = await transactionAPI.getSuspectedTransactions();

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records) ? response.data.records : [];
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
      console.error('Suspected transactions fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load suspected transactions',
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

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, item) => {
          acc.amount += Number(item.amount) || 0;
          return acc;
        },
        { amount: 0 }
      ),
    [data]
  );

  const handleProcess = async (futuretrxid) => {
    if (!futuretrxid) return;
    setLoading(true);
    try {
      const response = await transactionAPI.processSuspectedTransaction(futuretrxid);
      if (response.success && response.data) {
        showNotification({
          title: (response.data.status || '').toLowerCase() === 'ok' ? 'Success' : 'Info',
          message: response.data.message || 'Process completed',
          Color: (response.data.status || '').toLowerCase() === 'ok' ? 'green' : 'yellow',
        });
        fetchData({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to process transaction',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Process suspected transaction error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to process transaction',
        Color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData([]);
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
                <IconAlertTriangle size={22} color="#d97706" />
                <Text size="xl" fw={700}>
                  Suspected Transaction
                </Text>
              </Group>
              <Text size="sm" c="dimmed" mt={4}>
                Suspected transactions styled like Deposit Pending.
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

          <Card withBorder radius="md" padding="md" shadow="xs">
            <Group align="center" gap="xl" wrap="wrap">
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Total Rows
                </Text>
                <Text fw={700}>{data.length}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="sm" c="dimmed">
                  Total Amount
                </Text>
                <Text fw={700}>{formatNumber(totals.amount)}</Text>
              </Stack>
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
                          <Table.Td key={col.key}>
                            {col.key === 'action' ? (
                              <Button
                                size="xs"
                                variant="filled"
                                color="teal"
                                onClick={() => handleProcess(item.futuretrxid)}
                              >
                                Process
                              </Button>
                            ) : (
                              col.render(item)
                            )}
                          </Table.Td>
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

export default SuspectedTransaction;
