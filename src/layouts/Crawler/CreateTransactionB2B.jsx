import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { crawlerAPI, myBankAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const CreateTransactionB2B = () => {
  const [bankOptions, setBankOptions] = useState([]);
  const [agentOptions, setAgentOptions] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bankCode: '',
    amount: '',
    agent: '',
  });

  const loadOptions = useCallback(async () => {
    setLoadingLists(true);
    const [bankResponse, agentResponse] = await Promise.all([
      myBankAPI.getMasterBank(),
      crawlerAPI.getAgentListB2b(),
    ]);

    if (bankResponse.success && bankResponse.data?.status?.toLowerCase() === 'ok') {
      const options = (bankResponse.data.records || []).map((item) => ({
        value: item.bankCode,
        label: item.bankName ? `${item.bankCode} - ${item.bankName}` : item.bankCode,
      }));
      setBankOptions(options);
      setForm((prev) =>
        !prev.bankCode && options.length > 0
          ? { ...prev, bankCode: options[0].value }
          : prev
      );
    } else {
      showNotification({
        title: 'Error',
        message:
          bankResponse.error ||
          bankResponse.data?.message ||
          'Failed to load bank list',
        color: 'red',
      });
    }

    if (agentResponse.success && agentResponse.data?.status?.toLowerCase() === 'ok') {
      const options = (agentResponse.data.records || []).map((item) => ({
        value: item.v_user,
        label: item.v_user,
      }));
      setAgentOptions(options);
    } else {
      showNotification({
        title: 'Error',
        message:
          agentResponse.error ||
          agentResponse.data?.message ||
          'Failed to load agent list',
        color: 'red',
      });
    }

    setLoadingLists(false);
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreate = async () => {
    if (!form.bankCode) {
      showNotification({
        title: 'Validation',
        message: 'Please select Bank Code',
        color: 'yellow',
      });
      return;
    }

    const amountValue = Number(form.amount);
    if (!form.amount || Number.isNaN(amountValue) || amountValue <= 0) {
      showNotification({
        title: 'Validation',
        message: 'Please input Amount',
        color: 'yellow',
      });
      return;
    }

    if (!form.agent) {
      showNotification({
        title: 'Validation',
        message: 'Please select Agent',
        color: 'yellow',
      });
      return;
    }

    if (!window.confirm('Are you sure you want to create B2B transaction?')) return;

    setSubmitting(true);
    const response = await crawlerAPI.createB2bTransaction({
      bankCode: form.bankCode,
      amount: amountValue,
      agent: form.agent,
    });

    if (response.success && response.data?.status?.toLowerCase() === 'ok') {
      showNotification({
        title: 'Success',
        message: response.data?.message || 'Create B2B Transaction Success',
        color: 'green',
      });
      setForm((prev) => ({
        ...prev,
        amount: '',
      }));
    } else {
      showNotification({
        title: 'Error',
        message: response.error || response.data?.message || 'Failed to create B2B transaction',
        color: 'red',
      });
    }
    setSubmitting(false);
  };

  return (
    <Box p="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        <LoadingOverlay
          visible={loadingLists || submitting}
          overlayProps={{ radius: 'md', blur: 2 }}
          loaderProps={{ color: 'blue', type: 'dots' }}
        />

        <Stack gap="lg">
          <Group
            justify="space-between"
            align="center"
          >
            <Box>
              <Text
                size="xl"
                fw={700}
              >
                Create Transaction B2B
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Create a new B2B transaction for an agent
              </Text>
            </Box>

            <Button
              leftSection={<IconRefresh size={18} />}
              variant="light"
              color="blue"
              radius="md"
              loading={loadingLists}
              onClick={loadOptions}
            >
              Refresh
            </Button>
          </Group>

          <Card
            withBorder
            radius="md"
            padding="md"
            shadow="xs"
          >
            <Stack gap="md">
              <Select
                label="Bank"
                placeholder="Select bank"
                data={bankOptions}
                value={form.bankCode}
                onChange={(value) => handleChange('bankCode', value)}
                searchable
                clearable
                nothingFoundMessage="No bank data"
              />

              <NumberInput
                label="Amount"
                placeholder="Amount"
                value={form.amount}
                onChange={(value) => handleChange('amount', value ?? '')}
                min={0}
                decimalScale={2}
                thousandSeparator=","
              />

              <Select
                label="Agent"
                placeholder="Select agent"
                data={agentOptions}
                value={form.agent}
                onChange={(value) => handleChange('agent', value)}
                searchable
                clearable
                nothingFoundMessage="No agent data"
              />

              <Group justify="flex-end">
                <Button
                  color="blue"
                  radius="md"
                  onClick={handleCreate}
                  loading={submitting}
                >
                  Create
                </Button>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Card>
    </Box>
  );
};

export default CreateTransactionB2B;
