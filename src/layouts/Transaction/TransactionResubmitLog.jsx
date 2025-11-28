import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconListDetails, IconRefresh, IconSearch, IconTransfer } from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  date: '',
  filter: '',
  count: '',
  success: '',
  isfinished: '',
  finisheddate: '',
  finisheddate2: '',
};

const defaultDetailFilters = {
  trxid: '',
  futuretrxid: '',
  reason: '',
};

const TransactionResubmitLog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTrxid, setSearchTrxid] = useState('');

  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailFilters, setDetailFilters] = useState(defaultDetailFilters);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleDetailFilterChange = useCallback((column, value) => {
    setDetailFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
  }, []);

  const handleClearDetailFilters = useCallback(() => {
    setDetailFilters(defaultDetailFilters);
  }, []);

  const columns = useMemo(
    () => [
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
        key: 'filter',
        label: 'Filter',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.filter || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter text..."
            size="xs"
            value={columnFilters.filter}
            onChange={(e) => handleFilterChange('filter', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'count',
        label: 'Number of Transaction',
        minWidth: 140,
        render: (item) => (
          <Text size="sm" className="grid-alignright">
            {item.count ?? '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter count..."
            size="xs"
            value={columnFilters.count}
            onChange={(e) => handleFilterChange('count', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'success',
        label: 'Success Transaction',
        minWidth: 140,
        render: (item) => (
          <Text size="sm" className="grid-alignright">
            {item.success ?? '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter success..."
            size="xs"
            value={columnFilters.success}
            onChange={(e) => handleFilterChange('success', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'isfinished',
        label: 'Is Finished',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.isfinished ?? '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter..."
            size="xs"
            value={columnFilters.isfinished}
            onChange={(e) => handleFilterChange('isfinished', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'finisheddate',
        label: 'Finished Date',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.finisheddate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter finished..."
            size="xs"
            value={columnFilters.finisheddate}
            onChange={(e) => handleFilterChange('finisheddate', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'finisheddate2',
        label: 'Finished Date (2)',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.finisheddate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter finished..."
            size="xs"
            value={columnFilters.finisheddate2}
            onChange={(e) => handleFilterChange('finisheddate2', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 110,
        render: (item) => (
          <Button
            size="xs"
            color="indigo"
            leftSection={<IconListDetails size={14} />}
            onClick={() => handleOpenDetail(item)}
          >
            Detail
          </Button>
        ),
      },
    ],
    [columnFilters, handleFilterChange]
  );

  const detailColumns = useMemo(
    () => [
      {
        key: 'trxid',
        label: 'Trx Id',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.trxid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={detailFilters.trxid}
            onChange={(e) => handleDetailFilterChange('trxid', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'futuretrxid',
        label: 'FutureTrx Id',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.futuretrxid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter future trx..."
            size="xs"
            value={detailFilters.futuretrxid}
            onChange={(e) => handleDetailFilterChange('futuretrxid', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'reason',
        label: 'Reason',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.reason || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter reason..."
            size="xs"
            value={detailFilters.reason}
            onChange={(e) => handleDetailFilterChange('reason', e.currentTarget.value)}
          />
        ),
      },
    ],
    [detailFilters, handleDetailFilterChange]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } = useTableControls(columns, {
    onResetFilters: () => setColumnFilters(defaultFilters),
  });

  const makeKey = (item) => `${item.date || ''}-${item.filter || ''}-${item.count || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) =>
        Object.keys(defaultFilters).every((key) => {
          const value =
            key === 'finisheddate2'
              ? item.finisheddate
              : key === 'finisheddate'
                ? item.finisheddate
                : item[key];
          return includesValue(value, columnFilters[key]);
        })
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
      const payload = { trxid: searchTrxid };
      const response = await transactionAPI.getResubmitTransactionLogs(payload);

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
      console.error('Resubmit transaction log fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load resubmit transaction log',
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

  const handleOpenDetail = async (item) => {
    if (!item?.id) {
      showNotification({
        title: 'Info',
        message: 'Invalid log record',
        Color: 'yellow',
      });
      return;
    }
    setSelectedLog(item);
    setDetailLoading(true);
    setDetailFilters(defaultDetailFilters);
    setDetailData([]);
    openDetail();

    try {
      const response = await transactionAPI.getResubmitTransactionLogDetail(item.id);
      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          setDetailData(Array.isArray(response.data.records) ? response.data.records : []);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load detail',
            Color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load detail',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Resubmit transaction log detail error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load detail',
        Color: 'red',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredDetail = useMemo(
    () =>
      detailData.filter((item) =>
        Object.keys(defaultDetailFilters).every((key) => includesValue(item[key], detailFilters[key]))
      ),
    [detailData, detailFilters]
  );

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'md', blur: 2 }} />
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Group gap={8} align="center">
              <IconTransfer size={22} color="#2563eb" />
              <Text size="xl" fw={700}>
                Resubmit Transaction Log
              </Text>
            </Group>

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
                onClick={() => {
                  setSearchTrxid('');
                  handleClearFilters();
                  fetchData();
                }}
              >
                Reset
              </Button>
            </Group>
          </Group>

          <Card withBorder radius="md" padding="md" shadow="xs">
            <Group align="flex-end" gap="md" wrap="wrap">
              <TextInput
                label="Trx ID"
                placeholder="Search Trx ID..."
                value={searchTrxid}
                onChange={(e) => setSearchTrxid(e.currentTarget.value)}
                style={{ minWidth: 220 }}
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
                          {col.key !== 'action' && (
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

      <Modal opened={detailOpened} onClose={closeDetail} title="Transaction Detail" size="lg" centered>
        <LoadingOverlay visible={detailLoading} overlayProps={{ radius: 'md', blur: 2 }} />
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text size="sm" fw={600}>
              Log ID: {selectedLog?.id ?? '-'}
            </Text>
            <Button size="xs" variant="light" color="gray" onClick={handleClearDetailFilters}>
              Clear Filters
            </Button>
          </Group>

          <ScrollArea type="auto" h={360}>
            <Table withTableBorder withColumnBorders highlightOnHover horizontalSpacing="sm" verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  {detailColumns.map((col) => (
                    <Table.Th key={col.key} style={{ minWidth: col.minWidth || 120 }}>
                      <Text size="sm" fw={600}>
                        {col.label}
                      </Text>
                    </Table.Th>
                  ))}
                </Table.Tr>
                <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                  {detailColumns.map((col) => (
                    <Table.Th key={`${col.key}-filter`} style={{ minWidth: col.minWidth || 120 }}>
                      {col.filter || null}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredDetail.length > 0 ? (
                  filteredDetail.map((item, idx) => (
                    <Table.Tr key={`${item.trxid || ''}-${idx}`}>
                      {detailColumns.map((col) => (
                        <Table.Td key={col.key}>{col.render(item)}</Table.Td>
                      ))}
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={detailColumns.length}>
                      <Text ta="center" c="dimmed">
                        No data available
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Stack>
      </Modal>
    </Box>
  );
};

export default TransactionResubmitLog;
