import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  Popover,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconFilter, IconMessage, IconRefresh, IconCalendar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Calendar } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { smsAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const typeOptions = [
  { value: '0', label: 'All' },
  { value: '1', label: 'Successfully Match' },
  { value: '2', label: 'SMS need to check' },
  { value: '3', label: 'Unwanted SMS' },
  { value: '4', label: 'SMS Balance' },
  { value: '5', label: 'SMS Filtered' },
];

const defaultFilters = {
  timestamp: '',
  timestampBdt: '',
  from: '',
  username: '',
  alias: '',
  phonenumber: '',
  type: '',
  securitycode: '',
  customerphone: '',
  servicecenter: '',
  amount: '',
  message: '',
  transactiontype: '',
  smsid: '',
  futuretrxid: '',
  suspectedreason: '',
  balance: '',
  balancecalculate: '',
  balancediff: '',
  matchmanually: '',
  matchdate: '',
};

const formatNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value || '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const SmsLog = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [type, setType] = useState('2');
  const [user, setUser] = useState('');
  const [phoneUsers, setPhoneUsers] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setColumnFilters(defaultFilters);
  }, []);

  const handleResetAllFilters = () => {
    handleClearFilters();
    setSelectedDate(new Date());
    setDatePickerOpened(false);
    setType('2');
    setUser('');
    setData([]);
  };

  const columns = useMemo(
    () => [
      {
        key: 'timestamp',
        label: 'Timestamp',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.timestamp || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp..."
            size="xs"
            value={columnFilters.timestamp}
            onChange={(e) =>
              handleFilterChange('timestamp', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'timestampBdt',
        label: 'Timestamp (BDT)',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.timestampBdt || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter timestamp BDT..."
            size="xs"
            value={columnFilters.timestampBdt}
            onChange={(e) =>
              handleFilterChange('timestampBdt', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'from',
        label: 'From',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.from || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter from..."
            size="xs"
            value={columnFilters.from}
            onChange={(e) => handleFilterChange('from', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'username',
        label: 'Username',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.username || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter username..."
            size="xs"
            value={columnFilters.username}
            onChange={(e) =>
              handleFilterChange('username', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'alias',
        label: 'Alias',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.alias || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter alias..."
            size="xs"
            value={columnFilters.alias}
            onChange={(e) => handleFilterChange('alias', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'phonenumber',
        label: 'Phone Number',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.phonenumber || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter phone number..."
            size="xs"
            value={columnFilters.phonenumber}
            onChange={(e) =>
              handleFilterChange('phonenumber', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'type',
        label: 'Bank',
        minWidth: 110,
        render: (item) => <Text size="sm">{item.type || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.type}
            onChange={(e) => handleFilterChange('type', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'securitycode',
        label: 'Trx ID',
        minWidth: 130,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.securitycode || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter trx id..."
            size="xs"
            value={columnFilters.securitycode}
            onChange={(e) =>
              handleFilterChange('securitycode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'customerphone',
        label: 'Customer Phone',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.customerphone || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter customer phone..."
            size="xs"
            value={columnFilters.customerphone}
            onChange={(e) =>
              handleFilterChange('customerphone', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'servicecenter',
        label: 'Service Center',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.servicecenter || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter service center..."
            size="xs"
            value={columnFilters.servicecenter}
            onChange={(e) =>
              handleFilterChange('servicecenter', e.currentTarget.value)
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
            ta="right"
          >
            {formatNumber(item.amount)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter amount..."
            size="xs"
            value={columnFilters.amount}
            onChange={(e) =>
              handleFilterChange('amount', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'message',
        label: 'Message',
        minWidth: 220,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
          >
            {item.message || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter message..."
            size="xs"
            value={columnFilters.message}
            onChange={(e) =>
              handleFilterChange('message', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'transactiontype',
        label: 'Transaction Type',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.transactiontype || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter transaction type..."
            size="xs"
            value={columnFilters.transactiontype}
            onChange={(e) =>
              handleFilterChange('transactiontype', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'smsid',
        label: 'SMS ID',
        minWidth: 120,
        render: (item) => <Text size="sm">{item.smsid || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter SMS ID..."
            size="xs"
            value={columnFilters.smsid}
            onChange={(e) => handleFilterChange('smsid', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'futuretrxid',
        label: 'Future Trx ID',
        minWidth: 130,
        render: (item) => {
          const isExpired =
            item.futuretrxid === '-1' || item.futuretrxid === -1;
          return (
            <Text
              size="sm"
              fw={600}
              c={isExpired ? 'red' : undefined}
            >
              {isExpired ? 'Expired' : item.futuretrxid || '-'}
            </Text>
          );
        },
        filter: (
          <TextInput
            placeholder="Filter future trx..."
            size="xs"
            value={columnFilters.futuretrxid}
            onChange={(e) =>
              handleFilterChange('futuretrxid', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'suspectedreason',
        label: 'Suspect Reason',
        minWidth: 200,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
          >
            {item.suspectedreason || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter reason..."
            size="xs"
            value={columnFilters.suspectedreason}
            onChange={(e) =>
              handleFilterChange('suspectedreason', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'balance',
        label: 'Balance',
        minWidth: 120,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.balance)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter balance..."
            size="xs"
            value={columnFilters.balance}
            onChange={(e) =>
              handleFilterChange('balance', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'balancecalculate',
        label: 'Balance Calculate',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.balancecalculate)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter balance calc..."
            size="xs"
            value={columnFilters.balancecalculate}
            onChange={(e) =>
              handleFilterChange('balancecalculate', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'balancediff',
        label: 'Balance Different',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            ta="right"
          >
            {formatNumber(item.balancediff)}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter balance diff..."
            size="xs"
            value={columnFilters.balancediff}
            onChange={(e) =>
              handleFilterChange('balancediff', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'matchmanually',
        label: 'Match Manually',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.matchmanually || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter match manually..."
            size="xs"
            value={columnFilters.matchmanually}
            onChange={(e) =>
              handleFilterChange('matchmanually', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'matchdate',
        label: 'Match Date',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.matchdate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter match date..."
            size="xs"
            value={columnFilters.matchdate}
            onChange={(e) =>
              handleFilterChange('matchdate', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: 200,
        render: (item) => (
          <Group
            gap={6}
            wrap="wrap"
          >
            <Button
              size="xs"
              variant="light"
              color="blue"
              disabled={
                !!item.futuretrxid &&
                item.futuretrxid !== '' &&
                item.futuretrxid !== '-1'
              }
              onClick={() => handleMatch(item)}
            >
              Match
            </Button>
            <Button
              size="xs"
              variant="light"
              color="orange"
              disabled={item.futuretrxid && item.futuretrxid !== ''}
              onClick={() => handleExpire(item)}
            >
              Expire
            </Button>
          </Group>
        ),
      },
    ],
    [columnFilters, handleFilterChange]
  );

  const {
    visibleColumns,
    sortConfig,
    handleHideColumn,
    handleSort,
    handleResetAll,
  } = useTableControls(columns, {
    onResetFilters: handleResetAllFilters,
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.timestamp, columnFilters.timestamp) &&
          includesValue(item.timestampBdt, columnFilters.timestampBdt) &&
          includesValue(item.from, columnFilters.from) &&
          includesValue(item.username, columnFilters.username) &&
          includesValue(item.alias, columnFilters.alias) &&
          includesValue(item.phonenumber, columnFilters.phonenumber) &&
          includesValue(item.type, columnFilters.type) &&
          includesValue(item.securitycode, columnFilters.securitycode) &&
          includesValue(item.customerphone, columnFilters.customerphone) &&
          includesValue(item.servicecenter, columnFilters.servicecenter) &&
          includesValue(item.amount, columnFilters.amount) &&
          includesValue(item.message, columnFilters.message) &&
          includesValue(item.transactiontype, columnFilters.transactiontype) &&
          includesValue(item.smsid, columnFilters.smsid) &&
          includesValue(item.futuretrxid, columnFilters.futuretrxid) &&
          includesValue(item.suspectedreason, columnFilters.suspectedreason) &&
          includesValue(item.balance, columnFilters.balance) &&
          includesValue(
            item.balancecalculate,
            columnFilters.balancecalculate
          ) &&
          includesValue(item.balancediff, columnFilters.balancediff) &&
          includesValue(item.matchmanually, columnFilters.matchmanually) &&
          includesValue(item.matchdate, columnFilters.matchdate)
        );
      }),
    [data, columnFilters]
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) {
      return [...filteredData].sort((a, b) => {
        const av = a.timestamp ?? '';
        const bv = b.timestamp ?? '';
        if (av === bv) return 0;
        return av > bv ? -1 : 1;
      });
    }
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

  useEffect(() => {
    const fetchPhoneUsers = async () => {
      const response = await smsAPI.getPhoneUserList();
      if (
        response.success &&
        response.data &&
        response.data.status?.toLowerCase() === 'ok'
      ) {
        setPhoneUsers(
          Array.isArray(response.data.records) ? response.data.records : []
        );
      }
    };
    fetchPhoneUsers();
  }, []);

  const fetchData = async ({ silent = false } = {}) => {
    const date = selectedDate;

    if (!date) {
      showNotification({
        title: 'Validation',
        message: 'Please select a date',
        color: 'yellow',
      });
      return;
    }

    const from = `${dayjs(date).format('YYYY-MM-DD')} 00:00:00`;
    const to = `${dayjs(date).format('YYYY-MM-DD')} 23:59:59`;

    silent ? setRefreshing(true) : setLoading(true);

    try {
      const response = await smsAPI.getLogList({
        datefrom: from,
        dateto: to,
        type,
        user,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records)
            ? response.data.records
            : [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load SMS log data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load SMS log data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('SMS log fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load SMS log data',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExpire = async (item) => {
    const confirmed = window.confirm('Expire this SMS?');
    if (!confirmed) return;

    setRefreshing(true);
    try {
      const response = await smsAPI.expireSms({
        amount: item.amount,
        bank: item.type,
        trxid: item.securitycode,
        phonenumber: item.customerphone,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: 'SMS expired',
            color: 'green',
          });
          fetchData({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to expire SMS',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to expire SMS',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('SMS expire error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to expire SMS',
        color: 'red',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleMatch = async (item) => {
    const futuretrxid = window.prompt('Enter Future Trx ID to match with');
    if (!futuretrxid) return;

    setRefreshing(true);
    try {
      const response = await smsAPI.matchSms({
        futuretrxid,
        amount: item.amount,
        bank: item.type,
        trxid: item.securitycode,
        phonenumber: item.customerphone,
      });

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          showNotification({
            title: 'Success',
            message: 'SMS matched successfully',
            color: 'green',
          });
          fetchData({ silent: true });
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to match SMS',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to match SMS',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('SMS match error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to match SMS',
        color: 'red',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, item) => {
          acc.rows += 1;
          acc.amount += Number(item.amount) || 0;
          acc.balance += Number(item.balance) || 0;
          acc.balancecalculate += Number(item.balancecalculate) || 0;
          acc.balancediff += Number(item.balancediff) || 0;
          return acc;
        },
        { rows: 0, amount: 0, balance: 0, balancecalculate: 0, balancediff: 0 }
      ),
    [filteredData]
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
        />

        <Stack gap="lg">
          <Group
            justify="space-between"
            align="flex-start"
          >
            <Stack gap={4}>
              <Group gap={8}>
                <IconMessage size={22} />
                <Text
                  size="xl"
                  fw={700}
                >
                  SMS Log
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                View SMS logs by date range, status, and phone user. Totals stay
                in the footer.
              </Text>
            </Stack>

            <Group gap="xs">
              <Button
                variant="light"
                color="gray"
                radius="md"
                size="sm"
                leftSection={<IconFilter size={18} />}
                onClick={handleResetAll}
              >
                Reset Filters
              </Button>
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
            </Group>
          </Group>

          <Card
            withBorder
            radius="md"
            padding="md"
            shadow="xs"
          >
            <Group
            align="flex-end"
            gap="md"
            wrap="wrap"
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
                    {format(selectedDate, 'dd MMM yyyy')}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown p={0}>
                  <Paper>
                    <Calendar
                      date={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      maxDate={new Date()}
                    />
                  </Paper>
                </Popover.Dropdown>
              </Popover>
              <Select
                label="Type"
                data={typeOptions}
                value={type}
                onChange={(value) => setType(value || '2')}
                placeholder="Select type"
                style={{ minWidth: 200 }}
              />
              <Select
                label="Phone User"
                data={[
                  { value: '', label: '- ALL -' },
                  ...phoneUsers.map((item) => ({
                    value: item.user,
                    label: item.user,
                  })),
                ]}
                value={user}
                onChange={(value) => setUser(value || '')}
                placeholder="Select phone user"
                searchable
                style={{ minWidth: 200 }}
              />
              {/* <Group gap="xs">
                <Button
                  leftSection={<IconSearch size={18} />}
                  color="blue"
                  radius="md"
                  onClick={() => fetchData()}
                >
                  Search
                </Button>
              </Group> */}
            </Group>
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
                      <Table.Tr key={`${item.securitycode || idx}-${idx}`}>
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
                    {visibleColumns.map((col, index) => {
                      if (col.key === 'amount') {
                        return (
                          <Table.Th
                            key={`${col.key}-footer`}
                            style={{ textAlign: 'right' }}
                          >
                            {formatNumber(totals.amount)}
                          </Table.Th>
                        );
                      }
                      if (col.key === 'balance') {
                        return (
                          <Table.Th
                            key={`${col.key}-footer`}
                            style={{ textAlign: 'right' }}
                          >
                            {formatNumber(totals.balance)}
                          </Table.Th>
                        );
                      }
                      if (col.key === 'balancecalculate') {
                        return (
                          <Table.Th
                            key={`${col.key}-footer`}
                            style={{ textAlign: 'right' }}
                          >
                            {formatNumber(totals.balancecalculate)}
                          </Table.Th>
                        );
                      }
                      if (col.key === 'balancediff') {
                        return (
                          <Table.Th
                            key={`${col.key}-footer`}
                            style={{ textAlign: 'right' }}
                          >
                            {formatNumber(totals.balancediff)}
                          </Table.Th>
                        );
                      }
                      // if (index === 0) {
                      //   return (
                      //     <Table.Th key={`${col.key}-footer`}>
                      //       Totals (Rows: {totals.rows})
                      //     </Table.Th>
                      //   );
                      // }
                      return <Table.Th key={`${col.key}-footer`} />;
                    })}
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
                c="dimmed"
              >
                Total Rows: {totals.rows}
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
    </Box>
  );
};

export default SmsLog;
