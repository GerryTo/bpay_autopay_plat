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
  IconAlertTriangle,
  IconArrowRight,
  IconClock,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconUsers,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { myBankAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const defaultFilters = {
  group: '',
  bankAccNo: '',
  bankAccName: '',
  bankCode: '',
  login: '',
  type: '',
  active: '',
};

const MyBankDeactive = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [groupModalOpened, setGroupModalOpened] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSubmitting, setGroupSubmitting] = useState(false);

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
        return (
          includesValue(item.group, columnFilters.group) &&
          includesValue(item.bankAccNo, columnFilters.bankAccNo) &&
          includesValue(item.bankAccName, columnFilters.bankAccName) &&
          includesValue(item.bankCode, columnFilters.bankCode) &&
          includesValue(item.login, columnFilters.login) &&
          includesValue(item.type, columnFilters.type) &&
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
      const response = await myBankAPI.getDeactiveBankList();

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
      console.error('Error fetching deactive mybank:', error);
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

  const automationLabel = (item) =>
    item.automationStatus ?? item.AutomationStatus ?? '-';

  const handleAddNew = () => {
    navigate('/master-mybank-form', {
      state: { data: { bankAccNo: '', bankCode: '' } },
    });
  };

  const handleOpenGroupModal = () => {
    if (selectedRecords.length === 0) {
      showNotification({
        title: 'Info',
        message: 'Pilih minimal satu akun terlebih dahulu',
        color: 'blue',
      });
      return;
    }
    setGroupName('');
    setGroupModalOpened(true);
  };

  const handleSubmitGroup = async () => {
    if (!groupName.trim()) {
      showNotification({
        title: 'Info',
        message: 'Nama group tidak boleh kosong',
        color: 'blue',
      });
      return;
    }

    setGroupSubmitting(true);
    const items = selectedRecords.map((item) => ({
      account: item.bankAccNo,
      bank: item.bankCode,
    }));

    try {
      const response = await myBankAPI.groupAccounts(groupName.trim(), items);
      if (response.success && response.data?.status?.toLowerCase() === 'ok') {
        showNotification({
          title: 'Berhasil',
          message: 'Berhasil mengelompokkan akun terpilih',
          color: 'green',
        });
        setGroupModalOpened(false);
        loadData();
      } else {
        showNotification({
          title: 'Error',
          message: response.data?.message || response.error || 'Gagal grouping',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Group mybank error:', error);
      showNotification({
        title: 'Error',
        message: 'Gagal grouping akun',
        color: 'red',
      });
    } finally {
      setGroupSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    navigate('/master-mybank-form', {
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
                Master My Bank Acc Deactive
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Daftar akun MyBank yang non-aktif
              </Text>
            </Box>
          </Group>
          <Group
            gap="sm"
            wrap="wrap"
            align="flex-end"
          >
            {/* <TextInput
              label="Group"
              placeholder="Filter group..."
              value={columnFilters.group}
              onChange={(e) => handleFilterChange('group', e.currentTarget.value)}
            />
            <TextInput
              label="Account No"
              placeholder="Filter account..."
              value={columnFilters.bankAccNo}
              onChange={(e) => handleFilterChange('bankAccNo', e.currentTarget.value)}
            />
            <TextInput
              label="Account Name"
              placeholder="Filter name..."
              value={columnFilters.bankAccName}
              onChange={(e) => handleFilterChange('bankAccName', e.currentTarget.value)}
            />
            <TextInput
              label="Bank"
              placeholder="Filter bank..."
              value={columnFilters.bankCode}
              onChange={(e) => handleFilterChange('bankCode', e.currentTarget.value)}
            />
            <TextInput
              label="Login"
              placeholder="Filter login..."
              value={columnFilters.login}
              onChange={(e) => handleFilterChange('login', e.currentTarget.value)}
            />
            <TextInput
              label="Type"
              placeholder="Filter type..."
              value={columnFilters.type}
              onChange={(e) => handleFilterChange('type', e.currentTarget.value)}
            />
            <TextInput
              label="Active"
              placeholder="Filter active..."
              value={columnFilters.active}
              onChange={(e) => handleFilterChange('active', e.currentTarget.value)}
            /> */}
            <Button
              leftSection={<IconPlus size={16} />}
              variant="filled"
              color="blue"
              onClick={handleAddNew}
            >
              Add New
            </Button>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              color="gray"
              onClick={loadData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              leftSection={<IconUsers size={16} />}
              variant="light"
              color="grape"
              onClick={handleOpenGroupModal}
            >
              Group
            </Button>
            <Button
              leftSection={<IconAlertTriangle size={16} />}
              variant="light"
              color="blue"
              onClick={() => navigate('/master-mybank')}
            >
              Back
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
                    <Table.Th style={{ minWidth: 90 }}>Group</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Account No</Table.Th>
                    <Table.Th style={{ minWidth: 160 }}>Account Name</Table.Th>
                    <Table.Th style={{ minWidth: 90 }}>Bank</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Login</Table.Th>
                    <Table.Th style={{ minWidth: 80 }}>Type</Table.Th>
                    <Table.Th style={{ minWidth: 90 }}>Active</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Balance</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Daily Limit</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Daily</Table.Th>
                    <Table.Th style={{ minWidth: 200 }}>Action</Table.Th>
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
                        placeholder="Filter login..."
                        size="xs"
                        value={columnFilters.login}
                        onChange={(e) =>
                          handleFilterChange('login', e.currentTarget.value)
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
                      <TextInput
                        placeholder="Filter active..."
                        size="xs"
                        value={columnFilters.active}
                        onChange={(e) =>
                          handleFilterChange('active', e.currentTarget.value)
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
                            <Text size="sm">{item.login || '-'}</Text>
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
                          <Table.Td className="grid-alignright">
                            <Text size="sm">{formatNumber(item.curr)}</Text>
                          </Table.Td>
                          <Table.Td className="grid-alignright">
                            <Text size="sm">
                              {formatNumber(item.dailylimit)}
                            </Text>
                          </Table.Td>
                          <Table.Td className="grid-alignright">
                            <Text size="sm">{formatNumber(item.daily)}</Text>
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
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={12}>
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
        opened={groupModalOpened}
        onClose={() => setGroupModalOpened(false)}
        title="Group Selected Accounts"
        centered
        radius="md"
      >
        <Stack gap="sm">
          <Text
            size="sm"
            c="dimmed"
          >
            Masukkan nama group untuk {selectedRecords.length} akun terpilih
          </Text>
          <TextInput
            label="Group Name"
            placeholder="Nama group"
            value={groupName}
            onChange={(e) => setGroupName(e.currentTarget.value)}
          />
          <Group
            justify="flex-end"
            gap="sm"
          >
            <Button
              variant="light"
              color="gray"
              onClick={() => setGroupModalOpened(false)}
              disabled={groupSubmitting}
            >
              Cancel
            </Button>
            <Button
              loading={groupSubmitting}
              onClick={handleSubmitGroup}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

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
                        <Table.Td>{trx.insert || trx.timestamp}</Table.Td>
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

export default MyBankDeactive;
