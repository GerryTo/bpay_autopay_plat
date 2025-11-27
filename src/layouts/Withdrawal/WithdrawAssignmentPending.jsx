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
import { Popover } from '@mantine/core';
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  IconCalendar,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconUserShield,
} from '@tabler/icons-react';
import { withdrawAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  insert: '',
  futuretrxid: '',
  merchantcode: '',
  amount: '',
  bankcode: '',
  sourcebankcode: '',
  accountno: '',
  sourceaccountname: '',
  transactionid: '',
  agentAlias: '',
  selisih: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const WithdrawAssignmentPending = () => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [assignForm, setAssignForm] = useState({
    accountNo: '',
    bankCode: '',
    accountName: '',
    username: '',
  });

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'insert',
        label: 'Assignment Timestamp',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.insert}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp..."
            size="xs"
            value={columnFilters.insert}
            onChange={(e) => handleFilterChange('insert', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'futuretrxid',
        label: 'Future Trx ID',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.futuretrxid}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={columnFilters.futuretrxid}
            onChange={(e) =>
              handleFilterChange('futuretrxid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'merchantcode',
        label: 'Merchant',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.merchantcode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter merchant..."
            size="xs"
            value={columnFilters.merchantcode}
            onChange={(e) =>
              handleFilterChange('merchantcode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            className="grid-alignright"
          >
            {formatNumber(item.amount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter amount..."
            size="xs"
            value={columnFilters.amount}
            onChange={(e) => handleFilterChange('amount', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'bankcode',
        label: 'Bank',
        minWidth: 90,
        render: (item) => (
          <Badge
            color="blue"
            variant="light"
          >
            {item.bankcode || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bankcode}
            onChange={(e) =>
              handleFilterChange('bankcode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'sourcebankcode',
        label: 'Source Bank',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.sourcebankcode || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter source bank..."
            size="xs"
            value={columnFilters.sourcebankcode}
            onChange={(e) =>
              handleFilterChange('sourcebankcode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'accountno',
        label: 'Source Account',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.accountno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter account..."
            size="xs"
            value={columnFilters.accountno}
            onChange={(e) => handleFilterChange('accountno', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'sourceaccountname',
        label: 'Source Account Name',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.sourceaccountname || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter name..."
            size="xs"
            value={columnFilters.sourceaccountname}
            onChange={(e) =>
              handleFilterChange('sourceaccountname', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'transactionid',
        label: 'Transaction ID',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.transactionid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter transaction..."
            size="xs"
            value={columnFilters.transactionid}
            onChange={(e) =>
              handleFilterChange('transactionid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'agentAlias',
        label: 'Agent Assign',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.agentAlias || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.agentAlias}
            onChange={(e) =>
              handleFilterChange('agentAlias', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'selisih',
        label: 'Pending Time (min)',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.selisih || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter pending..."
            size="xs"
            value={columnFilters.selisih}
            onChange={(e) => handleFilterChange('selisih', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: 160,
        render: (item) => (
          <Button
            size="xs"
            variant="light"
            color="blue"
            leftSection={<IconUserShield size={14} />}
            onClick={() => openAssignModal(item)}
          >
            Assign
          </Button>
        ),
      },
    ],
    [columnFilters]
  );

  const { visibleColumns, sortConfig, handleHideColumn, handleSort, handleResetAll } =
    useTableControls(columns, {
      onResetFilters: () => setColumnFilters(defaultFilters),
    });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.insert, columnFilters.insert) &&
          includesValue(item.futuretrxid, columnFilters.futuretrxid) &&
          includesValue(item.merchantcode, columnFilters.merchantcode) &&
          includesValue(item.amount, columnFilters.amount) &&
          includesValue(item.bankcode, columnFilters.bankcode) &&
          includesValue(item.sourcebankcode, columnFilters.sourcebankcode) &&
          includesValue(item.accountno, columnFilters.accountno) &&
          includesValue(item.sourceaccountname, columnFilters.sourceaccountname) &&
          includesValue(item.transactionid, columnFilters.transactionid) &&
          includesValue(item.agentAlias, columnFilters.agentAlias) &&
          includesValue(item.selisih, columnFilters.selisih)
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

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const decodeRecord = (record) =>
    Object.entries(record || {}).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        try {
          acc[key] = decodeURIComponent(value);
        } catch (_) {
          acc[key] = value;
        }
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

  const mapRecords = (records = []) =>
    records.map((item) => ({
      ...item,
      amount: Number(item.amount) || 0,
    }));

  const fetchList = useCallback(
    async ({ silent = false } = {}) => {
      const start = dateRange?.[0]?.startDate;
      const end = dateRange?.[0]?.endDate || start;
      if (!start || !end) {
        showNotification({
          title: 'Validation',
          message: 'Please select date range',
          color: 'yellow',
        });
        return;
      }

      silent ? setRefreshing(true) : setLoading(true);

      try {
        const payloadFrom = format(start, 'yyyy-MM-dd');
        const payloadTo = format(end, 'yyyy-MM-dd');
        const response = await withdrawAPI.getWithdrawAssignmentPending(payloadFrom, payloadTo);

        if (response.success && response.data) {
          const payload = response.data;
          if ((payload.status || '').toLowerCase() === 'ok') {
            const records = Array.isArray(payload.records) ? payload.records : [];
            const decoded = records.map(decodeRecord);
            setData(mapRecords(decoded));
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load assignment pending list',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.error || 'Failed to load assignment pending list',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Assignment pending list fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load assignment pending list',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange]
  );

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openAssignModal = (item) => {
    setSelectedRow(item);
    setAssignForm({
      accountNo: '',
      bankCode: item.bankcode || '',
      accountName: '',
      username: '',
    });
    setAssignModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedRow) return;
    const { accountNo, bankCode, accountName, username } = assignForm;
    if (!accountNo || !bankCode || !accountName || !username) {
      showNotification({
        title: 'Validation',
        message: 'Please fill all assignment fields',
        color: 'yellow',
      });
      return;
    }
    setAssigning(true);
    try {
      const response = await withdrawAPI.assignWithdraw({
        id: selectedRow.futuretrxid || selectedRow.id,
        accountNo,
        bankCode,
        accountName,
        username,
      });
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: payload.message || 'Assignment success',
            color: 'green',
          });
          setAssignModalOpen(false);
          fetchList({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to assign',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to assign',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Assign withdraw pending error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to assign withdraw',
        color: 'red',
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleResetFiltersAll = () => {
    const now = new Date();
    setDateRange([
      {
        startDate: now,
        endDate: now,
        key: 'selection',
      },
    ]);
    setColumnFilters(defaultFilters);
    handleResetAll();
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
                Assignment Pending
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Pending assignment monitoring (styled like Deposit Pending)
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
                onClick={handleResetFiltersAll}
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
                <Popover
                  position="bottom-start"
                  opened={datePickerOpened}
                  onChange={setDatePickerOpened}
                  width="auto"
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    <Button
                      variant="light"
                      color="blue"
                      leftSection={<IconCalendar size={18} />}
                      onClick={() => setDatePickerOpened((o) => !o)}
                    >
                      {`${format(dateRange[0].startDate, 'dd MMM yyyy')} - ${format(
                        dateRange[0].endDate,
                        'dd MMM yyyy'
                      )}`}
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown p="sm">
                    <DateRangePicker
                      onChange={(ranges) => {
                        const selection = ranges.selection;
                        setDateRange([selection]);
                      }}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      maxDate={new Date()}
                    />
                  </Popover.Dropdown>
                </Popover>

                <Button
                  onClick={() => fetchList()}
                  leftSection={<IconSearch size={18} />}
                  radius="md"
                  color="blue"
                >
                  Apply
                </Button>
              </Group>

              <Group gap="sm">
                <Badge
                  variant="light"
                  color="gray"
                >
                  Records: {data.length}
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
                    {visibleColumns.map((col) => (
                      <Table.Th
                        key={col.key}
                        style={{ minWidth: col.minWidth || 120 }}
                      >
                        <Group
                          gap={6}
                          align="center"
                        >
                          <Text
                            size="sm"
                            fw={600}
                          >
                            {col.label}
                          </Text>
                          {col.key !== 'actions' && (
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
                    paginatedData.map((item) => (
                      <Table.Tr key={`${item.futuretrxid}-${item.insert}`}>
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
        opened={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Withdraw"
        centered
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            ID: {selectedRow?.futuretrxid || selectedRow?.id || '-'} | Bank:{' '}
            {selectedRow?.bankcode || '-'}
          </Text>
          <TextInput
            label="Account No"
            value={assignForm.accountNo}
            onChange={(e) =>
              setAssignForm((prev) => ({ ...prev, accountNo: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Bank Code"
            value={assignForm.bankCode}
            onChange={(e) =>
              setAssignForm((prev) => ({ ...prev, bankCode: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Account Name"
            value={assignForm.accountName}
            onChange={(e) =>
              setAssignForm((prev) => ({ ...prev, accountName: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Username"
            value={assignForm.username}
            onChange={(e) =>
              setAssignForm((prev) => ({ ...prev, username: e.currentTarget.value }))
            }
            required
          />
          <Group justify="flex-end" mt="sm">
            <Button
              variant="light"
              onClick={() => setAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              loading={assigning}
              onClick={handleAssign}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default WithdrawAssignmentPending;
