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
  Badge,
  ScrollArea,
  Tooltip,
  ActionIcon,
  Modal,
  Textarea,
  Popover,
  Paper,
} from '@mantine/core';
import {
  IconRefresh,
  IconCheck,
  IconX,
  IconCalendar,
} from '@tabler/icons-react';
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { showNotification } from '../../helper/showNotification';
import { agentCommissionAPI } from '../../helper/api';

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

const AgentCommissionSettlement = () => {
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

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedSettlement, setSelectedSettlement] = useState(null);

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

  // Format date to YYYY-MM-DD HH:mm:ss
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getListData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange[0];
      const from = `${formatDateForAPI(startDate)} 00:00:00`;
      const to = `${formatDateForAPI(endDate)} 23:59:59`;

      const response = await agentCommissionAPI.getCommissionSettlementList(
        from,
        to
      );

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'success') {
          setData(response.data.data || []);
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

  const handleApprove = async (settlement) => {
    if (window.confirm('Are you sure want to approve this settlement?')) {
      try {
        const response = await agentCommissionAPI.approveCommissionSettlement(
          settlement.id
        );

        if (response.success && response.data) {
          if (response.data.status?.toLowerCase() === 'success') {
            showNotification({
              title: 'Success',
              message: 'Approve Success!',
              color: 'green',
            });
            getListData();
          } else {
            showNotification({
              title: 'Error',
              message: response.data.message || 'Failed to approve settlement',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to approve settlement',
            color: 'red',
          });
        }
      } catch (error) {
        showNotification({
          title: 'Error',
          message: 'Failed to approve settlement',
          color: 'red',
        });
        console.error('Error approving settlement:', error);
      }
    }
  };

  const handleRejectClick = (settlement) => {
    setSelectedSettlement(settlement);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please input the reason',
        color: 'red',
      });
      return;
    }

    try {
      const response = await agentCommissionAPI.rejectCommissionSettlement(
        selectedSettlement.id,
        rejectReason
      );

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'success') {
          showNotification({
            title: 'Success',
            message: 'Reject Success!',
            color: 'green',
          });
          setRejectModalOpen(false);
          setRejectReason('');
          setSelectedSettlement(null);
          getListData();
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to reject settlement',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to reject settlement',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to reject settlement',
        color: 'red',
      });
      console.error('Error rejecting settlement:', error);
    }
  };

  const handleRefresh = () => {
    getListData();
  };

  // Calculate totals
  const totalCount = data.length;
  const totalAmount = data.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const rows = data.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          fw={600}
          size="sm"
        >
          {item.id}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.date}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.user}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.bankcode}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.bankaccountsource}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.bankaccounttarget}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          size="sm"
          fw={500}
        >
          {parseFloat(item.amount).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={
            item.status === '0'
              ? 'yellow'
              : item.status === '1'
                ? 'green'
                : 'red'
          }
          variant="light"
        >
          {item.statusdesc}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.note}</Text>
      </Table.Td>
      <Table.Td>
        {item.status === '0' && (
          <Group
            gap="xs"
            wrap="nowrap"
          >
            <Tooltip label="Approve">
              <ActionIcon
                variant="light"
                color="blue"
                size="md"
                onClick={() => handleApprove(item)}
              >
                <IconCheck size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Reject">
              <ActionIcon
                variant="light"
                color="orange"
                size="md"
                onClick={() => handleRejectClick(item)}
              >
                <IconX size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
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
                Agent Commission Settlement
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage agent commission settlements
              </Text>
            </Box>
          </Group>

          {/* Filters */}
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
                  width: 'fit-content',
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

          {/* Action Buttons */}
          <Group>
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
                  minWidth: 1400,
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
                    <Table.Th style={{ minWidth: 120 }}>Settlement ID</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Date</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Agent</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Bank</Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>
                      Account Source
                    </Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>
                      Account Target
                    </Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Amount</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Status</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Notes</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={10}>
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
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalCount}
                      </Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                    </Table.Tr>
                  </Table.Tfoot>
                )}
              </Table>
            </ScrollArea>
          </Box>
        </Stack>
      </Card>

      {/* Reject Modal */}
      <Modal
        opened={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Settlement"
        centered
      >
        <Stack gap="md">
          <Text size="sm">Please input the reason for rejection:</Text>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.currentTarget.value)}
            minRows={4}
            required
          />
          <Group
            justify="flex-end"
            gap="sm"
          >
            <Button
              variant="light"
              color="gray"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="orange"
              onClick={handleRejectConfirm}
            >
              Reject
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default AgentCommissionSettlement;
