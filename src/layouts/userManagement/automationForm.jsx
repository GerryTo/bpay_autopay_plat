import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Group,
  TextInput,
  Select,
  LoadingOverlay,
  Stack,
  Text,
  Paper,
  Card,
  Divider,
  Autocomplete,
} from '@mantine/core';
import { IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { automationAPI } from '../../helper/api';
import apiClient from '../../helper/api';

const AutomationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginAccounts, setLoginAccounts] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    mainUser: '',
    username: '',
    bankCode: 'NAGAD',
    system: 'AUTOMATION',
    useappium: '0',
    phonenumber: '',
    provider: '',
  });

  // Fetch login accounts for main user dropdown
  const getLoginAccounts = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append('data', 'get');

      const response = await apiClient.post('/loginAccount_getList.php', formData);

      if (response.data && response.data.status?.toLowerCase() === 'ok') {
        const accounts = response.data.records || [];
        setLoginAccounts(accounts);
      }
    } catch (error) {
      console.error('Error fetching login accounts:', error);
    }
  };

  useEffect(() => {
    getLoginAccounts();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle main user selection
  const handleMainUserSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      mainUser: value,
    }));

    // Find selected account and auto-fill phone number
    const selectedAccount = loginAccounts.find((acc) => acc.user === value);
    if (selectedAccount && selectedAccount.phonenumber) {
      setFormData((prev) => ({
        ...prev,
        phonenumber: selectedAccount.phonenumber,
      }));
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.username.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please insert the username',
        color: 'red',
      });
      return;
    }

    if (!formData.system) {
      showNotification({
        title: 'Validation Error',
        message: 'Please choose system',
        color: 'red',
      });
      return;
    }

    if (!formData.bankCode) {
      showNotification({
        title: 'Validation Error',
        message: 'Please choose bankCode',
        color: 'red',
      });
      return;
    }

    if (!formData.mainUser.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please choose mainUser',
        color: 'red',
      });
      return;
    }

    if (!formData.useappium) {
      showNotification({
        title: 'Validation Error',
        message: 'Please choose useAppium',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      // Format data as string for PHP backend
      const dataString = JSON.stringify({
        mainUser: formData.mainUser,
        username: formData.username,
        bankCode: formData.bankCode,
        system: formData.system,
        useappium: formData.useappium,
        phonenumber: formData.phonenumber,
        provider: formData.provider,
      });

      console.log('Sending automation data:', dataString);

      const response = await automationAPI.createAutomation(dataString);

      if (response.success) {
        showNotification({
          title: 'Success',
          message: 'Automation account created successfully',
          color: 'green',
        });
        // Navigate back to automation list admin
        navigate('/automation-create-list-admin');
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to create automation account',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to create automation account',
        color: 'red',
      });
      console.error('Error creating automation account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/automation-create-list-admin');
  };

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
                Add Automation Account
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Create new automation account
              </Text>
            </Box>
            <Button
              leftSection={<IconArrowLeft size={18} />}
              onClick={handleCancel}
              variant="light"
              color="gray"
            >
              Back to List
            </Button>
          </Group>

          <Divider />

          {/* Form */}
          <Box pos="relative">
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: 'md', blur: 2 }}
              loaderProps={{ color: 'blue', type: 'dots' }}
            />

            <Paper
              p="xl"
              withBorder
              radius="md"
              bg="gray.0"
            >
              <Stack gap="md">
                {/* Main User */}
                <Autocomplete
                  label="Main User"
                  placeholder="Search main user..."
                  value={formData.mainUser}
                  onChange={handleMainUserSelect}
                  data={loginAccounts.map((acc) => ({
                    value: acc.user,
                    label: `${acc.user} (${acc.phonenumber || 'N/A'})`,
                  }))}
                  required
                  withAsterisk
                  maxDropdownHeight={200}
                  limit={50}
                />

                {/* Username */}
                <TextInput
                  label="Username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.currentTarget.value)}
                  required
                  withAsterisk
                />

                {/* Bank Code */}
                <Select
                  label="Bank Code"
                  placeholder="Select bank code"
                  value={formData.bankCode}
                  onChange={(value) => handleInputChange('bankCode', value)}
                  data={[
                    { value: 'BKASH', label: 'BKASH' },
                    { value: 'NAGAD', label: 'NAGAD' },
                    { value: 'BKASHM', label: 'BKASHM' },
                  ]}
                  required
                  withAsterisk
                />

                {/* System */}
                <Select
                  label="System"
                  placeholder="Select system"
                  value={formData.system}
                  onChange={(value) => handleInputChange('system', value)}
                  data={[
                    { value: 'AUTOMATION', label: 'AUTOMATION' },
                    { value: 'COM GETTER', label: 'COM GETTER' },
                  ]}
                  required
                  withAsterisk
                />

                {/* Appium Online */}
                <Select
                  label="Appium Online"
                  placeholder="Select appium status"
                  value={formData.useappium}
                  onChange={(value) => handleInputChange('useappium', value)}
                  data={[
                    { value: '0', label: 'No' },
                    { value: '1', label: 'Yes' },
                  ]}
                  required
                  withAsterisk
                />

                {/* Phone Number */}
                <TextInput
                  label="Phone Number"
                  placeholder="Phone number"
                  value={formData.phonenumber}
                  onChange={(e) => handleInputChange('phonenumber', e.currentTarget.value)}
                  readOnly
                  description="Auto-filled from selected main user"
                />

                {/* Provider */}
                <Select
                  label="Set Provider"
                  placeholder="Select provider"
                  value={formData.provider}
                  onChange={(value) => handleInputChange('provider', value)}
                  data={[
                    { value: 'Airtel', label: 'Airtel' },
                    { value: 'Banglalink', label: 'Banglalink' },
                    { value: 'Grameenphone', label: 'Grameenphone' },
                    { value: 'Robi', label: 'Robi' },
                  ]}
                  clearable
                />
              </Stack>
            </Paper>
          </Box>

          {/* Action Buttons */}
          <Group
            justify="flex-end"
            gap="md"
          >
            <Button
              variant="light"
              color="gray"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={handleSave}
              variant="filled"
              color="blue"
              disabled={loading}
            >
              Add
            </Button>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
};

export default AutomationForm;
