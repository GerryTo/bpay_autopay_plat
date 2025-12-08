import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { Popover } from '@mantine/core';
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import {
  IconAlertTriangle,
  IconCalendar,
  IconCircleCheck,
  IconFilter,
  IconPlayerStop,
  IconRefresh,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { depositAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const defaultFilters = {
  agent: '',
  bank: '',
  isCheckDeposit: '',
  lastCheckDeposit: '',
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const MybankCheckDeposit = () => {
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
  const [actingKey, setActingKey] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState({
    futuretrxid: '',
    idsText: '',
    agent: '',
    bank: '',
  });

  const makeKey = (item) => `${item.agent || ''}-${item.bank || ''}`;

  const handleFilterChange = useCallback((key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
  }, []);

  const fetchList = async ({ silent = false } = {}) => {
    const start = dateRange?.[0]?.startDate;
    const end = dateRange?.[0]?.endDate;
    if (!start || !end) {
      showNotification({
        title: 'Validation',
        message: 'Please select a date range first',
        Color: 'yellow',
      });
      return;
    }

    const from = dayjs(start).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const to = dayjs(end).endOf('day').format('YYYY-MM-DD HH:mm:ss');

    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await depositAPI.getMybankCheckDepositList({ from, to });
      if (response.success && response.data) {
        const payload = response.data;
        const records = Array.isArray(payload.records)
          ? payload.records
          : Array.isArray(payload.data)
            ? payload.data
            : [];

        const normalized = records.map((item) => ({
          ...item,
          agent: item.agent ?? item.account ?? '',
          bank: item.bank ?? item.bankcode ?? '',
          totalResubmitNotMatch:
            Number(
              item.totalResubmitNotMatch ??
                item.total_resubmit_notmatch ??
                item.totalResubmitNotmatch ??
                0
            ) || 0,
          totalResubmitMatch:
            Number(item.totalResubmitMatch ?? item.total_resubmit_match ?? 0) || 0,
          isCheckDeposit:
            Number(item.isCheckDeposit ?? item.ischeckdeposit ?? item.is_check_deposit ?? 0) || 0,
          lastCheckDeposit: item.lastCheckDeposit ?? item.last_check_deposit ?? '',
          phonenumber: item.phonenumber ?? item.phoneNumber ?? '',
          futuretrxid: item.futuretrxid ?? '',
        }));

        setData(normalized);
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load Mybank check deposit list',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Mybank check deposit fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load Mybank check deposit list',
        Color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureAutomationOnline = async (item) => {
    const phoneNumber = item.phonenumber || item.phoneNumber || '';
    const bankCode = item.bank || item.bankcode || '';

    if (!phoneNumber || !bankCode) {
      showNotification({
        title: 'Info',
        message: 'Missing phone number or bank code for automation check',
        Color: 'yellow',
      });
      return false;
    }

    try {
      const response = await depositAPI.checkAutomationLive({ phoneNumber, bankCode });
      if (response.success) {
        const payload = response.data || {};
        const online =
          (payload.status || '').toLowerCase() === 'ok' && Boolean(payload.records);
        if (!online) {
          showNotification({
            title: 'Automation Offline',
            message: payload.message || 'Automation is offline, please turn on and try again',
            Color: 'yellow',
          });
        }
        return online;
      }
      showNotification({
        title: 'Error',
        message: response.error || 'Failed to verify automation status',
        Color: 'red',
      });
      return false;
    } catch (error) {
      console.error('Check automation online error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to verify automation status',
        Color: 'red',
      });
      return false;
    }
  };

  const handleToggleStatus = async (item, status) => {
    if (status === 1 && Number(item.isCheckDeposit) === 1) {
      showNotification({
        title: 'Info',
        message: 'Please stop the current check before starting again',
        Color: 'yellow',
      });
      return;
    }

    setActingKey(makeKey(item));
    try {
      const isOnline = await ensureAutomationOnline(item);
      if (!isOnline) {
        return;
      }

      const start = dayjs(dateRange?.[0]?.startDate || new Date())
        .startOf('day')
        .format('YYYY-MM-DD HH:mm:ss');
      const end = dayjs(dateRange?.[0]?.endDate || new Date())
        .endOf('day')
        .format('YYYY-MM-DD HH:mm:ss');

      const response = await depositAPI.setCheckDepositStatus({
        agent: item.agent,
        bank: item.bank,
        status,
        dateFrom: start,
        dateTo: end,
      });

      if (response.success) {
        const payload = response.data || {};
        const ok = (payload.status || '').toLowerCase?.() === 'ok';
        showNotification({
          title: ok ? 'Success' : 'Info',
          message: payload.message || (ok ? 'Status updated' : 'Unable to update status'),
          Color: ok ? 'green' : 'yellow',
        });
        await fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update status',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Toggle check deposit status error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update status',
        Color: 'red',
      });
    } finally {
      setActingKey('');
    }
  };

  const openNotFoundModal = (item) => {
    setModalPayload({
      futuretrxid: item.futuretrxid || '',
      idsText: '',
      agent: item.agent || '',
      bank: item.bank || '',
    });
    setModalOpen(true);
  };

  const handleSubmitNotFound = async () => {
    const ids = (modalPayload.idsText || '')
      .split(/[\n,]+/)
      .map((val) => val.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      showNotification({
        title: 'Validation',
        message: 'Please provide at least one transaction id',
        Color: 'yellow',
      });
      return;
    }

    setActingKey('modal');
    try {
      const response = await depositAPI.matchDepositQueue({
        futuretrxid: modalPayload.futuretrxid || '',
        ids,
      });
      if (response.success) {
        const payload = response.data || {};
        const ok = (payload.status || '').toLowerCase?.() === 'ok';
        showNotification({
          title: ok ? 'Success' : 'Info',
          message: payload.message || (ok ? 'Submitted' : 'Request processed'),
          Color: ok ? 'green' : 'yellow',
        });
        if (ok) {
          setModalOpen(false);
          setModalPayload({
            futuretrxid: '',
            idsText: '',
            agent: '',
            bank: '',
          });
          await fetchList({ silent: true });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to submit mapping',
          Color: 'red',
        });
      }
    } catch (error) {
      console.error('Submit not found mapping error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to submit mapping request',
        Color: 'red',
      });
    } finally {
      setActingKey('');
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'agent',
        label: 'Agent',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.agent || '-'}
          </Text>
        ),
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
        key: 'bank',
        label: 'Bank',
        minWidth: 120,
        render: (item) => (
          <Badge
            color="blue"
            variant="light"
          >
            {item.bank || '-'}
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
        key: 'totalResubmitNotMatch',
        label: 'Total Resubmit Not Match',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.totalResubmitNotMatch)}
          </Text>
        ),
      },
      {
        key: 'totalResubmitMatch',
        label: 'Transaction Match',
        minWidth: 160,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.totalResubmitMatch)}
          </Text>
        ),
      },
      {
        key: 'isCheckDeposit',
        label: 'Is Recrawling',
        minWidth: 140,
        render: (item) => (
          <Badge
            color={Number(item.isCheckDeposit) === 1 ? 'green' : 'gray'}
            variant="light"
          >
            {Number(item.isCheckDeposit) === 1 ? 'Yes' : 'No'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Yes / No"
            size="xs"
            value={columnFilters.isCheckDeposit}
            onChange={(e) =>
              handleFilterChange('isCheckDeposit', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastCheckDeposit',
        label: 'Last Check',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.lastCheckDeposit || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter last check..."
            size="xs"
            value={columnFilters.lastCheckDeposit}
            onChange={(e) =>
              handleFilterChange('lastCheckDeposit', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'actions',
        label: 'Action',
        minWidth: 260,
        disableMenu: true,
        render: (item) => {
          const rowKey = makeKey(item);
          const busy = actingKey === rowKey || loading;
          return (
            <Group gap="xs">
              <Button
                size="xs"
                color="blue"
                variant="light"
                leftSection={<IconCircleCheck size={16} />}
                onClick={() => handleToggleStatus(item, 1)}
                loading={busy}
              >
                Check
              </Button>
              <Button
                size="xs"
                color="orange"
                variant="light"
                leftSection={<IconPlayerStop size={16} />}
                onClick={() => handleToggleStatus(item, 0)}
                loading={busy}
              >
                Stop
              </Button>
              <Button
                size="xs"
                color="red"
                variant="light"
                leftSection={<IconAlertTriangle size={16} />}
                onClick={() => openNotFoundModal(item)}
                disabled={loading}
              >
                Trx not found
              </Button>
            </Group>
          );
        },
      },
    ],
    [
      actingKey,
      columnFilters,
      handleFilterChange,
      handleToggleStatus,
      openNotFoundModal,
      loading,
    ]
  );

  const {
    visibleColumns,
    sortConfig,
    handleHideColumn,
    handleSort,
    handleResetAll,
  } = useTableControls(columns, {
    onResetFilters: resetFilters,
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        const recrawlText = Number(item.isCheckDeposit) === 1 ? 'yes' : 'no';
        return (
          includesValue(item.agent, columnFilters.agent) &&
          includesValue(item.bank, columnFilters.bank) &&
          includesValue(item.lastCheckDeposit, columnFilters.lastCheckDeposit) &&
          includesValue(recrawlText, columnFilters.isCheckDeposit || '')
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

  const totals = useMemo(
    () => ({
      notMatch: sortedData.reduce(
        (acc, curr) => acc + (Number(curr.totalResubmitNotMatch) || 0),
        0
      ),
      match: sortedData.reduce(
        (acc, curr) => acc + (Number(curr.totalResubmitMatch) || 0),
        0
      ),
      recrawling: sortedData.reduce(
        (acc, curr) => acc + (Number(curr.isCheckDeposit) || 0),
        0
      ),
      rows: sortedData.length,
    }),
    [sortedData]
  );

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
                Mybank Check Deposit
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Monitor recrawling status and unresolved transactions
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
                onClick={() => {
                  handleResetAll();
                  resetFilters();
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
                      {format(dateRange[0].startDate, 'dd MMM yyyy')} -{' '}
                      {format(dateRange[0].endDate, 'dd MMM yyyy')}
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
                  leftSection={<IconCircleCheck size={18} />}
                  radius="md"
                  color="blue"
                >
                  Apply
                </Button>
              </Group>

              <Divider />

              <Text
                size="sm"
                c="dimmed"
              >
                Columns are filterable and sortable; totals are shown in the footer.
              </Text>
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
                          gap={8}
                          align="center"
                        >
                          <Text
                            size="sm"
                            fw={600}
                          >
                            {col.label}
                          </Text>
                          {!col.disableMenu && (
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
                  {sortedData.length > 0 ? (
                    sortedData.map((item) => {
                      const key = makeKey(item);
                      return (
                        <Table.Tr key={key}>
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
                    {visibleColumns.map((col) => {
                      switch (col.key) {
                        case 'agent':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              Totals ({totals.rows}{' '}
                              {totals.rows === 1 ? 'row' : 'rows'})
                            </Table.Th>
                          );
                        case 'bank':
                          return (
                            <Table.Th key={`foot-${col.key}`}>-</Table.Th>
                          );
                        case 'totalResubmitNotMatch':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.notMatch)}
                            </Table.Th>
                          );
                        case 'totalResubmitMatch':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.match)}
                            </Table.Th>
                          );
                        case 'isCheckDeposit':
                          return (
                            <Table.Th key={`foot-${col.key}`}>
                              {formatNumber(totals.recrawling)}
                            </Table.Th>
                          );
                        case 'lastCheckDeposit':
                          return (
                            <Table.Th key={`foot-${col.key}`}>-</Table.Th>
                          );
                        case 'actions':
                          return <Table.Th key={`foot-${col.key}`} />;
                        default:
                          return <Table.Th key={`foot-${col.key}`}>-</Table.Th>;
                      }
                    })}
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </ScrollArea>
          </Box>
        </Stack>
      </Card>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActingKey('');
        }}
        title="Map Transaction (Not Found)"
        size="lg"
        centered
      >
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm">
              Agent: <strong>{modalPayload.agent || '-'}</strong>
            </Text>
            <Text size="sm">
              Bank: <strong>{modalPayload.bank || '-'}</strong>
            </Text>
          </Group>
          <TextInput
            label="Future Trx ID"
            placeholder="Future transaction id"
            value={modalPayload.futuretrxid}
            onChange={(e) =>
              setModalPayload((prev) => ({ ...prev, futuretrxid: e.currentTarget.value }))
            }
          />
          <Textarea
            label="Mutation IDs"
            description="Comma or newline separated mutation IDs to match"
            minRows={3}
            placeholder="123, 456, 789"
            value={modalPayload.idsText}
            onChange={(e) =>
              setModalPayload((prev) => ({ ...prev, idsText: e.currentTarget.value }))
            }
          />
          <Group justify="flex-end" gap="sm" mt="sm">
            <Button
              variant="light"
              color="gray"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleSubmitNotFound}
              loading={actingKey === 'modal'}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default MybankCheckDeposit;
