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
  Modal,
  TextInput,
  Select,
  NumberInput,
  Textarea,
} from '@mantine/core';
import {
  IconRefresh,
  IconArrowDown,
  IconArrowUp,
} from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { agentCommissionAPI } from '../../helper/api';

const AgentCurrentBalance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Adjustment modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState('in'); // 'in' or 'out'
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    amount: 0,
    bankAccountNo: '',
    bankCode: '',
    note: '',
    source: '',
    purpose: '',
  });

  const getListData = async () => {
    setLoading(true);
    try {
      // Call API without any parameters (matching AngularJS version)
      const response = await agentCommissionAPI.getCurrentBalance();

      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.data?.status);
      console.log('Response records:', response.data?.records);

      if (response.success && response.data) {
        let responseData = response.data;

        // If response is a string (mixed with PHP warnings), extract JSON
        if (typeof responseData === 'string') {
          console.log('Response is string, extracting JSON...');
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

        if (responseData.status?.toLowerCase() === 'success') {
          const records = responseData.records || [];
          console.log('Setting data with records:', records);
          setData(records);

          if (records.length === 0) {
            showNotification({
              title: 'Info',
              message: 'No data found',
              color: 'blue',
            });
          }
        } else {
          console.error('API returned non-success status:', responseData.status);
          showNotification({
            title: 'Error',
            message: responseData.message || 'Failed to load data',
            color: 'red',
          });
        }
      } else {
        console.error('API call failed:', response.error);
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Exception in getListData:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustClick = (agent, type) => {
    setSelectedAgent(agent);
    setAdjustType(type);
    setAdjustmentForm({
      amount: 0,
      bankAccountNo: '',
      bankCode: '',
      note: '',
      source: '',
      purpose: '',
    });
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async () => {
    // Validation
    if (!adjustmentForm.amount || adjustmentForm.amount <= 0) {
      showNotification({
        title: 'Validation Error',
        message: 'Please input a valid amount',
        color: 'red',
      });
      return;
    }

    if (!adjustmentForm.bankAccountNo.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please input bank account number',
        color: 'red',
      });
      return;
    }

    if (!adjustmentForm.bankCode.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please select bank code',
        color: 'red',
      });
      return;
    }

    try {
      const response = await agentCommissionAPI.creditAdjustment({
        username: selectedAgent.agentUsername,
        adjustType: adjustType,
        amount: adjustmentForm.amount,
        bankAccountNo: adjustmentForm.bankAccountNo,
        bankCode: adjustmentForm.bankCode,
        note: adjustmentForm.note,
        source: adjustmentForm.source,
        purpose: adjustmentForm.purpose,
      });

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'success') {
          showNotification({
            title: 'Success',
            message: 'Credit Adjustment Success!',
            color: 'green',
          });
          setAdjustModalOpen(false);
          getListData();
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to adjust credit',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to adjust credit',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to adjust credit',
        color: 'red',
      });
      console.error('Error adjusting credit:', error);
    }
  };

  const handleRefresh = () => {
    getListData();
  };

  // Calculate totals
  const totalAgents = data.length;
  const totalCashOut = data.reduce(
    (sum, item) => sum + (parseFloat(item.totalCashOut) || 0),
    0
  );
  const totalCashIn = data.reduce(
    (sum, item) => sum + (parseFloat(item.totalCashIn) || 0),
    0
  );
  const totalCashOutNagad = data.reduce(
    (sum, item) => sum + (parseFloat(item.totalCashOutNagad) || 0),
    0
  );
  const totalCashInNagad = data.reduce(
    (sum, item) => sum + (parseFloat(item.totalCashInNagad) || 0),
    0
  );
  const totalCashOutBkash = data.reduce(
    (sum, item) => sum + (parseFloat(item.totalCashOutBkash) || 0),
    0
  );
  const totalCashInBkash = data.reduce(
    (sum, item) => sum + (parseFloat(item.totalCashInBkash) || 0),
    0
  );
  const totalAdjustmentIn = data.reduce(
    (sum, item) => sum + (parseFloat(item.finalAdjustmentIn) || 0),
    0
  );
  const totalAdjustmentOut = data.reduce(
    (sum, item) => sum + (parseFloat(item.finalAdjustmentOut) || 0),
    0
  );
  const totalTopUp = data.reduce(
    (sum, item) => sum + (parseFloat(item.finalTopUp) || 0),
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
          {parseFloat(item.finalNagadCredit || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.finalBkashCredit || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.totalCashOut || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.totalCashIn || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.totalCashOutNagad || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.totalCashInNagad || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.totalCashOutBkash || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.totalCashInBkash || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.finalAdjustmentIn || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.finalAdjustmentOut || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">
          {parseFloat(item.finalTopUp || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group
          gap="xs"
          wrap="nowrap"
        >
          <Button
            size="xs"
            color="blue"
            leftSection={<IconArrowDown size={14} />}
            onClick={() => handleAdjustClick(item, 'in')}
          >
            Adjust In
          </Button>
          <Button
            size="xs"
            color="orange"
            leftSection={<IconArrowUp size={14} />}
            onClick={() => handleAdjustClick(item, 'out')}
          >
            Adjust Out
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
                Agent Current Balance GMT+6 New
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Live agent balance data
              </Text>
            </Box>
          </Group>

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
                  minWidth: 2200,
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
                    <Table.Th style={{ minWidth: 150 }}>
                      Credit Adjustment In
                    </Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>
                      Credit Adjustment Out
                    </Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Credit Topup</Table.Th>
                    <Table.Th style={{ minWidth: 300 }}>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={14}>
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
                {/* Footer with totals - matching AngularJS version */}
                {rows.length > 0 && (
                  <Table.Tfoot>
                    <Table.Tr>
                      <Table.Td></Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalAgents}
                      </Table.Td>
                      {/* NAGAD and BKASH Credit columns - no totals in AngularJS version */}
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalCashOut.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalCashIn.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalCashOutNagad.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalCashInNagad.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalCashOutBkash.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalCashInBkash.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalAdjustmentIn.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalAdjustmentOut.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {totalTopUp.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Table.Td>
                      <Table.Td></Table.Td>
                    </Table.Tr>
                  </Table.Tfoot>
                )}
              </Table>
            </ScrollArea>
          </Box>
        </Stack>
      </Card>

      {/* Adjustment Modal */}
      <Modal
        opened={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={
          <Text
            size="lg"
            fw={600}
          >
            Credit Adjustment - {adjustType === 'in' ? 'In' : 'Out'}
          </Text>
        }
        centered
        size="md"
      >
        {selectedAgent && (
          <Stack gap="md">
            {/* Agent Info */}
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
                    {selectedAgent.agentUsername}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    Current Balance:
                  </Text>
                  <Stack
                    gap={2}
                    align="flex-end"
                  >
                    <Text size="xs">
                      Nagad:{' '}
                      {parseFloat(
                        selectedAgent.finalNagadCredit || 0
                      ).toLocaleString()}
                    </Text>
                    <Text size="xs">
                      Bkash:{' '}
                      {parseFloat(
                        selectedAgent.finalBkashCredit || 0
                      ).toLocaleString()}
                    </Text>
                  </Stack>
                </Group>
              </Stack>
            </Box>

            {/* Adjustment Form */}
            <NumberInput
              label="Amount"
              placeholder="Enter amount"
              value={adjustmentForm.amount}
              onChange={(value) =>
                setAdjustmentForm((prev) => ({ ...prev, amount: value }))
              }
              required
              withAsterisk
              min={0}
              hideControls
            />

            <Select
              label="Bank Code"
              placeholder="Select bank code"
              value={adjustmentForm.bankCode}
              onChange={(value) =>
                setAdjustmentForm((prev) => ({ ...prev, bankCode: value }))
              }
              data={[
                { value: 'nagad', label: 'Nagad' },
                { value: 'bkash', label: 'Bkash' },
              ]}
              required
              withAsterisk
            />

            <TextInput
              label="Bank Account Number"
              placeholder="Enter bank account number"
              value={adjustmentForm.bankAccountNo}
              onChange={(e) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  bankAccountNo: e.currentTarget.value,
                }))
              }
              required
              withAsterisk
            />

            <TextInput
              label="Note"
              placeholder="Enter note (optional)"
              value={adjustmentForm.note}
              onChange={(e) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  note: e.currentTarget.value,
                }))
              }
            />

            <TextInput
              label="Source"
              placeholder="Enter source (optional)"
              value={adjustmentForm.source}
              onChange={(e) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  source: e.currentTarget.value,
                }))
              }
            />

            <Textarea
              label="Purpose"
              placeholder="Enter purpose (optional)"
              value={adjustmentForm.purpose}
              onChange={(e) =>
                setAdjustmentForm((prev) => ({
                  ...prev,
                  purpose: e.currentTarget.value,
                }))
              }
              minRows={3}
            />

            {/* Action Buttons */}
            <Group
              justify="flex-end"
              gap="sm"
              mt="md"
            >
              <Button
                variant="light"
                color="gray"
                onClick={() => setAdjustModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color={adjustType === 'in' ? 'blue' : 'orange'}
                onClick={handleAdjustSubmit}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default AgentCurrentBalance;
