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
import { IconCalendar, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { onboardAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const defaultFilters = {
  dateOnboard: '',
  dateSuccess: '',
  bankAccNo: '',
  bankAccName: '',
  bankCode: '',
  AutomationStatus: '',
  LastOnline: '',
  isonline: '',
  LastOtp: '',
  lastAutomationStatus: '',
  LastCrawl: '',
  LastTrxid: '',
};

const ListOnboardAgent = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [onboardDate, setOnboardDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const makeKey = (item) => `${item.bankAccNo || ''}-${item.bankCode || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.dateOnboard, columnFilters.dateOnboard) &&
          includesValue(item.dateSuccess, columnFilters.dateSuccess) &&
          includesValue(item.bankAccNo, columnFilters.bankAccNo) &&
          includesValue(item.bankAccName, columnFilters.bankAccName) &&
          includesValue(item.bankCode, columnFilters.bankCode) &&
          includesValue(
            item.AutomationStatus,
            columnFilters.AutomationStatus
          ) &&
          includesValue(item.LastOnline, columnFilters.LastOnline) &&
          includesValue(item.isonline, columnFilters.isonline) &&
          includesValue(item.LastOtp, columnFilters.LastOtp) &&
          includesValue(
            item.lastAutomationStatus,
            columnFilters.lastAutomationStatus
          ) &&
          includesValue(item.LastCrawl, columnFilters.LastCrawl) &&
          includesValue(item.LastTrxid, columnFilters.LastTrxid)
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
      const response = await onboardAPI.getOnboardAgents();

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
      console.error('Error fetching onboard agents:', error);
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

  const handleSubmitOnboard = async () => {
    if (!onboardDate) {
      showNotification({
        title: 'Warning',
        message: 'Pilih tanggal onboard terlebih dahulu',
        color: 'yellow',
      });
      return;
    }

    if (selectedRecords.length === 0) {
      showNotification({
        title: 'Warning',
        message: 'Pilih minimal satu akun',
        color: 'yellow',
      });
      return;
    }

    setSubmitting(true);
    try {
      const items = selectedRecords.map((item) => ({
        account: item.bankAccNo,
        bank: item.bankCode,
      }));

      const response = await onboardAPI.updateOnboardDate(onboardDate, items);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'Date onboard updated',
            color: 'green',
          });
          setDateModalOpen(false);
          setOnboardDate('');
          loadData();
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to update date',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update date',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Update onboard date error:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to update date',
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
                List Agent Onboard
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Monitoring agent onboarding dan status otomatis
              </Text>
            </Box>
          </Group>

          <Group
            gap="sm"
            wrap="wrap"
          >
            {/* <Button
              variant="filled"
              color="blue"
              size="md"
              leftSection={<IconCalendar size={18} />}
              onClick={() => setDateModalOpen(true)}
            >
              Set Date Onboard
            </Button> */}
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
                  minWidth: 1600,
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
                    <Table.Th style={{ minWidth: 140 }}>Date Onboard</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Date Success</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Account No</Table.Th>
                    <Table.Th style={{ minWidth: 160 }}>Account Name</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Bank</Table.Th>
                    <Table.Th style={{ minWidth: 160 }}>
                      Automation Status
                    </Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Last Online</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>
                      Onboard Status
                    </Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Last OTP</Table.Th>
                    <Table.Th style={{ minWidth: 200 }}>
                      Last Update Automation
                    </Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Last Crawling</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Last TRX ID</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Last Balance</Table.Th>
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
                        placeholder="Filter date onboard..."
                        size="xs"
                        value={columnFilters.dateOnboard}
                        onChange={(e) =>
                          handleFilterChange(
                            'dateOnboard',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter date success..."
                        size="xs"
                        value={columnFilters.dateSuccess}
                        onChange={(e) =>
                          handleFilterChange(
                            'dateSuccess',
                            e.currentTarget.value
                          )
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
                        placeholder="Filter name..."
                        size="xs"
                        value={columnFilters.bankAccName}
                        onChange={(e) =>
                          handleFilterChange(
                            'bankAccName',
                            e.currentTarget.value
                          )
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
                        placeholder="Filter automation..."
                        size="xs"
                        value={columnFilters.AutomationStatus}
                        onChange={(e) =>
                          handleFilterChange(
                            'AutomationStatus',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter last online..."
                        size="xs"
                        value={columnFilters.LastOnline}
                        onChange={(e) =>
                          handleFilterChange(
                            'LastOnline',
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
                          { value: 'Y', label: 'Online' },
                          { value: 'N', label: 'Offline' },
                        ]}
                        value={columnFilters.isonline}
                        onChange={(val) =>
                          handleFilterChange('isonline', val || '')
                        }
                        clearable
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter last otp..."
                        size="xs"
                        value={columnFilters.LastOtp}
                        onChange={(e) =>
                          handleFilterChange('LastOtp', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter last update..."
                        size="xs"
                        value={columnFilters.lastAutomationStatus}
                        onChange={(e) =>
                          handleFilterChange(
                            'lastAutomationStatus',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter last crawl..."
                        size="xs"
                        value={columnFilters.LastCrawl}
                        onChange={(e) =>
                          handleFilterChange('LastCrawl', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter last trx..."
                        size="xs"
                        value={columnFilters.LastTrxid}
                        onChange={(e) =>
                          handleFilterChange('LastTrxid', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th />
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
                              {item.dateOnboard || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.dateSuccess || '-'}</Text>
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
                            <Text size="sm">{item.bankAccName || '-'}</Text>
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
                              color="indigo"
                              variant="light"
                            >
                              {item.AutomationStatus || '-'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.LastOnline || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={item.isonline === 'Y' ? 'green' : 'red'}
                              variant="light"
                            >
                              {item.isonline === 'Y' ? 'Online' : 'Offline'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.LastOtp || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {item.lastAutomationStatus || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.LastCrawl || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.LastTrxid || '-'}</Text>
                          </Table.Td>
                          <Table.Td className="grid-alignright">
                            <Text size="sm">
                              {formatNumber(item.lastBalance)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={14}>
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
        opened={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        title="Set Date Onboard"
        radius="md"
      >
        <Stack gap="md">
          <Text
            size="sm"
            c="dimmed"
          >
            Terapkan ke {selectedRecords.length} akun terpilih.
          </Text>
          <TextInput
            type="date"
            label="Tanggal Onboard"
            value={onboardDate}
            onChange={(e) => setOnboardDate(e.currentTarget.value)}
          />
          <Group
            justify="flex-end"
            gap="sm"
          >
            <Button
              variant="default"
              onClick={() => setDateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              loading={submitting}
              onClick={handleSubmitOnboard}
              color="blue"
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default ListOnboardAgent;
