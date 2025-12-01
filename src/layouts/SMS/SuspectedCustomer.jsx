import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
  IconAlertTriangle,
  IconFilter,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { smsAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  customerPhone: '',
  totalCount: '',
  totalAmount: '',
  isChecked: '',
};

const formatNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value || '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const SuspectedCustomer = () => {
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

  const handleResetAllFilters = () => {
    handleClearFilters();
    setData([]);
  };

  const columns = useMemo(
    () => [
      {
        key: 'customerPhone',
        label: 'Customer Phone',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.customerPhone || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter customer phone..."
            size="xs"
            value={columnFilters.customerPhone}
            onChange={(e) =>
              handleFilterChange('customerPhone', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'totalCount',
        label: 'Total SMS',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.totalCount ?? '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter total SMS..."
            size="xs"
            value={columnFilters.totalCount}
            onChange={(e) =>
              handleFilterChange('totalCount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'totalAmount',
        label: 'Total Amount',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.totalAmount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter total amount..."
            size="xs"
            value={columnFilters.totalAmount}
            onChange={(e) =>
              handleFilterChange('totalAmount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'isChecked',
        label: 'Status',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            c={item.isChecked ? 'green' : 'red'}
            fw={600}
          >
            {item.isChecked ? 'Checked' : 'Not Checked'}
          </Text>
        ),
        filter: (
          <Select
            placeholder="Filter status..."
            size="xs"
            data={[
              { value: '', label: 'All' },
              { value: 'checked', label: 'Checked' },
              { value: 'notChecked', label: 'Not Checked' },
            ]}
            value={columnFilters.isChecked}
            onChange={(value) => handleFilterChange('isChecked', value || '')}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: 200,
        render: (item) => (
          <Group
            gap={6}
            wrap="wrap"
          >
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => handleShow(item)}
            >
              Show
            </Button>
            <Button
              size="xs"
              variant="light"
              color="green"
              disabled={item.isChecked}
              onClick={() => handleChecked(item)}
            >
              Mark Checked
            </Button>
          </Group>
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
    onResetFilters: handleResetAllFilters,
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        const statusValue = columnFilters.isChecked;
        const statusMatch =
          statusValue === ''
            ? true
            : statusValue === 'checked'
            ? item.isChecked === 1 ||
              item.isChecked === '1' ||
              item.isChecked === true
            : item.isChecked === 0 ||
              item.isChecked === '0' ||
              item.isChecked === false;

        return (
          statusMatch &&
          includesValue(item.customerPhone, columnFilters.customerPhone) &&
          includesValue(item.totalCount, columnFilters.totalCount) &&
          includesValue(item.totalAmount, columnFilters.totalAmount)
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
      const response = await smsAPI.getSuspectedCustomerList();

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records)
            ? response.data.records
            : [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message:
              response.data.message || 'Failed to load suspected customer data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load suspected customer data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Suspected customer fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load suspected customer data',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleChecked = async (item) => {
    const confirmed = window.confirm(
      `Mark customer phone ${item.customerPhone} as checked?`
    );
    if (!confirmed) return;

    setRefreshing(true);
    try {
      const response = await smsAPI.setSuspectedCustomerChecked({
        customerPhone: item.customerPhone,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: 'Customer marked as checked',
            color: 'green',
          });
          fetchData({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message:
              response.data.message || 'Failed to update customer status',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update customer status',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Suspected customer update error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update customer status',
        color: 'red',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleShow = (item) => {
    showNotification({
      title: 'Info',
      message: `Show detail for ${item.customerPhone} (modal not implemented)`,
      color: 'blue',
    });
  };

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, item) => {
          acc.rows += 1;
          acc.totalAmount += Number(item.totalAmount) || 0;
          return acc;
        },
        { rows: 0, totalAmount: 0 }
      ),
    [filteredData]
  );

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
            align="flex-start"
          >
            <Stack gap={4}>
              <Group gap={8}>
                <IconAlertTriangle size={22} />
                <Text
                  size="xl"
                  fw={700}
                >
                  Suspected Customer
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Review suspected customers from SMS patterns. Totals are shown
                in the footer.
              </Text>
            </Stack>

            <Group gap="xs">
              <Button
                variant="light"
                color="gray"
                radius="md"
                size="sm"
                leftSection={<IconFilter size={18} />}
                onClick={handleResetAll}
              >
                Reset Filters
              </Button>
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

          {/* <Card withBorder radius="md" padding="md" shadow="xs">
            <Group align="flex-end" gap="md" wrap="wrap">
              <Group gap="xs">
                <Button
                  leftSection={<IconSearch size={18} />}
                  color="blue"
                  radius="md"
                  onClick={() => fetchData()}
                >
                  Search
                </Button>
              </Group>
            </Group>
          </Card> */}

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
                    paginatedData.map((item, idx) => (
                      <Table.Tr key={`${item.customerPhone || idx}-${idx}`}>
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

                <Table.Tfoot>
                  <Table.Tr>
                    {visibleColumns.map((col, index) => {
                      if (col.key === 'totalAmount') {
                        return (
                          <Table.Th
                            key={`${col.key}-footer`}
                            style={{ textAlign: 'right' }}
                          >
                            {formatNumber(totals.totalAmount)}
                          </Table.Th>
                        );
                      }
                      if (index === 0) {
                        return (
                          <Table.Th key={`${col.key}-footer`}>
                            Totals (Rows: {totals.rows})
                          </Table.Th>
                        );
                      }
                      return <Table.Th key={`${col.key}-footer`} />;
                    })}
                  </Table.Tr>
                </Table.Tfoot>
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
              <Text
                size="sm"
                c="dimmed"
              >
                Total Rows: {totals.rows}
              </Text>
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

export default SuspectedCustomer;
