import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  Menu,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconAdjustments,
  IconArrowDown,
  IconArrowUp,
  IconEyeOff,
  IconRefresh,
} from '@tabler/icons-react';
import { merchantAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const updateOptions = [
  { value: 'linked', label: 'Set linked' },
  { value: 'notLinked', label: 'Set not linked' },
];

const defaultFilters = {
  v_merchantcode: '',
  v_bankaccountno: '',
  v_bankaccountname: '',
  n_isdeleted: '',
};

const UpdateMerchantBankSelected = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [updateValue, setUpdateValue] = useState(updateOptions[0].value);
  const [submitting, setSubmitting] = useState(false);

  const [merchantOptions, setMerchantOptions] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState('ALL');
  const [isNotLinked, setIsNotLinked] = useState(false);
  const [sortConfig, setSortConfig] = useState(null); // { key, direction }
  const columns = [
    {
      key: 'v_merchantcode',
      label: 'Merchant Code',
      minWidth: 160,
      render: (item) => (
        <Text fw={600} size="sm">
          {item.v_merchantcode || '-'}
        </Text>
      ),
      filter: (
        <TextInput
          placeholder="Filter merchant..."
          size="xs"
          value={columnFilters.v_merchantcode}
          onChange={(e) =>
            handleFilterChange('v_merchantcode', e.currentTarget.value)
          }
        />
      ),
    },
    {
      key: 'v_bankaccountno',
      label: 'Account No',
      minWidth: 140,
      render: (item) => (
        <Text fw={600} size="sm" c="blue">
          {item.v_bankaccountno}
        </Text>
      ),
      filter: (
        <TextInput
          placeholder="Filter account..."
          size="xs"
          value={columnFilters.v_bankaccountno}
          onChange={(e) =>
            handleFilterChange('v_bankaccountno', e.currentTarget.value)
          }
        />
      ),
    },
    {
      key: 'v_bankaccountname',
      label: 'Account Name',
      minWidth: 180,
      render: (item) => <Text size="sm">{item.v_bankaccountname || '-'}</Text>,
      filter: (
        <TextInput
          placeholder="Filter name..."
          size="xs"
          value={columnFilters.v_bankaccountname}
          onChange={(e) =>
            handleFilterChange('v_bankaccountname', e.currentTarget.value)
          }
        />
      ),
    },
    {
      key: 'n_isdeleted',
      label: 'Is Linked',
      minWidth: 120,
      render: (item) => (
        <Text size="sm">{item.n_isdeleted == 1 ? 'No' : 'Yes'}</Text>
      ),
      filter: (
        <Select
          placeholder="All"
          size="xs"
          data={[
            { value: '', label: 'All' },
            { value: '0', label: 'Yes' },
            { value: '1', label: 'No' },
          ]}
          value={columnFilters.n_isdeleted}
          onChange={(val) => handleFilterChange('n_isdeleted', val || '')}
          clearable
        />
      ),
    },
  ];
  const defaultVisibility = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.key] = true;
      return acc;
    }, {});
  }, [columns]);
  const [columnVisibility, setColumnVisibility] = useState(defaultVisibility);

  const makeKey = (item) =>
    `${item.v_merchantcode || ''}-${item.v_bankaccountno || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.v_merchantcode, columnFilters.v_merchantcode) &&
          includesValue(item.v_bankaccountno, columnFilters.v_bankaccountno) &&
          includesValue(
            item.v_bankaccountname,
            columnFilters.v_bankaccountname
          ) &&
          includesValue(String(item.n_isdeleted), columnFilters.n_isdeleted)
        );
      }),
    [data, columnFilters]
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

  const selectedRecords = useMemo(
    () => data.filter((item) => selectedKeys.includes(makeKey(item))),
    [data, selectedKeys]
  );

  const pageKeys = paginatedData.map((item) => makeKey(item));
  const pageFullySelected =
    pageKeys.length > 0 && pageKeys.every((key) => selectedKeys.includes(key));
  const pagePartiallySelected =
    pageKeys.some((key) => selectedKeys.includes(key)) && !pageFullySelected;

  const loadMerchantList = async () => {
    const response = await merchantAPI.getMerchantList();
    if (response.success && response.data?.status?.toLowerCase() === 'ok') {
      const opts = (response.data.records || []).map((m) => ({
        value: m.merchantcode,
        label: m.merchantcode,
      }));
      setMerchantOptions(opts);
      if (opts.length > 0) {
        setSelectedMerchant(opts[0].value);
      }
    } else {
      showNotification({
        title: 'Error',
        message:
          response.error ||
          response.data?.message ||
          'Failed to load merchant list',
        color: 'red',
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getMerchantBankAccList(
        selectedMerchant || 'ALL',
        isNotLinked ? 1 : 0
      );

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
      console.error('Error fetching merchant bank list:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  const handleHideColumn = (key) => {
    setColumnVisibility((prev) => ({ ...prev, [key]: false }));
  };

  const handleResetAll = () => {
    setColumnVisibility(defaultVisibility);
    setSortConfig(null);
    setColumnFilters(defaultFilters);
    setSelectedKeys([]);
    setCurrentPage(1);
  };

  const visibleColumns = columns.filter((col) => columnVisibility[col.key]);

  const handleSubmit = async () => {
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
      const response = await merchantAPI.updateMerchantBankSelected(
        updateValue,
        selectedRecords
      );
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
      console.error('Update merchant bank selected error:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to update status',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
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
                Update Merchant Bank Account Selected
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Set linked / not linked untuk akun bank merchant terpilih
              </Text>
            </Box>
          </Group>

          <Group
            gap="sm"
            wrap="wrap"
            align="flex-end"
          >
            <Select
              label="Merchant"
              data={merchantOptions}
              value={selectedMerchant}
              onChange={(val) => setSelectedMerchant(val || 'ALL')}
              placeholder="Select merchant"
              searchable
              style={{ minWidth: 180 }}
            />
            <Checkbox
              label="isNotLinked"
              checked={isNotLinked}
              onChange={(e) => setIsNotLinked(e.currentTarget.checked)}
            />
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
              color="gray"
              size="sm"
              leftSection={<IconAdjustments size={16} />}
              onClick={handleResetAll}
            >
              Reset
            </Button>
            <Select
              label="Set Status"
              data={updateOptions}
              value={updateValue}
              onChange={(val) => setUpdateValue(val || updateOptions[0].value)}
              style={{ minWidth: 180 }}
            />
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={handleSubmit}
              loading={submitting}
            >
              Set
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
                  minWidth: 900,
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
                    {visibleColumns.map((col) => {
                      const isSorted =
                        sortConfig && sortConfig.key === col.key
                          ? sortConfig.direction
                          : null;
                      return (
                        <Table.Th key={col.key} style={{ minWidth: col.minWidth }}>
                          <Group gap={6} align="center" wrap="nowrap">
                            <Text size="sm" fw={600}>
                              {col.label}
                            </Text>
                            <Menu shadow="sm" withinPortal>
                              <Menu.Target>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  size="sm"
                                  radius="md"
                                  title="Sort / Hide"
                                >
                                  {isSorted === 'asc' ? (
                                    <IconArrowUp size={16} />
                                  ) : isSorted === 'desc' ? (
                                    <IconArrowDown size={16} />
                                  ) : (
                                    <IconAdjustments size={16} />
                                  )}
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<IconArrowUp size={14} />}
                                  onClick={() => handleSort(col.key, 'asc')}
                                >
                                  Sort Asc
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconArrowDown size={14} />}
                                  onClick={() => handleSort(col.key, 'desc')}
                                >
                                  Sort Desc
                                </Menu.Item>
                                <Menu.Item
                                  leftSection={<IconEyeOff size={14} />}
                                  onClick={() => handleHideColumn(col.key)}
                                >
                                  Hide Column
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Table.Th>
                      );
                    })}
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
                    {visibleColumns.map((col) => (
                      <Table.Th key={`filter-${col.key}`}>
                        {col.filter}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => {
                      const key = makeKey(item);
                      const selected = selectedKeys.includes(key);
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
                          {visibleColumns.map((col) => (
                            <Table.Td key={`${key}-${col.key}`}>
                              {col.render(item)}
                            </Table.Td>
                          ))}
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
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
                    <Button
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Clear Filters
                    </Button>
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
    </Box>
  );
};

export default UpdateMerchantBankSelected;
