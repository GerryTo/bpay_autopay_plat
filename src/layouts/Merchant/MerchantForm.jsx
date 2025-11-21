import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  NumberInput,
  Select,
  PasswordInput,
  Grid,
  Divider,
  Table,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconTrash, IconPlus, IconArrowLeft } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';

const MerchantForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const merchantcode = location.state?.merchantcode || '';
  const isEdit = merchantcode !== '';

  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [resellers, setResellers] = useState([]);

  // Main form data
  const [formData, setFormData] = useState({
    merchantCode: merchantcode,
    merchantName: '',
    mobileNumber: '',
    email: '',
    website: '',
    secureCode: '',
    countryCode: '',
    currencyCode: '',
    openingBalance: 0,
    withdrawFeeType: 'P',
    withdrawFeeValue: 0,
    depositFeeType: 'P',
    depositFeeValue: 0,
    customerDepositFeeType: 'P',
    customerDepositFeeValue: 0,
    customerWithdrawFeeType: 'P',
    customerWithdrawFeeValue: 0,
    minimumWithdraw: 0,
    resellerid: '',
    resellerFeeType: 'P',
    resellerFeeValue: 0,
    merchantBank: [],
    timezone: 8,
  });

  // Bank detail form
  const [bankDetail, setBankDetail] = useState({
    id: 0,
    bankAccNo: '',
    bankAccName: '',
    bankCode: '',
  });

  // Load master data
  useEffect(() => {
    loadMasterData();
    if (isEdit) {
      loadMerchantDetail();
    }
  }, []);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [countryRes, currencyRes, bankRes, resellerRes] = await Promise.all([
        merchantAPI.getCountryList(),
        merchantAPI.getCurrencyList(),
        merchantAPI.getBankList(),
        merchantAPI.getResellerList(),
      ]);

      if (countryRes.success && countryRes.data.status?.toLowerCase() === 'ok') {
        setCountries(countryRes.data.records || []);
        if (countryRes.data.records.length > 0 && !formData.countryCode) {
          setFormData((prev) => ({
            ...prev,
            countryCode: countryRes.data.records[0].countryCode,
          }));
        }
      }

      if (currencyRes.success && currencyRes.data.status?.toLowerCase() === 'ok') {
        setCurrencies(currencyRes.data.records || []);
        if (currencyRes.data.records.length > 0 && !formData.currencyCode) {
          setFormData((prev) => ({
            ...prev,
            currencyCode: currencyRes.data.records[0].currencyCode,
          }));
        }
      }

      if (bankRes.success && bankRes.data.status?.toLowerCase() === 'ok') {
        setBanks(bankRes.data.records || []);
        if (bankRes.data.records.length > 0 && !bankDetail.bankCode) {
          setBankDetail((prev) => ({
            ...prev,
            bankCode: bankRes.data.records[0].bankCode,
          }));
        }
      }

      if (resellerRes.success && resellerRes.data.status?.toLowerCase() === 'ok') {
        setResellers(resellerRes.data.records || []);
      }
    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMerchantDetail = async () => {
    if (!merchantcode) return;

    setLoading(true);
    try {
      const response = await merchantAPI.getMerchantDetail(merchantcode);

      if (response.success && response.data.status?.toLowerCase() === 'ok') {
        const detail = response.data.records[0];
        setFormData({
          ...detail,
          timezone: parseInt(detail.timezone),
          resellerFeeValue: Number(detail.resellerFeeValue),
          minimumWithdraw: Number(detail.minimumWithdraw),
          withdrawFeeValue: Number(detail.withdrawFeeValue),
          depositFeeValue: Number(detail.depositFeeValue),
          customerWithdrawFeeValue: Number(detail.customerWithdrawFeeValue),
          customerDepositFeeValue: Number(detail.customerDepositFeeValue),
        });
      } else {
        showNotification({
          title: 'Error',
          message: response.data?.message || 'Failed to load merchant detail',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to load merchant detail',
        color: 'red',
      });
      console.error('Error loading merchant detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = () => {
    if (!bankDetail.bankAccNo) {
      showNotification({
        title: 'Validation Error',
        message: 'Please input Bank Acc. No',
        color: 'orange',
      });
      return;
    }

    if (!bankDetail.bankAccName) {
      showNotification({
        title: 'Validation Error',
        message: 'Please input Bank Acc. Name',
        color: 'orange',
      });
      return;
    }

    if (!bankDetail.bankCode) {
      showNotification({
        title: 'Validation Error',
        message: 'Please pick bank',
        color: 'orange',
      });
      return;
    }

    // Check for duplicates
    const isDuplicate = formData.merchantBank.some(
      (item) =>
        item.bankAccNo === bankDetail.bankAccNo && item.bankCode === bankDetail.bankCode
    );

    if (isDuplicate) {
      showNotification({
        title: 'Validation Error',
        message: 'Duplicate Account Number',
        color: 'orange',
      });
      return;
    }

    const newBank = {
      idx: formData.merchantBank.length,
      id: bankDetail.id,
      bankAccNo: bankDetail.bankAccNo,
      bankAccName: bankDetail.bankAccName,
      bankCode: bankDetail.bankCode,
    };

    setFormData((prev) => ({
      ...prev,
      merchantBank: [...prev.merchantBank, newBank],
    }));

    // Reset bank detail form
    setBankDetail({
      id: 0,
      bankAccNo: '',
      bankAccName: '',
      bankCode: banks.length > 0 ? banks[0].bankCode : '',
    });
  };

  const handleRemoveBank = (idx) => {
    setFormData((prev) => ({
      ...prev,
      merchantBank: prev.merchantBank.filter((_, index) => index !== idx),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.saveMerchant(formData);

      if (response.success && response.data.status?.toLowerCase() === 'ok') {
        showNotification({
          title: 'Success',
          message: 'Data Saved',
          color: 'green',
        });
        navigate('/master-merchant-superadmin');
      } else {
        showNotification({
          title: 'Error',
          message: response.data?.message || response.error || 'Failed to save merchant',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to save merchant',
        color: 'red',
      });
      console.error('Error saving merchant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/master-merchant-superadmin');
  };

  const feeTypeOptions = [
    { value: 'P', label: 'Percentage' },
    { value: 'F', label: 'Fixed value' },
  ];

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
          <Group justify="space-between">
            <Group>
              <ActionIcon
                variant="light"
                onClick={handleCancel}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <Box>
                <Text
                  size="xl"
                  fw={700}
                  c="dark"
                >
                  {isEdit ? 'Edit Merchant' : 'Add New Merchant'}
                </Text>
                <Text
                  size="sm"
                  c="dimmed"
                >
                  {isEdit
                    ? `Editing merchant: ${formData.merchantCode}`
                    : 'Create a new merchant account'}
                </Text>
              </Box>
            </Group>
          </Group>

          <Divider />

          {/* Form */}
          <Box pos="relative">
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: 'md', blur: 2 }}
            />

            <Stack gap="md">
              {/* Merchant Data Section */}
              <Text
                fw={600}
                size="lg"
              >
                Merchant Data
              </Text>

              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Merchant Code"
                    placeholder="Input merchant code"
                    value={formData.merchantCode}
                    onChange={(e) =>
                      setFormData({ ...formData, merchantCode: e.target.value })
                    }
                    required
                    disabled={isEdit}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Merchant Name"
                    placeholder="Input merchant name"
                    value={formData.merchantName}
                    onChange={(e) =>
                      setFormData({ ...formData, merchantName: e.target.value })
                    }
                    required
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Mobile Number"
                    placeholder="Input merchant mobile number"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, mobileNumber: e.target.value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Email"
                    placeholder="Input merchant email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Website Address"
                    placeholder="Input merchant website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <PasswordInput
                    label="Secure Code"
                    placeholder="Input merchant secure code"
                    value={formData.secureCode}
                    onChange={(e) =>
                      setFormData({ ...formData, secureCode: e.target.value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Country"
                    placeholder="Select country"
                    data={countries.map((c) => ({
                      value: c.countryCode,
                      label: c.countryName,
                    }))}
                    value={formData.countryCode}
                    onChange={(value) =>
                      setFormData({ ...formData, countryCode: value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Currency"
                    placeholder="Select currency"
                    data={currencies.map((c) => ({
                      value: c.currencyCode,
                      label: c.currencyName,
                    }))}
                    value={formData.currencyCode}
                    onChange={(value) =>
                      setFormData({ ...formData, currencyCode: value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Timezone"
                    placeholder="Input timezone that use by merchant"
                    value={formData.timezone}
                    onChange={(value) => setFormData({ ...formData, timezone: value })}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Opening Balance"
                    placeholder="Input merchant opening balance"
                    value={formData.openingBalance}
                    onChange={(value) =>
                      setFormData({ ...formData, openingBalance: value })
                    }
                    decimalScale={2}
                  />
                </Grid.Col>
              </Grid>

              <Divider
                my="md"
                label="Fee Configuration"
                labelPosition="center"
              />

              {/* Withdraw Fee */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Withdraw Fee Type"
                    data={feeTypeOptions}
                    value={formData.withdrawFeeType}
                    onChange={(value) =>
                      setFormData({ ...formData, withdrawFeeType: value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Withdraw Fee Value"
                    placeholder="Input withdraw fee value"
                    value={formData.withdrawFeeValue}
                    onChange={(value) =>
                      setFormData({ ...formData, withdrawFeeValue: value })
                    }
                    decimalScale={2}
                    step={0.01}
                  />
                </Grid.Col>

                {/* Deposit Fee */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Deposit Fee Type"
                    data={feeTypeOptions}
                    value={formData.depositFeeType}
                    onChange={(value) =>
                      setFormData({ ...formData, depositFeeType: value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Deposit Fee Value"
                    placeholder="Input deposit fee value"
                    value={formData.depositFeeValue}
                    onChange={(value) =>
                      setFormData({ ...formData, depositFeeValue: value })
                    }
                    decimalScale={2}
                    step={0.01}
                  />
                </Grid.Col>

                {/* Customer Withdraw Fee */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Customer Withdraw Fee Type"
                    data={feeTypeOptions}
                    value={formData.customerWithdrawFeeType}
                    onChange={(value) =>
                      setFormData({ ...formData, customerWithdrawFeeType: value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Customer Withdraw Fee Value"
                    placeholder="Input customer withdraw fee value"
                    value={formData.customerWithdrawFeeValue}
                    onChange={(value) =>
                      setFormData({ ...formData, customerWithdrawFeeValue: value })
                    }
                    decimalScale={2}
                    step={0.01}
                  />
                </Grid.Col>

                <Grid.Col span={12}>
                  <NumberInput
                    label="Customer Minimum Withdraw"
                    placeholder="Input customer minimum withdraw"
                    value={formData.minimumWithdraw}
                    onChange={(value) =>
                      setFormData({ ...formData, minimumWithdraw: value })
                    }
                    decimalScale={2}
                  />
                </Grid.Col>

                {/* Customer Deposit Fee */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Customer Deposit Fee Type"
                    data={feeTypeOptions}
                    value={formData.customerDepositFeeType}
                    onChange={(value) =>
                      setFormData({ ...formData, customerDepositFeeType: value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Customer Deposit Fee Value"
                    placeholder="Input customer deposit fee value"
                    value={formData.customerDepositFeeValue}
                    onChange={(value) =>
                      setFormData({ ...formData, customerDepositFeeValue: value })
                    }
                    decimalScale={2}
                    step={0.01}
                  />
                </Grid.Col>

                {/* Reseller */}
                <Grid.Col span={12}>
                  <Select
                    label="Reseller ID"
                    placeholder="Select reseller"
                    data={resellers.map((r) => ({
                      value: r.v_user,
                      label: r.v_user,
                    }))}
                    value={formData.resellerid}
                    onChange={(value) => setFormData({ ...formData, resellerid: value })}
                    clearable
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Reseller Commission Type"
                    data={feeTypeOptions}
                    value={formData.resellerFeeType}
                    onChange={(value) =>
                      setFormData({ ...formData, resellerFeeType: value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Reseller Commission Value"
                    placeholder="Input reseller commission value"
                    value={formData.resellerFeeValue}
                    onChange={(value) =>
                      setFormData({ ...formData, resellerFeeValue: value })
                    }
                    decimalScale={2}
                    step={0.01}
                  />
                </Grid.Col>
              </Grid>

              <Divider
                my="md"
                label="Merchant Bank Accounts"
                labelPosition="center"
              />

              {/* Bank Detail Input */}
              <Grid>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <TextInput
                    placeholder="Bank Acc. No"
                    value={bankDetail.bankAccNo}
                    onChange={(e) =>
                      setBankDetail({ ...bankDetail, bankAccNo: e.target.value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                  <TextInput
                    placeholder="Bank Acc. Name"
                    value={bankDetail.bankAccName}
                    onChange={(e) =>
                      setBankDetail({ ...bankDetail, bankAccName: e.target.value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    placeholder="Select Bank"
                    data={banks.map((b) => ({
                      value: b.bankCode,
                      label: b.bankName,
                    }))}
                    value={bankDetail.bankCode}
                    onChange={(value) =>
                      setBankDetail({ ...bankDetail, bankCode: value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 2 }}>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={handleAddBank}
                    fullWidth
                    variant="light"
                  >
                    Add
                  </Button>
                </Grid.Col>
              </Grid>

              {/* Bank List Table */}
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Bank Acc. No</Table.Th>
                    <Table.Th>Bank Acc. Name</Table.Th>
                    <Table.Th>Bank Code</Table.Th>
                    <Table.Th>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {formData.merchantBank.length > 0 ? (
                    formData.merchantBank.map((bank, idx) => (
                      <Table.Tr key={idx}>
                        <Table.Td>{bank.bankAccNo}</Table.Td>
                        <Table.Td>{bank.bankAccName}</Table.Td>
                        <Table.Td>{bank.bankCode}</Table.Td>
                        <Table.Td>
                          <Tooltip label="Remove">
                            <ActionIcon
                              color="red"
                              variant="light"
                              onClick={() => handleRemoveBank(idx)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td
                        colSpan={4}
                        style={{ textAlign: 'center' }}
                      >
                        No data available
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>

              {/* Action Buttons */}
              <Group
                justify="flex-end"
                mt="xl"
              >
                <Button
                  variant="default"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  loading={loading}
                >
                  Save
                </Button>
              </Group>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default MerchantForm;
