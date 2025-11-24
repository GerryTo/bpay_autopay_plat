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
  Select,
  Grid,
} from '@mantine/core';
import { IconRefresh, IconCalendar } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const MerchantDailyReportGMT6 = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchantList, setMerchantList] = useState([]);

  // Date range state - default to today
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  // Merchant filter
  const [selectedMerchant, setSelectedMerchant] = useState('ALL');

  // Load merchant list on init
  const loadMerchantList = async () => {
    try {
      const response = await merchantAPI.getMerchantList();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const merchants = response.data.records || [];
          setMerchantList(merchants);
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
      const fromDate = `${format(
        dateRange[0].startDate,
        'yyyy-MM-dd'
      )} 00:00:00`;
      const toDate = `${format(dateRange[0].endDate, 'yyyy-MM-dd')} 23:59:59`;

      console.log('Request params:', {
        fromDate,
        toDate,
        merchant: selectedMerchant,
      });

      const response = await merchantAPI.getMerchantDailyReportGMT6(
        fromDate,
        toDate,
        selectedMerchant
      );

      console.log('API Response:', response);

      if (response.success && response.data) {
        const responseData = response.data;

        console.log('Response data:', responseData);

        if (responseData.status?.toLowerCase() === 'ok') {
          const records = responseData.records || [];
          console.log('Setting data with records:', records);
          setData(records);

          if (records.length === 0) {
            showNotification({
              title: 'Info',
              message: 'No data found for selected filters',
              color: 'blue',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: responseData.message || 'Failed to load data',
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

  // Init
  useEffect(() => {
    loadMerchantList();
  }, []);

  // Prepare merchant options for Select
  const merchantOptions = [
    { value: 'ALL', label: 'ALL' },
    ...merchantList.map((merchant) => ({
      value: merchant.merchantcode,
      label: merchant.merchantcode,
    })),
  ];

  // Calculate totals
  const totalOpeningBalance = data.reduce(
    (sum, item) => sum + (parseFloat(item.opening_balance) || 0),
    0
  );
  const totalDeposit = data.reduce(
    (sum, item) => sum + (parseFloat(item.total_deposit) || 0),
    0
  );
  const totalWithdrawal = data.reduce(
    (sum, item) => sum + (parseFloat(item.total_withdrawal) || 0),
    0
  );
  const totalFee = data.reduce(
    (sum, item) => sum + (parseFloat(item.total_fee) || 0),
    0
  );
  const totalTopup = data.reduce(
    (sum, item) => sum + (parseFloat(item.total_topup) || 0),
    0
  );
  const totalSettlement = data.reduce(
    (sum, item) => sum + (parseFloat(item.total_settlement) || 0),
    0
  );
  const totalClosingBalance = data.reduce(
    (sum, item) => sum + (parseFloat(item.closing_balance) || 0),
    0
  );
  const totalDepositCount = data.reduce(
    (sum, item) => sum + (parseFloat(item.deposit_count) || 0),
    0
  );
  const totalWithdrawCount = data.reduce(
    (sum, item) => sum + (parseFloat(item.withdraw_count) || 0),
    0
  );

  const rows = data.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          size="sm"
          fw={600}
        >
          {item.merchantcode}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.date}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.opening_balance || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.total_deposit || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.total_withdrawal || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.total_fee || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.total_topup || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.total_settlement || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.closing_balance || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.deposit_count || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.withdraw_count || 0).toLocaleString('en-US', {
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
                Merchant Daily (GMT+6)
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Daily merchant transaction report
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
                      maxDate={new Date()}
                    />
                  </Paper>
                </Popover.Dropdown>
              </Popover>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Select
                placeholder="Select merchant"
                value={selectedMerchant}
                onChange={(value) => setSelectedMerchant(value)}
                data={merchantOptions}
                size="sm"
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 1.5 }}>
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
                  minWidth: 1600,
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
                    <Table.Th style={{ minWidth: 150 }}>Merchant Code</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Date</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Opening Balance
                    </Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Total Deposit</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Total Withdrawal
                    </Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Bropay Fee</Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>
                      Total Top Up / Adj Debit
                    </Table.Th>
                    <Table.Th style={{ minWidth: 200 }}>
                      Total Settlement / Adj Credit
                    </Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Closing Balance
                    </Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Count Deposit</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>
                      Count Withdraw
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={11}>
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
                {/* Footer with totals */}
                {rows.length > 0 && (
                  <Table.Tfoot>
                    <Table.Tr>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalOpeningBalance.toLocaleString('en-US', {
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
                        {totalWithdrawal.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalFee.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalTopup.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalSettlement.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalClosingBalance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalDepositCount.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalWithdrawCount.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                    </Table.Tr>
                  </Table.Tfoot>
                )}
              </Table>
            </ScrollArea>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default MerchantDailyReportGMT6;
