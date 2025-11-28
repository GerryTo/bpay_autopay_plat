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
  IconArrowUpCircle,
  IconFilter,
  IconRefresh,
} from '@tabler/icons-react';
import { withdrawAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  bankcode: '',
  isenabled: '',
};

const WithdrawAllowedBank = () => {
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
        key: 'bankcode',
        label: 'Bank Code',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.bankcode || '-'}
          </Text>
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
        key: 'isenabled',
        label: 'Is Enabled',
        minWidth: 120,
        render: (item) => (
          <Badge
            color={item.isenabled === 'Y' ? 'green' : 'red'}
            variant="light"
          >
            {item.isenabled === 'Y' ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
        filter: (
          <Select
            placeholder="Filter status..."
            size="xs"
            data={[
              { value: '', label: 'All' },
              { value: 'Y', label: 'Enabled' },
              { value: 'N', label: 'Disabled' },
            ]}
            value={columnFilters.isenabled}
            onChange={(val) => handleFilterChange('isenabled', val || '')}
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 160,
        render: (item) => (
          <Group gap="xs">
            <Button
              size="xs"
              color="green"
              variant="light"
              disabled={item.isenabled === 'Y' || loading}
              onClick={() => toggleStatus(item, 'Y')}
            >
              Enable
            </Button>
            <Button
              size="xs"
              color="red"
              variant="light"
              disabled={item.isenabled === 'N' || loading}
              onClick={() => toggleStatus(item, 'N')}
            >
              Disable
            </Button>
          </Group>
        ),
      },
    ],
    [columnFilters, handleFilterChange, loading]
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

  const makeKey = (item) => `${item.id || item.bankcode}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.isenabled, columnFilters.isenabled)
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

  const fetchList = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await withdrawAPI.getWithdrawBanks();
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          setData(Array.isArray(payload.records) ? payload.records : []);
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load withdraw banks',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load withdraw banks',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Withdraw bank list fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load withdraw allowed bank list',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const toggleStatus = async (item, status) => {
    setLoading(true);
    try {
      const response = await withdrawAPI.setWithdrawBankStatus(item.id, status);
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: payload.message || 'Status updated',
            color: 'green',
          });
          fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to update status',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update status',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Withdraw bank toggle error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update bank status',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

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
                Withdraw Allowed Bank
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage which banks are enabled for withdrawal
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

          <Group gap="sm">
            <Badge
              variant="light"
              color="blue"
            >
              Banks: {data.length}
            </Badge>
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

export default WithdrawAllowedBank;
