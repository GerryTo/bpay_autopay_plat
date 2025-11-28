import { useEffect, useState } from 'react';
import { Box, Button, Card, Group, LoadingOverlay, Stack, Text, TextInput, Checkbox, Radio } from '@mantine/core';
import { IconRefresh, IconSend, IconTransfer } from '@tabler/icons-react';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const defaultPayload = {
  status: '0',
  notes3: '',
  chgAmt: false,
  chgChk: false,
  amount: '',
  pass: '',
};

const UpdateTransaction = () => {
  const [form, setForm] = useState(defaultPayload);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleAmount = () => {
    setForm((prev) => ({ ...prev, chgAmt: !prev.chgAmt, amount: '' }));
  };

  const handleToggleStatus = () => {
    setForm((prev) => ({ ...prev, chgChk: !prev.chgChk, status: '' }));
  };

  const handleStatusChange = (value) => {
    if (value === '1') {
      // If mark as fail, amount change is not allowed
      setForm((prev) => ({ ...prev, status: value, chgAmt: false, amount: '' }));
    } else {
      setForm((prev) => ({ ...prev, status: value }));
    }
  };

  const resetForm = () => {
    setForm(defaultPayload);
  };

  const validate = () => {
    if (!form.notes3) {
      showNotification({ title: 'Validation', message: 'Transaction ID is required', Color: 'yellow' });
      return false;
    }
    if (form.chgAmt && (form.amount === '' || form.amount === null)) {
      showNotification({ title: 'Validation', message: 'Amount is required when changing amount', Color: 'yellow' });
      return false;
    }
    if (form.chgChk && form.status === '') {
      showNotification({ title: 'Validation', message: 'Choose a status when changing status', Color: 'yellow' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!window.confirm(`Are you sure want to update ${form.notes3}?`)) return;

    setLoading(true);
    try {
      const payload = { ...form };
      const response = await transactionAPI.updateTransactionStatus(payload);

      if (response.success && response.data) {
        showNotification({
          title: 'Info',
          message: response.data.message || 'Request completed',
          Color: (response.data.status || '').toLowerCase() === 'ok' ? 'green' : 'yellow',
        });
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update transaction',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Update transaction submit error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update transaction',
        Color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.status === '1') {
      setForm((prev) => ({ ...prev, chgAmt: false, amount: '' }));
    }
  }, [form.status]);

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'md', blur: 2 }} />

        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Group gap={8} align="center">
              <IconTransfer size={22} color="#2563eb" />
              <Text size="xl" fw={700}>
                Update Transaction
              </Text>
            </Group>

            <Group gap="xs">
              <Button
                variant="light"
                color="gray"
                radius="md"
                size="sm"
                leftSection={<IconRefresh size={18} />}
                onClick={resetForm}
              >
                Reset
              </Button>
              <Button
                variant="filled"
                color="teal"
                radius="md"
                size="sm"
                leftSection={<IconSend size={18} />}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Group>
          </Group>

          <Card withBorder radius="md" padding="md" shadow="xs">
            <Stack gap="md">
              <TextInput
                label="Transaction ID"
                placeholder="Enter transaction ID"
                value={form.notes3}
                onChange={(e) => handleChange('notes3', e.currentTarget.value)}
                required
              />

              <Stack gap="xs">
                <Group gap="sm" align="center">
                  <Checkbox
                    label="Change Amount"
                    checked={form.chgAmt}
                    onChange={handleToggleAmount}
                    disabled={form.status === '1'}
                  />
                  <Text size="xs" c="dimmed">
                    Amount change not allowed when setting status to Fail.
                  </Text>
                </Group>
                {form.chgAmt && (
                  <TextInput
                    label="Amount"
                    type="number"
                    value={form.amount}
                    onChange={(e) => handleChange('amount', e.currentTarget.value)}
                    style={{ maxWidth: 260 }}
                  />
                )}
              </Stack>

              <Stack gap="xs">
                <Checkbox label="Change Status" checked={form.chgChk} onChange={handleToggleStatus} />
                {form.chgChk && (
                  <Radio.Group value={form.status} onChange={handleStatusChange} label="Select status">
                    <Group gap="lg">
                      <Radio value="0" label="Success" />
                      <Radio value="1" label="Fail" />
                    </Group>
                  </Radio.Group>
                )}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Card>
    </Box>
  );
};

export default UpdateTransaction;
