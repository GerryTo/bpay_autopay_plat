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
  Popover,
  Paper,
  Checkbox,
  Modal,
} from '@mantine/core';
import { IconRefresh, IconCalendar } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { agentCommissionAPI } from '../../helper/api';
import { DateRangePicker } from 'react-date-range';
import { format, subDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const AgentTransactionSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Include zero credit checkbox
  const [includeZeroCredit, setIncludeZeroCredit] = useState(false);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalData, setDetailModalData] = useState(null);

  const getListData = async () => {
    setLoading(true);
    try {
      const fromDate = `${format(dateRange[0].startDate, 'yyyy-MM-dd')} 00:00:00`;
      const toDate = `${format(dateRange[0].endDate, 'yyyy-MM-dd')} 23:59:59`;

      console.log('Request params:', { fromDate, toDate, includeZeroCredit });

      const response = await agentCommissionAPI.getTransactionSummary(
        fromDate,
        toDate,
        includeZeroCredit
      );

      console.log('API Response:', response);

      if (response.success && response.data) {
        let responseData = response.data;

        // If response is a string (mixed with PHP warnings), extract JSON
        if (typeof responseData === 'string') {
          console.log('Response is string, extracting JSON...');
          // Find the JSON part (starts with { and ends with })
          const jsonMatch = responseData.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              responseData = JSON.parse(jsonMatch[0]);
              console.log('Parsed JSON from mixed response:', responseData);
            } catch (e) {
              console.error('Failed to parse JSON:', e);
              showNotification({
                title: 'Error',
                message: 'Invalid response format from server',
                color: 'red',
              });
              return;
            }
          }
        }

        console.log('Response data:', responseData);
        console.log('Response status:', responseData.status);
        console.log('Response records:', responseData.records);

        if (responseData.status?.toLowerCase() === 'success') {
          const records = responseData.records || [];
          console.log('Setting data with records:', records);
          setData(records);

          if (records.length === 0) {
            showNotification({
              title: 'Info',
              message: 'No data found for selected date range',
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
    getListData();
  };

  const handleCreditClick = (agent, bankCode, endingCredit) => {
    setDetailModalData({
      type: 'credit',
      bankCode,
      agent,
      endingCredit,
    });
    setDetailModalOpen(true);
  };

  const handleAdjustmentClick = (agent, date, type) => {
    setDetailModalData({
      type: 'adjustment',
      agent,
      date,
      adjustType: type,
    });
    setDetailModalOpen(true);
  };

  // Calculate totals
  const totalAvailableCredit = data.reduce(
    (sum, item) => sum + (parseFloat(item.availableCredit) || 0),
    0
  );
  const totalCashOut = data.reduce(
    (sum, item) => sum + (parseFloat(item.cashOutAmount) || 0),
    0
  );
  const totalCashIn = data.reduce(
    (sum, item) => sum + (parseFloat(item.cashInAmount) || 0),
    0
  );
  const totalNagadCashOut = data.reduce(
    (sum, item) => sum + (parseFloat(item.nagadCashOutAmount) || 0),
    0
  );
  const totalNagadCashIn = data.reduce(
    (sum, item) => sum + (parseFloat(item.nagadCashInAmount) || 0),
    0
  );
  const totalBkashCashOut = data.reduce(
    (sum, item) => sum + (parseFloat(item.bkashCashOutAmount) || 0),
    0
  );
  const totalBkashCashIn = data.reduce(
    (sum, item) => sum + (parseFloat(item.bkashCashInAmount) || 0),
    0
  );
  const totalAdjustmentIn = data.reduce(
    (sum, item) => sum + (parseFloat(item.creditAdjustmentIn) || 0),
    0
  );
  const totalAdjustmentOut = data.reduce(
    (sum, item) => sum + (parseFloat(item.creditAdjustmentOut) || 0),
    0
  );

  const rows = data.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text size="sm">{item.date}</Text>
      </Table.Td>
      <Table.Td>
        <Text
          fw={600}
          size="sm"
        >
          {item.agentUsername}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.availableCredit || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          size="sm"
          c="blue"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            handleCreditClick(item.agentUsername, 'NAGAD', item.nagad)
          }
        >
          {parseFloat(item.nagad || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          size="sm"
          c="blue"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            handleCreditClick(item.agentUsername, 'BKASH', item.bkash)
          }
        >
          {parseFloat(item.bkash || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.cashOutAmount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.cashInAmount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.nagadCashOutAmount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.nagadCashInAmount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.bkashCashOutAmount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.bkashCashInAmount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          size="sm"
          c="blue"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            handleAdjustmentClick(item.agentUsername, item.date, 'IN')
          }
        >
          {parseFloat(item.creditAdjustmentIn || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          size="sm"
          c="blue"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            handleAdjustmentClick(item.agentUsername, item.date, 'OUT')
          }
        >
          {parseFloat(item.creditAdjustmentOut || 0).toLocaleString('en-US', {
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
                Transaction Summary by Agent GMT +6 NEW
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Agent transaction summary report
              </Text>
            </Box>
          </Group>

          {/* Action Buttons */}
          <Group>
            {/* Date Range Picker */}
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
                  style={{ width: 'fit-content' }}
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
                    staticRanges={[
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
                          const date = subDays(new Date(), 1);
                          return {
                            startDate: date,
                            endDate: date,
                          };
                        },
                        isSelected: () => false,
                      },
                      {
                        label: 'Last 7 Days',
                        range: () => ({
                          startDate: subDays(new Date(), 6),
                          endDate: new Date(),
                        }),
                        isSelected: () => false,
                      },
                      {
                        label: 'Last 30 Days',
                        range: () => ({
                          startDate: subDays(new Date(), 29),
                          endDate: new Date(),
                        }),
                        isSelected: () => false,
                      },
                    ]}
                    inputRanges={[]}
                  />
                </Paper>
              </Popover.Dropdown>
            </Popover>

            <Checkbox
              label="Include Zero Credit"
              checked={includeZeroCredit}
              onChange={(event) =>
                setIncludeZeroCredit(event.currentTarget.checked)
              }
            />

            <Button
              leftSection={<IconRefresh size={18} />}
              onClick={handleRefresh}
              variant="light"
              color="gray"
              radius="md"
              disabled={loading}
            >
              Refresh
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
                  minWidth: 1800,
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
                    <Table.Th style={{ minWidth: 120 }}>Date</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Agent Username
                    </Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Available Credit
                    </Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>NAGAD Credit</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>BKASH Credit</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Cash Out Amount
                    </Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Cash In Amount
                    </Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>
                      Nagad Cash Out Amount
                    </Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>
                      Nagad Cash In Amount
                    </Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>
                      Bkash Cash Out Amount
                    </Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>
                      Bkash Cash In Amount
                    </Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>
                      Credit Adjustment In
                    </Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>
                      Credit Adjustment Out
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={13}>
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
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalAvailableCredit.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalCashOut.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalCashIn.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalNagadCashOut.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalNagadCashIn.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalBkashCashOut.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalBkashCashIn.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalAdjustmentIn.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalAdjustmentOut.toLocaleString('en-US', {
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

      {/* Detail Modal */}
      <Modal
        opened={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={
          <Text
            size="lg"
            fw={600}
          >
            {detailModalData?.type === 'credit'
              ? `${detailModalData.bankCode} Credit Detail`
              : `Credit Adjustment ${detailModalData?.adjustType} Detail`}
          </Text>
        }
        centered
        size="lg"
      >
        {detailModalData && (
          <Stack gap="md">
            <Box
              p="md"
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    Agent:
                  </Text>
                  <Text
                    size="sm"
                    fw={600}
                  >
                    {detailModalData.agent}
                  </Text>
                </Group>
                {detailModalData.type === 'credit' && (
                  <>
                    <Group justify="space-between">
                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        Bank Code:
                      </Text>
                      <Text
                        size="sm"
                        fw={600}
                      >
                        {detailModalData.bankCode}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        Ending Credit:
                      </Text>
                      <Text
                        size="sm"
                        fw={600}
                      >
                        {parseFloat(
                          detailModalData.endingCredit || 0
                        ).toLocaleString()}
                      </Text>
                    </Group>
                  </>
                )}
                {detailModalData.type === 'adjustment' && (
                  <>
                    <Group justify="space-between">
                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        Date:
                      </Text>
                      <Text
                        size="sm"
                        fw={600}
                      >
                        {detailModalData.date}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        Type:
                      </Text>
                      <Text
                        size="sm"
                        fw={600}
                      >
                        {detailModalData.adjustType}
                      </Text>
                    </Group>
                  </>
                )}
              </Stack>
            </Box>
            <Text
              size="sm"
              c="dimmed"
            >
              Detail transaction information would be loaded from the API.
            </Text>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default AgentTransactionSummary;
