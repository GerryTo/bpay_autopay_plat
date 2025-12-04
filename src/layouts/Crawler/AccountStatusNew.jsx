import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from '@mantine/core';
import { IconFilter, IconRefresh } from '@tabler/icons-react';
import { crawlerAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  mainUser: '',
  bankCode: '',
  statusDesOtpSender: '',
  statusDesCommGetter: '',
  statusAppiumServer: '',
  noteAppiumServer: '',
  serverName: '',
  serialNumber: '',
};

const AccountStatusNew = () => {
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
    setColumnFilters({ ...defaultFilters });
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'mainUser',
        label: 'User',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.mainUser || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter user..."
            size="xs"
            value={columnFilters.mainUser}
            onChange={(e) =>
              handleFilterChange('mainUser', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'bankCode',
        label: 'Bank',
        minWidth: 100,
        render: (item) => (
          <Badge
            color="blue"
            variant="light"
          >
            {item.bankCode || '-'}
          </Badge>
        ),
        filter: (
          <TextInput
            placeholder="Filter bank..."
            size="xs"
            value={columnFilters.bankCode}
            onChange={(e) =>
              handleFilterChange('bankCode', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'statusDesOtpSender',
        label: 'Status OTP',
        minWidth: 160,
        render: (item) => (
          <Text size="sm">{item.statusDesOtpSender || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter status OTP..."
            size="xs"
            value={columnFilters.statusDesOtpSender}
            onChange={(e) =>
              handleFilterChange('statusDesOtpSender', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'statusDesCommGetter',
        label: 'Status Comm Getter',
        minWidth: 200,
        render: (item) => (
          <Text size="sm">{item.statusDesCommGetter || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter status comm..."
            size="xs"
            value={columnFilters.statusDesCommGetter}
            onChange={(e) =>
              handleFilterChange('statusDesCommGetter', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'statusAppiumServer',
        label: 'Status Automation',
        minWidth: 180,
        render: (item) => (
          <Text size="sm">{item.statusAppiumServer || '-'}</Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter status automation..."
            size="xs"
            value={columnFilters.statusAppiumServer}
            onChange={(e) =>
              handleFilterChange('statusAppiumServer', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'noteAppiumServer',
        label: 'Note Automation',
        minWidth: 180,
        render: (item) => <Text size="sm">{item.noteAppiumServer || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter note automation..."
            size="xs"
            value={columnFilters.noteAppiumServer}
            onChange={(e) =>
              handleFilterChange('noteAppiumServer', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'serverName',
        label: 'Server Name',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.serverName || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter server..."
            size="xs"
            value={columnFilters.serverName}
            onChange={(e) =>
              handleFilterChange('serverName', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'serialNumber',
        label: 'Serial No.',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.serialNumber || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter serial..."
            size="xs"
            value={columnFilters.serialNumber}
            onChange={(e) =>
              handleFilterChange('serialNumber', e.currentTarget.value)
            }
          />
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
    handleResetAll: resetTableControls,
  } = useTableControls(columns, {
    onResetFilters: handleClearFilters,
  });

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.mainUser, columnFilters.mainUser) &&
          includesValue(item.bankCode, columnFilters.bankCode) &&
          includesValue(
            item.statusDesOtpSender,
            columnFilters.statusDesOtpSender
          ) &&
          includesValue(
            item.statusDesCommGetter,
            columnFilters.statusDesCommGetter
          ) &&
          includesValue(
            item.statusAppiumServer,
            columnFilters.statusAppiumServer
          ) &&
          includesValue(
            item.noteAppiumServer,
            columnFilters.noteAppiumServer
          ) &&
          includesValue(item.serverName, columnFilters.serverName) &&
          includesValue(item.serialNumber, columnFilters.serialNumber)
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

  const fetchList = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await crawlerAPI.getAccountStatusNew();
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(payload.records) ? payload.records : [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load account status',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load account status',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Account status new fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load account status',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetAll = () => {
    handleClearFilters();
    setCurrentPage(1);
    resetTableControls();
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
                Account Status New
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Appium account status overview
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
                onClick={handleResetAll}
              >
                Reset
              </Button>
            </Group>
          </Group>

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
                      <Table.Tr
                        key={`${item.mainUser || 'row'}-${
                          item.bankCode || ''
                        }-${startIndex + idx}`}
                      >
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
                {/* <Table.Tfoot>
                  <Table.Tr>
                    {visibleColumns.map((col, idx) => {
                      if (idx === 0) {
                        return (
                          <Table.Td key={`${col.key}-footer`}>
                            <Text fw={700}>Rows: {paginatedData.length}</Text>
                          </Table.Td>
                        );
                      }
                      return <Table.Td key={`${col.key}-footer`} />;
                    })}
                  </Table.Tr>
                </Table.Tfoot> */}
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

export default AccountStatusNew;
