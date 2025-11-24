import { useState } from 'react';
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
  Alert,
  Grid,
  Popover,
  Paper,
} from '@mantine/core';
import { IconRefresh, IconCalendar, IconInfoCircle } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';
import { DateRangePicker } from 'react-date-range';
import { format, subDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const SummaryBkashm = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalBankCount, setTotalBankCount] = useState(0);

  // Date range state - default to yesterday, max is yesterday
  const yesterday = subDays(new Date(), 1);
  const [dateRange, setDateRange] = useState([
    {
      startDate: yesterday,
      endDate: yesterday,
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  // Max date is yesterday
  const maxDate = yesterday;

  // Load summary data
  const loadSummaryData = async () => {
    setLoading(true);
    try {
      const fromDate = format(dateRange[0].startDate, 'yyyy-MM-dd');
      const toDate = format(dateRange[0].endDate, 'yyyy-MM-dd');

      console.log('Request params:', {
        datefrom: fromDate,
        dateto: toDate,
      });

      const response = await merchantAPI.getSummaryBkashm(fromDate, toDate);

      console.log('API Response:', response);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          setData(records);

          // Get total bank count from first record
          if (records.length > 0 && records[0].totalBank) {
            setTotalBankCount(records[0].totalBank);
          } else {
            setTotalBankCount(0);
          }

          if (records.length === 0) {
            showNotification({
              title: 'Info',
              message: 'No data available for selected date range',
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
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadSummaryData();
  };

  // Calculate totals
  const totalDepositAmount = data.reduce(
    (sum, item) => sum + (parseFloat(item.depositAmount) || 0),
    0
  );
  const totalDepositCount = data.reduce(
    (sum, item) => sum + (parseFloat(item.depositCount) || 0),
    0
  );

  const rows = data.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text size="sm">{item.date}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm" fw={500}>
          {parseFloat(item.depositAmount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm" fw={500}>
          {parseFloat(item.depositCount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Box>
              <Text size="xl" fw={700} c="dark">
                Summary Bkashm
              </Text>
              <Text size="sm" c="dimmed">
                BKASHM agent deposit summary report
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
          </Grid>

          {/* Info Alert */}
          <Alert
            icon={<IconInfoCircle size={20} />}
            title="Total Agent BKASHM Active"
            color="blue"
            variant="light"
          >
            <Text size="lg" fw={700}>
              {totalBankCount}
            </Text>
          </Alert>

          {/* Table */}
          <Box pos="relative" style={{ minHeight: 400 }}>
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: 'md', blur: 2 }}
              loaderProps={{ color: 'blue', type: 'dots' }}
            />

            <ScrollArea type="auto" scrollbarSize={10} scrollHideDelay={500}>
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 600,
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
                    <Table.Th style={{ minWidth: 100 }}>Date</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Deposit Amount</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Deposit Count</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={3}>
                        <Stack align="center" py="xl" gap="xs">
                          <Text size="lg" c="dimmed" fw={500}>
                            No Data Available
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
                {/* Footer with totals */}
                {data.length > 0 && (
                  <Table.Tfoot>
                    <Table.Tr>
                      <Table.Td style={{ fontWeight: 600 }}>Total</Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalDepositAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalDepositCount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
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

export default SummaryBkashm;
