import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Grid,
  Group,
  LoadingOverlay,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconRefresh,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { myBankAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const defaultForm = {
  bankAccNo: '',
  bankAccName: '',
  bankCode: '',
  balance: '',
  login: '',
  pass: '',
  type: '',
  active: 'Y',
  alias: '',
  dailywithdrawallimit: '',
  dailydepositlimit: '',
  dailylimit: '',
  accountId: '',
  ifsc: '',
  branch: '',
  phoneNumber: '',
  minDeposit: '',
  maxDeposit: '',
  agentCommission: '',
  agentCommissionWithdraw: '',
  balanceDifferent: '',
  alwaysRoundRobin: '0',
  useAppium: '0',
  opentype: 'P',
  automationStatus: '0',
};

const MasterMyBankForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.data || {};

  const [form, setForm] = useState(defaultForm);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [checkAll, setCheckAll] = useState(false);
  const [merchantLoading, setMerchantLoading] = useState(false);

  const isEdit = useMemo(
    () => Boolean(editData?.bankAccNo) || Boolean(editData?.bankAccName),
    [editData]
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const loadBanks = async () => {
    try {
      const res = await myBankAPI.getMasterBank();
      if (res.success && res.data?.status?.toLowerCase() === 'ok') {
        const list = res.data.records || [];
        setBanks(list);
        if (!form.bankCode && list.length > 0) {
          handleChange('bankCode', list[0].bankCode);
        }
      }
    } catch (error) {
      console.error('Load bank list error:', error);
    }
  };

  const categorizeMerchants = (records, bankCode) => {
    const frequentlyUsed = [
      'BB88',
      'LGRB',
      'CTAPP',
      'D88',
      'BGTK',
      'B777',
      'BJ001',
      'BHGO1149',
      'LB88-Agent',
      'BB88AGENT',
    ];
    const lessUsed = ['BB88V2', 'D88V2', 'LB88V2'];
    const bkashSpecial = ['D88xP', 'LB88xP', 'BBXP'];
    const code = (bankCode || '').toLowerCase();

    if (code === 'bkashm') {
      return records
        .filter((m) => bkashSpecial.includes((m.merchantcode || '').trim()))
        .map((m) => ({
          ...m,
          check: m.check === true,
          group: 'BkashM Special',
        }));
    }

    return records.map((m) => {
      const mc = (m.merchantcode || '').trim();
      let group = 'Other';
      if (frequentlyUsed.includes(mc)) group = 'Frequently Used';
      else if (lessUsed.includes(mc)) group = 'Less Used';
      return { ...m, check: m.check === true, group };
    });
  };

  const loadMerchants = async (bankAccNoParam, bankCodeParam) => {
    const bankAccNo = bankAccNoParam ?? editData.bankAccNo ?? '';
    const bankCode = bankCodeParam ?? form.bankCode ?? '';
    if (!bankCode) return;
    setMerchantLoading(true);
    try {
      const res = await myBankAPI.getMasterMerchantForBank(bankAccNo, bankCode);
      if (res.success && res.data?.status?.toLowerCase() === 'ok') {
        const records = categorizeMerchants(res.data.records || [], bankCode);
        setMerchants(records);
        setCheckAll(records.length > 0 && records.every((m) => m.check));
      } else {
        showNotification({
          title: 'Error',
          message: res.data?.message || res.error || 'Gagal memuat merchant',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Load merchants error:', error);
      showNotification({
        title: 'Error',
        message: 'Gagal memuat merchant',
        color: 'red',
      });
    } finally {
      setMerchantLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  useEffect(() => {
    if (editData) {
      setForm((prev) => ({
        ...prev,
        ...editData,
        bankAccNo: editData.bankAccNo || prev.bankAccNo,
        bankAccName: editData.bankAccName || prev.bankAccName,
        bankCode: editData.bankCode || prev.bankCode,
      }));
      loadMerchants(editData.bankAccNo, editData.bankCode);
    }
  }, [editData]);

  useEffect(() => {
    if (form.bankCode) {
      loadMerchants(editData.bankAccNo, form.bankCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.bankCode]);

  const validateForm = () => {
    const required = [
      ['bankAccNo', 'Account No wajib diisi'],
      ['bankAccName', 'Account Name wajib diisi'],
      ['bankCode', 'Bank wajib dipilih'],
      ['login', 'Login wajib diisi'],
      ['pass', 'Password wajib diisi'],
      ['alias', 'Alias wajib diisi'],
      ['type', 'Type wajib diisi'],
      ['automationStatus', 'Automation Status wajib diisi'],
    ];

    for (const [field, message] of required) {
      if (!String(form[field] ?? '').trim()) {
        showNotification({ title: 'Validasi', message, color: 'red' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = { ...form, edit: isEdit ? 1 : 0, merchants };
      const res = await myBankAPI.saveMasterMyBank(payload);
      if (res.success && res.data?.status?.toLowerCase() === 'ok') {
        showNotification({
          title: 'Berhasil',
          message: 'Data tersimpan',
          color: 'green',
        });
        navigate('/master-mybank');
      } else {
        showNotification({
          title: 'Error',
          message: res.data?.message || res.error || 'Gagal menyimpan data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Save master mybank error:', error);
      showNotification({
        title: 'Error',
        message: 'Gagal menyimpan data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'D', label: 'Deposit Account' },
    { value: 'W', label: 'Withdraw Account' },
    { value: 'A', label: 'Deposit & Withdraw' },
    { value: 'P', label: 'Penampungan' },
    { value: 'B', label: 'Big Balance' },
  ];

  const automationOptions = [
    { value: '0', label: 'No' },
    { value: '1', label: 'Yes' },
    { value: '2', label: 'OTP Error' },
    { value: 'N', label: 'Inactive' },
  ];

  const openTypeOptions = [
    { value: 'P', label: 'Pending' },
    { value: '16', label: '16 Hour' },
    { value: '24CI', label: '24 Hour CI' },
    { value: '24CO', label: '24 Hour CO' },
  ];

  const activeOptions = [
    { value: 'Y', label: 'Active' },
    { value: 'N', label: 'Inactive' },
    { value: 'D', label: 'Deactive' },
  ];

  const groupedMerchants = useMemo(() => {
    const groups = {};
    merchants.forEach((m) => {
      const g = m.group || 'Other';
      if (!groups[g]) groups[g] = [];
      groups[g].push(m);
    });
    return groups;
  }, [merchants]);

  const handleToggleAll = (checked) => {
    setCheckAll(checked);
    setMerchants((prev) => prev.map((m) => ({ ...m, check: checked })));
  };

  const handleToggleMerchant = (idx, checked) => {
    setMerchants((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], check: checked };
      const allChecked = next.length > 0 && next.every((m) => m.check);
      setCheckAll(allChecked);
      return next;
    });
  };

  const resetForm = () => {
    if (isEdit) {
      setForm({ ...defaultForm, ...editData });
      loadMerchants(editData.bankAccNo, editData.bankCode);
    } else {
      setForm(defaultForm);
      setMerchants([]);
      setCheckAll(false);
    }
  };

  return (
    <Box p="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        pos="relative"
      >
        <LoadingOverlay
          visible={loading}
          overlayProps={{ blur: 2 }}
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
                c="dark"
              >
                {isEdit ? 'Edit MyBank' : 'Add MyBank'}
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Form MyBank untuk Data List dan Deactive Bank
              </Text>
            </Box>
            <Group gap="xs">
              <Button
                variant="light"
                color="gray"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Button
                variant="light"
                color="gray"
                leftSection={<IconRefresh size={16} />}
                onClick={resetForm}
              >
                Reset
              </Button>
            </Group>
          </Group>

          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Account No"
                placeholder="Bank Acc. No"
                value={form.bankAccNo}
                onChange={(e) =>
                  handleChange('bankAccNo', e.currentTarget.value)
                }
                disabled={isEdit}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Account Name"
                placeholder="Bank Acc. Name"
                value={form.bankAccName}
                onChange={(e) =>
                  handleChange('bankAccName', e.currentTarget.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Alias"
                placeholder="Alias"
                value={form.alias}
                onChange={(e) => handleChange('alias', e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Account ID"
                placeholder="Account ID"
                value={form.accountId}
                onChange={(e) =>
                  handleChange('accountId', e.currentTarget.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="IFSC"
                placeholder="IFSC"
                value={form.ifsc}
                onChange={(e) => handleChange('ifsc', e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Branch"
                placeholder="Bank Branch"
                value={form.branch}
                onChange={(e) => handleChange('branch', e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Bank"
                placeholder="Select bank"
                data={banks.map((b) => ({
                  value: b.bankCode,
                  label: `${b.bankCode} - ${b.bankName || b.bankcode}`,
                }))}
                value={form.bankCode}
                onChange={(val) => handleChange('bankCode', val)}
                disabled={isEdit}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Login"
                placeholder="User Login"
                value={form.login}
                onChange={(e) => handleChange('login', e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Password"
                type="password"
                placeholder="User Password"
                value={form.pass}
                onChange={(e) => handleChange('pass', e.currentTarget.value)}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Status"
                data={activeOptions}
                value={form.active}
                onChange={(val) => handleChange('active', val)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Type"
                data={typeOptions}
                value={form.type}
                onChange={(val) => handleChange('type', val)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Operation Hour"
                data={openTypeOptions}
                value={form.opentype}
                onChange={(val) => handleChange('opentype', val)}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Daily Deposit Limit"
                placeholder="0"
                value={form.dailydepositlimit}
                onChange={(e) =>
                  handleChange('dailydepositlimit', e.currentTarget.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Daily Withdraw Limit"
                placeholder="0"
                value={form.dailywithdrawallimit}
                onChange={(e) =>
                  handleChange('dailywithdrawallimit', e.currentTarget.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Daily Limit"
                placeholder="0"
                value={form.dailylimit}
                onChange={(e) =>
                  handleChange('dailylimit', e.currentTarget.value)
                }
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Phone Number"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={(e) =>
                  handleChange('phoneNumber', e.currentTarget.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Min Deposit"
                placeholder="0"
                value={form.minDeposit}
                onChange={(e) =>
                  handleChange('minDeposit', e.currentTarget.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Max Deposit"
                placeholder="0"
                value={form.maxDeposit}
                onChange={(e) =>
                  handleChange('maxDeposit', e.currentTarget.value)
                }
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Agent Commission Deposit (%)"
                placeholder="0"
                value={form.agentCommission}
                onChange={(e) =>
                  handleChange('agentCommission', e.currentTarget.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Agent Commission Withdraw (%)"
                placeholder="0"
                value={form.agentCommissionWithdraw}
                onChange={(e) =>
                  handleChange('agentCommissionWithdraw', e.currentTarget.value)
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Balance Different Criteria"
                placeholder="0"
                value={form.balanceDifferent}
                onChange={(e) =>
                  handleChange('balanceDifferent', e.currentTarget.value)
                }
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Always Chosen for Available Account"
                data={[
                  { value: '0', label: 'No' },
                  { value: '1', label: 'Yes' },
                ]}
                value={form.alwaysRoundRobin}
                onChange={(val) => handleChange('alwaysRoundRobin', val)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Appium Online"
                data={[
                  { value: '0', label: 'No' },
                  { value: '1', label: 'Yes' },
                ]}
                value={form.useAppium}
                onChange={(val) => handleChange('useAppium', val)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Automation Status"
                data={automationOptions}
                value={form.automationStatus}
                onChange={(val) => handleChange('automationStatus', val)}
              />
            </Grid.Col>
          </Grid>

          <Card
            withBorder
            padding="md"
            radius="md"
          >
            <Stack gap="sm">
              <Group
                justify="space-between"
                align="center"
              >
                <Text fw={600}>List Merchant</Text>
                <Group gap="xs">
                  <Checkbox
                    label="Check all"
                    checked={checkAll}
                    onChange={(e) => handleToggleAll(e.currentTarget.checked)}
                  />
                  <Button
                    variant="light"
                    color="gray"
                    size="xs"
                    leftSection={<IconRefresh size={14} />}
                    onClick={() =>
                      loadMerchants(editData.bankAccNo, form.bankCode)
                    }
                    disabled={!form.bankCode}
                  >
                    Refresh Merchant
                  </Button>
                </Group>
              </Group>

              <Box pos="relative">
                <LoadingOverlay
                  visible={merchantLoading}
                  overlayProps={{ blur: 2 }}
                />
                <ScrollArea
                  h={320}
                  type="auto"
                  scrollbarSize={8}
                  offsetScrollbars={false}
                  style={{ width: '100%' }}
                  styles={{ viewport: { overflowX: 'clip', paddingBottom: 8 } }}
                >
                  <Stack gap="md">
                    {Object.keys(groupedMerchants).length === 0 && (
                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        Tidak ada merchant untuk bank ini.
                      </Text>
                    )}
                    {Object.entries(groupedMerchants).map(
                      ([groupName, items]) => (
                        <Stack
                          key={groupName}
                          gap={6}
                        >
                          <Text
                            fw={600}
                            size="sm"
                          >
                            {groupName}
                          </Text>
                          <SimpleGrid
                            cols={3}
                            spacing="xs"
                            breakpoints={[
                              { maxWidth: 'md', cols: 2 },
                              { maxWidth: 'sm', cols: 1 },
                            ]}
                            style={{ width: '100%' }}
                          >
                            {items.map((item, idx) => {
                              const globalIndex = merchants.indexOf(item);
                              return (
                                <Checkbox
                                  key={`${item.merchantcode}-${idx}`}
                                  label={`${item.merchantcode} - ${item.merchantname}`}
                                  checked={item.check === true}
                                  onChange={(e) =>
                                    handleToggleMerchant(
                                      globalIndex,
                                      e.currentTarget.checked
                                    )
                                  }
                                  styles={{ label: { whiteSpace: 'normal' } }}
                                />
                              );
                            })}
                          </SimpleGrid>
                        </Stack>
                      )
                    )}
                  </Stack>
                </ScrollArea>
              </Box>
            </Stack>
          </Card>

          <Group
            justify="flex-end"
            gap="sm"
          >
            <Button
              variant="light"
              color="gray"
              onClick={() => navigate('/master-mybank')}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={handleSubmit}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
};

export default MasterMyBankForm;
