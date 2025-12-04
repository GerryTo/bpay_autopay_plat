import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { IconAdjustments, IconFilter, IconRefresh } from '@tabler/icons-react';
import { availableAccountAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  agent: '',
  merchant: '',
  bank: '',
  bankAccount: '',
  user: '',
  groupId: '',
  use: '',
  active: '',
  type: '',
  date: '',
  counter: '',
};

const useOptions = [
  { value: '1', label: 'Used' },
  { value: '0', label: 'Not Used' },
];

const AvailableAccountList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editUseValue, setEditUseValue] = useState('0');
  const [saving, setSaving] = useState(false);

  const handleFilterChange = useCallback((key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.v_user, columnFilters.agent) &&
          includesValue(item.v_merchantcode, columnFilters.merchant) &&
          includesValue(item.v_bankcode, columnFilters.bank) &&
          includesValue(item.v_bankaccountno, columnFilters.bankAccount) &&
          includesValue(item.v_user, columnFilters.user) &&
          includesValue(item.n_groupid, columnFilters.groupId) &&
          includesValue(item.n_isUsed, columnFilters.use) &&
          includesValue(item.v_isactive, columnFilters.active) &&
          includesValue(item.v_type, columnFilters.type) &&
          includesValue(item.d_date, columnFilters.date) &&
          includesValue(item.n_current_counter, columnFilters.counter)
        );
      }),
    [data, columnFilters]
  );

  const columns = useMemo(
    () => [
      {
        key: 'agent',
        label: 'Agent',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.v_user || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.agent}
            onChange={(e) => handleFilterChange('agent', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'merchant',
        label: 'Merchant',
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
        key: 'bank',
        label: 'Bank',
        minWidth: 120,
        render: (item) => (
          <Badge
            variant="light"
            color="blue"
          >
            {item.v_bankcode || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bank}
            onChange={(e) => handleFilterChange('bank', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'bankAccount',
        label: 'Bank Account',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.v_bankaccountno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter account..."
            size="xs"
            value={columnFilters.bankAccount}
            onChange={(e) => handleFilterChange('bankAccount', e.currentTarget.value)}
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
        key: 'groupId',
        label: 'Group ID',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.n_groupid ?? '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter group..."
            size="xs"
            value={columnFilters.groupId}
            onChange={(e) => handleFilterChange('groupId', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'use',
        label: 'Use',
        minWidth: 100,
        render: (item) => (
          <Badge
            variant="light"
            color={Number(item.n_isUsed) === 1 ? 'green' : 'gray'}
          >
            {Number(item.n_isUsed) === 1 ? 'Used' : 'Not Used'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter use..."
            size="xs"
            value={columnFilters.use}
            onChange={(e) => handleFilterChange('use', e.currentTarget.value)}
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
        minWidth: 120,
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
        key: 'date',
        label: 'Date',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.d_date || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter date..."
            size="xs"
            value={columnFilters.date}
            onChange={(e) => handleFilterChange('date', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'counter',
        label: 'Counter',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.n_current_counter ?? '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter counter..."
            size="xs"
            value={columnFilters.counter}
            onChange={(e) => handleFilterChange('counter', e.currentTarget.value)}
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
              setSelectedRow(item);
              setEditUseValue(String(item.n_isUsed ?? '0'));
              setEditModalOpen(true);
            }}
          >
            Edit Use
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

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      silent ? setRefreshing(true) : setLoading(true);
      try {
        const response = await availableAccountAPI.getList();
        if (response.success && response.data) {
          const payload = response.data;
          const status = (payload.status || '').toLowerCase();
          if (!payload.status || status === 'ok') {
            const records = Array.isArray(payload.records) ? payload.records : [];
            setData(records);
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
        console.error('Available account list fetch error:', error);
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

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAll = () => {
    setColumnFilters(defaultFilters);
    setCurrentPage(1);
    setItemsPerPage(10);
    handleResetAll();
  };

  const handleSaveUse = async () => {
    if (!selectedRow) return;
    setSaving(true);
    try {
      const payload = { ...selectedRow, isUsed: editUseValue };
      const response = await availableAccountAPI.updateUse(payload);
      if (response.success && response.data) {
        const status = (response.data.status || '').toLowerCase();
        const message = response.data.message || 'Update submitted';
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
          message: response.error || 'Failed to update use status',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Update use error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update use status',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

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
                Available Account List
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage available account usage.
              </Text>
            </Box>

            <Group gap="xs">
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
                onClick={resetAll}
              >
                Reset
              </Button>
            </Group>
          </Group>

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
                    paginatedData.map((item, idx) => (
                      <Table.Tr key={`${item.v_bankaccountno || 'row'}-${idx}`}>
                        {visibleColumns.map((col) => (
                          <Table.Td key={col.key}>{col.render(item)}</Table.Td>
                        ))}
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={visibleColumns.length}>
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
                    <Table.Td colSpan={visibleColumns.length}>
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
        title="Edit Use Status"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Set use status for account{' '}
            <Text
              component="span"
              fw={600}
            >
              {selectedRow?.v_bankaccountno || '-'}
            </Text>
          </Text>
          <Select
            label="Use status"
            data={useOptions}
            value={editUseValue}
            onChange={(value) => setEditUseValue(value || '0')}
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
              onClick={handleSaveUse}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default AvailableAccountList;
