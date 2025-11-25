import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  LoadingOverlay,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
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

  useEffect(() => {
    loadMerchantList();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedMerchant, isNotLinked]);

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
                    <Table.Th style={{ minWidth: 160 }}>Merchant Code</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Account No</Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>Account Name</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Is Linked</Table.Th>
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
                        placeholder="Filter merchant..."
                        size="xs"
                        value={columnFilters.v_merchantcode}
                        onChange={(e) =>
                          handleFilterChange(
                            'v_merchantcode',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter account..."
                        size="xs"
                        value={columnFilters.v_bankaccountno}
                        onChange={(e) =>
                          handleFilterChange(
                            'v_bankaccountno',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter name..."
                        size="xs"
                        value={columnFilters.v_bankaccountname}
                        onChange={(e) =>
                          handleFilterChange(
                            'v_bankaccountname',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <Select
                        placeholder="All"
                        size="xs"
                        data={[
                          { value: '', label: 'All' },
                          { value: '0', label: 'Yes' },
                          { value: '1', label: 'No' },
                        ]}
                        value={columnFilters.n_isdeleted}
                        onChange={(val) =>
                          handleFilterChange('n_isdeleted', val || '')
                        }
                        clearable
                      />
                    </Table.Th>
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
                          <Table.Td>
                            <Text
                              fw={600}
                              size="sm"
                            >
                              {item.v_merchantcode || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text
                              fw={600}
                              size="sm"
                              c="blue"
                            >
                              {item.v_bankaccountno}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {item.v_bankaccountname || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {item.n_isdeleted == 1 ? 'No' : 'Yes'}
                            </Text>
                          </Table.Td>
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
