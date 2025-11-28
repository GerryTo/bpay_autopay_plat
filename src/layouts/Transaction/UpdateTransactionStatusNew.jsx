import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Checkbox,
  Radio,
  Switch,
} from '@mantine/core';
import { IconEdit, IconFilter, IconListDetails, IconRefresh, IconSearch, IconSend, IconSettings, IconTransfer } from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { transactionAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  futuretrxid: '',
  insert: '',
  completedate: '',
  merchantcode: '',
  customercode: '',
  ccy: '',
  bankcode: '',
  DB: '',
  CR: '',
  ip: '',
  transactiontype: '',
  status: '',
  callbackresponse: '',
  accountsrc: '',
  fee: '',
  notes: '',
  notes2: '',
  notes3: '',
  phonenumber: '',
  user: '',
  transactionid: '',
  reference: '',
  alias: '',
  accountno: '',
  accountsrcname: '',
  accountdst: '',
  accountdstname: '',
  servername: '',
  serverurl: '',
  disable: '',
  memo: '',
  receiptId: '',
};

const defaultModal = {
  open: false,
  type: 'status', // status | notes2 | notes3
  record: null,
  chgAmt: false,
  chgChk: false,
  amount: '',
  status: '',
  notes2: '',
  notes3: '',
};

const numberColumns = new Set(['DB', 'CR', 'fee']);

const UpdateTransactionStatusNew = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [transId, setTransId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [modal, setModal] = useState(defaultModal);

  const formatNumber = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    if (Number.isNaN(num)) return val;
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const handleFilterChange = (key, value) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => setColumnFilters(defaultFilters);

  const columns = useMemo(() => {
    const defs = [
      { key: 'futuretrxid', label: 'Future Trx ID', minWidth: 140 },
      { key: 'insert', label: 'Date', minWidth: 140 },
      { key: 'completedate', label: 'Complete Date', minWidth: 140 },
      { key: 'merchantcode', label: 'Merchant Code', minWidth: 120 },
      { key: 'customercode', label: 'Customer Code', minWidth: 140 },
      { key: 'ccy', label: 'CCY', minWidth: 80 },
      { key: 'bankcode', label: 'Bank', minWidth: 100 },
      { key: 'DB', label: 'Debit', minWidth: 110 },
      { key: 'CR', label: 'Credit', minWidth: 110 },
      { key: 'ip', label: 'IP', minWidth: 140 },
      { key: 'transactiontype', label: 'Trans Type', minWidth: 110 },
      { key: 'status', label: 'Status', minWidth: 140 },
      { key: 'callbackresponse', label: 'Callback Status', minWidth: 160 },
      { key: 'accountsrc', label: 'Account Src', minWidth: 140 },
      { key: 'fee', label: 'Fee', minWidth: 110 },
      { key: 'notes', label: 'Notes', minWidth: 140 },
      { key: 'notes2', label: 'Notes 2', minWidth: 140 },
      { key: 'notes3', label: 'Notes 3', minWidth: 140 },
      { key: 'phonenumber', label: 'Sms Phone', minWidth: 140 },
      { key: 'user', label: 'Sms Agent', minWidth: 140 },
      { key: 'transactionid', label: 'Trans ID', minWidth: 140 },
      { key: 'reference', label: 'Reference', minWidth: 140 },
      { key: 'alias', label: 'Alias', minWidth: 120 },
      { key: 'accountno', label: 'Acc Source', minWidth: 140 },
      { key: 'accountsrcname', label: 'Acc Source Name', minWidth: 150 },
      { key: 'accountdst', label: 'Acc Dest', minWidth: 140 },
      { key: 'accountdstname', label: 'Acc Dest Name', minWidth: 150 },
      { key: 'servername', label: 'Server Name', minWidth: 140 },
      { key: 'serverurl', label: 'Server URL', minWidth: 140 },
      { key: 'disable', label: 'dis', minWidth: 80 },
      { key: 'receiptId', label: 'Receipt ID', minWidth: 120, source: 'notes2' },
      { key: 'memo', label: 'Memo', minWidth: 140 },
    ];

    return [
      ...defs.map((col) => ({
        ...col,
        render: (item) => {
          const value = col.source ? item[col.source] : item[col.key];
          if (col.key === 'status') {
            return (
              <Badge color="blue" variant="light">
                {value || '-'}
              </Badge>
            );
          }
          if (numberColumns.has(col.key)) {
            return (
              <Text size="sm" className="grid-alignright">
                {formatNumber(value)}
              </Text>
            );
          }
          return <Text size="sm">{value || '-'}</Text>;
        },
        filter: (
          <TextInput
            placeholder={`Filter ${col.label.toLowerCase()}...`}
            size="xs"
            value={columnFilters[col.key]}
            onChange={(e) => handleFilterChange(col.key, e.currentTarget.value)}
          />
        ),
      })),
      {
        key: 'action',
        label: 'Action',
        minWidth: 320,
        render: (item) => (
          <Group gap={6}>
            <Button
              size="xs"
              color="indigo"
              leftSection={<IconEdit size={14} />}
              onClick={() => openModal('status', item)}
            >
              Update Status & Amount
            </Button>
            <Button
              size="xs"
              variant="light"
              color="blue"
              leftSection={<IconListDetails size={14} />}
              onClick={() => openModal('notes3', item)}
            >
              Edit Notes 3
            </Button>
            <Button
              size="xs"
              variant="light"
              color="grape"
              leftSection={<IconListDetails size={14} />}
              onClick={() => openModal('notes2', item)}
            >
              Edit Notes 2
            </Button>
          </Group>
        ),
      },
    ];
  }, [columnFilters]);

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } = useTableControls(columns, {
    onResetFilters: () => setColumnFilters(defaultFilters),
  });

  const makeKey = (item) => `${item.futuretrxid || ''}-${item.transactionid || ''}`;

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) =>
        Object.keys(defaultFilters).every((key) => {
          const sourceKey = key === 'receiptId' ? 'notes2' : key;
          return includesValue(item[sourceKey], columnFilters[key]);
        })
      ),
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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => setCurrentPage(1), [columnFilters]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [totalPages, currentPage]);

  const fetchData = async ({ silent = false } = {}) => {
    if (!transId) {
      showNotification({ title: 'Validation', message: 'Please input Transaction ID', Color: 'yellow' });
      return;
    }
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const payload = { transId, history: showHistory };
      const response = await transactionAPI.getByTransactionId(payload);

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records) ? response.data.records : [];
          const mapped = records.map((item) => {
            const row = { ...item, receiptId: item.notes2 };
            if (['D', 'Topup', 'Y', 'I'].includes(row.transactiontype)) {
              row.DB = row.amount;
              row.CR = '0';
            } else {
              row.CR = row.amount;
              row.DB = '0';
            }
            row.fee = Number(row.fee);
            return row;
          });
          setData(mapped);
        } else {
          showNotification({ title: 'Error', message: response.data.message || 'Failed to load data', Color: 'red' });
          setData([]);
        }
      } else {
        showNotification({ title: 'Error', message: response.error || 'Failed to load data', Color: 'red' });
      }
    } catch (error) {
      console.error('Update transaction status new fetch error:', error);
      showNotification({ title: 'Error', message: 'Unable to load transactions', Color: 'red' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openModal = (type, record) => {
    setModal({
      open: true,
      type,
      record,
      chgAmt: false,
      chgChk: type === 'status',
      amount: '',
      status: '',
      notes2: record?.notes2 || '',
      notes3: record?.notes3 || '',
    });
  };

  const closeModal = () => setModal(defaultModal);

  const handleSubmitStatus = async () => {
    const { record, chgAmt, chgChk, amount, status } = modal;
    if (!record) return;
    if (chgAmt && (amount === '' || amount === null)) {
      showNotification({ title: 'Validation', message: 'Amount is required', Color: 'yellow' });
      return;
    }
    if (chgChk && status === '') {
      showNotification({ title: 'Validation', message: 'Choose a status', Color: 'yellow' });
      return;
    }
    if (!window.confirm(`Are you sure want to update ${record.notes3}?`)) return;

    setLoading(true);
    try {
      const payload = {
        status,
        notes3: record.notes3,
        transactionid: record.transactionid,
        history: showHistory,
        chgAmt,
        chgChk,
        pass: '',
        amount,
      };
      const response = await transactionAPI.updateTransactionStatusNew(payload);
      if (response.success && response.data) {
        showNotification({
          title: 'Info',
          message: response.data.message || 'Request completed',
          Color: (response.data.status || '').toLowerCase() === 'ok' ? 'green' : 'yellow',
        });
        fetchData({ silent: true });
      } else {
        showNotification({ title: 'Error', message: response.error || 'Failed to update transaction', Color: 'red' });
      }
    } catch (error) {
      console.error('Update transaction status new submit error:', error);
      showNotification({ title: 'Error', message: 'Unable to update transaction', Color: 'red' });
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const handleSubmitNotes = async (field) => {
    const { record } = modal;
    if (!record) return;
    const value = field === 'notes2' ? modal.notes2 : modal.notes3;
    if (!window.confirm(`Are you sure want to update ${record.notes3}?`)) return;

    setLoading(true);
    try {
      const payload = { id: record.futuretrxid, notes: value, history: showHistory };
      const api =
        field === 'notes2'
          ? transactionAPI.updateTransactionNotes2ById
          : transactionAPI.updateTransactionNotesById;
      const response = await api(payload);
      if (response.success && response.data) {
        showNotification({
          title: 'Info',
          message: response.data.message || 'Request completed',
          Color: (response.data.status || '').toLowerCase() === 'ok' ? 'green' : 'yellow',
        });
        fetchData({ silent: true });
      } else {
        showNotification({ title: 'Error', message: response.error || 'Failed to update notes', Color: 'red' });
      }
    } catch (error) {
      console.error('Update notes error:', error);
      showNotification({ title: 'Error', message: 'Unable to update notes', Color: 'red' });
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  return (
    <Box p="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'md', blur: 2 }} />

        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Group gap={8} align="center">
              <IconTransfer size={22} color="#2563eb" />
              <Text size="xl" fw={700}>
                Update Transaction New
              </Text>
            </Group>

            <Group gap="xs">
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing}
                onClick={() => fetchData({ silent: true })}
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
                  setTransId('');
                  setShowHistory(false);
                  handleClearFilters();
                  setData([]);
                }}
              >
                Reset
              </Button>
            </Group>
          </Group>

          <Card withBorder radius="md" padding="md" shadow="xs">
            <Group align="flex-end" gap="md" wrap="wrap">
              <TextInput
                label="Transaction ID"
                placeholder="Enter transaction ID"
                value={transId}
                onChange={(e) => setTransId(e.currentTarget.value)}
                style={{ minWidth: 240 }}
              />
              <Switch label="Show history" checked={showHistory} onChange={(e) => setShowHistory(e.currentTarget.checked)} />
              <Button leftSection={<IconSearch size={18} />} color="blue" radius="md" onClick={() => fetchData()}>
                Search
              </Button>
            </Group>
          </Card>

          <Box pos="relative">
            <ScrollArea type="auto" h="60vh">
              <Table
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="sm"
                verticalSpacing="xs"
                styles={{ th: { backgroundColor: '#f8f9fa', fontWeight: 600 } }}
              >
                <Table.Thead>
                  <Table.Tr>
                    {visibleColumns.map((col) => (
                      <Table.Th key={col.key} style={{ minWidth: col.minWidth || 120 }}>
                        <Group gap={6} align="center">
                          <Text size="sm" fw={600}>
                            {col.label}
                          </Text>
                          {col.key !== 'action' && (
                            <ColumnActionMenu
                              columnKey={col.key}
                              sortConfig={sortConfig}
                              onSort={handleSort}
                              onHide={handleHideColumn}
                            />
                          )}
                        </Group>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    {visibleColumns.map((col) => (
                      <Table.Th key={`${col.key}-filter`} style={{ minWidth: col.minWidth || 120, padding: '8px' }}>
                        {col.filter || null}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <Table.Tr key={makeKey(item)}>
                        {visibleColumns.map((col) => (
                          <Table.Td key={col.key}>{col.render(item)}</Table.Td>
                        ))}
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={visibleColumns.length}>
                        <Text ta="center" c="dimmed">
                          No data available
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>

          <Group justify="space-between" align="center">
            <Group gap="md" align="center">
              <Group gap="sm" align="center">
                <Text size="sm" c="dimmed">
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
              <Group gap={6} align="center">
                <Text size="sm" c="dimmed">
                  Total rows:
                </Text>
                <Text size="sm" fw={600}>
                  {data.length}
                </Text>
              </Group>
            </Group>

            <Group gap="xs">
              <Button variant="light" size="xs" onClick={handleResetAll} leftSection={<IconRefresh size={14} />}>
                Reset Columns/Sort
              </Button>
              <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} size="sm" radius="md" withEdges />
            </Group>
          </Group>
        </Stack>
      </Card>

      {modal.open && modal.type === 'status' && (
        <Card shadow="sm" padding="md" radius="md" withBorder mt="md">
          <Group justify="space-between" align="center" mb="sm">
            <Group gap={6} align="center">
              <IconSettings size={18} color="#2563eb" />
              <Text fw={600}>Update Status & Amount</Text>
            </Group>
            <Button variant="subtle" color="gray" size="xs" onClick={closeModal}>
              Close
            </Button>
          </Group>
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Transaction ID: {modal.record?.transactionid || '-'}
            </Text>
            <Checkbox
              label="Change Amount"
              checked={modal.chgAmt}
              onChange={(e) => setModal((prev) => ({ ...prev, chgAmt: e.currentTarget.checked, amount: '' }))}
              disabled={modal.status === '1'}
            />
            {modal.chgAmt && (
              <TextInput
                label="Amount"
                type="number"
                value={modal.amount}
                onChange={(e) => setModal((prev) => ({ ...prev, amount: e.currentTarget.value }))}
                style={{ maxWidth: 220 }}
              />
            )}
            <Checkbox
              label="Change Status"
              checked={modal.chgChk}
              onChange={(e) => setModal((prev) => ({ ...prev, chgChk: e.currentTarget.checked, status: '' }))}
            />
            {modal.chgChk && (
              <Radio.Group
                value={modal.status}
                onChange={(value) => {
                  if (value === '1') {
                    setModal((prev) => ({ ...prev, status: value, chgAmt: false, amount: '' }));
                  } else {
                    setModal((prev) => ({ ...prev, status: value }));
                  }
                }}
                label="Select status"
              >
                <Group gap="lg">
                  <Radio value="0" label="Success" />
                  <Radio value="1" label="Fail" />
                </Group>
              </Radio.Group>
            )}
            <Group gap="xs" mt="sm">
              <Button color="teal" leftSection={<IconSend size={16} />} onClick={handleSubmitStatus}>
                Submit
              </Button>
              <Button variant="light" color="gray" onClick={closeModal}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {modal.open && modal.type === 'notes3' && (
        <Card shadow="sm" padding="md" radius="md" withBorder mt="md">
          <Group justify="space-between" align="center" mb="sm">
            <Group gap={6} align="center">
              <IconEdit size={18} color="#2563eb" />
              <Text fw={600}>Edit Notes 3</Text>
            </Group>
            <Button variant="subtle" color="gray" size="xs" onClick={closeModal}>
              Close
            </Button>
          </Group>
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Transaction ID: {modal.record?.transactionid || '-'}
            </Text>
            <TextInput
              label="Notes 3"
              value={modal.notes3}
              onChange={(e) => setModal((prev) => ({ ...prev, notes3: e.currentTarget.value }))}
            />
            <Group gap="xs" mt="sm">
              <Button color="teal" leftSection={<IconSend size={16} />} onClick={() => handleSubmitNotes('notes3')}>
                Submit
              </Button>
              <Button variant="light" color="gray" onClick={closeModal}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {modal.open && modal.type === 'notes2' && (
        <Card shadow="sm" padding="md" radius="md" withBorder mt="md">
          <Group justify="space-between" align="center" mb="sm">
            <Group gap={6} align="center">
              <IconEdit size={18} color="#2563eb" />
              <Text fw={600}>Edit Notes 2</Text>
            </Group>
            <Button variant="subtle" color="gray" size="xs" onClick={closeModal}>
              Close
            </Button>
          </Group>
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Transaction ID: {modal.record?.transactionid || '-'}
            </Text>
            <TextInput
              label="Notes 2"
              value={modal.notes2}
              onChange={(e) => setModal((prev) => ({ ...prev, notes2: e.currentTarget.value }))}
            />
            <Group gap="xs" mt="sm">
              <Button color="teal" leftSection={<IconSend size={16} />} onClick={() => handleSubmitNotes('notes2')}>
                Submit
              </Button>
              <Button variant="light" color="gray" onClick={closeModal}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </Card>
      )}
    </Box>
  );
};

export default UpdateTransactionStatusNew;
