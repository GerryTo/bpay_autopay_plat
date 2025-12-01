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
  IconMessageOff,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { smsAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  timestamp: '',
  futuretrxid: '',
  trans_phonenumber: '',
  sms_phonenumber: '',
  trans_amount: '',
  sms_amount: '',
  suspectedreason: '',
};

const formatNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value || '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const SmsCriteriaNotMatchingById = () => {
  const [trxId, setTrxId] = useState('');
  const [history, setHistory] = useState(false);
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
    setTrxId('');
    setHistory(false);
    setData([]);
  };

  const columns = useMemo(
    () => [
      {
        key: 'timestamp',
        label: 'Timestamp',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.timestamp || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp..."
            size="xs"
            value={columnFilters.timestamp}
            onChange={(e) =>
              handleFilterChange('timestamp', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'futuretrxid',
        label: 'Trx ID',
        minWidth: 130,
        render: (item) => {
          const isExpired =
            item.futuretrxid === '-1' || item.futuretrxid === -1;
          return (
            <Text
              size="sm"
              fw={600}
              c={isExpired ? 'red' : undefined}
            >
              {isExpired ? 'Expired' : item.futuretrxid || '-'}
            </Text>
          );
        },
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={columnFilters.futuretrxid}
            onChange={(e) =>
              handleFilterChange('futuretrxid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'trans_phonenumber',
        label: 'Trans Phone Number',
        minWidth: 150,
        render: (item) => (
          <Text size="sm">{item.trans_phonenumber || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter trans phone..."
            size="xs"
            value={columnFilters.trans_phonenumber}
            onChange={(e) =>
              handleFilterChange('trans_phonenumber', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'sms_phonenumber',
        label: 'SMS Phone Number',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.sms_phonenumber || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter SMS phone..."
            size="xs"
            value={columnFilters.sms_phonenumber}
            onChange={(e) =>
              handleFilterChange('sms_phonenumber', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'trans_amount',
        label: 'Trans Amount',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.trans_amount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter trans amount..."
            size="xs"
            value={columnFilters.trans_amount}
            onChange={(e) =>
              handleFilterChange('trans_amount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'sms_amount',
        label: 'SMS Amount',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.sms_amount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter SMS amount..."
            size="xs"
            value={columnFilters.sms_amount}
            onChange={(e) =>
              handleFilterChange('sms_amount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'suspectedreason',
        label: 'Suspected Reason',
        minWidth: 220,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
          >
            {item.suspectedreason || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter reason..."
            size="xs"
            value={columnFilters.suspectedreason}
            onChange={(e) =>
              handleFilterChange('suspectedreason', e.currentTarget.value)
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
    onResetFilters: handleResetAllFilters,
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.timestamp, columnFilters.timestamp) &&
          includesValue(item.futuretrxid, columnFilters.futuretrxid) &&
          includesValue(
            item.trans_phonenumber,
            columnFilters.trans_phonenumber
          ) &&
          includesValue(item.sms_phonenumber, columnFilters.sms_phonenumber) &&
          includesValue(item.trans_amount, columnFilters.trans_amount) &&
          includesValue(item.sms_amount, columnFilters.sms_amount) &&
          includesValue(item.suspectedreason, columnFilters.suspectedreason)
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
    if (!trxId.trim()) {
      showNotification({
        title: 'Validation',
        message: 'Please input Transaction ID first',
        color: 'yellow',
      });
      return;
    }

    silent ? setRefreshing(true) : setLoading(true);

    try {
      const response = await smsAPI.getCriteriaNotMatchingById({
        trxId: trxId.trim(),
        history,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records)
            ? response.data.records
            : [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load SMS data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load SMS data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('SMS criteria not matching fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load SMS data',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, item) => {
          acc.rows += 1;
          acc.transAmount += Number(item.trans_amount) || 0;
          acc.smsAmount += Number(item.sms_amount) || 0;
          return acc;
        },
        { rows: 0, transAmount: 0, smsAmount: 0 }
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
                <IconMessageOff size={22} />
                <Text
                  size="xl"
                  fw={700}
                >
                  SMS Criteria Not Matching by ID
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Find SMS that do not meet criteria using a Transaction ID.
                Totals sit in the footer.
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

          <Card
            withBorder
            radius="md"
            padding="md"
            shadow="xs"
          >
            <Group
              align="flex-end"
              gap="md"
              wrap="wrap"
            >
              <TextInput
                label="Transaction ID"
                placeholder="Enter Transaction ID"
                value={trxId}
                onChange={(e) => setTrxId(e.currentTarget.value)}
                style={{ minWidth: 260 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchData();
                  }
                }}
              />
              <Checkbox
                label="Include History"
                checked={history}
                onChange={(e) => setHistory(e.currentTarget.checked)}
              />
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
                    paginatedData.map((item, idx) => (
                      <Table.Tr key={`${item.futuretrxid || idx}-${idx}`}>
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
                  {/* <Table.Tr>
                    {visibleColumns.map((col, index) => {
                      if (col.key === 'trans_amount') {
                        return (
                          <Table.Th key={`${col.key}-footer`} style={{ textAlign: 'right' }}>
                            {formatNumber(totals.transAmount)}
                          </Table.Th>
                        );
                      }
                      if (col.key === 'sms_amount') {
                        return (
                          <Table.Th key={`${col.key}-footer`} style={{ textAlign: 'right' }}>
                            {formatNumber(totals.smsAmount)}
                          </Table.Th>
                        );
                      }
                      if (index === 0) {
                        return <Table.Th key={`${col.key}-footer`}>Totals (Rows: {totals.rows})</Table.Th>;
                      }
                      return <Table.Th key={`${col.key}-footer`} />;
                    })}
                  </Table.Tr> */}
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

export default SmsCriteriaNotMatchingById;
