import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { myBankAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  accountno: '',
  accountname: '',
  bankcode: '',
};

const MyBankBalance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const columns = [
    {
      key: 'accountno',
      label: 'Account No',
      minWidth: 140,
      render: (item) => (
        <Text fw={600} size="sm" c="blue">
          {item.accountno}
        </Text>
      ),
      filter: (
        <TextInput
          placeholder="Filter account..."
          size="xs"
          value={columnFilters.accountno}
          onChange={(e) => handleFilterChange('accountno', e.currentTarget.value)}
        />
      ),
    },
    {
      key: 'accountname',
      label: 'Account Name',
      minWidth: 160,
      render: (item) => <Text size="sm">{item.accountname || '-'}</Text>,
      filter: (
        <TextInput
          placeholder="Filter name..."
          size="xs"
          value={columnFilters.accountname}
          onChange={(e) =>
            handleFilterChange('accountname', e.currentTarget.value)
          }
        />
      ),
    },
    {
      key: 'bankcode',
      label: 'Bank',
      minWidth: 100,
      render: (item) => (
        <Badge color="blue" variant="light">
          {item.bankcode}
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
      key: 'current',
      label: 'Balance',
      minWidth: 140,
      render: (item) => (
        <Text size="sm" className="grid-alignright">
          {formatNumber(item.current)}
        </Text>
      ),
    },
    {
      key: 'daily',
      label: 'Daily',
      minWidth: 120,
      render: (item) => (
        <Text size="sm" className="grid-alignright">
          {formatNumber(item.daily)}
        </Text>
      ),
    },
    {
      key: 'dailyWithdrawLimit',
      label: 'Daily Withdrawal Limit',
      minWidth: 180,
      render: (item) => (
        <Text size="sm" className="grid-alignright">
          {formatNumber(item.dailyWithdrawLimit)}
        </Text>
      ),
    },
    {
      key: 'dailyWithdraw',
      label: 'Daily Withdrawal',
      minWidth: 140,
      render: (item) => (
        <Text size="sm" className="grid-alignright">
          {formatNumber(item.dailyWithdraw)}
        </Text>
      ),
    },
  ];

  const {
    visibleColumns,
    sortConfig,
    handleHideColumn,
    handleSort,
    handleResetAll,
  } = useTableControls(columns, {
    onResetFilters: () => setColumnFilters(defaultFilters),
    onResetSelection: () => setSelectedKeys([]),
  });

  const makeKey = (item) => `${item.accountno || ''}-${item.bankcode || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.accountno, columnFilters.accountno) &&
          includesValue(item.accountname, columnFilters.accountname) &&
          includesValue(item.bankcode, columnFilters.bankcode)
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

  const selectedRecords = useMemo(
    () => data.filter((item) => selectedKeys.includes(makeKey(item))),
    [data, selectedKeys]
  );

  const pageKeys = paginatedData.map((item) => makeKey(item));
  const pageFullySelected =
    pageKeys.length > 0 && pageKeys.every((key) => selectedKeys.includes(key));
  const pagePartiallySelected =
    pageKeys.some((key) => selectedKeys.includes(key)) && !pageFullySelected;

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await myBankAPI.getMyBankBalance();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          setData(response.data.records || []);
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
      console.error('Error fetching mybank balance:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const handleClearFilters = () => {
    setColumnFilters(defaultFilters);
  };

  const toggleRow = (item) => {
    const key = makeKey(item);
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key]
    );
  };

  const toggleAllOnPage = () => {
    if (pageFullySelected) {
      setSelectedKeys((current) =>
        current.filter((key) => !pageKeys.includes(key))
      );
    } else {
      setSelectedKeys((current) => [
        ...current,
        ...pageKeys.filter((key) => !current.includes(key)),
      ]);
    }
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return value;
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
      numberValue
    );
  };

  const totalBalance = useMemo(
    () =>
      filteredData.reduce((sum, item) => sum + (Number(item.current) || 0), 0),
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
        <Stack gap="lg">
          <Group
            justify="space-between"
            align="center"
          >
            <Box>
              <Text
                size="xl"
                fw={700}
                c="dark"
              >
                My Bank Balance
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Ringkasan saldo dan limit harian akun MyBank
              </Text>
            </Box>
            <Badge
              color="blue"
              size="lg"
              variant="light"
            >
              Total Balance: {formatNumber(totalBalance)}
            </Badge>
          </Group>

          <Group
            gap="sm"
            wrap="wrap"
            align="flex-end"
          >
            {/* <TextInput
              label="Account No"
              placeholder="Filter account..."
              value={columnFilters.accountno}
              onChange={(e) =>
                handleFilterChange('accountno', e.currentTarget.value)
              }
            />
            <TextInput
              label="Account Name"
              placeholder="Filter name..."
              value={columnFilters.accountname}
              onChange={(e) =>
                handleFilterChange('accountname', e.currentTarget.value)
              }
            />
            <TextInput
              label="Bank"
              placeholder="Filter bank..."
              value={columnFilters.bankcode}
              onChange={(e) =>
                handleFilterChange('bankcode', e.currentTarget.value)
              }
            /> */}
            <Button
              variant="light"
              color="gray"
              size="sm"
              leftSection={<IconRefresh size={16} />}
              onClick={loadData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="light"
              color="gray"
              size="sm"
              onClick={handleResetAll}
            >
              Reset
            </Button>
          </Group>

          <Box
            pos="relative"
            style={{ minHeight: 420 }}
          >
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: 'md', blur: 2 }}
              loaderProps={{ color: 'blue', type: 'dots' }}
            />

            <ScrollArea
              type="auto"
              scrollbarSize={10}
              scrollHideDelay={500}
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 1200,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
                styles={{
                  th: {
                    backgroundColor: '#f8f9fa',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#0f1011ff',
                    whiteSpace: 'nowrap',
                    padding: '12px 16px',
                  },
                  td: {
                    padding: '10px 16px',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 48 }}>
                      <Checkbox
                        checked={pageFullySelected}
                        indeterminate={pagePartiallySelected}
                        onChange={toggleAllOnPage}
                        aria-label="Select all rows"
                      />
                    </Table.Th>
                    {visibleColumns.map((col) => (
                      <Table.Th key={col.key} style={{ minWidth: col.minWidth }}>
                        <Group gap={6} align="center" wrap="nowrap">
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
                    <Table.Th>
                      <Checkbox
                        checked={pageFullySelected}
                        indeterminate={pagePartiallySelected}
                        onChange={toggleAllOnPage}
                        aria-label="Select all rows"
                      />
                    </Table.Th>
                    {visibleColumns.map((col) => (
                      <Table.Th key={`filter-${col.key}`}>
                        {col.filter}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => {
                      const key = makeKey(item);
                      const selected = selectedKeys.includes(key);
                      return (
                        <Table.Tr
                          key={key}
                          bg={selected ? 'rgba(34, 139, 230, 0.06)' : undefined}
                        >
                          <Table.Td>
                            <Checkbox
                              checked={selected}
                              onChange={() => toggleRow(item)}
                              aria-label="Select row"
                            />
                          </Table.Td>
                          {visibleColumns.map((col) => (
                            <Table.Td key={`${key}-${col.key}`}>
                              {col.render(item)}
                            </Table.Td>
                          ))}
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={8}>
                        <Stack
                          align="center"
                          py="xl"
                          gap="xs"
                        >
                          <Text
                            size="lg"
                            c="dimmed"
                            fw={500}
                          >
                            No Data Available
                          </Text>
                          <Text
                            size="sm"
                            c="dimmed"
                          >
                            {Object.values(columnFilters).some(
                              (val) => val !== ''
                            )
                              ? 'Coba sesuaikan filter pencarian'
                              : 'Klik Refresh untuk memuat data terbaru'}
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {filteredData.length > 0 && (
              <Stack
                gap="md"
                mt="md"
                pt="md"
                style={{ borderTop: '1px solid #dee2e6' }}
              >
                <Group
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                >
                  <Group gap="md">
                    <Text
                      size="sm"
                      c="dimmed"
                      fw={500}
                    >
                      Showing {startIndex + 1}-
                      {Math.min(endIndex, filteredData.length)} of{' '}
                      {filteredData.length} records
                    </Text>
                    <Group
                      gap="xs"
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
                  </Group>

                  <Group gap="sm">
                    <Button
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Clear Filters
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
            )}
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default MyBankBalance;
