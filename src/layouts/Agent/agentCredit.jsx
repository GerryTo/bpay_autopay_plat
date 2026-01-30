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
  Modal,
  TextInput,
  Select,
  NumberInput,
} from '@mantine/core';
import { IconRefresh, IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { agentCommissionAPI } from '../../helper/api';

const AgentCredit = () => {
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
  });

  const getListData = async () => {
    setLoading(true);
    try {
      const response = await agentCommissionAPI.getCreditBalance();

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

  const handleAdjustClick = (agent, type) => {
    setSelectedAgent(agent);
    setAdjustType(type);
    setAdjustmentForm({
      amount: 0,
      bankAccountNo: '',
      bankCode: '',
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
        username: selectedAgent.user,
        adjustType: adjustType,
        amount: adjustmentForm.amount,
        bankAccountNo: adjustmentForm.bankAccountNo,
        bankCode: adjustmentForm.bankCode,
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
  const totalNagad = data.reduce(
    (sum, item) => sum + (parseFloat(item.nagad) || 0),
    0
  );
  const totalRocket = data.reduce(
    (sum, item) => sum + (parseFloat(item.rocket) || 0),
    0
  );
  const totalBkash = data.reduce(
    (sum, item) => sum + (parseFloat(item.bkash) || 0),
    0
  );

  const rows = data.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          fw={600}
          size="sm"
        >
          {item.user}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.alias}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={item.isActive === 'Y' ? 'green' : 'red'}
          variant="light"
          size="sm"
        >
          {item.isActive === 'Y' ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          size="sm"
          fw={500}
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
          fw={500}
        >
          {parseFloat(item.rocket || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          size="sm"
          fw={500}
        >
          {parseFloat(item.bkash || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
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
                Agent Credit Balance
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage agent credit balances
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
                  <Table.Tr>
                    <Table.Th style={{ minWidth: 150 }}>Agent</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Name</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Alias</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Active</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Nagad</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Rocket</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Bkash</Table.Th>
                    <Table.Th style={{ minWidth: 300 }}>Action</Table.Th>
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
                {/* Footer with totals */}
                {rows.length > 0 && (
                  <Table.Tfoot>
                    <Table.Tr>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td></Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalNagad.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalRocket.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Table.Td>
                      <Table.Td
                        style={{ textAlign: 'right', fontWeight: 600 }}
                      >
                        {totalBkash.toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
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
                    {selectedAgent.user}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text
                    size="sm"
                    c="dimmed"
                  >
                    Name:
                  </Text>
                  <Text
                    size="sm"
                    fw={600}
                  >
                    {selectedAgent.name}
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
                      {parseFloat(selectedAgent.nagad || 0).toLocaleString()}
                    </Text>
                    <Text size="xs">
                      Rocket:{' '}
                      {parseFloat(selectedAgent.rocket || 0).toLocaleString()}
                    </Text>
                    <Text size="xs">
                      Bkash:{' '}
                      {parseFloat(selectedAgent.bkash || 0).toLocaleString()}
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
                { value: 'rocket', label: 'Rocket' },
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

export default AgentCredit;
