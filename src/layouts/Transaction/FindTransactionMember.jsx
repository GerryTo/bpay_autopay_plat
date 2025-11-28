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
import {
  IconFilter,
  IconRefresh,
  IconSearch,
  IconUserSearch,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  v_accountno: '',
  total: '',
  status_check: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const FindTransactionMember = () => {
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
        key: 'v_accountno',
        label: 'Account No',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.v_accountno}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter account..."
            size="xs"
            value={columnFilters.v_accountno}
            onChange={(e) =>
              handleFilterChange('v_accountno', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'total',
        label: 'Total',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.total)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter total..."
            size="xs"
            value={columnFilters.total}
            onChange={(e) => handleFilterChange('total', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'status_check',
        label: 'New',
        minWidth: 120,
        render: (item) =>
          item.status_check === 'true' ? (
            <Badge
              color="red"
              variant="filled"
              size="sm"
            >
              New
            </Badge>
          ) : (
            <Badge
              color="gray"
              variant="light"
              size="sm"
            >
              -
            </Badge>
          ),
        filter: (
          <TextInput
            placeholder="Filter new..."
            size="xs"
            value={columnFilters.status_check}
            onChange={(e) =>
              handleFilterChange('status_check', e.currentTarget.value)
            }
          />
        ),
      },
    ],
    [columnFilters, handleFilterChange]
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
    `${item.v_accountno}-${item.status_check}-${item.total}`;

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
      const response = await transactionAPI.getFindTransactionMemberList();

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
      console.error('Find Transaction Member fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load transaction member data',
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
          acc.total += Number(item.total) || 0;
          return acc;
        },
        { total: 0 }
      ),
    [data]
  );

  const handleReset = () => {
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
                <IconUserSearch
                  size={22}
                  color="#1d4ed8"
                />
                <Text
                  size="xl"
                  fw={700}
                >
                  Find Transaction Member
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
                mt={4}
              >
                Search for member accounts
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
              align="center"
              gap="xl"
              wrap="wrap"
            >
              <Stack gap={4}>
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Total Akun
                </Text>
                <Text fw={700}>{data.length}</Text>
              </Stack>
              <Stack gap={4}>
                <Text
                  size="sm"
                  c="dimmed"
                >
                  Total Nominal
                </Text>
                <Text fw={700}>{formatNumber(totals.total)}</Text>
              </Stack>
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

export default FindTransactionMember;
