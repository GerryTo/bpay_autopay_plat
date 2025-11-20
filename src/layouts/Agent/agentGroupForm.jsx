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
  Select,
} from '@mantine/core';
import { IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { userAPI } from '../../helper/api';

const AgentGroupForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Get data from navigation state
  const editData = location.state?.data;
  const isEditMode = editData && editData.id !== 0;

  // Form data
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    status: 'Yes',
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id || 0,
        name: editData.name || '',
        status: editData.active || 'Yes',
      });
    } else {
      // If no data, redirect back to list
      navigate('/agentgroup');
    }
  }, [editData, navigate]);

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
        message: 'Please input group name',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      // Convert status to 1 or 0 as expected by backend
      const saveData = {
        id: formData.id,
        name: formData.name,
        status: formData.status === 'Yes' ? 1 : 0,
      };

      const response = await userAPI.saveAgentGroup(saveData);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'success') {
          showNotification({
            title: 'Success',
            message: 'Data Saved',
            color: 'green',
          });
          // Navigate back to list
          navigate('/agentgroup');
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to save data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to save data',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to save data',
        color: 'red',
      });
      console.error('Error saving data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/agentgroup');
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
                Agent Group Form
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                {isEditMode
                  ? 'Update agent group information'
                  : 'Create new agent group'}
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
                {/* Group Name */}
                <TextInput
                  label="Group Name"
                  placeholder="Enter group name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.currentTarget.value)}
                  required
                  withAsterisk
                />

                {/* Is Active */}
                <Select
                  label="Is Active"
                  placeholder="Select status"
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  data={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                  ]}
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
              Save
            </Button>
          </Group>
        </Stack>
      </Card>
    </Box>
  );
};

export default AgentGroupForm;
