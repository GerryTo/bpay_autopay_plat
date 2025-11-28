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
import { IconRefresh, IconFilter } from '@tabler/icons-react';
import { depositAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  bankaccountno: '',
  bankaccountname: '',
  bankcode: '',
  total: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const DepositQueueAlert = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filterInput = (key, placeholder) => (
    <TextInput
      placeholder={placeholder}
      size="xs"
      value={columnFilters[key]}
      onChange={(e) => handleFilterChange(key, e.currentTarget.value)}
      leftSection={<IconFilter size={14} />}
      leftSectionPointerEvents="none"
    />
  );

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
        key: 'bankaccountno',
        label: 'Account No',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.bankaccountno}
          </Text>
        ),
        filter: filterInput('bankaccountno', 'Filter account no...'),
      },
      {
        key: 'bankaccountname',
        label: 'Account Name',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.bankaccountname || '-'}</Text>,
        filter: filterInput('bankaccountname', 'Filter account name...'),
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
        filter: filterInput('bankcode', 'Filter bank...'),
      },
      {
        key: 'total',
        label: 'Pending Transaction',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.total)}
          </Text>
        ),
        filter: filterInput('total', 'Filter total...'),
      },
    ],
    [columnFilters]
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
    `${item.bankaccountno || ''}-${item.bankcode || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.bankaccountno, columnFilters.bankaccountno) &&
          includesValue(item.bankaccountname, columnFilters.bankaccountname) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.total, columnFilters.total)
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

  const fetchData = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const response = await depositAPI.getDepositQueueAlert();

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
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Deposit queue alert fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load deposit queue alert',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
                Deposit Queue Alert
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Accounts with pending transactions
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
                onClick={() => {
                  handleClearFilters();
                }}
              >
                Reset
              </Button>
            </Group>
          </Group>

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

export default DepositQueueAlert;
