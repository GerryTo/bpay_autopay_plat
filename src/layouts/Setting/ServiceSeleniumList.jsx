import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Select,
} from '@mantine/core';
import { IconFilter, IconRefresh, IconServer } from '@tabler/icons-react';
import { serviceAutomationAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  mainuser: '',
  email: '',
  password: '',
  server: '',
};

const ServiceSeleniumList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleFilterChange = useCallback((key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          includesValue(item.v_mainuser, columnFilters.mainuser) &&
          includesValue(item.v_email, columnFilters.email) &&
          includesValue(item.v_password_bkash, columnFilters.password) &&
          includesValue(item.v_servername, columnFilters.server)
        );
      }),
    [data, columnFilters]
  );

  const sortAccessors = useMemo(
    () => ({
      mainuser: (item) => item.v_mainuser ?? '',
      email: (item) => item.v_email ?? '',
      password: (item) => item.v_password_bkash ?? '',
      server: (item) => item.v_servername ?? '',
    }),
    []
  );

  const columns = useMemo(
    () => [
      {
        key: 'mainuser',
        label: 'User',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.v_mainuser || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter user..."
            size="xs"
            value={columnFilters.mainuser}
            onChange={(e) =>
              handleFilterChange('mainuser', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'email',
        label: 'Email',
        minWidth: 200,
        render: (item) => <Text size="sm">{item.v_email || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter email..."
            size="xs"
            value={columnFilters.email}
            onChange={(e) => handleFilterChange('email', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'password',
        label: 'Password',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.v_password_bkash || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter password..."
            size="xs"
            value={columnFilters.password}
            onChange={(e) =>
              handleFilterChange('password', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'server',
        label: 'Server',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.v_servername || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter server..."
            size="xs"
            value={columnFilters.server}
            onChange={(e) =>
              handleFilterChange('server', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'action',
        label: 'Action',
        minWidth: 220,
        render: (item) => (
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="orange"
              onClick={() => handleExecute(item, 'restart')}
            >
              Restart
            </Button>
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => handleExecute(item, 'start')}
            >
              Start
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => handleExecute(item, 'stop')}
            >
              Stop
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
    onResetFilters: () => setColumnFilters(defaultFilters),
  });

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const accessor = sortAccessors[key];
    if (!accessor) return filteredData;

    const dir = direction === 'desc' ? -1 : 1;
    return [...filteredData].sort((a, b) => {
      const av = (accessor(a) ?? '').toString().toLowerCase();
      const bv = (accessor(b) ?? '').toString().toLowerCase();
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }, [filteredData, sortConfig, sortAccessors]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, sortConfig]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const fetchList = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await serviceAutomationAPI.getList();
      if (response.success && response.data) {
        const payload = response.data;
        const status = (payload.status || '').toLowerCase();
        if (!payload.status || status === 'ok' || status === 'success') {
          const records = Array.isArray(payload.records) ? payload.records : [];
          const withKeys = records.map((item, idx) => ({
            ...item,
            _rowKey: `${item.v_mainuser || 'service'}-${idx}`,
          }));
          setData(withKeys);
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load services',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load services',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Service list fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load service list',
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

  const resetAll = () => {
    setColumnFilters(defaultFilters);
    setCurrentPage(1);
    setItemsPerPage(10);
    handleResetAll();
  };

  const handleExecute = async (item, statement) => {
    setSaving(true);
    try {
      const payload = {
        statment: statement,
        servicename: item.v_mainuser,
        server: item.v_servername,
      };
      const response = await serviceAutomationAPI.execute(payload);
      if (response.success && response.data) {
        const status = (response.data.status || '').toLowerCase();
        showNotification({
          title: status === 'success' || status === 'ok' ? 'Success' : 'Info',
          message: response.data.message || 'Request submitted',
          color: status === 'success' || status === 'ok' ? 'green' : 'blue',
        });
        fetchList({ silent: true });
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to execute service',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Execute service error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to execute service',
        color: 'red',
      });
    } finally {
      setSaving(false);
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
              <Group gap={8}>
                <IconServer
                  size={22}
                  color="#1d4ed8"
                />
                <Text
                  size="xl"
                  fw={700}
                >
                  Service Selenium List
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage Selenium services (start/stop/restart).
              </Text>
            </Box>

            <Group gap="xs">
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing || saving}
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
                onClick={resetAll}
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
                      <Table.Tr key={item._rowKey || `${idx}-row`}>
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
                          Total rows: {filteredData.length}
                        </Text>
                        <Text
                          size="sm"
                          c="dimmed"
                        >
                          Totals stay in the footer.
                        </Text>
                      </Group>
                    </Table.Td>
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

export default ServiceSeleniumList;
