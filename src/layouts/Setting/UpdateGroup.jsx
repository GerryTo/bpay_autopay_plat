import { useCallback, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
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
import { IconDeviceFloppy, IconFilter, IconRefresh, IconSettings } from '@tabler/icons-react';
import { myBankAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const groupOptions = [
  { value: '1', label: 'Group 1' },
  { value: '2', label: 'Group 2' },
  { value: '3', label: 'Group 3' },
  { value: '4', label: 'Group 4' },
];

const defaultFilters = {
  accountName: '',
  accountNo: '',
  bankCode: '',
};

const UpdateGroup = () => {
  const [dateOptions, setDateOptions] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filter, setFilter] = useState({
    date: '',
    bank: '',
    group: '1',
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFilterChange = useCallback((key, value) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleTableFilterChange = useCallback((key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setDefaults = useCallback((dates, accountsList) => {
    setFilter((prev) => ({
      ...prev,
      date: prev.date || dates[0]?.value || '',
      bank: prev.bank || accountsList[0]?.value || '',
    }));
  }, []);

  const mapAccountOptions = (records = []) =>
    records.map((item) => {
      const bankaccountno = item.bankaccountno || '';
      const bankcode = item.bankcode || '';
      const value = `${bankaccountno} - ${bankcode}`;
      const label = item.bankaccountname
        ? `${item.bankaccountname} (${value})`
        : value;
      return {
        value,
        label,
        bankaccountno,
        bankcode,
        bankaccountname: item.bankaccountname || '',
      };
    });

  const fetchLists = useCallback(
    async ({ silent = false } = {}) => {
      silent ? setRefreshing(true) : setLoading(true);
      try {
        const [dateRes, accountRes] = await Promise.all([
          myBankAPI.getAvailableAccountDates(),
          myBankAPI.getMyBankList(),
        ]);

        if (dateRes.success && dateRes.data?.status?.toLowerCase?.() === 'ok') {
          const dateRecords = Array.isArray(dateRes.data.records)
            ? dateRes.data.records
            : [];
          const mappedDates = dateRecords.map((item) => ({
            value: item.date || '',
            label: item.date || '',
          }));
          setDateOptions(mappedDates);
        } else if (!dateRes.success) {
          showNotification({
            title: 'Error',
            message: dateRes.error || 'Failed to load date list',
            color: 'red',
          });
        } else {
          showNotification({
            title: 'Error',
            message: dateRes.data?.message || 'Failed to load date list',
            color: 'red',
          });
        }

        if (accountRes.success) {
          const payload = accountRes.data;
          const status = (payload?.status || '').toLowerCase();
          if (!payload?.status || status === 'ok') {
            const records = Array.isArray(payload.records) ? payload.records : [];
            const options = mapAccountOptions(records);
            setAccountOptions(options);
            setAccounts(records);
          } else {
            showNotification({
              title: 'Error',
              message: payload.message || 'Failed to load account list',
              color: 'red',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: accountRes.error || 'Failed to load account list',
            color: 'red',
          });
        }
      } catch (error) {
        console.error('Update Group fetch error:', error);
        showNotification({
          title: 'Error',
          message: 'Unable to load data',
          color: 'red',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  

  

  const handleReset = () => {
    setColumnFilters(defaultFilters);
    setCurrentPage(1);
    setItemsPerPage(10);
    setDefaults(dateOptions, accountOptions);
  };

  const handleSubmit = async () => {
    if (!filter.date || !filter.bank) {
      showNotification({
        title: 'Validation',
        message: 'Please choose a date and an account',
        color: 'yellow',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await myBankAPI.updateGroupPriority(filter);
      if (response.success && response.data) {
        showNotification({
          title: 'Info',
          message: response.data.message || 'Group updated successfully',
          color: (response.data.status || '').toLowerCase() === 'ok' ? 'green' : 'blue',
        });
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to update group',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Update group submit error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to update group priority',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      accounts.filter((item) => {
        return (
          includesValue(item.bankaccountname, columnFilters.accountName) &&
          includesValue(item.bankaccountno, columnFilters.accountNo) &&
          includesValue(item.bankcode, columnFilters.bankCode)
        );
      }),
    [accounts, columnFilters]
  );

  const columns = useMemo(
    () => [
      {
        key: 'bankaccountname',
        label: 'Account Name',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.bankaccountname || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter name..."
            size="xs"
            value={columnFilters.accountName}
            onChange={(e) => handleTableFilterChange('accountName', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'bankaccountno',
        label: 'Account No',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.bankaccountno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter account..."
            size="xs"
            value={columnFilters.accountNo}
            onChange={(e) => handleTableFilterChange('accountNo', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'bankcode',
        label: 'Bank Code',
        minWidth: 120,
        render: (item) => (
          <Badge
            variant="light"
            color="blue"
          >
            {item.bankcode || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bankCode}
            onChange={(e) => handleTableFilterChange('bankCode', e.currentTarget.value)}
          />
        ),
      },
    ],
    [columnFilters, handleTableFilterChange]
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

  

  

  return (
    <Box p="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        <LoadingOverlay
          visible={loading || submitting}
          overlayProps={{ radius: 'md', blur: 2 }}
          loaderProps={{ color: 'blue', type: 'dots' }}
        />

        <Stack gap="lg">
          <Group
            justify="space-between"
            align="center"
          >
            <Box>
              <Group gap={8}>
                <IconSettings
                  size={22}
                  color="#1d4ed8"
                />
                <Text
                  size="xl"
                  fw={700}
                >
                  Update Group Priority
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Select a date and account, then set the target group.
              </Text>
            </Box>

            <Group gap="xs">
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing}
                onClick={() => fetchLists({ silent: true })}
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
                  handleReset();
                  handleResetAll();
                }}
              >
                Reset
              </Button>
              <Button
                leftSection={<IconDeviceFloppy size={18} />}
                color="blue"
                radius="md"
                onClick={handleSubmit}
                loading={submitting}
              >
                Update Group
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
              >
                <Select
                  label="Select Date"
                  placeholder="Choose date"
                  data={dateOptions}
                  value={filter.date}
                  onChange={(value) => handleFilterChange('date', value || '')}
                  searchable
                  nothingFoundMessage="No dates"
                  style={{ minWidth: 220 }}
                />

                <Select
                  label="Select Account"
                  placeholder="Choose account"
                  data={accountOptions}
                  value={filter.bank}
                  onChange={(value) => handleFilterChange('bank', value || '')}
                  searchable
                  nothingFoundMessage="No accounts"
                  style={{ minWidth: 280 }}
                />

                <Select
                  label="Update to Group"
                  placeholder="Choose group"
                  data={groupOptions}
                  value={filter.group}
                  onChange={(value) => handleFilterChange('group', value || '1')}
                  style={{ minWidth: 180 }}
                />
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
                        style={{ minWidth: col.minWidth || 140 }}
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
                          minWidth: col.minWidth || 140,
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
                      <Table.Tr key={`${item.bankaccountno || 'account'}-${idx}`}>
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
                          Total accounts: {filteredData.length}
                        </Text>
                        <Text
                          size="sm"
                          c="dimmed"
                        >
                          Totals stay in the footer as requested.
                        </Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </ScrollArea>
          </Box>

          <Divider />

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
    </Box>
  );
};

export default UpdateGroup;
