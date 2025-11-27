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
import { IconFilter, IconRefresh } from '@tabler/icons-react';
import { withdrawAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  id: '',
  merchantcode: '',
  customercode: '',
  amount: '',
  transtime: '',
  bankcode: '',
  dstbankaccount: '',
  accountname: '',
  transactionid: '',
  status: '',
  message: '',
  futureid: '',
  parentfutureid: '',
  type: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const WithdrawQueue = () => {
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

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'Queue ID',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.id}
          </Text>
        ),
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
        minWidth: 130,
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
        key: 'amount',
        label: 'Amount',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
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
        key: 'transtime',
        label: 'Client Timestamp',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.transtime || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp..."
            size="xs"
            value={columnFilters.transtime}
            onChange={(e) =>
              handleFilterChange('transtime', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'bankcode',
        label: 'Bank',
        minWidth: 90,
        render: (item) => <Text size="sm">{item.bankcode || '-'}</Text>,
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
        key: 'dstbankaccount',
        label: 'Dest Bank Account',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.dstbankaccount || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dest account..."
            size="xs"
            value={columnFilters.dstbankaccount}
            onChange={(e) =>
              handleFilterChange('dstbankaccount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountname',
        label: 'Dest Account Name',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.accountname || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter dest name..."
            size="xs"
            value={columnFilters.accountname}
            onChange={(e) =>
              handleFilterChange('accountname', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'transactionid',
        label: 'Transaction ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.transactionid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter transaction..."
            size="xs"
            value={columnFilters.transactionid}
            onChange={(e) =>
              handleFilterChange('transactionid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'status',
        label: 'Status',
        minWidth: 140,
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
        key: 'message',
        label: 'Message',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.message || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter message..."
            size="xs"
            value={columnFilters.message}
            onChange={(e) =>
              handleFilterChange('message', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'futureid',
        label: 'Future ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.futureid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter future id..."
            size="xs"
            value={columnFilters.futureid}
            onChange={(e) =>
              handleFilterChange('futureid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'parentfutureid',
        label: 'Parent Future ID',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.parentfutureid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter parent id..."
            size="xs"
            value={columnFilters.parentfutureid}
            onChange={(e) =>
              handleFilterChange('parentfutureid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'type',
        label: 'Type',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.type || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter type..."
            size="xs"
            value={columnFilters.type}
            onChange={(e) => handleFilterChange('type', e.currentTarget.value)}
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

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.id, columnFilters.id) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.customercode, columnFilters.customercode) &&
          includesValue(item.amount, columnFilters.amount) &&
          includesValue(item.transtime, columnFilters.transtime) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.dstbankaccount, columnFilters.dstbankaccount) &&
          includesValue(item.accountname, columnFilters.accountname) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.status, columnFilters.status) &&
          includesValue(item.message, columnFilters.message) &&
          includesValue(item.futureid, columnFilters.futureid) &&
          includesValue(item.parentfutureid, columnFilters.parentfutureid) &&
          includesValue(item.type, columnFilters.type)
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

  const decodeRecord = (record) =>
    Object.entries(record || {}).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        try {
          acc[key] = decodeURIComponent(value);
        } catch (_) {
          acc[key] = value;
        }
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

  const mapRecords = (records = []) =>
    records.map((item) => ({
      ...item,
      amount: Number(item.amount) || 0,
    }));

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      silent ? setRefreshing(true) : setLoading(true);
      try {
        const response = await withdrawAPI.getWithdrawQueue();
        if (response.success && response.data) {
          const payload = response.data;
          if ((payload.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payload.records) ? payload.records : [];
            const decoded = records.map(decodeRecord);
            setData(mapRecords(decoded));
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load withdraw queue',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load withdraw queue',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Withdraw queue list fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load withdraw queue',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleResetFiltersAll = () => {
    setColumnFilters(defaultFilters);
    handleResetAll();
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
                Withdraw Queue
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Queue monitoring (styled like Deposit Pending)
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
                onClick={handleResetFiltersAll}
              >
                Reset
              </Button>
            </Group>
          </Group>

          <Group
            gap="xs"
            wrap="wrap"
            justify="flex-start"
            align="center"
          >
            <Badge
              variant="light"
              color="gray"
            >
              Rows: {data.length}
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
                      <Table.Tr key={`${item.id}-${item.transactionid}`}>
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

export default WithdrawQueue;
