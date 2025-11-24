import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Group,
  Table,
  LoadingOverlay,
  Stack,
  Text,
  Card,
  ScrollArea,
  TextInput,
  Pagination,
  Select,
} from '@mantine/core';
import { IconRefresh, IconSearch } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';

const AgentRealtimeReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchantList, setMerchantList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    date: '',
    bankCode: '',
    accNo: '',
    accName: '',
  });

  // Filter data based on column filters
  const filteredData = data.filter((item) => {
    const dateMatch =
      !columnFilters.date ||
      item.date?.toLowerCase().includes(columnFilters.date.toLowerCase());

    const bankMatch =
      !columnFilters.bankCode ||
      item.bankCode?.toLowerCase().includes(columnFilters.bankCode.toLowerCase());

    const accNoMatch =
      !columnFilters.accNo ||
      item.accNo?.toLowerCase().includes(columnFilters.accNo.toLowerCase());

    const accNameMatch =
      !columnFilters.accName ||
      item.accName?.toLowerCase().includes(columnFilters.accName.toLowerCase());

    return dateMatch && bankMatch && accNoMatch && accNameMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  // Update column filter
  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setColumnFilters({
      date: '',
      bankCode: '',
      accNo: '',
      accName: '',
    });
  };

  // Load merchant list (no demo accounts)
  const loadMerchantList = async () => {
    try {
      const response = await merchantAPI.getMerchantListNoDemo();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const merchants = response.data.records || [];
          // Extract merchant codes only
          const merchantCodes = merchants.map((m) => m.merchantcode);
          setMerchantList(merchantCodes);
        }
      }
    } catch (error) {
      console.error('Error loading merchant list:', error);
    }
  };

  // Load report data
  const loadReportData = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getAgentRealtimeReport();

      console.log('API Response:', response);

      if (response.success && response.data) {
        const records = response.data.records || [];
        console.log('Setting data with records:', records);

        // Transform data to include merchant deposits as columns
        const transformedData = records.map((record) => {
          const row = {
            date: record.date,
            bankCode: record.bankCode,
            accNo: record.accNo,
            accName: record.accName,
            lastbalance: record.lastbalance || 0,
            totalDeposit: record.totalDeposit || 0,
            totalWithdraw: record.totalWithdraw || 0,
            totalPending: record.totalPending || 0,
          };

          // Add merchant deposits as individual columns
          merchantList.forEach((merchantCode) => {
            row[merchantCode] =
              record.merchantDeposit && record.merchantDeposit[merchantCode]
                ? record.merchantDeposit[merchantCode]
                : 0;
          });

          return row;
        });

        setData(transformedData);

        if (transformedData.length === 0) {
          showNotification({
            title: 'Info',
            message: 'No data available',
            color: 'blue',
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
      showNotification({
        title: 'Error',
        message: 'Failed to load data',
        color: 'red',
      });
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadReportData();
  };

  // Init - load merchant list first, then load data
  useEffect(() => {
    const init = async () => {
      await loadMerchantList();
    };
    init();
  }, []);

  // Load data when merchant list is ready
  useEffect(() => {
    if (merchantList.length > 0) {
      loadReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantList]);

  // Calculate totals from filtered data
  const calculateTotal = (field) => {
    return filteredData.reduce((sum, item) => sum + (parseFloat(item[field]) || 0), 0);
  };

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
      {/* Fixed columns */}
      <Table.Td>
        <Text size="sm">{item.date}</Text>
      </Table.Td>
      <Table.Td>
        <Text
          size="sm"
          fw={600}
        >
          {item.bankCode}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.accNo}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.accName}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.lastbalance || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>

      {/* Dynamic merchant columns */}
      {merchantList.map((merchantCode) => (
        <Table.Td
          key={merchantCode}
          style={{ textAlign: 'right' }}
        >
          <Text size="sm">
            {parseFloat(item[merchantCode] || 0).toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Text>
        </Table.Td>
      ))}

      {/* Total columns */}
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.totalDeposit || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.totalWithdraw || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.totalPending || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
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
          {/* Header */}
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
                Agent success Trans Realtime (GMT+8)
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Real-time agent transaction report with merchant breakdown
              </Text>
            </Box>
          </Group>

          {/* Action Buttons */}
          <Group>
            <Button
              leftSection={<IconRefresh size={18} />}
              onClick={handleRefresh}
              variant="filled"
              color="blue"
              radius="md"
              disabled={loading}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              leftSection={<IconSearch size={18} />}
              onClick={handleClearFilters}
              variant="light"
              color="red"
              radius="md"
              size="sm"
            >
              Clear Column Filters
            </Button>
          </Group>

          {/* Table */}
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
                  minWidth: 1200 + merchantList.length * 100,
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
                  {/* Header Row */}
                  <Table.Tr>
                    {/* Fixed columns */}
                    <Table.Th style={{ minWidth: 100 }}>Date</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Bank</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Account No</Table.Th>
                    <Table.Th style={{ minWidth: 200 }}>Account Name</Table.Th>
                    <Table.Th style={{ minWidth: 130 }}>Last Balance</Table.Th>

                    {/* Dynamic merchant columns */}
                    {merchantList.map((merchantCode) => (
                      <Table.Th
                        key={merchantCode}
                        style={{ minWidth: 100 }}
                      >
                        {merchantCode}
                      </Table.Th>
                    ))}

                    {/* Total columns */}
                    <Table.Th style={{ minWidth: 130 }}>Total Deposit</Table.Th>
                    <Table.Th style={{ minWidth: 130 }}>Total Withdraw</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Total Pending</Table.Th>
                  </Table.Tr>

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter date..."
                        size="xs"
                        value={columnFilters.date}
                        onChange={(e) =>
                          handleFilterChange('date', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter bank..."
                        size="xs"
                        value={columnFilters.bankCode}
                        onChange={(e) =>
                          handleFilterChange('bankCode', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter account no..."
                        size="xs"
                        value={columnFilters.accNo}
                        onChange={(e) =>
                          handleFilterChange('accNo', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter account name..."
                        size="xs"
                        value={columnFilters.accName}
                        onChange={(e) =>
                          handleFilterChange('accName', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>

                    {/* Empty cells for merchant columns */}
                    {merchantList.map((merchantCode) => (
                      <Table.Th
                        key={merchantCode}
                        style={{ padding: '8px' }}
                      ></Table.Th>
                    ))}

                    {/* Empty cells for total columns */}
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={8 + merchantList.length}>
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
                {/* Footer with totals - always show if there's filtered data */}
                {filteredData.length > 0 && (
                  <Table.Tfoot>
                    <Table.Tr>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {calculateTotal('lastbalance').toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>

                      {/* Dynamic merchant totals */}
                      {merchantList.map((merchantCode) => (
                        <Table.Td
                          key={merchantCode}
                          style={{ textAlign: 'right', fontWeight: 600 }}
                        >
                          {calculateTotal(merchantCode).toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </Table.Td>
                      ))}

                      {/* Total column totals */}
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {calculateTotal('totalDeposit').toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {calculateTotal('totalWithdraw').toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {calculateTotal('totalPending').toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tfoot>
                )}
              </Table>
            </ScrollArea>

            {/* Pagination */}
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
    </Box>
  );
};

export default AgentRealtimeReport;
