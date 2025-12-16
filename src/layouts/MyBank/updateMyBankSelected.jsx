import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconArrowRight,
  IconArrowUp,
  IconClock,
  IconEdit,
  IconEye,
  IconKey,
  IconRefresh,
  IconUsers,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { myBankAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const updateOptions = [
  { value: 'active', label: 'Set active' },
  { value: 'inactive', label: 'Set inactive' },
  { value: 'deposit', label: 'Set deposit only' },
  { value: 'withdraw', label: 'Set withdraw only' },
  { value: 'withdraw and deposit', label: 'Set withdraw and deposit' },
];

const operationOptions = [
  { value: 'P', label: 'Pending' },
  { value: '16', label: '16 Hour' },
  { value: '24CI', label: '24 Hour CI' },
  { value: '24CO', label: '24 Hour CO' },
];

const automationOptions = [
  { value: '0', label: 'No' },
  { value: '1', label: 'Yes' },
  { value: '2', label: 'OTP Error' },
  { value: 'N', label: 'Inactive' },
];

const defaultFilters = {
  group: '',
  upline: '',
  issue: '',
  remark: '',
  alias: '',
  bankAccNo: '',
  bankCode: '',
  type: '',
  active: '',
  opentype: '',
  automationStatus: '',
};

const UpdateMyBankSelected = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [updateValue, setUpdateValue] = useState(updateOptions[0].value);
  const [operationValue, setOperationValue] = useState(
    operationOptions[0].value
  );
  const [automationValue, setAutomationValue] = useState(
    automationOptions[0].value
  );
  const [submitting, setSubmitting] = useState(false);

  const [lastModalOpened, setLastModalOpened] = useState(false);
  const [lastTrxLoading, setLastTrxLoading] = useState(false);
  const [lastTrxInfo, setLastTrxInfo] = useState({
    bankAccNo: '',
    bankCode: '',
    bankAccName: '',
  });
  const [lastTrxRecords, setLastTrxRecords] = useState([]);

  const makeKey = (item) => `${item.bankAccNo || ''}-${item.bankCode || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        const automationStatus =
          item.automationStatus ?? item.AutomationStatus ?? '';
        return (
          includesValue(item.group, columnFilters.group) &&
          includesValue(item.upline, columnFilters.upline) &&
          includesValue(item.issue, columnFilters.issue) &&
          includesValue(item.remark, columnFilters.remark) &&
          includesValue(item.alias, columnFilters.alias) &&
          includesValue(item.bankAccNo, columnFilters.bankAccNo) &&
          includesValue(item.bankCode, columnFilters.bankCode) &&
          includesValue(item.type, columnFilters.type) &&
          includesValue(
            item.opentype ?? item.openType,
            columnFilters.opentype
          ) &&
          includesValue(automationStatus, columnFilters.automationStatus) &&
          includesValue(item.active, columnFilters.active)
        );
      }),
    [data, columnFilters]
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const selectedRecords = useMemo(
    () => data.filter((item) => selectedKeys.includes(makeKey(item))),
    [data, selectedKeys]
  );

  const pageKeys = paginatedData.map((item) => makeKey(item));
  const pageFullySelected =
    pageKeys.length > 0 && pageKeys.every((key) => selectedKeys.includes(key));
  const pagePartiallySelected =
    pageKeys.some((key) => selectedKeys.includes(key)) && !pageFullySelected;

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await myBankAPI.getMasterMyBank();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          setData(response.data.records || []);
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
      console.error('Error fetching mybank:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const handleClearFilters = () => {
    setColumnFilters(defaultFilters);
  };

  const toggleRow = (item) => {
    const key = makeKey(item);
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key]
    );
  };

  const toggleAllOnPage = () => {
    if (pageFullySelected) {
      setSelectedKeys((current) =>
        current.filter((key) => !pageKeys.includes(key))
      );
    } else {
      setSelectedKeys((current) => [
        ...current,
        ...pageKeys.filter((key) => !current.includes(key)),
      ]);
    }
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return value;
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
      numberValue
    );
  };

  const handleEdit = (record) => {
    navigate('/master-mybank-form-selected', {
      state: {
        data: {
          bankAccNo: record.bankAccNo,
          bankCode: record.bankCode,
          type: record.type,
          active: record.active,
          dailylimit: record.dailylimit,
          dailywithdrawallimit: record.dailywithdrawallimit,
          dailydepositlimit: record.dailydepositlimit,
          opentype: record.opentype ?? record.openType,
          automationStatus: record.automationStatus ?? record.AutomationStatus,
        },
      },
    });
  };

  const handleLastTransaction = async (record) => {
    setLastModalOpened(true);
    setLastTrxInfo({
      bankAccNo: record.bankAccNo,
      bankCode: record.bankCode,
      bankAccName: record.bankAccName,
    });
    setLastTrxRecords([]);
    setLastTrxLoading(true);

    try {
      const response = await myBankAPI.getLastTransaction(
        record.bankAccNo,
        record.bankCode
      );

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          setLastTrxRecords(response.data.records || []);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Gagal memuat transaksi terakhir',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Gagal memuat transaksi terakhir',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Get last transaction error:', error);
      showNotification({
        title: 'Error',
        message: 'Gagal memuat transaksi terakhir',
        color: 'red',
      });
    } finally {
      setLastTrxLoading(false);
    }
  };

  const handleSubmitUpdate = async () => {
    if (selectedRecords.length === 0) {
      showNotification({
        title: 'Warning',
        message: 'Pilih minimal satu akun',
        color: 'yellow',
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to set ${updateValue} selected items?`
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const items = selectedRecords.map((item) => ({
        account: item.bankAccNo,
        bank: item.bankCode,
      }));

      const response = await myBankAPI.updateStatusSelected({
        button: updateValue,
        items,
      });

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Status updated',
            color: 'green',
          });
          loadData();
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to update status',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update status',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Update status selected error:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to update status',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOperation = async () => {
    if (selectedRecords.length === 0) {
      showNotification({
        title: 'Warning',
        message: 'Pilih minimal satu akun',
        color: 'yellow',
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to set Operation Hour (${operationValue}) selected items?`
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const items = selectedRecords.map((item) => ({
        account: item.bankAccNo,
        bank: item.bankCode,
      }));

      const response = await myBankAPI.updateStatusSelected({
        button: 'operation',
        value: operationValue,
        items,
      });

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Operation updated',
            color: 'green',
          });
          loadData();
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to update operation',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update operation',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Update operation selected error:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to update operation',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAutomation = async () => {
    if (selectedRecords.length === 0) {
      showNotification({
        title: 'Warning',
        message: 'Pilih minimal satu akun',
        color: 'yellow',
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to set Automation Status (${automationValue}) selected items?`
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const items = selectedRecords.map((item) => ({
        account: item.bankAccNo,
        bank: item.bankCode,
      }));

      const response = await myBankAPI.updateStatusSelected({
        button: 'automation',
        value: automationValue,
        items,
      });

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Automation updated',
            color: 'green',
          });
          loadData();
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to update automation',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update automation',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Update automation selected error:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to update automation',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGroupAction = async (type) => {
    if (selectedRecords.length === 0) {
      showNotification({
        title: 'Info',
        message: 'Pilih minimal satu akun',
        color: 'blue',
      });
      return;
    }

    const label =
      type === 'group'
        ? 'Group name'
        : type === 'upline'
          ? 'Upline'
          : type === 'issue'
            ? 'Issue'
            : 'Remark';
    const value = window.prompt(label);
    if (!value) return;

    const items = selectedRecords.map((item) => ({
      account: item.bankAccNo,
      bank: item.bankCode,
    }));

    let response;
    try {
      if (type === 'group') {
        response = await myBankAPI.groupAccounts(value, items);
      } else if (type === 'upline') {
        response = await myBankAPI.setUpline(value, items);
      } else if (type === 'issue') {
        response = await myBankAPI.setIssue(value, items);
      } else {
        response = await myBankAPI.setRemark(value, items);
      }

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Berhasil disimpan',
            color: 'green',
          });
          loadData();
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Gagal memproses',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Gagal memproses',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Group action error:', error);
      showNotification({
        title: 'Error',
        message: 'Gagal memproses',
        color: 'red',
      });
    }
  };

  const automationLabel = (item) =>
    item.automationStatus ?? item.AutomationStatus ?? '-';
  return (
    <Box p="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
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
                Update MyBank Selected
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Set status dan grouping untuk akun MyBank terpilih
              </Text>
            </Box>
          </Group>

          <Group
            gap="xs"
            wrap="wrap"
            align="flex-end"
          >
            <Select
              label="Set Status"
              data={updateOptions}
              value={updateValue}
              onChange={(val) => setUpdateValue(val || updateOptions[0].value)}
              style={{ minWidth: 200 }}
            />
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={handleSubmitUpdate}
              loading={submitting}
            >
              Set
            </Button>
            <Select
              label="Operation"
              data={operationOptions}
              value={operationValue}
              onChange={(val) =>
                setOperationValue(val || operationOptions[0].value)
              }
              style={{ minWidth: 160 }}
            />
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={handleSubmitOperation}
              loading={submitting}
            >
              Set
            </Button>
            <Select
              label="Automation"
              data={automationOptions}
              value={automationValue}
              onChange={(val) =>
                setAutomationValue(val || automationOptions[0].value)
              }
              style={{ minWidth: 160 }}
            />
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={handleSubmitAutomation}
              loading={submitting}
            >
              Set
            </Button>
            <Button
              variant="light"
              color="gray"
              size="sm"
              leftSection={<IconRefresh size={16} />}
              onClick={loadData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="light"
              color="red"
              size="sm"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
            <Button
              variant="light"
              color="indigo"
              size="sm"
              leftSection={<IconUsers size={16} />}
              onClick={() => handleGroupAction('group')}
            >
              Group
            </Button>
            <Button
              variant="light"
              color="teal"
              size="sm"
              leftSection={<IconArrowUp size={16} />}
              onClick={() => handleGroupAction('upline')}
            >
              Upline
            </Button>
            <Button
              variant="light"
              color="red"
              size="sm"
              leftSection={<IconAlertTriangle size={16} />}
              onClick={() => handleGroupAction('issue')}
            >
              Issue
            </Button>
            <Button
              variant="light"
              color="yellow"
              size="sm"
              onClick={() => handleGroupAction('remark')}
            >
              Remark
            </Button>
          </Group>

          <Box
            pos="relative"
            style={{ minHeight: 420 }}
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
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 1400,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
                styles={{
                  th: {
                    backgroundColor: '#f8f9fa',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#0f1011ff',
                    whiteSpace: 'nowrap',
                    padding: '12px 16px',
                  },
                  td: {
                    padding: '10px 16px',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 48 }}>
                      <Checkbox
                        checked={pageFullySelected}
                        indeterminate={pagePartiallySelected}
                        onChange={toggleAllOnPage}
                        aria-label="Select all rows"
                      />
                    </Table.Th>
                    <Table.Th style={{ minWidth: 110 }}>Group</Table.Th>
                    <Table.Th style={{ minWidth: 110 }}>Upline</Table.Th>
                    <Table.Th style={{ minWidth: 110 }}>Issue</Table.Th>
                    <Table.Th style={{ minWidth: 160 }}>Remark</Table.Th>
                    <Table.Th style={{ minWidth: 160 }}>Alias</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Account No</Table.Th>
                    <Table.Th style={{ minWidth: 110 }}>Bank</Table.Th>
                    <Table.Th style={{ minWidth: 90 }}>Type</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Active</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Open Type</Table.Th>
                    <Table.Th style={{ minWidth: 160 }}>
                      Automation Status
                    </Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>
                      Agent Commission
                    </Table.Th>
                    <Table.Th style={{ minWidth: 130 }}>Date Insert</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Last Balance</Table.Th>
                    <Table.Th style={{ minWidth: 220 }}>Action</Table.Th>
                  </Table.Tr>

                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th>
                      <Checkbox
                        checked={pageFullySelected}
                        indeterminate={pagePartiallySelected}
                        onChange={toggleAllOnPage}
                        aria-label="Select all rows"
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter group..."
                        size="xs"
                        value={columnFilters.group}
                        onChange={(e) =>
                          handleFilterChange('group', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter upline..."
                        size="xs"
                        value={columnFilters.upline}
                        onChange={(e) =>
                          handleFilterChange('upline', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter issue..."
                        size="xs"
                        value={columnFilters.issue}
                        onChange={(e) =>
                          handleFilterChange('issue', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter remark..."
                        size="xs"
                        value={columnFilters.remark}
                        onChange={(e) =>
                          handleFilterChange('remark', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter alias..."
                        size="xs"
                        value={columnFilters.alias}
                        onChange={(e) =>
                          handleFilterChange('alias', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter account..."
                        size="xs"
                        value={columnFilters.bankAccNo}
                        onChange={(e) =>
                          handleFilterChange('bankAccNo', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter bank..."
                        size="xs"
                        value={columnFilters.bankCode}
                        onChange={(e) =>
                          handleFilterChange('bankCode', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter type..."
                        size="xs"
                        value={columnFilters.type}
                        onChange={(e) =>
                          handleFilterChange('type', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <Select
                        placeholder="All"
                        size="xs"
                        data={[
                          { value: '', label: 'All' },
                          { value: 'Y', label: 'Active' },
                          { value: 'N', label: 'Inactive' },
                        ]}
                        value={columnFilters.active}
                        onChange={(value) =>
                          handleFilterChange('active', value || '')
                        }
                        clearable
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter open type..."
                        size="xs"
                        value={columnFilters.opentype}
                        onChange={(e) =>
                          handleFilterChange('opentype', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter automation..."
                        size="xs"
                        value={columnFilters.automationStatus}
                        onChange={(e) =>
                          handleFilterChange(
                            'automationStatus',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th />
                    <Table.Th />
                    <Table.Th />
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => {
                      const key = makeKey(item);
                      const selected = selectedKeys.includes(key);
                      const automation = automationLabel(item);
                      return (
                        <Table.Tr
                          key={key}
                          bg={selected ? 'rgba(34, 139, 230, 0.06)' : undefined}
                        >
                          <Table.Td>
                            <Checkbox
                              checked={selected}
                              onChange={() => toggleRow(item)}
                              aria-label="Select row"
                            />
                          </Table.Td>
                          <Table.Td>
                            <Text
                              fw={600}
                              size="sm"
                            >
                              {item.group || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.upline || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.issue || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.remark || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.alias || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text
                              fw={600}
                              size="sm"
                              c="blue"
                            >
                              {item.bankAccNo}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color="blue"
                              variant="light"
                            >
                              {item.bankCode}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color="gray"
                              variant="outline"
                            >
                              {item.type}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={item.active === 'Y' ? 'green' : 'red'}
                              variant="light"
                            >
                              {item.active === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color="teal"
                              variant="outline"
                            >
                              {item.opentype ?? item.openType ?? '-'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={automation ? 'indigo' : 'gray'}
                              variant="light"
                            >
                              {automation || '-'}
                            </Badge>
                          </Table.Td>
                          <Table.Td className="grid-alignright">
                            <Text size="sm">
                              {formatNumber(item.agentCommission)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.insert || '-'}</Text>
                          </Table.Td>
                          <Table.Td className="grid-alignright">
                            <Text size="sm">
                              {formatNumber(item.lastBalance)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group
                              gap="xs"
                              wrap="nowrap"
                            >
                              <Button
                                variant="light"
                                color="blue"
                                size="xs"
                                leftSection={<IconEdit size={16} />}
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="light"
                                color="orange"
                                size="xs"
                                leftSection={<IconClock size={16} />}
                                onClick={() => handleLastTransaction(item)}
                              >
                                Last TRX
                              </Button>
                              <Button
                                variant="light"
                                color="grape"
                                size="xs"
                                leftSection={<IconArrowRight size={16} />}
                                onClick={() =>
                                  navigate('/transaction-account-by-company', {
                                    state: {
                                      data: { accountno: item.bankAccNo },
                                    },
                                  })
                                }
                              >
                                More
                              </Button>
                              <Button
                                variant="light"
                                color="teal"
                                size="xs"
                                leftSection={<IconEye size={16} />}
                                onClick={() =>
                                  navigate('/list-merchant-group', {
                                    state: {
                                      data: {
                                        bankAccNo: item.bankAccNo,
                                        bankAccName: item.bankAccName,
                                      },
                                    },
                                  })
                                }
                              >
                                Show
                              </Button>
                              <Button
                                variant="light"
                                color="gray"
                                size="xs"
                                leftSection={<IconKey size={16} />}
                                onClick={() =>
                                  navigate('/secret-page', {
                                    state: {
                                      data: {
                                        bankAccNo: item.bankAccNo,
                                        bankAccName: item.bankAccName,
                                        bankCode: item.bankCode,
                                      },
                                    },
                                  })
                                }
                              >
                                Secret
                              </Button>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={16}>
                        <Stack
                          align="center"
                          py="xl"
                          gap="xs"
                        >
                          <Text
                            size="lg"
                            c="dimmed"
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
                              ? 'Coba sesuaikan filter pencarian'
                              : 'Klik Refresh untuk memuat data terbaru'}
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            {filteredData.length > 0 && (
              <Stack
                gap="md"
                mt="md"
                pt="md"
                style={{ borderTop: '1px solid #dee2e6' }}
              >
                <Group
                  justify="space-between"
                  align="center"
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
                      {filteredData.length} records
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
                        Rows per page:
                      </Text>
                      <Select
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
                        style={{ width: 90 }}
                        size="sm"
                      />
                    </Group>
                  </Group>

                  <Group gap="sm">
                    <Pagination
                      total={totalPages}
                      value={currentPage}
                      onChange={setCurrentPage}
                      size="sm"
                      radius="md"
                      withEdges
                    />
                  </Group>
                </Group>
              </Stack>
            )}
          </Box>
        </Stack>
      </Card>

      <Modal
        opened={lastModalOpened}
        onClose={() => setLastModalOpened(false)}
        title="Last Transaction"
        size="xl"
        radius="md"
      >
        <Stack gap="md">
          <Group
            justify="space-between"
            align="center"
          >
            <Stack gap={2}>
              <Text fw={600}>{lastTrxInfo.bankAccName || '-'}</Text>
              <Text
                size="sm"
                c="dimmed"
              >
                {lastTrxInfo.bankCode} - {lastTrxInfo.bankAccNo}
              </Text>
            </Stack>
            <Button
              variant="light"
              size="xs"
              onClick={() =>
                handleLastTransaction({
                  bankAccNo: lastTrxInfo.bankAccNo,
                  bankCode: lastTrxInfo.bankCode,
                  bankAccName: lastTrxInfo.bankAccName,
                })
              }
              leftSection={<IconRefresh size={16} />}
            >
              Refresh
            </Button>
          </Group>

          <Box pos="relative">
            <LoadingOverlay
              visible={lastTrxLoading}
              overlayProps={{ radius: 'md', blur: 2 }}
              loaderProps={{ color: 'blue', type: 'dots' }}
            />
            <ScrollArea
              type="auto"
              h={360}
            >
              <Table
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="sm"
                verticalSpacing="xs"
                styles={{
                  th: { backgroundColor: '#f8f9fa', fontWeight: 600 },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>FutureId</Table.Th>
                    <Table.Th>Insert</Table.Th>
                    <Table.Th>MerchantCode</Table.Th>
                    <Table.Th>CustomerCode</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Fee</Table.Th>
                    <Table.Th>Account Src</Table.Th>
                    <Table.Th>Account Dst</Table.Th>
                    <Table.Th>TransactionID</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {lastTrxRecords.length > 0 ? (
                    lastTrxRecords.map((trx, idx) => (
                      <Table.Tr key={idx}>
                        <Table.Td>{trx.futuretrxid}</Table.Td>
                        <Table.Td>{trx.timestamp}</Table.Td>
                        <Table.Td>{trx.merchantcode}</Table.Td>
                        <Table.Td>{trx.customercode}</Table.Td>
                        <Table.Td>{trx.transactiontype}</Table.Td>
                        <Table.Td>{formatNumber(trx.amount)}</Table.Td>
                        <Table.Td>{formatNumber(trx.Fee)}</Table.Td>
                        <Table.Td>{trx.accountno}</Table.Td>
                        <Table.Td>{trx.accountdst}</Table.Td>
                        <Table.Td>{trx.transactionid}</Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={10}>
                        <Text
                          ta="center"
                          c="dimmed"
                        >
                          Tidak ada transaksi terakhir
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>
        </Stack>
      </Modal>
    </Box>
  );
};

export default UpdateMyBankSelected;
