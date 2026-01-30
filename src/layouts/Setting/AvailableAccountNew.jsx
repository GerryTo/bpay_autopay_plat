import { useCallback, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
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
import { IconAdjustments, IconFilter, IconRefresh, IconRepeat, IconSend } from '@tabler/icons-react';
import { availableAccountNewAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  bankcode: '',
  bankaccountno: '',
  active: '',
  type: '',
  group: '',
  merchant: '',
  user: '',
  useCredit: '',
  credit: '',
  runningCredit: '',
};

const groupOptions = [
  { value: '1', label: 'Group 1' },
  { value: '2', label: 'Group 2' },
  { value: '3', label: 'Group 3' },
  { value: '4', label: 'Group 4' },
];

const formatNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value ?? '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const AvailableAccountNew = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [bulkGroup, setBulkGroup] = useState('1');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editGroupValue, setEditGroupValue] = useState('1');
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFilterChange = useCallback((key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const makeKey = (item) =>
    item._rowKey || `${item.v_bankcode || 'bank'}-${item.v_bankaccountno || 'acct'}-${item.v_user || 'user'}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.v_bankcode, columnFilters.bankcode) &&
          includesValue(item.v_bankaccountno, columnFilters.bankaccountno) &&
          includesValue(item.v_isactive, columnFilters.active) &&
          includesValue(item.v_type, columnFilters.type) &&
          includesValue(item.n_groupid, columnFilters.group) &&
          includesValue(item.v_merchantcode, columnFilters.merchant) &&
          includesValue(item.v_user, columnFilters.user) &&
          includesValue(item.n_isusecredit, columnFilters.useCredit) &&
          includesValue(item.n_credit, columnFilters.credit) &&
          includesValue(item.n_running_credit, columnFilters.runningCredit)
        );
      }),
    [data, columnFilters]
  );

  const columns = useMemo(
    () => [
      {
        key: 'bankcode',
        label: 'Bank Code',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.v_bankcode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bankcode}
            onChange={(e) => handleFilterChange('bankcode', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'bankaccountno',
        label: 'Account No',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.v_bankaccountno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter account..."
            size="xs"
            value={columnFilters.bankaccountno}
            onChange={(e) => handleFilterChange('bankaccountno', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'active',
        label: 'Active',
        minWidth: 110,
        render: (item) => (
          <Badge
            variant="light"
            color={(item.v_isactive || '').toString().toLowerCase() === 'y' ? 'green' : 'gray'}
          >
            {item.v_isactive || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter active..."
            size="xs"
            value={columnFilters.active}
            onChange={(e) => handleFilterChange('active', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'type',
        label: 'Type',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.v_type || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter type..."
            size="xs"
            value={columnFilters.type}
            onChange={(e) => handleFilterChange('type', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'group',
        label: 'Group',
        minWidth: 100,
        render: (item) => <Text size="sm">{item.n_groupid ?? '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter group..."
            size="xs"
            value={columnFilters.group}
            onChange={(e) => handleFilterChange('group', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'merchant',
        label: 'Merchant Code',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.v_merchantcode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter merchant..."
            size="xs"
            value={columnFilters.merchant}
            onChange={(e) => handleFilterChange('merchant', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'user',
        label: 'User',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.v_user || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter user..."
            size="xs"
            value={columnFilters.user}
            onChange={(e) => handleFilterChange('user', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'useCredit',
        label: 'Use Credit',
        minWidth: 110,
        render: (item) => (
          <Badge
            variant="light"
            color={Number(item.n_isusecredit) === 1 ? 'green' : 'gray'}
          >
            {Number(item.n_isusecredit) === 1 ? 'Yes' : 'No'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter use credit..."
            size="xs"
            value={columnFilters.useCredit}
            onChange={(e) => handleFilterChange('useCredit', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'credit',
        label: 'Credit',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_credit)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter credit..."
            size="xs"
            value={columnFilters.credit}
            onChange={(e) => handleFilterChange('credit', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'runningCredit',
        label: 'Running Credit',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.n_running_credit)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter running credit..."
            size="xs"
            value={columnFilters.runningCredit}
            onChange={(e) => handleFilterChange('runningCredit', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 140,
        render: (item) => (
          <Button
            size="xs"
            variant="light"
            color="blue"
            leftSection={<IconAdjustments size={14} />}
            onClick={() => {
              setEditRow(item);
              setEditGroupValue(String(item.n_groupid ?? '1'));
              setEditModalOpen(true);
            }}
          >
            Edit Group
          </Button>
        ),
      },
    ],
    [columnFilters, handleFilterChange]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } = useTableControls(
    columns,
    {
      onResetFilters: () => setColumnFilters(defaultFilters),
      onResetSelection: () => setSelectedKeys([]),
    }
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const dir = direction === 'desc' ? -1 : 1;
    return [...filteredData].sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  

  

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      silent ? setRefreshing(true) : setLoading(true);
      try {
        const response = await availableAccountNewAPI.getList();
        if (response.success && response.data) {
          const payload = response.data;
          const status = (payload.status || '').toLowerCase();
          if (!payload.status || status === 'success' || status === 'ok') {
            const records = Array.isArray(payload.records) ? payload.records : [];
            const withKeys = records.map((item, idx) => ({
              ...item,
              _rowKey: `${item.v_bankcode || 'bank'}-${item.v_bankaccountno || 'acct'}-${item.v_user || 'user'}-${idx}`,
            }));
            setData(withKeys);
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load available accounts',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load available accounts',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Available account new fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load available accounts',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  

  const toggleRow = (item) => {
    const key = makeKey(item);
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : current.length >= 50
          ? current
          : [...current, key]
    );
  };

  const toggleAllOnPage = () => {
    const pageKeys = paginatedData.map((item) => makeKey(item));
    const pageFullySelected = pageKeys.every((key) => selectedKeys.includes(key));
    if (pageFullySelected) {
      setSelectedKeys((current) => current.filter((key) => !pageKeys.includes(key)));
    } else {
      setSelectedKeys((current) => {
        const newKeys = pageKeys.filter((key) => !current.includes(key));
        const allowed = Math.max(0, 50 - current.length);
        return [...current, ...newKeys.slice(0, allowed)];
      });
    }
  };

  const selectedItems = useMemo(
    () => data.filter((item) => selectedKeys.includes(makeKey(item))),
    [data, selectedKeys]
  );

  const handleSubmitBulk = async () => {
    if (selectedItems.length === 0) {
      showNotification({
        title: 'Info',
        message: 'Select at least one account',
        color: 'blue',
      });
      return;
    }

    setSaving(true);
    try {
      const payload = { group: bulkGroup, list: selectedItems };
      const response = await availableAccountNewAPI.updateSelected(payload);
      if (response.success && response.data) {
        const status = (response.data.status || '').toLowerCase();
        const message = response.data.message || 'Update submitted';
        showNotification({
          title: status === 'ok' ? 'Success' : 'Info',
          message,
          color: status === 'ok' ? 'green' : 'blue',
        });
        if (status === 'ok') {
          setSelectedKeys([]);
          fetchList({ silent: true });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update selected accounts',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update selected accounts',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRerun = async () => {
    const confirmed = window.confirm('Re-run available account new process?');
    if (!confirmed) return;
    setSaving(true);
    try {
      const response = await availableAccountNewAPI.rerun();
      const payload = response.data || {};
      const status = (payload.status || '').toLowerCase();
      showNotification({
        title: status === 'ok' ? 'Success' : 'Info',
        message: payload.message || 'Re-run submitted',
        color: status === 'ok' ? 'green' : 'blue',
      });
      fetchList({ silent: true });
    } catch (error) {
      console.error('Rerun error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to rerun process',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const payload = {
        groupid: editGroupValue,
        bankCode: editRow.v_bankcode,
        merchant: editRow.v_merchantcode,
        user: editRow.v_user,
      };
      const response = await availableAccountNewAPI.updateSingleGroup(payload);
      if (response.success && response.data) {
        const status = (response.data.status || '').toLowerCase();
        const message = response.data.message || 'Update success';
        showNotification({
          title: status === 'ok' ? 'Success' : 'Info',
          message,
          color: status === 'ok' ? 'green' : 'blue',
        });
        if (status === 'ok') {
          setEditModalOpen(false);
          fetchList({ silent: true });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update group',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Single edit error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update group',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const totalSelectedOnPage = paginatedData.filter((item) => selectedKeys.includes(makeKey(item))).length;
  const pageKeys = paginatedData.map((item) => makeKey(item));
  const pageFullySelected = pageKeys.length > 0 && pageKeys.every((key) => selectedKeys.includes(key));
  const pagePartiallySelected =
    pageKeys.some((key) => selectedKeys.includes(key)) && !pageFullySelected;

  return (
    <Box p="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        <LoadingOverlay
          visible={loading}
          overlayProps={{ radius: 'md', blur: 2 }}
          loaderProps={{ color: 'blue', type: 'dots' }}
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
              >
                Available Account New Deposit
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage available accounts and group assignments.
              </Text>
            </Box>

            <Group gap="xs">
              <Button
                leftSection={<IconSend size={18} />}
                color="blue"
                radius="md"
                onClick={handleSubmitBulk}
                loading={saving}
              >
                Submit Selection
              </Button>
              <Button
                leftSection={<IconRepeat size={18} />}
                variant="light"
                color="orange"
                radius="md"
                onClick={handleRerun}
                loading={saving}
              >
                Re-Run
              </Button>
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing}
                onClick={() => fetchList({ silent: true })}
              >
                Refresh
              </Button>
              <Button
                variant="light"
                color="gray"
                radius="md"
                size="sm"
                leftSection={<IconFilter size={18} />}
                onClick={() => {
                  setSelectedKeys([]);
                  setColumnFilters(defaultFilters);
                  setCurrentPage(1);
                  handleResetAll();
                }}
              >
                Reset
              </Button>
            </Group>
          </Group>

          <Card
            withBorder
            radius="md"
            padding="md"
            shadow="xs"
          >
            <Stack gap="md">
              <Group
                gap="md"
                wrap="wrap"
                align="flex-end"
              >
                <Select
                  label="Update to Group"
                  data={groupOptions}
                  value={bulkGroup}
                  onChange={(value) => setBulkGroup(value || '1')}
                  style={{ minWidth: 160 }}
                />
                <Badge
                  variant="light"
                  color="blue"
                >
                  Selected: {selectedKeys.length} (max 50)
                </Badge>
                <Badge
                  variant="light"
                  color="gray"
                >
                  Rows: {data.length}
                </Badge>
              </Group>
            </Stack>
          </Card>

          <Box pos="relative">
            <ScrollArea
              type="auto"
              h="60vh"
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
                    <Table.Th w={50}>
                      <input
                        type="checkbox"
                        checked={pageFullySelected}
                        ref={(el) => {
                          if (el) el.indeterminate = pagePartiallySelected;
                        }}
                        onChange={toggleAllOnPage}
                      />
                    </Table.Th>
                    {visibleColumns.map((col) => (
                      <Table.Th
                        key={col.key}
                        style={{ minWidth: col.minWidth || 120 }}
                      >
                        <Group
                          gap={8}
                          align="center"
                        >
                          <Text
                            size="sm"
                            fw={600}
                          >
                            {col.label}
                          </Text>
                          <ColumnActionMenu
                            columnKey={col.key}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onHide={handleHideColumn}
                          />
                        </Group>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th w={50}>
                      <Badge
                        variant="light"
                        color="gray"
                      >
                        {totalSelectedOnPage}/{paginatedData.length}
                      </Badge>
                    </Table.Th>
                    {visibleColumns.map((col) => (
                      <Table.Th
                        key={`${col.key}-filter`}
                        style={{
                          minWidth: col.minWidth || 120,
                          padding: '8px',
                        }}
                      >
                        {col.filter || null}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, idx) => {
                      const key = makeKey(item);
                      return (
                        <Table.Tr key={key || `${idx}-row`}>
                          <Table.Td>
                            <input
                              type="checkbox"
                              checked={selectedKeys.includes(key)}
                              onChange={() => toggleRow(item)}
                            />
                          </Table.Td>
                          {visibleColumns.map((col) => (
                            <Table.Td key={col.key}>{col.render(item)}</Table.Td>
                          ))}
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={visibleColumns.length + 1}>
                        <Text
                          ta="center"
                          c="dimmed"
                        >
                          No data available
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
                <Table.Tfoot>
                  <Table.Tr>
                    <Table.Td colSpan={visibleColumns.length + 1}>
                      <Group
                        justify="space-between"
                        align="center"
                      >
                        <Text
                          size="sm"
                          fw={600}
                        >
                          Total rows: {filteredData.length}
                        </Text>
                        <Text
                          size="sm"
                          c="dimmed"
                        >
                          Totals stay in the footer.
                        </Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </ScrollArea>
          </Box>

          <Group
            justify="space-between"
            align="center"
          >
            <Group
              gap="sm"
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
              <Text
                size="sm"
                fw={600}
              >
                Rows: {paginatedData.length}
              </Text>
            </Group>

            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              size="sm"
              radius="md"
              withEdges
            />
          </Group>
        </Stack>
      </Card>

      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Group"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Change group for account{' '}
            <Text
              component="span"
              fw={600}
            >
              {editRow?.v_bankaccountno || '-'}
            </Text>
          </Text>
          <Select
            label="Group"
            data={groupOptions}
            value={editGroupValue}
            onChange={(value) => setEditGroupValue(value || '1')}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="light"
              color="gray"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              loading={saving}
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default AvailableAccountNew;
