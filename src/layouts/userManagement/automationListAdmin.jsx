import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Group,
  Table,
  TextInput,
  LoadingOverlay,
  Stack,
  Text,
  Paper,
  ScrollArea,
  Badge,
  Card,
  Pagination,
  Select,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconRefresh,
  IconSearch,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { showNotification } from '../../helper/showNotification';
import { automationAPI } from '../../helper/api';

const AutomationListAdmin = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    mainUser: '',
    bankCode: '',
    operationHour: '',
    username: '',
    phonenumber: '',
    appiumStatus: '',
    automationAgent: '',
    otpStatus: '',
    isOnline: '',
    pin: '',
    serialNumber: '',
    serverName: '',
  });

  // Filter data based on column filters
  const filteredData = data.filter((item) => {
    const mainUserMatch =
      !columnFilters.mainUser ||
      item.mainUser
        ?.toLowerCase()
        .includes(columnFilters.mainUser.toLowerCase());

    const bankCodeMatch =
      !columnFilters.bankCode || item.bankCode === columnFilters.bankCode;

    const operationHourMatch =
      !columnFilters.operationHour ||
      item.opentype
        ?.toLowerCase()
        .includes(columnFilters.operationHour.toLowerCase());

    const usernameMatch =
      !columnFilters.username ||
      item.username
        ?.toLowerCase()
        .includes(columnFilters.username.toLowerCase());

    const phonenumberMatch =
      !columnFilters.phonenumber ||
      item.phonenumber
        ?.toLowerCase()
        .includes(columnFilters.phonenumber.toLowerCase());

    const appiumStatusMatch =
      !columnFilters.appiumStatus ||
      item.useappium === columnFilters.appiumStatus;

    const automationAgentMatch =
      !columnFilters.automationAgent ||
      item.AutomationStatus === columnFilters.automationAgent;

    const otpStatusMatch =
      !columnFilters.otpStatus ||
      item.statusDesOtpSender === columnFilters.otpStatus;

    const isOnlineMatch =
      !columnFilters.isOnline || item.isOnline === columnFilters.isOnline;

    const pinMatch =
      !columnFilters.pin ||
      item.pin?.toLowerCase().includes(columnFilters.pin.toLowerCase());

    const serialNumberMatch =
      !columnFilters.serialNumber ||
      item.serialNumber
        ?.toLowerCase()
        .includes(columnFilters.serialNumber.toLowerCase());

    const serverNameMatch =
      !columnFilters.serverName ||
      item.serverName
        ?.toLowerCase()
        .includes(columnFilters.serverName.toLowerCase());

    return (
      mainUserMatch &&
      bankCodeMatch &&
      operationHourMatch &&
      usernameMatch &&
      phonenumberMatch &&
      appiumStatusMatch &&
      automationAgentMatch &&
      otpStatusMatch &&
      isOnlineMatch &&
      pinMatch &&
      serialNumberMatch &&
      serverNameMatch
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  // Update column filter
  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setColumnFilters({
      mainUser: '',
      bankCode: '',
      operationHour: '',
      username: '',
      phonenumber: '',
      appiumStatus: '',
      automationAgent: '',
      otpStatus: '',
      isOnline: '',
      pin: '',
      serialNumber: '',
      serverName: '',
    });
  };

  const handleNew = () => {
    // Navigate to automation create form
    navigate('/automation-create-form');
  };

  const handleDelete = (username) => {
    modals.openConfirmModal({
      title: 'Delete Automation Account',
      children: (
        <Text size="sm">
          Are you sure you want to delete automation account{' '}
          <strong>{username}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await automationAPI.deleteAutomation(username);

          if (response.success) {
            showNotification({
              title: 'Success',
              message: 'Automation account deleted successfully',
              color: 'green',
            });
            await getListData(); // Refresh data
          } else {
            showNotification({
              title: 'Error',
              message: response.error || 'Failed to delete automation account',
              color: 'red',
            });
          }
        } catch (error) {
          showNotification({
            title: 'Error',
            message: 'Failed to delete automation account',
            color: 'red',
          });
          console.error('Error deleting automation account:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getListData = async () => {
    setLoading(true);
    try {
      const response = await automationAPI.getAutomationList();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load data',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to load data',
        color: 'red',
      });
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getListData();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'ONLINE') return 'green';
    if (status === 'OFFLINE') return 'red';
    return 'orange';
  };

  const getAutomationStatusColor = (status) => {
    if (status === 'YES') return 'green';
    if (status === 'NO') return 'red';
    if (status === 'ERROR OTP') return 'orange';
    return 'gray';
  };

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          fw={600}
          size="sm"
          c="blue"
        >
          {item.mainUser}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color="indigo"
          variant="light"
        >
          {item.bankCode}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.opentype}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.username}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.phonenumber}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={item.useappium === 'YES' ? 'green' : 'gray'}
          variant="dot"
        >
          {item.useappium}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getAutomationStatusColor(item.AutomationStatus)}
          variant="filled"
        >
          {item.AutomationStatus}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getStatusColor(item.statusDesOtpSender)}
          variant="filled"
        >
          {item.statusDesOtpSender}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getStatusColor(item.isOnline)}
          variant="filled"
        >
          {item.isOnline}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.pin || '-'}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.serialNumber}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.serverName}</Text>
      </Table.Td>
      <Table.Td>
        <Group
          gap="xs"
          wrap="nowrap"
        >
          <Tooltip label="Delete">
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => handleDelete(item.username)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

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
                Automation List Admin
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage automation accounts with full CRUD operations
              </Text>
            </Box>
          </Group>

          {/* Button Container */}
          <Group
            justify="space-between"
            wrap="wrap"
          >
            <Group>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={handleNew}
                variant="filled"
                color="blue"
                radius="md"
              >
                Add New
              </Button>
              <Button
                leftSection={<IconRefresh size={18} />}
                onClick={getListData}
                variant="light"
                color="gray"
                radius="md"
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                leftSection={<IconSearch size={18} />}
                onClick={handleClearFilters}
                variant="light"
                color="red"
                radius="md"
              >
                Clear All Filters
              </Button>
            </Group>

            <Badge
              size="lg"
              variant="light"
              color="blue"
            >
              {filteredData.length} of {data.length} records
            </Badge>
          </Group>

          {/* Table */}
          <Box
            pos="relative"
            style={{ minHeight: 400 }}
          >
            <LoadingOverlay
              visible={loading}
              overlayProps={{ radius: 'md', blur: 2 }}
              loaderProps={{ color: 'blue', type: 'dots' }}
            />

            <ScrollArea
              type="auto"
              scrollbarSize={10}
              scrollHideDelay={500}
              styles={{
                scrollbar: {
                  '&[data-orientation="horizontal"]': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                  },
                  '&[data-orientation="horizontal"] .mantine-ScrollArea-thumb':
                    {
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      },
                    },
                },
              }}
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 1900,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
                styles={{
                  th: {
                    backgroundColor: '#f8f9fa',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#0f1012ff',
                    whiteSpace: 'nowrap',
                    padding: '12px 16px',
                  },
                  td: {
                    padding: '10px 16px',
                    fontSize: '14px',
                  },
                }}
              >
                <Table.Thead>
                  {/* Header Row */}
                  <Table.Tr>
                    <Table.Th style={{ minWidth: 140 }}>Main User</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Bank Code</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>
                      Operation Hour
                    </Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Username</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Phone Number</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Appium Status</Table.Th>
                    <Table.Th style={{ minWidth: 160 }}>
                      Automation Agent
                    </Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>OTP Status</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>
                      Status (Online/Offline)
                    </Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Pin</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Serial Number</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Server Name</Table.Th>
                    <Table.Th style={{ minWidth: 80 }}>Action</Table.Th>
                  </Table.Tr>

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.mainUser}
                        onChange={(e) =>
                          handleFilterChange('mainUser', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.bankCode}
                        onChange={(value) =>
                          handleFilterChange('bankCode', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'NAGAD', label: 'NAGAD' },
                          { value: 'BKASH', label: 'BKASH' },
                          { value: 'BKASHM', label: 'BKASHM' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.operationHour}
                        onChange={(e) =>
                          handleFilterChange(
                            'operationHour',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.username}
                        onChange={(e) =>
                          handleFilterChange('username', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.phonenumber}
                        onChange={(e) =>
                          handleFilterChange(
                            'phonenumber',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.appiumStatus}
                        onChange={(value) =>
                          handleFilterChange('appiumStatus', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'YES', label: 'YES' },
                          { value: 'NO', label: 'NO' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.automationAgent}
                        onChange={(value) =>
                          handleFilterChange('automationAgent', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'YES', label: 'YES' },
                          { value: 'NO', label: 'NO' },
                          { value: 'ERROR OTP', label: 'ERROR OTP' },
                          { value: 'INACTIVE', label: 'INACTIVE' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.otpStatus}
                        onChange={(value) =>
                          handleFilterChange('otpStatus', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'ONLINE', label: 'ONLINE' },
                          { value: 'OFFLINE', label: 'OFFLINE' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <Select
                        placeholder="All"
                        size="xs"
                        value={columnFilters.isOnline}
                        onChange={(value) =>
                          handleFilterChange('isOnline', value || '')
                        }
                        data={[
                          { value: '', label: 'All' },
                          { value: 'ONLINE', label: 'ONLINE' },
                          { value: 'OFFLINE', label: 'OFFLINE' },
                        ]}
                        clearable
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.pin}
                        onChange={(e) =>
                          handleFilterChange('pin', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.serialNumber}
                        onChange={(e) =>
                          handleFilterChange(
                            'serialNumber',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.serverName}
                        onChange={(e) =>
                          handleFilterChange(
                            'serverName',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      {/* No filter for Action column */}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={13}>
                        <Stack
                          align="center"
                          gap="xs"
                          py="xl"
                        >
                          <Text
                            size="lg"
                            fw={500}
                          >
                            No Data Available
                          </Text>
                          <Text
                            size="sm"
                            c="dimmed"
                          >
                            {Object.values(columnFilters).some(
                              (val) => val !== ''
                            )
                              ? 'Try adjusting your filters'
                              : 'Click "Add New" to create an automation account'}
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {/* Footer with Pagination */}
            <Paper
              p="md"
              mt="md"
              withBorder
              radius="md"
              bg="gray.0"
            >
              <Group
                justify="space-between"
                wrap="wrap"
              >
                <Group gap="md">
                  <Text
                    size="sm"
                    c="dimmed"
                    fw={500}
                  >
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredData.length)} of{' '}
                    {filteredData.length}{' '}
                    {filteredData.length === 1 ? 'record' : 'records'}
                    {Object.values(columnFilters).some((val) => val !== '') &&
                      ` (filtered from ${data.length} total)`}
                  </Text>
                  <Group
                    gap="xs"
                    align="center"
                  >
                    <Text
                      size="sm"
                      c="dimmed"
                    >
                      Per page:
                    </Text>
                    <Select
                      size="xs"
                      value={String(itemsPerPage)}
                      onChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                      data={[
                        { value: '10', label: '10' },
                        { value: '25', label: '25' },
                        { value: '50', label: '50' },
                        { value: '100', label: '100' },
                      ]}
                      style={{ width: 70 }}
                    />
                  </Group>
                </Group>

                {totalPages > 1 && (
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                    size="sm"
                    radius="md"
                    withEdges
                  />
                )}
              </Group>
            </Paper>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default AutomationListAdmin;
