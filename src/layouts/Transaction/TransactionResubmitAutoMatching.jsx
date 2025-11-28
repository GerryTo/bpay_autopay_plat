import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import { IconFilter, IconRefresh, IconSearch, IconTransfer, IconSend } from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  id: '',
  date: '',
  bank: '',
  customerAccount: '',
  trxId: '',
  amount: '',
  agentUser: '',
  agentPhone: '',
  agentAccount: '',
};

const typeOptions = [
  { value: '0', label: 'Amount less than' },
  { value: '1', label: 'Phone number do not match' },
  { value: '2', label: 'SMS need to check' },
];

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const TransactionResubmitAutoMatching = () => {
  const [filterType, setFilterType] = useState('0');
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
        if (next.size >= 20) {
          showNotification({
            title: 'Limit',
            message: 'You can select up to 20 rows',
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
            checked={selectedIds.has(item.id)}
            onChange={() => toggleSelect(item.id)}
          />
        ),
      },
      {
        key: 'id',
        label: 'Id',
        minWidth: 80,
        render: (item) => <Text size="sm">{item.id || '-'}</Text>,
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
        key: 'date',
        label: 'Date',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.date || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date..."
            size="xs"
            value={columnFilters.date}
            onChange={(e) => handleFilterChange('date', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'bank',
        label: 'Bank',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.bank || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bank}
            onChange={(e) => handleFilterChange('bank', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'customerAccount',
        label: 'Customer Account',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.customerAccount || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter customer..."
            size="xs"
            value={columnFilters.customerAccount}
            onChange={(e) => handleFilterChange('customerAccount', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'trxId',
        label: 'Trx Id',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.trxId || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={columnFilters.trxId}
            onChange={(e) => handleFilterChange('trxId', e.currentTarget.value)}
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
        key: 'agentUser',
        label: 'User',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.agentUser || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter user..."
            size="xs"
            value={columnFilters.agentUser}
            onChange={(e) => handleFilterChange('agentUser', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'agentPhone',
        label: 'Phone Number',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.agentPhone || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter phone..."
            size="xs"
            value={columnFilters.agentPhone}
            onChange={(e) => handleFilterChange('agentPhone', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'agentAccount',
        label: 'Agent Account No',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.agentAccount || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter account..."
            size="xs"
            value={columnFilters.agentAccount}
            onChange={(e) => handleFilterChange('agentAccount', e.currentTarget.value)}
          />
        ),
      },
    ],
    [columnFilters, handleFilterChange, selectedIds]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } = useTableControls(columns, {
    onResetFilters: () => setColumnFilters(defaultFilters),
  });

  const makeKey = (item) => `${item.id || ''}-${item.trxId || ''}-${item.date || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) =>
        Object.keys(defaultFilters).every((key) => includesValue(item[key], columnFilters[key]))
      ),
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
      const response = await transactionAPI.getResubmitAutoMatchingList(payload);

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records) ? response.data.records : [];
          setData(records);
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
      console.error('Resubmit auto matching fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load resubmit auto matching',
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

    const selectedList = data.filter((item) => selectedIds.has(item.id));
    setLoading(true);
    try {
      const payload = { type: filterType, amount, list: selectedList };
      const response = await transactionAPI.submitResubmitAutoMatching(payload);

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
      console.error('Submit resubmit auto matching error:', error);
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
    setFilterType('0');
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
                  Resubmit Auto Matching
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
                onChange={(value) => setFilterType(value || '0')}
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
                          {col.key !== 'select' && (
                            <ColumnActionMenu
                              columnKey={col.key}
                              sortConfig={sortConfig}
                              onSort={handleSort}
                              onHide={handleHideColumn}
                            />
                          )}
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

export default TransactionResubmitAutoMatching;
