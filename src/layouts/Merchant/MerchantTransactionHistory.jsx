import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Table,
  ScrollArea,
  Paper,
  Pagination,
  Select,
  TextInput,
  Badge,
  Grid,
  Divider,
  Popover,
} from '@mantine/core';
import { IconRefresh, IconSearch, IconCalendar } from '@tabler/icons-react';
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';

// Custom styles for react-date-range
const dateRangeStyles = `
  .rdrCalendarWrapper {
    background: white;
    border-radius: 8px;
  }
  .rdrMonth {
    padding: 0;
  }
  .rdrMonthAndYearWrapper {
    padding-top: 10px;
    height: 60px;
  }
  .rdrMonthName {
    font-weight: 600;
  }
  .rdrDayNumber span {
    font-weight: 400;
  }
  .rdrDayToday .rdrDayNumber span:after {
    background: #228be6;
  }
  .rdrDefinedRangesWrapper {
    border-right: 1px solid #e9ecef;
  }
  .rdrStaticRange {
    border: 0;
    padding: 8px 16px;
  }
  .rdrStaticRange:hover {
    background: #f1f3f5;
  }
  .rdrStaticRangeSelected {
    background: #e7f5ff;
    color: #228be6;
    font-weight: 500;
  }
`;

const MerchantTransactionHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(''); // ''=all, '9'=pending, '0'=accepted, '8'=failed
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Balance data
  const [merchantBalance, setMerchantBalance] = useState({
    opening: 0,
    current: 0,
  });

  // Summary data
  const [summary, setSummary] = useState({
    pendingDB: 0,
    pendingCR: 0,
    DB: 0,
    CR: 0,
    fee: 0,
  });

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    futuretrxid: '',
    timestamp: '',
    accountno: '',
    customercode: '',
    bankcode: '',
    transactiontype: '',
    status: '',
  });

  // Static ranges for quick selection
  const staticRanges = [
    {
      label: 'Today',
      range: () => ({
        startDate: new Date(),
        endDate: new Date(),
      }),
      isSelected: () => false,
    },
    {
      label: 'Yesterday',
      range: () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return {
          startDate: date,
          endDate: date,
        };
      },
      isSelected: () => false,
    },
    {
      label: 'Last 7 Days',
      range: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        return { startDate, endDate };
      },
      isSelected: () => false,
    },
    {
      label: 'Last 30 Days',
      range: () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);
        return { startDate, endDate };
      },
      isSelected: () => false,
    },
    {
      label: 'This Month',
      range: () => {
        const now = new Date();
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
      },
      isSelected: () => false,
    },
    {
      label: 'Last Month',
      range: () => {
        const now = new Date();
        return {
          startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          endDate: new Date(now.getFullYear(), now.getMonth(), 0),
        };
      },
      isSelected: () => false,
    },
  ];

  // Process data: compute DB/CR columns
  const processedData = data.map((item) => {
    const transType = item.transactiontype;
    let DB = '0';
    let CR = '0';

    if (transType === 'D' || transType === 'M' || transType === 'Y') {
      DB = item.amount || '0';
      CR = '0';
    } else {
      CR = item.amount || '0';
      DB = '0';
    }

    return {
      ...item,
      DB: Number(DB),
      CR: Number(CR),
    };
  });

  // Filter data
  const filteredData = processedData.filter((item) => {
    const futuretrxidMatch =
      !columnFilters.futuretrxid ||
      item.futuretrxid
        ?.toLowerCase()
        .includes(columnFilters.futuretrxid.toLowerCase());

    const timestampMatch =
      !columnFilters.timestamp ||
      item.timestamp
        ?.toLowerCase()
        .includes(columnFilters.timestamp.toLowerCase());

    const accountnoMatch =
      !columnFilters.accountno ||
      item.accountno
        ?.toLowerCase()
        .includes(columnFilters.accountno.toLowerCase());

    const customercodeMatch =
      !columnFilters.customercode ||
      item.customercode
        ?.toLowerCase()
        .includes(columnFilters.customercode.toLowerCase());

    const bankcodeMatch =
      !columnFilters.bankcode ||
      item.bankcode
        ?.toLowerCase()
        .includes(columnFilters.bankcode.toLowerCase());

    const transtypeMatch =
      !columnFilters.transactiontype ||
      item.transactiontype
        ?.toLowerCase()
        .includes(columnFilters.transactiontype.toLowerCase());

    const statusMatch =
      !columnFilters.status ||
      item.status?.toLowerCase().includes(columnFilters.status.toLowerCase());

    return (
      futuretrxidMatch &&
      timestampMatch &&
      accountnoMatch &&
      customercodeMatch &&
      bankcodeMatch &&
      transtypeMatch &&
      statusMatch
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, statusFilter, dateRange]);

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
      futuretrxid: '',
      timestamp: '',
      accountno: '',
      customercode: '',
      bankcode: '',
      transactiontype: '',
      status: '',
    });
  };

  // Format date to YYYY-MM-DD HH:mm:ss
  const formatDate = (date, isEndOfDay = false) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (isEndOfDay) {
      return `${year}-${month}-${day} 23:59:59`;
    }
    return `${year}-${month}-${day} 00:00:00`;
  };

  // Calculate summary
  const calculateSummary = (records) => {
    const newSummary = {
      pendingDB: 0,
      pendingCR: 0,
      DB: 0,
      CR: 0,
      fee: 0,
    };

    records.forEach((record) => {
      if (record.status === 'Pending') {
        newSummary.pendingDB += record.DB;
        newSummary.pendingCR += record.CR;
      } else if (record.status === 'Transaction Success') {
        newSummary.DB += record.DB;
        newSummary.CR += record.CR;
        newSummary.fee += Number(record.fee || 0);
      }
    });

    setSummary(newSummary);
  };

  // Load balance data
  const loadBalance = async () => {
    try {
      const datefrom = formatDate(dateRange[0].startDate, false);
      const response = await merchantAPI.getMerchantBalance(datefrom);

      if (response.success && response.data.status?.toLowerCase() === 'ok') {
        const balance = response.data.records[0] || {};
        setMerchantBalance({
          opening: Number(balance.opening || 0),
          current: Number(balance.current || 0),
        });
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  // Load transaction data
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const datefrom = formatDate(dateRange[0].startDate, false);
      const dateto = formatDate(dateRange[0].endDate, true);

      // Convert empty string to null for API call
      const statusValue = statusFilter === '' ? null : statusFilter;

      const response = await merchantAPI.getTransactionByMerchantHistory(
        datefrom,
        dateto,
        statusValue
      );

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          setData(records);

          // Process and calculate summary
          const processed = records.map((item) => {
            const transType = item.transactiontype;
            let DB = '0';
            let CR = '0';

            if (transType === 'D' || transType === 'M' || transType === 'Y') {
              DB = item.amount || '0';
              CR = '0';
            } else {
              CR = item.amount || '0';
              DB = '0';
            }

            return {
              ...item,
              DB: Number(DB),
              CR: Number(CR),
            };
          });

          calculateSummary(processed);
          await loadBalance();
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
    loadTransactions();
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0.00';
    return Number(value).toFixed(2);
  };

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          size="sm"
          fw={600}
        >
          {item.futuretrxid}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.timestamp}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.originaldate}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.insert}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.accountno}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.customercode}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.bankcode}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">{formatNumber(item.DB)}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">{formatNumber(item.CR)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.ip}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.transactiontype}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={
            item.status === 'Transaction Success'
              ? 'green'
              : item.status === 'Pending'
              ? 'orange'
              : 'red'
          }
        >
          {item.status}
        </Badge>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">{formatNumber(item.fee)}</Text>
      </Table.Td>
      <Table.Td>
        <Text
          size="sm"
          style={{
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.notes}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          size="sm"
          style={{
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.notes2}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text
          size="sm"
          style={{
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.notes3}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.transactionid}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.reference}</Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box p="md">
      <style>{dateRangeStyles}</style>
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
                Merchant Transaction History
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                View and filter merchant transaction history
              </Text>
            </Box>
          </Group>

          {/* Filter Section */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 2.6 }}>
              <Popover
                opened={datePickerOpen}
                onChange={setDatePickerOpen}
                position="bottom-start"
                shadow="md"
                width="auto"
              >
                <Popover.Target>
                  <Button
                    variant="default"
                    leftSection={<IconCalendar size={16} />}
                    onClick={() => setDatePickerOpen((o) => !o)}
                    size="sm"
                    style={{
                      justifyContent: 'flex-start',
                      fontWeight: 400,
                      width: '100%',
                    }}
                  >
                    {format(dateRange[0].startDate, 'dd MMM yyyy')} -{' '}
                    {format(dateRange[0].endDate, 'dd MMM yyyy')}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown p={0}>
                  <Paper>
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={(item) => setDateRange([item.selection])}
                      moveRangeOnFirstSelection={false}
                      months={1}
                      direction="horizontal"
                      maxDate={new Date()}
                      showDateDisplay={false}
                      rangeColors={['#228be6']}
                      staticRanges={staticRanges}
                      inputRanges={[]}
                    />
                  </Paper>
                </Popover.Dropdown>
              </Popover>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 1.2 }}>
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || '')}
                data={[
                  { value: '', label: 'ALL' },
                  { value: '9', label: 'PENDING' },
                  { value: '0', label: 'ACCEPTED' },
                  { value: '8', label: 'FAILED' },
                ]}
                clearable
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Group gap="xs">
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
                  size="sm"
                >
                  Clear Filters
                </Button>
              </Group>
            </Grid.Col>
          </Grid>

          <Badge
            size="lg"
            variant="light"
            color="blue"
          >
            {filteredData.length} of {data.length} records
          </Badge>

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
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 2500,
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Future Trx ID</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Original Date</Table.Th>
                    <Table.Th>Insert Date</Table.Th>
                    <Table.Th>Account No</Table.Th>
                    <Table.Th>Customer Code</Table.Th>
                    <Table.Th>Bank</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Debit</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Credit</Table.Th>
                    <Table.Th>IP</Table.Th>
                    <Table.Th>Trans Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Fee</Table.Th>
                    <Table.Th>Notes</Table.Th>
                    <Table.Th>Notes 2</Table.Th>
                    <Table.Th>Notes 3</Table.Th>
                    <Table.Th>Trans ID</Table.Th>
                    <Table.Th>Reference</Table.Th>
                  </Table.Tr>

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.futuretrxid}
                        onChange={(e) =>
                          handleFilterChange(
                            'futuretrxid',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.timestamp}
                        onChange={(e) =>
                          handleFilterChange('timestamp', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.accountno}
                        onChange={(e) =>
                          handleFilterChange('accountno', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
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
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.bankcode}
                        onChange={(e) =>
                          handleFilterChange('bankcode', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.transactiontype}
                        onChange={(e) =>
                          handleFilterChange(
                            'transactiontype',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.status}
                        onChange={(e) =>
                          handleFilterChange('status', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
                    <Table.Th style={{ padding: '8px' }}></Table.Th>
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
                      <Table.Td colSpan={18}>
                        <Stack
                          align="center"
                          gap="xs"
                          py="xl"
                        >
                          <Text
                            size="lg"
                            fw={500}
                          >
                            No Data Available
                          </Text>
                          <Text
                            size="sm"
                            c="dimmed"
                          >
                            Select date range and click Refresh to load
                            transactions
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {/* Pagination */}
            <Paper
              p="md"
              mt="md"
              withBorder
              radius="md"
              bg="gray.0"
            >
              <Group
                justify="space-between"
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
                      Per page:
                    </Text>
                    <Select
                      size="xs"
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
                      style={{ width: 70 }}
                    />
                  </Group>
                </Group>

                {totalPages > 1 && (
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                    size="sm"
                    radius="md"
                    withEdges
                  />
                )}
              </Group>
            </Paper>
          </Box>

          <Divider />

          {/* Summary Section */}
          <Paper
            p="lg"
            withBorder
            radius="md"
          >
            <Text
              size="lg"
              fw={700}
              mb="md"
            >
              Summary
            </Text>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group
                  justify="space-between"
                  mb="xs"
                >
                  <Text
                    fw={500}
                    c="dimmed"
                  >
                    Opening Balance:
                  </Text>
                  <Text
                    fw={600}
                    size="lg"
                  >
                    {formatNumber(merchantBalance.opening)}
                  </Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group
                  justify="space-between"
                  mb="xs"
                >
                  <Text
                    fw={500}
                    c="dimmed"
                  >
                    Current Balance:
                  </Text>
                  <Text
                    fw={600}
                    size="lg"
                  >
                    {formatNumber(merchantBalance.current)}
                  </Text>
                </Group>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group
                  justify="space-between"
                  mb="xs"
                >
                  <Text
                    fw={500}
                    c="dimmed"
                  >
                    Total Pending DB:
                  </Text>
                  <Text fw={600}>{formatNumber(summary.pendingDB)}</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group
                  justify="space-between"
                  mb="xs"
                >
                  <Text
                    fw={500}
                    c="dimmed"
                  >
                    Total DB:
                  </Text>
                  <Text fw={600}>{formatNumber(summary.DB)}</Text>
                </Group>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group
                  justify="space-between"
                  mb="xs"
                >
                  <Text
                    fw={500}
                    c="dimmed"
                  >
                    Total Pending CR:
                  </Text>
                  <Text fw={600}>{formatNumber(summary.pendingCR)}</Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group
                  justify="space-between"
                  mb="xs"
                >
                  <Text
                    fw={500}
                    c="dimmed"
                  >
                    Total CR:
                  </Text>
                  <Text fw={600}>{formatNumber(summary.CR)}</Text>
                </Group>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}></Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Group
                  justify="space-between"
                  mb="xs"
                >
                  <Text
                    fw={500}
                    c="dimmed"
                  >
                    Fee:
                  </Text>
                  <Text fw={600}>{formatNumber(summary.fee)}</Text>
                </Group>
              </Grid.Col>
            </Grid>
          </Paper>
        </Stack>
      </Card>
    </Box>
  );
};

export default MerchantTransactionHistory;
