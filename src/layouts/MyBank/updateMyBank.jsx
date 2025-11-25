import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Tabs,
  Text,
} from '@mantine/core';
import { IconRefresh, IconSettings } from '@tabler/icons-react';
import { myBankAPI, userAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const UpdateMyBank = () => {
  const [bankOptions, setBankOptions] = useState([{ value: 'ALL', label: 'ALL' }]);
  const [merchantOptions, setMerchantOptions] = useState([{ value: 'ALL', label: 'ALL' }]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [loadingMerchant, setLoadingMerchant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filter, setFilter] = useState({
    bank: 'ALL',
    merchant: 'ALL',
    status: 'Y',
    merchantStatus: '0',
    type: 'A',
  });

  const handleChange = (key, value) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const loadBankList = async () => {
    setLoadingBank(true);
    const response = await myBankAPI.getMasterBank();
    if (response.success && response.data?.status?.toLowerCase() === 'ok') {
      const options = (response.data.records || []).map((item) => ({
        value: item.bankCode,
        label: item.bankCode,
      }));
      setBankOptions([{ value: 'ALL', label: 'ALL' }, ...options]);
    } else {
      showNotification({
        title: 'Error',
        message: response.error || response.data?.message || 'Failed to load bank list',
        color: 'red',
      });
    }
    setLoadingBank(false);
  };

  const loadMerchantList = async () => {
    setLoadingMerchant(true);
    const response = await userAPI.getMasterMerchantList();
    if (response.success && response.data?.status?.toLowerCase() === 'ok') {
      const options = (response.data.records || []).map((item) => ({
        value: item.merchantCode,
        label: item.merchantCode,
      }));
      setMerchantOptions(options);
      if (options.length > 0) {
        handleChange('merchant', options[0].value);
      }
    } else {
      showNotification({
        title: 'Error',
        message: response.error || response.data?.message || 'Failed to load merchant list',
        color: 'red',
      });
    }
    setLoadingMerchant(false);
  };

  useEffect(() => {
    loadBankList();
  }, []);

  const submitStatus = async () => {
    if (!window.confirm('Are you sure?')) return;
    setSubmitting(true);
    const payload = {
      bank: filter.bank,
      merchant: filter.merchant,
      status: filter.status,
    };
    const response = await myBankAPI.updateBankStatus(payload);
    if (response.success) {
      showNotification({
        title: 'Info',
        message: response.data?.message || 'Update submitted',
        color: 'blue',
      });
    } else {
      showNotification({
        title: 'Error',
        message: response.error || 'Failed to update',
        color: 'red',
      });
    }
    setSubmitting(false);
  };

  const submitMerchant = async () => {
    if (!window.confirm('Are you sure?')) return;
    setSubmitting(true);
    const payload = {
      merchant: filter.merchant,
      bank: filter.bank,
      merchantStatus: filter.merchantStatus,
    };
    const response = await myBankAPI.updateMerchantStatus(payload);
    if (response.success) {
      showNotification({
        title: 'Info',
        message: response.data?.message || 'Update submitted',
        color: 'blue',
      });
    } else {
      showNotification({
        title: 'Error',
        message: response.error || 'Failed to update',
        color: 'red',
      });
    }
    setSubmitting(false);
  };

  const submitType = async () => {
    if (!window.confirm('Are you sure?')) return;
    setSubmitting(true);
    const payload = {
      bank: filter.bank,
      type: filter.type,
    };
    const response = await myBankAPI.updateAgentType(payload);
    if (response.success) {
      showNotification({
        title: 'Info',
        message: response.data?.message || 'Update submitted',
        color: 'blue',
      });
    } else {
      showNotification({
        title: 'Error',
        message: response.error || 'Failed to update',
        color: 'red',
      });
    }
    setSubmitting(false);
  };

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Box>
              <Text size="xl" fw={700} c="dark">
                Update Mybank
              </Text>
              <Text size="sm" c="dimmed">
                Pengaturan massal status MyBank dan merchant
              </Text>
            </Box>
            <Button
              variant="light"
              color="gray"
              size="md"
              leftSection={<IconRefresh size={16} />}
              onClick={() => {
                loadBankList();
                loadMerchantList();
              }}
            >
              Refresh Lists
            </Button>
          </Group>

          <Tabs defaultValue="status" color="blue">
            <Tabs.List>
              <Tabs.Tab value="status" leftSection={<IconSettings size={16} />}>
                Turn Off All Agents
              </Tabs.Tab>
              <Tabs.Tab value="merchant" leftSection={<IconSettings size={16} />}>
                Inactive Merchant Wallet
              </Tabs.Tab>
              <Tabs.Tab value="type" leftSection={<IconSettings size={16} />}>
                Change Agent Status
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="status" pt="md">
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  *Function untuk menyalakan/mematikan seluruh wallet (BKASH/NAGAD/ROCKET) sesuai status.
                </Text>
                <Group gap="md" wrap="wrap">
                  <Select
                    label="Merchant"
                    data={merchantOptions}
                    value={filter.merchant}
                    onChange={(val) => handleChange('merchant', val || 'ALL')}
                    placeholder="Select merchant"
                    searchable
                    loading={loadingMerchant}
                    style={{ minWidth: 220 }}
                  />
                  <Select
                    label="Bank"
                    data={bankOptions}
                    value={filter.bank}
                    onChange={(val) => handleChange('bank', val || 'ALL')}
                    placeholder="Select bank"
                    searchable
                    loading={loadingBank}
                    style={{ minWidth: 180 }}
                  />
                  <Select
                    label="Status"
                    data={[
                      { value: 'Y', label: 'Active' },
                      { value: 'N', label: 'Non-Active' },
                    ]}
                    value={filter.status}
                    onChange={(val) => handleChange('status', val || 'Y')}
                    style={{ minWidth: 160 }}
                  />
                </Group>
                <Group justify="flex-start">
                  <Button
                    variant="filled"
                    color="blue"
                    onClick={submitStatus}
                    loading={submitting}
                  >
                    Submit
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="merchant" pt="md">
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  *Unselect/select merchant untuk bank tertentu (tickbox merchant di mybank acc).
                </Text>
                <Group gap="md" wrap="wrap">
                  <Select
                    label="Merchant"
                    data={merchantOptions.filter((m) => m.value !== 'ALL')}
                    value={filter.merchant}
                    onChange={(val) => handleChange('merchant', val || '')}
                    placeholder="Select merchant"
                    searchable
                    loading={loadingMerchant}
                    style={{ minWidth: 220 }}
                  />
                  <Select
                    label="Bank"
                    data={bankOptions}
                    value={filter.bank}
                    onChange={(val) => handleChange('bank', val || 'ALL')}
                    placeholder="Select bank"
                    searchable
                    loading={loadingBank}
                    style={{ minWidth: 180 }}
                  />
                  <Select
                    label="Status"
                    data={[
                      { value: '0', label: 'Active' },
                      { value: '1', label: 'Non-Active' },
                    ]}
                    value={filter.merchantStatus}
                    onChange={(val) => handleChange('merchantStatus', val || '0')}
                    style={{ minWidth: 160 }}
                  />
                </Group>
                <Group justify="flex-start">
                  <Button
                    variant="filled"
                    color="blue"
                    onClick={submitMerchant}
                    loading={submitting}
                  >
                    Submit
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="type" pt="md">
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  *Mengubah status agent aktif dari deposit/withdraw menjadi sesuai pilihan.
                </Text>
                <Group gap="md" wrap="wrap">
                  <Select
                    label="Bank"
                    data={bankOptions}
                    value={filter.bank}
                    onChange={(val) => handleChange('bank', val || 'ALL')}
                    placeholder="Select bank"
                    searchable
                    loading={loadingBank}
                    style={{ minWidth: 180 }}
                  />
                  <Select
                    label="Type"
                    data={[
                      { value: 'A', label: 'DEPOSIT & WITHDRAW' },
                      { value: 'D', label: 'DEPOSIT' },
                      { value: 'W', label: 'WITHDRAW' },
                    ]}
                    value={filter.type}
                    onChange={(val) => handleChange('type', val || 'A')}
                    style={{ minWidth: 220 }}
                  />
                </Group>
                <Group justify="flex-start">
                  <Button
                    variant="filled"
                    color="blue"
                    onClick={submitType}
                    loading={submitting}
                  >
                    Submit
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Card>
    </Box>
  );
};

export default UpdateMyBank;
