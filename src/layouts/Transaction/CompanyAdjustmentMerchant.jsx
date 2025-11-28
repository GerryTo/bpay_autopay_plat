import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { DateRangePicker } from 'react-date-range';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Popover,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconCalendar, IconFilter, IconRefresh, IconSend, IconTransfer } from '@tabler/icons-react';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const noteOptions = [
  'MANUAL DEPOSIT',
  'MANUAL WITHDRAWAL',
  'MANUAL TOPUP',
  'MANUAL SETTLEMENT',
  'BANK INTEREST',
  'BANK CHARGE',
  'TRANSFER IN',
  'TRANSFER OUT',
  'TESTING',
  '1', // UNKNOWN/OTHERS
];

const defaultForm = {
  merchantCode: '',
  accountno: '',
  type: 'Y',
  amount: '',
  bankcode: '',
  notes: '',
  typenotes: '1',
  datenotes: '',
  subnotes: 'U/O',
  notes2: noteOptions[0],
};

const CompanyAdjustmentMerchant = () => {
  const [form, setForm] = useState(defaultForm);
  const [accounts, setAccounts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);

  const isOtherNotes = useMemo(() => form.notes2 === '1', [form.notes2]);

  const fetchAccounts = async () => {
    setRefreshing(true);
    try {
      const response = await transactionAPI.getActiveMyBank();
      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          setAccounts(Array.isArray(response.data.records) ? response.data.records : []);
        } else {
          showNotification({ title: 'Error', message: response.data.message || 'Failed to load accounts', Color: 'red' });
        }
      } else {
        showNotification({ title: 'Error', message: response.error || 'Failed to load accounts', Color: 'red' });
      }
    } catch (error) {
      console.error('Active MyBank load error:', error);
      showNotification({ title: 'Error', message: 'Unable to load accounts', Color: 'red' });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchMerchants = async () => {
    try {
      const response = await transactionAPI.getMasterMerchant();
      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          setMerchants(Array.isArray(response.data.records) ? response.data.records : []);
        } else {
          showNotification({ title: 'Error', message: response.data.message || 'Failed to load merchants', Color: 'red' });
        }
      } else {
        showNotification({ title: 'Error', message: response.error || 'Failed to load merchants', Color: 'red' });
      }
    } catch (error) {
      console.error('Master merchant load error:', error);
      showNotification({ title: 'Error', message: 'Unable to load merchants', Color: 'red' });
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchMerchants();
  }, []);

  const handleAccountChange = (value) => {
    setForm((prev) => ({
      ...prev,
      accountno: value,
      bankcode: value ? value.split('||')[1] || '' : '',
    }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setDateRange([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
  };

  const validate = () => {
    if (!form.merchantCode) {
      showNotification({ title: 'Validation', message: 'Please choose a merchant', Color: 'yellow' });
      return false;
    }
    if (!form.accountno) {
      showNotification({ title: 'Validation', message: 'Please choose an admin account', Color: 'yellow' });
      return false;
    }
    if (!form.type) {
      showNotification({ title: 'Validation', message: 'Please choose a type', Color: 'yellow' });
      return false;
    }
    if (form.amount === '' || Number(form.amount) <= 0) {
      showNotification({ title: 'Validation', message: 'Amount must be greater than 0', Color: 'yellow' });
      return false;
    }
    if (!form.notes2) {
      showNotification({ title: 'Validation', message: 'Please choose notes', Color: 'yellow' });
      return false;
    }
    if (isOtherNotes && !form.notes) {
      showNotification({ title: 'Validation', message: 'Please fill other notes', Color: 'yellow' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const selectedDate = dateRange[0]?.startDate;
    if (!selectedDate) {
      showNotification({ title: 'Validation', message: 'Please choose Actual Transaction Date', Color: 'yellow' });
      return;
    }

    const payload = {
      ...form,
      datenotes: selectedDate,
      typenotes: isOtherNotes ? '2' : '1',
      notes: isOtherNotes ? form.notes : '',
      merchantaccountno: form.accountno,
    };

    setLoading(true);
    try {
      const response = await transactionAPI.saveCompanyAdjustmentMerchant(payload);
      if (response.success && response.data) {
        const ok = (response.data.status || '').toLowerCase() === 'ok';
        showNotification({
          title: ok ? 'Success' : 'Info',
          message: response.data.message || 'Request completed',
          Color: ok ? 'green' : 'yellow',
        });
        if (ok) {
          resetForm();
        }
      } else {
        showNotification({ title: 'Error', message: response.error || 'Failed to save adjustment', Color: 'red' });
      }
    } catch (error) {
      console.error('Save company adjustment merchant error:', error);
      showNotification({ title: 'Error', message: 'Unable to save adjustment', Color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const accountOptions = accounts.map((item) => ({
    value: `${item.bankaccountno}||${item.bankcode}`,
    label: `${item.bankaccountno} - ${item.bankaccountname} - ${item.bankcode}`,
  }));

  const merchantOptions = merchants.map((item) => ({
    value: item.merchantcode,
    label: item.merchantcode,
  }));

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'md', blur: 2 }} />
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Group gap={8} align="center">
              <IconTransfer size={22} color="#2563eb" />
              <Text size="xl" fw={700}>
                Adjustment Merchant
              </Text>
            </Group>

            <Group gap="xs">
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing}
                onClick={() => {
                  fetchAccounts();
                  fetchMerchants();
                }}
              >
                Refresh
              </Button>
              <Button variant="light" color="gray" radius="md" size="sm" leftSection={<IconFilter size={18} />} onClick={resetForm}>
                Reset
              </Button>
            </Group>
          </Group>

          <Card withBorder radius="md" padding="md" shadow="xs">
            <Stack gap="md">
              <Select
                label="Merchant Code"
                placeholder="Choose merchant"
                data={merchantOptions}
                value={form.merchantCode}
                onChange={(value) => setForm((prev) => ({ ...prev, merchantCode: value || '' }))}
                searchable
                clearable
                nothingFound="No merchant"
              />

              <Select
                label="Account Bank No Admin"
                placeholder="Choose account"
                data={accountOptions}
                value={form.accountno}
                onChange={(value) => handleAccountChange(value || '')}
                searchable
                clearable
                nothingFound="No account"
              />

              <Select
                label="Type"
                data={[
                  { value: 'Y', label: 'Manual Debit' },
                  { value: 'Z', label: 'Manual Credit' },
                ]}
                value={form.type}
                onChange={(value) => setForm((prev) => ({ ...prev, type: value || 'Y' }))}
                required
              />

              <TextInput
                label="Adjustment Amount"
                placeholder="Input Adjustment Amount"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.currentTarget.value }))}
                type="number"
              />

              <Select
                label="Notes"
                data={noteOptions.map((n) => ({ value: n, label: n === '1' ? 'UNKNOWN/OTHERS' : n }))}
                value={form.notes2}
                onChange={(value) => setForm((prev) => ({ ...prev, notes2: value || noteOptions[0] }))}
              />

              <Group align="flex-end" gap="md" wrap="wrap">
                <Popover opened={datePickerOpened} onChange={setDatePickerOpened} width={320} position="bottom-start" shadow="md">
                  <Popover.Target>
                    <Button
                      variant="light"
                      color="blue"
                      leftSection={<IconCalendar size={18} />}
                      onClick={() => setDatePickerOpened((o) => !o)}
                    >
                      {format(dateRange[0].startDate, 'yyyy-MM-dd')}
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown p={0}>
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={(ranges) => setDateRange([{ ...ranges.selection, endDate: ranges.selection.startDate }])}
                      moveRangeOnFirstSelection={false}
                      showSelectionPreview
                      rangeColors={['#1d4ed8']}
                      months={1}
                      direction="horizontal"
                    />
                  </Popover.Dropdown>
                </Popover>
                <Text size="sm" c="dimmed">
                  Actual Transaction Date
                </Text>
              </Group>

              {isOtherNotes && (
                <Stack gap="xs">
                  <Text size="sm" fw={600}>
                    Other Notes
                  </Text>
                  <Group gap="sm">
                    <TextInput
                      label="Prefix"
                      value={form.subnotes}
                      onChange={(e) => setForm((prev) => ({ ...prev, subnotes: e.currentTarget.value }))}
                      style={{ maxWidth: 100 }}
                    />
                    <TextInput
                      label="Details"
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.currentTarget.value }))}
                      style={{ flex: 1 }}
                    />
                  </Group>
                </Stack>
              )}
            </Stack>
          </Card>

          <Group justify="flex-end" gap="sm">
            <Button variant="light" color="gray" leftSection={<IconRefresh size={18} />} onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="filled" color="teal" leftSection={<IconSend size={18} />} onClick={handleSubmit}>
              Save
            </Button>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
};

export default CompanyAdjustmentMerchant;
