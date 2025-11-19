import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Group,
  TextInput,
  PasswordInput,
  Select,
  Stack,
  Text,
  Card,
  LoadingOverlay,
  Checkbox,
  Grid,
  Divider,
  Paper,
  Badge,
} from '@mantine/core';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showNotification } from '../../helper/showNotification';
import { userAPI } from '../../helper/api';
import { CRYPTO } from '../../helper/crypto';

const AccountForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.data;

  const [loading, setLoading] = useState(false);
  const [merchantList, setMerchantList] = useState([]);
  const [menuNav, setMenuNav] = useState([]);
  const [agentGroupList, setAgentGroupList] = useState([]);
  const [loginStatusList, setLoginStatusList] = useState([]);
  const [menuAccess, setMenuAccess] = useState({});

  const loginTypeOptions = [
    { value: 'S', label: 'Super Admin' },
    { value: 'A', label: 'Admin' },
    { value: 'M', label: 'Merchant' },
    { value: 'R', label: 'Reseller' },
    { value: 'G', label: 'Agent' },
  ];

  const providerOptions = [
    { value: 'Airtel', label: 'Airtel' },
    { value: 'Banglalink', label: 'Banglalink' },
    { value: 'Grameenphone', label: 'Grameenphone' },
    { value: 'Robi', label: 'Robi' },
  ];

  const [formData, setFormData] = useState({
    login: '',
    password: '',
    active: 'Y',
    logintype: 'A',
    access: 0,
    merchantcode: '',
    phoneNumber: '',
    agentName: '',
    alias: '',
    status: '1',
    agentgroupid: '0',
    isNew: '1',
    useCredit: 'Y',
    isdm: 'N',
    isSetMerchant: 'N',
    provider: '',
  });

  const [hiddenMenus, setHiddenMenus] = useState([]);

  // Load edit data
  useEffect(() => {
    if (editData && editData.login) {
      setFormData({
        login: editData.login || '',
        password: '',
        active: editData.active || 'Y',
        logintype: editData.logintype || 'A',
        access: Number(editData.access || 0),
        merchantcode: editData.merchantcode || '',
        phoneNumber: editData.phoneNumber || '',
        agentName: editData.agentName || '',
        alias: editData.alias || '',
        status: editData.status || '1',
        agentgroupid: editData.agentgroupid || '0',
        isNew: '0',
        useCredit: editData.useCredit || 'Y',
        isdm: editData.isdm || 'N',
        isSetMerchant: editData.issetmerchant || 'N',
        provider: editData.provider || '',
      });
    }
  }, [editData]);

  // Load master data on mount
  useEffect(() => {
    getMasterMerchant();
    getMenuNav();
    getAgentGroup();
    getLoginStatusList();
  }, []);

  // Update menu access checkboxes when formData.access or menuNav changes
  useEffect(() => {
    if (menuNav.length > 0) {
      const newMenuAccess = {};
      menuNav.forEach((menu) => {
        const menuId = Number(menu.menuid);
        newMenuAccess[menu.menuid] = (formData.access & menuId) !== 0;
      });
      setMenuAccess(newMenuAccess);
    }
  }, [formData.access, menuNav]);

  // Update hidden menus based on login type
  useEffect(() => {
    changeType();
  }, [formData.logintype]);

  const getMasterMerchant = async () => {
    try {
      const response = await userAPI.getMasterMerchantList();
      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          setMerchantList(response.data.records || []);
        }
      }
    } catch (error) {
      console.error('Error fetching merchant list:', error);
    }
  };

  const getMenuNav = async () => {
    try {
      const response = await userAPI.getMenuNav();
      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          // Filter only active menus
          const activeMenus = (response.data.records || []).filter(
            (menu) => menu.active === 'Yes'
          );
          setMenuNav(activeMenus);
        }
      }
    } catch (error) {
      console.error('Error fetching menu nav:', error);
    }
  };

  const getAgentGroup = async () => {
    try {
      const response = await userAPI.getAgentGroup();
      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'success') {
          setAgentGroupList(response.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching agent groups:', error);
    }
  };

  const getLoginStatusList = async () => {
    try {
      const response = await userAPI.getLoginStatusList();
      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          setLoginStatusList(response.data.records || []);
        }
      }
    } catch (error) {
      console.error('Error fetching login status list:', error);
    }
  };

  const changeType = () => {
    const type = formData.logintype;
    let access = 0;
    const hidden = Array(14).fill(true);

    if (type === 'A' || type === 'S') {
      access = 3191;
      hidden[0] = false;
      hidden[1] = false;
      hidden[2] = false;
      hidden[4] = false;
      hidden[5] = false;
      hidden[6] = false;
      hidden[10] = false;
      hidden[11] = false;
      hidden[12] = false;
      hidden[13] = false;
    } else if (type === 'M') {
      access = 520;
      hidden[3] = false;
      hidden[9] = false;
      hidden[12] = false;
    } else if (type === 'R') {
      access = 896;
      hidden[7] = false;
      hidden[8] = false;
      hidden[9] = false;
    } else if (type === 'G') {
      access = 0;
      // All hidden
    }

    setHiddenMenus(hidden);
    setFormData((prev) => ({ ...prev, access }));
  };

  const handleMenuCheck = (menuId, checked) => {
    const id = Number(menuId);
    setMenuAccess((prev) => ({ ...prev, [menuId]: checked }));

    setFormData((prev) => {
      let newAccess = prev.access;
      if (checked) {
        newAccess = newAccess | id; // Bitwise OR to add
      } else {
        newAccess = newAccess & ~id; // Bitwise AND with NOT to remove
      }
      return { ...prev, access: newAccess };
    });
  };

  const handleSelectAll = () => {
    const newMenuAccess = {};
    let newAccess = 0;

    menuNav.forEach((menu, index) => {
      const isHidden = hiddenMenus[index] === true;
      if (!isHidden) {
        const menuId = Number(menu.menuid);
        newMenuAccess[menu.menuid] = true;
        newAccess = newAccess | menuId;
      }
    });

    setMenuAccess(newMenuAccess);
    setFormData((prev) => ({ ...prev, access: newAccess }));
  };

  const handleClearAll = () => {
    const newMenuAccess = {};
    menuNav.forEach((menu) => {
      newMenuAccess[menu.menuid] = false;
    });

    setMenuAccess(newMenuAccess);
    setFormData((prev) => ({ ...prev, access: 0 }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.login.trim()) {
      showNotification({
        title: 'Validation Error',
        message: 'Please input login',
        color: 'red',
      });
      return;
    }

    if (formData.logintype === 'M' && !formData.merchantcode) {
      showNotification({
        title: 'Validation Error',
        message: 'Please select merchant code',
        color: 'red',
      });
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to save user [${formData.login}]?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data
      const saveData = {
        ...formData,
        // Clear merchant code if not merchant type
        merchantcode:
          formData.logintype !== 'M' ? '' : formData.merchantcode,
      };

      console.log('Sending data to save:', saveData);
      const response = await userAPI.saveMasterLogin(saveData);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: 'User saved successfully',
            color: 'green',
          });
          navigate('/login-list');
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to save user',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to save user',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to save user',
        color: 'red',
      });
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/login-list');
  };

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Box pos="relative">
          <LoadingOverlay
            visible={loading}
            overlayProps={{ radius: 'md', blur: 2 }}
            loaderProps={{ color: 'blue', type: 'dots' }}
          />

          <Stack gap="lg">
            {/* Header */}
            <Box>
              <Text size="xl" fw={700} c="dark">
                {formData.isNew === '1' ? 'Add New User' : 'Edit User'}
              </Text>
              <Text size="sm" c="dimmed">
                {formData.isNew === '1'
                  ? 'Create a new user account'
                  : `Editing user: ${formData.login}`}
              </Text>
            </Box>

            <Divider />

            {/* Login Data Section */}
            <Box>
              <Text size="md" fw={600} mb="md" c="blue">
                Login Data
              </Text>

              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="User Login"
                    placeholder="Input login code"
                    value={formData.login}
                    onChange={(e) =>
                      setFormData({ ...formData, login: e.target.value })
                    }
                    required
                    disabled={formData.isNew === '0'}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <PasswordInput
                    label="Password"
                    placeholder={
                      formData.isNew === '1'
                        ? 'Input password'
                        : 'Leave empty to keep current password'
                    }
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Active"
                    value={formData.active}
                    onChange={(value) =>
                      setFormData({ ...formData, active: value })
                    }
                    data={[
                      { value: 'Y', label: 'Yes' },
                      { value: 'N', label: 'No' },
                    ]}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Login Type"
                    value={formData.logintype}
                    onChange={(value) =>
                      setFormData({ ...formData, logintype: value })
                    }
                    data={loginTypeOptions}
                  />
                </Grid.Col>

                {formData.logintype === 'G' && (
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Select
                      label="Agent Group"
                      value={formData.agentgroupid}
                      onChange={(value) =>
                        setFormData({ ...formData, agentgroupid: value })
                      }
                      data={[
                        { value: '0', label: '- NO GROUP -' },
                        ...agentGroupList.map((item) => ({
                          value: String(item.agentgroupid),
                          label: item.agentgroupname,
                        })),
                      ]}
                    />
                  </Grid.Col>
                )}

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Merchant"
                    value={formData.merchantcode}
                    onChange={(value) =>
                      setFormData({ ...formData, merchantcode: value })
                    }
                    data={merchantList.map((item) => ({
                      value: item.merchantCode,
                      label: item.merchantName,
                    }))}
                    placeholder="Select merchant"
                    clearable
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Phone Number"
                    placeholder="Input phone number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Agent Name"
                    placeholder="Input agent name"
                    value={formData.agentName}
                    onChange={(e) =>
                      setFormData({ ...formData, agentName: e.target.value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Alias"
                    placeholder="Input alias"
                    value={formData.alias}
                    onChange={(e) =>
                      setFormData({ ...formData, alias: e.target.value })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Login Status"
                    value={formData.status}
                    onChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                    data={loginStatusList.map((item) => ({
                      value: String(item.id),
                      label: item.description,
                    }))}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Use Credit"
                    value={formData.useCredit}
                    onChange={(value) =>
                      setFormData({ ...formData, useCredit: value })
                    }
                    data={[
                      { value: 'Y', label: 'Yes' },
                      { value: 'N', label: 'No' },
                    ]}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Is Direct Merchant"
                    value={formData.isdm}
                    onChange={(value) =>
                      setFormData({ ...formData, isdm: value })
                    }
                    data={[
                      { value: 'Y', label: 'Yes' },
                      { value: 'N', label: 'No' },
                    ]}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Set Merchant"
                    value={formData.isSetMerchant}
                    onChange={(value) =>
                      setFormData({ ...formData, isSetMerchant: value })
                    }
                    data={[
                      { value: 'Y', label: 'Yes' },
                      { value: 'N', label: 'No' },
                    ]}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Set Provider"
                    value={formData.provider}
                    onChange={(value) =>
                      setFormData({ ...formData, provider: value })
                    }
                    data={providerOptions}
                    placeholder="Select provider"
                    clearable
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* CP Access Section */}
            <Box>
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <Text size="md" fw={600} c="blue">
                    CP Access
                  </Text>
                  <Badge size="sm" variant="light">
                    {Object.values(menuAccess).filter(Boolean).length} selected
                  </Badge>
                </Group>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                </Group>
              </Group>

              <Paper p="md" withBorder radius="md" bg="gray.0">
                <Grid>
                  {menuNav.map((menu, index) => {
                    const isHidden = hiddenMenus[index] === true;
                    if (isHidden) return null;

                    return (
                      <Grid.Col key={menu.menuid} span={{ base: 12, sm: 6, md: 4 }}>
                        <Checkbox
                          label={menu.menu}
                          checked={menuAccess[menu.menuid] || false}
                          onChange={(e) =>
                            handleMenuCheck(menu.menuid, e.target.checked)
                          }
                        />
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Paper>
            </Box>

            {/* Action Buttons */}
            <Group justify="flex-end" mt="md">
              <Button
                variant="default"
                onClick={handleCancel}
                leftSection={<IconX size={18} />}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                leftSection={<IconDeviceFloppy size={18} />}
                disabled={loading}
              >
                Save
              </Button>
            </Group>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
};

export default AccountForm;
