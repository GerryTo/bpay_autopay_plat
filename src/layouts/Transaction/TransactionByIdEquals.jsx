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
import {
  IconFilter,
  IconRefresh,
  IconSearch,
  IconTransfer,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  futuretrxid: '',
  customercode: '',
  status: '',
  transactionid: '',
};

const TransactionByIdEquals = () => {
  const [transId, setTransId] = useState('');
  const [history, setHistory] = useState(false);
  const [archive, setArchive] = useState(false);
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
        minWidth: 200,
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
        key: 'customercode',
        label: 'Customer',
        minWidth: 200,
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
        key: 'status',
        label: 'Status',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.status || '-'}</Text>,
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
        key: 'transactionid',
        label: 'Trans ID',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.transactionid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trans id..."
            size="xs"
            value={columnFilters.transactionid}
            onChange={(e) => handleFilterChange('transactionid', e.currentTarget.value)}
          />
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

  const resolveType = () => {
    if (history) return 'history';
    if (archive) return 'archive';
    return 'current';
  };

  const fetchData = async ({ silent = false } = {}) => {
    if (!transId.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Please input Transaction ID first',
        Color: 'yellow',
      });
      return;
    }

    silent ? setRefreshing(true) : setLoading(true);

    try {
      const response = await transactionAPI.getByTransactionIdNew({
        transId: transId.trim(),
        type: resolveType(),
      });

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
      console.error('Transaction by ID New fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load transaction data',
        Color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReset = () => {
    setTransId('');
    setHistory(false);
    setArchive(false);
    setData([]);
    handleClearFilters();
    setCurrentPage(1);
  };

  const handleHistoryToggle = (checked) => {
    setHistory(checked);
    if (checked) setArchive(false);
  };

  const handleArchiveToggle = (checked) => {
    setArchive(checked);
    if (checked) setHistory(false);
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
                  Transaction by ID Backup (equals)
                </Text>
              </Group>
              <Text size="sm" c="dimmed" mt={4}>
                Versi backup equals dengan tampilan mirip Deposit Pending.
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
            <Group align="flex-end" gap="md" wrap="wrap">
              <TextInput
                label="Transaction ID"
                placeholder="Enter Transaction ID"
                value={transId}
                onChange={(e) => setTransId(e.currentTarget.value)}
                style={{ minWidth: 260 }}
              />
              <Checkbox
                label="History"
                checked={history}
                onChange={(e) => handleHistoryToggle(e.currentTarget.checked)}
              />
              <Checkbox
                label="Archive"
                checked={archive}
                onChange={(e) => handleArchiveToggle(e.currentTarget.checked)}
              />
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

export default TransactionByIdEquals;
