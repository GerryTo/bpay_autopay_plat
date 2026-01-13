import { useEffect, useMemo, useState } from 'react';
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
import { IconListDetails, IconPlus, IconRefresh } from '@tabler/icons-react';
import { merchantAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const defaultFilters = {
  customercode: '',
  merchantcode: '',
  totalFlag: '',
  totalFailed: '',
};

const SpammerTransaction = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRows, setDetailRows] = useState([]);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailContext, setDetailContext] = useState({
    customercode: '',
    merchantcode: '',
    type: '',
  });

  const normalizeRecords = (records = []) =>
    records.map((record) =>
      Object.entries(record || {}).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          try {
            acc[key] = decodeURIComponent(value);
          } catch {
            acc[key] = value;
          }
        } else {
          acc[key] = value;
        }
        return acc;
      }, {})
    );

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getSpammerTransactionList();
      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = normalizeRecords(response.data.records || []);
          const normalized = records.map((item) => ({
            customercode: item.v_customercode || item.customercode || '',
            merchantcode: item.v_merchantcode || item.merchantcode || '',
            totalFlag: Number(item.total_flag ?? item.totalFlag ?? 0),
            totalFailed: Number(item.total_failed ?? item.totalFailed ?? 0),
            raw: item,
          }));
          setData(normalized);
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
      console.error('Spammer transaction load error:', error);
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

  const clearFilters = () => {
    setColumnFilters(defaultFilters);
  };

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.customercode, columnFilters.customercode) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.totalFlag, columnFilters.totalFlag) &&
          includesValue(item.totalFailed, columnFilters.totalFailed)
        );
      }),
    [data, columnFilters]
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const handleAddCustomerCode = async (item) => {
    setLoading(true);
    try {
      const response = await merchantAPI.addSpammerCustomerCode(
        item.customercode,
        item.merchantcode
      );
      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Customer code added',
            color: 'green',
          });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to add customer code',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to add customer code',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Add customer code error:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to add customer code',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (item, type) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailRows([]);
    setDetailTitle(
      type === 'failed' ? 'Transaction Failed List' : 'Order Need To Check List'
    );
    setDetailContext({
      customercode: item.customercode,
      merchantcode: item.merchantcode,
      type,
    });

    try {
      const response = await merchantAPI.getSpammerTransactionDetail({
        customercode: item.customercode,
        merchantcode: item.merchantcode,
        type,
      });
      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = normalizeRecords(response.data.records || []);
          setDetailRows(records);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load detail',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load detail',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Detail load error:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load detail',
        color: 'red',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const detailColumns = useMemo(() => {
    if (detailRows.length === 0) return [];
    return Object.keys(detailRows[0]);
  }, [detailRows]);

  const renderDetailValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return value;
  };

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={`${item.customercode}-${item.merchantcode}-${index}`}>
      <Table.Td>
        <Text
          size="sm"
          fw={600}
        >
          {item.customercode}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.merchantcode}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.totalFlag}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.totalFailed}</Text>
      </Table.Td>
      <Table.Td style={{ whiteSpace: 'nowrap' }}>
        <Group
          gap="xs"
          wrap="nowrap"
        >
          <Button
            size="xs"
            variant="light"
            color="blue"
            leftSection={<IconListDetails size={14} />}
            onClick={() => handleOpenDetail(item, 'flag')}
          >
            Order Need To Check List
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            leftSection={<IconListDetails size={14} />}
            onClick={() => handleOpenDetail(item, 'failed')}
          >
            Transaction Failed List
          </Button>
          <Button
            size="xs"
            variant="light"
            color="yellow"
            leftSection={<IconPlus size={14} />}
            onClick={() => handleAddCustomerCode(item)}
          >
            Add Customer Code
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

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
                Spammer Transaction
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Monitor customer codes with suspicious transaction activity
              </Text>
            </Box>
          </Group>

          <Group>
            <Button
              leftSection={<IconRefresh size={18} />}
              onClick={loadData}
              variant="filled"
              color="blue"
              radius="md"
              disabled={loading}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              onClick={clearFilters}
              variant="light"
              color="red"
              radius="md"
              size="sm"
            >
              Clear Column Filters
            </Button>
          </Group>

          <Box
            pos="relative"
            style={{ minHeight: 400 }}
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
                  minWidth: 1120,
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
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ minWidth: 180 }}>Customer Code</Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>Merchant Code</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Order Need To Check
                    </Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Transaction Failed
                    </Table.Th>
                    <Table.Th style={{ minWidth: 520 }}>Action</Table.Th>
                  </Table.Tr>

                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter customer..."
                        size="xs"
                        value={columnFilters.customercode}
                        onChange={(e) =>
                          handleFilterChange(
                            'customercode',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter merchant..."
                        size="xs"
                        value={columnFilters.merchantcode}
                        onChange={(e) =>
                          handleFilterChange(
                            'merchantcode',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter total..."
                        size="xs"
                        value={columnFilters.totalFlag}
                        onChange={(e) =>
                          handleFilterChange('totalFlag', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter total..."
                        size="xs"
                        value={columnFilters.totalFailed}
                        onChange={(e) =>
                          handleFilterChange(
                            'totalFailed',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
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
                      {filteredData.length}{' '}
                      {filteredData.length === 1 ? 'record' : 'records'}
                      {Object.values(columnFilters).some((val) => val !== '') &&
                        ` (filtered from ${data.length} total)`}
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
                        style={{ width: 80 }}
                        size="sm"
                      />
                    </Group>
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
            )}
          </Box>
        </Stack>
      </Card>

      <Modal
        opened={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailTitle}
        size="lg"
        centered
      >
        <Stack gap="md">
          <Group
            justify="space-between"
            align="center"
          >
            <Box>
              <Text
                size="sm"
                c="dimmed"
              >
                Customer Code: {detailContext.customercode || '-'}
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Merchant Code: {detailContext.merchantcode || '-'}
              </Text>
            </Box>
            <Button
              size="xs"
              variant="light"
              color="blue"
              leftSection={<IconRefresh size={14} />}
              loading={detailLoading}
              onClick={() =>
                handleOpenDetail(detailContext, detailContext.type || 'flag')
              }
            >
              Refresh
            </Button>
          </Group>

          <Box
            pos="relative"
            style={{ minHeight: 240 }}
          >
            <LoadingOverlay
              visible={detailLoading}
              overlayProps={{ radius: 'md', blur: 2 }}
              loaderProps={{ color: 'blue', type: 'dots' }}
            />
            <ScrollArea
              type="auto"
              h={320}
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
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
                    {detailColumns.map((column) => (
                      <Table.Th key={column}>{column}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {detailRows.length > 0 ? (
                    detailRows.map((row, idx) => (
                      <Table.Tr key={idx}>
                        {detailColumns.map((column) => (
                          <Table.Td key={column}>
                            {renderDetailValue(row[column])}
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={detailColumns.length || 1}>
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
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>
        </Stack>
      </Modal>
    </Box>
  );
};

export default SpammerTransaction;
