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
  Popover,
  Paper,
  Grid,
  TextInput,
  Pagination,
  Select,
} from '@mantine/core';
import { IconRefresh, IconCalendar, IconSearch } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';
import { DateRangePicker } from 'react-date-range';
import { format, subDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const SmsLogByAgentReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Date range state - default to yesterday
  const yesterday = subDays(new Date(), 1);
  const [dateRange, setDateRange] = useState([
    {
      startDate: yesterday,
      endDate: yesterday,
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    date: '',
    bankCode: '',
    accountNo: '',
    accountName: '',
  });

  // Filter data based on column filters
  const filteredData = data.filter((item) => {
    const dateMatch =
      !columnFilters.date ||
      item.date?.toLowerCase().includes(columnFilters.date.toLowerCase());

    const bankMatch =
      !columnFilters.bankCode ||
      item.bankCode?.toLowerCase().includes(columnFilters.bankCode.toLowerCase());

    const accountNoMatch =
      !columnFilters.accountNo ||
      item.accountNo?.toLowerCase().includes(columnFilters.accountNo.toLowerCase());

    const accountNameMatch =
      !columnFilters.accountName ||
      item.accountName
        ?.toLowerCase()
        .includes(columnFilters.accountName.toLowerCase());

    return dateMatch && bankMatch && accountNoMatch && accountNameMatch;
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
      accountNo: '',
      accountName: '',
    });
  };

  // Load report data
  const loadReportData = async () => {
    setLoading(true);
    try {
      const dateStr = format(dateRange[0].startDate, 'yyyy-MM-dd');

      console.log('Request params:', { date: dateStr });

      const response = await merchantAPI.getSmsLogByAgentReport(dateStr);

      console.log('API Response:', response);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          console.log('Setting data with records:', records);
          setData(records);

          if (records.length === 0) {
            showNotification({
              title: 'Info',
              message: 'No data found for selected date',
              color: 'blue',
            });
          }
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
    loadReportData();
  };

  // Don't auto-load on mount (init function in AngularJS doesn't call getListData)
  useEffect(() => {
    // Empty - don't auto load
  }, []);

  // Calculate totals from filtered data
  const totalCashIn = filteredData.reduce(
    (sum, item) => sum + (parseFloat(item.cashIn) || 0),
    0
  );
  const totalDeposit = filteredData.reduce(
    (sum, item) => sum + (parseFloat(item.deposit) || 0),
    0
  );
  const totalReceived = filteredData.reduce(
    (sum, item) => sum + (parseFloat(item.received) || 0),
    0
  );
  const totalSend = filteredData.reduce(
    (sum, item) => sum + (parseFloat(item.send) || 0),
    0
  );

  const maxDate = subDays(new Date(), 1);

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
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
        <Text size="sm">{item.accountNo}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.accountName}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.cashIn || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.deposit || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.received || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.send || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
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
                Account Report By SMS Daily
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Daily SMS-based agent account report
              </Text>
            </Box>
          </Group>

          {/* Filters */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Popover
                opened={datePickerOpened}
                onChange={setDatePickerOpened}
                width="auto"
                position="bottom-start"
                shadow="md"
              >
                <Popover.Target>
                  <Button
                    variant="light"
                    color="blue"
                    size="sm"
                    leftSection={<IconCalendar size={16} />}
                    onClick={() => setDatePickerOpened((o) => !o)}
                    fullWidth
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
                      months={1}
                      direction="horizontal"
                      showDateDisplay={false}
                      maxDate={maxDate}
                    />
                  </Paper>
                </Popover.Dropdown>
              </Popover>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Button
                leftSection={<IconRefresh size={18} />}
                onClick={handleRefresh}
                variant="filled"
                color="blue"
                radius="md"
                disabled={loading}
                size="sm"
                fullWidth
              >
                Refresh
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2.5 }}>
              <Button
                leftSection={<IconSearch size={18} />}
                onClick={handleClearFilters}
                variant="light"
                color="red"
                radius="md"
                size="sm"
                fullWidth
              >
                Clear Column Filters
              </Button>
            </Grid.Col>
          </Grid>

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
                  },
                }}
              >
                <Table.Thead>
                  {/* Header Row */}
                  <Table.Tr>
                    <Table.Th style={{ minWidth: 100 }}>Date</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Bank</Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>Account No</Table.Th>
                    <Table.Th style={{ minWidth: 200 }}>Account Name</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Cash In</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Deposit</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>B2B Received</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>B2b Send</Table.Th>
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
                        value={columnFilters.accountNo}
                        onChange={(e) =>
                          handleFilterChange('accountNo', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter account name..."
                        size="xs"
                        value={columnFilters.accountName}
                        onChange={(e) =>
                          handleFilterChange('accountName', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
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
                        {totalCashIn.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalDeposit.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalReceived.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalSend.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
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

export default SmsLogByAgentReport;
