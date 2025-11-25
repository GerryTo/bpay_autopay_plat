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
  IconClock,
  IconEdit,
  IconEye,
  IconKey,
  IconRefresh,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { myBankAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const updateOptions = [
  { value: 'active', label: 'Set active' },
  { value: 'inactive', label: 'Set inactive' },
  { value: 'deactive', label: 'Set deactive' },
  { value: 'deposit', label: 'Set deposit only' },
  { value: 'withdraw', label: 'Set withdraw only' },
  { value: 'withdraw and deposit', label: 'Set withdraw and deposit' },
];

const defaultFilters = {
  groupname: '',
  action: '',
  alias: '',
  bankaccountno: '',
  bankaccountname: '',
  bankcode: '',
  userlogin: '',
  type: '',
  isactive: '',
  islocked: '',
};

const MyBankInactiveList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [updateValue, setUpdateValue] = useState(updateOptions[0].value);
  const [submitting, setSubmitting] = useState(false);

  const [lastModalOpened, setLastModalOpened] = useState(false);
  const [lastTrxLoading, setLastTrxLoading] = useState(false);
  const [lastTrxInfo, setLastTrxInfo] = useState({
    bankAccNo: '',
    bankCode: '',
    bankAccName: '',
  });
  const [lastTrxRecords, setLastTrxRecords] = useState([]);

  const makeKey = (item) =>
    `${item.bankaccountno || ''}-${item.bankcode || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.groupname, columnFilters.groupname) &&
          includesValue(item.action, columnFilters.action) &&
          includesValue(item.alias, columnFilters.alias) &&
          includesValue(item.bankaccountno, columnFilters.bankaccountno) &&
          includesValue(item.bankaccountname, columnFilters.bankaccountname) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.userlogin, columnFilters.userlogin) &&
          includesValue(item.type, columnFilters.type) &&
          includesValue(item.isactive, columnFilters.isactive) &&
          includesValue(item.islocked, columnFilters.islocked)
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
      const response = await myBankAPI.getInactiveList();

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
      console.error('Error fetching inactive list:', error);
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
    navigate('/master-mybank-form', {
      state: {
        data: {
          bankAccNo: record.bankaccountno,
          bankCode: record.bankcode,
          type: record.type,
          active: record.isactive,
          dailylimit: record.dailylimit,
          dailywithdrawallimit: record.dailywithdrawallimit,
          dailydepositlimit: record.dailydepositlimit,
        },
      },
    });
  };

  const handleMore = (record) => {
    navigate('/transaction-account-by-company', {
      state: { data: { accountno: record.bankaccountno } },
    });
  };

  const handleShow = (record) => {
    navigate('/list-merchant-group', {
      state: {
        data: {
          bankAccNo: record.bankaccountno,
          bankAccName: record.bankaccountname,
        },
      },
    });
  };

  const handleSecret = (record) => {
    navigate('/secret-page', {
      state: {
        data: {
          bankAccNo: record.bankaccountno,
          bankAccName: record.bankaccountname,
          bankCode: record.bankcode,
        },
      },
    });
  };

  const handleLastTransaction = async (record) => {
    setLastModalOpened(true);
    setLastTrxInfo({
      bankAccNo: record.bankaccountno,
      bankCode: record.bankcode,
      bankAccName: record.bankaccountname,
    });
    setLastTrxRecords([]);
    setLastTrxLoading(true);

    try {
      const response = await myBankAPI.getLastTransaction(
        record.bankaccountno,
        record.bankcode
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
    if (selectedRecords.length === 0 || selectedRecords.length > 50) {
      showNotification({
        title: 'Warning',
        message: 'Pilih 1 sampai 50 akun sebelum set status',
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
        account: item.bankaccountno,
        bank: item.bankcode,
      }));

      const response = await myBankAPI.updateInactiveStatus(updateValue, items);

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
      console.error('Update status error:', error);
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
                Update MyBank Inactive
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Set status akun MyBank yang inactive
              </Text>
            </Box>
          </Group>

          <Group
            gap="sm"
            wrap="wrap"
            align="flex-end"
          >
            <Select
              label="Set Status"
              size="sm"
              data={updateOptions}
              value={updateValue}
              onChange={(val) => setUpdateValue(val || updateOptions[0].value)}
              styles={{
                root: { minWidth: 220 },
              }}
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
            <Button
              variant="light"
              color="gray"
              leftSection={<IconRefresh size={16} />}
              size="sm"
              onClick={loadData}
              disabled={loading}
            >
              Refresh
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
                    <Table.Th style={{ minWidth: 120 }}>Group</Table.Th>
                    <Table.Th style={{ minWidth: 180 }}>Status</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Alias</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Account No</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Account Name</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Bank</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Login</Table.Th>
                    <Table.Th style={{ minWidth: 90 }}>Type</Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Active</Table.Th>
                    <Table.Th style={{ minWidth: 90 }}>Locked</Table.Th>
                    <Table.Th style={{ minWidth: 160 }}>Last Used</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>
                      Agent Commission
                    </Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Date Insert</Table.Th>
                    <Table.Th style={{ minWidth: 140 }}>Last Balance</Table.Th>
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
                        value={columnFilters.groupname}
                        onChange={(e) =>
                          handleFilterChange('groupname', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter status..."
                        size="xs"
                        value={columnFilters.action}
                        onChange={(e) =>
                          handleFilterChange('action', e.currentTarget.value)
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
                        value={columnFilters.bankaccountno}
                        onChange={(e) =>
                          handleFilterChange(
                            'bankaccountno',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter name..."
                        size="xs"
                        value={columnFilters.bankaccountname}
                        onChange={(e) =>
                          handleFilterChange(
                            'bankaccountname',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter bank..."
                        size="xs"
                        value={columnFilters.bankcode}
                        onChange={(e) =>
                          handleFilterChange('bankcode', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter login..."
                        size="xs"
                        value={columnFilters.userlogin}
                        onChange={(e) =>
                          handleFilterChange('userlogin', e.currentTarget.value)
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
                        value={columnFilters.isactive}
                        onChange={(e) =>
                          handleFilterChange('isactive', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th>
                      <TextInput
                        placeholder="Filter locked..."
                        size="xs"
                        value={columnFilters.islocked}
                        onChange={(e) =>
                          handleFilterChange('islocked', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th />
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
                              {item.groupname || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color="gray"
                              variant="light"
                            >
                              {item.action || '-'}
                            </Badge>
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
                              {item.bankaccountno}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.bankaccountname || '-'}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color="blue"
                              variant="light"
                            >
                              {item.bankcode}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.userlogin || '-'}</Text>
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
                              color={item.isactive === 'Y' ? 'green' : 'red'}
                              variant="light"
                            >
                              {item.isactive === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={item.islocked === 'Y' ? 'orange' : 'gray'}
                              variant="light"
                            >
                              {item.islocked === 'Y' ? 'Locked' : 'Open'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.lastused || '-'}</Text>
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
                                onClick={() => handleMore(item)}
                              >
                                More
                              </Button>
                              <Button
                                variant="light"
                                color="teal"
                                size="xs"
                                leftSection={<IconEye size={16} />}
                                onClick={() => handleShow(item)}
                              >
                                Show
                              </Button>
                              <Button
                                variant="light"
                                color="gray"
                                size="xs"
                                leftSection={<IconKey size={16} />}
                                onClick={() => handleSecret(item)}
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
                  bankaccountno: lastTrxInfo.bankAccNo,
                  bankcode: lastTrxInfo.bankCode,
                  bankaccountname: lastTrxInfo.bankAccName,
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

export default MyBankInactiveList;
