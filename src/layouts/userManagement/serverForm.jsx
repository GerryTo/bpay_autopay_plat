import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Group,
  TextInput,
  LoadingOverlay,
  Stack,
  Text,
  Paper,
  Card,
  Divider,
} from '@mantine/core';
import { IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { serverAPI } from '../../helper/api';

const ServerForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Check if we're editing (server data passed from list)
  const editingServer = location.state?.server;
  const isEditMode = !!editingServer;

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    password: '',
  });

  useEffect(() => {
    if (editingServer) {
      setFormData({
        name: editingServer.name || '',
        address: editingServer.address || '',
        password: editingServer.password || '',
      });
    }
  }, [editingServer]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please insert the server name',
        color: 'red',
      });
      return;
    }

    if (!formData.address.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please insert the Anydesk address',
        color: 'red',
      });
      return;
    }

    if (!formData.password.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please insert the password',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const response = isEditMode
        ? await serverAPI.updateServer(formData)
        : await serverAPI.createServer(formData);

      const expectedMessage = isEditMode
        ? 'success update server'
        : 'success add server';

      if (response.success && response.data?.message === expectedMessage) {
        showNotification({
          title: 'Success',
          message: isEditMode
            ? 'Server updated successfully'
            : 'Server added successfully',
          color: 'green',
        });
        // Navigate back to server list
        navigate('/server-list');
      } else {
        showNotification({
          title: 'Error',
          message: response.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} server`,
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'add'} server`,
        color: 'red',
      });
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} server:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/server-list');
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
                {isEditMode ? 'Edit Server' : 'Add New Server'}
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                {isEditMode
                  ? 'Update server configuration'
                  : 'Create new server configuration'}
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
                {/* Server Name */}
                <TextInput
                  label="Server Name"
                  placeholder="Enter server name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.currentTarget.value)}
                  required
                  withAsterisk
                  disabled={isEditMode} // Disable name editing in edit mode
                  description={
                    isEditMode ? 'Server name cannot be changed' : undefined
                  }
                />

                {/* Anydesk Address */}
                <TextInput
                  label="Anydesk Address"
                  placeholder="Enter Anydesk address"
                  value={formData.address}
                  onChange={(e) =>
                    handleInputChange('address', e.currentTarget.value)
                  }
                  required
                  withAsterisk
                />

                {/* Password */}
                <TextInput
                  label="Password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.currentTarget.value)
                  }
                  required
                  withAsterisk
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
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
};

export default ServerForm;
