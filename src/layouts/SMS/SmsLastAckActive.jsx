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
import {
  IconFilter,
  IconMessage,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import ColumnActionMenu from '../../components/ColumnActionMenu';
import { smsAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';

const defaultFilters = {
  username: '',
  phonenumber: '',
  alias: '',
  agentname: '',
  lastackBdt: '',
  lastack: '',
  lastsmsdateBdt: '',
  lastsmsdate: '',
  lastsmscontent: '',
  lastsn: '',
  bankaccno: '',
  bankname: '',
  bankactive: '',
};

const SmsLastAckActive = () => {
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
    setData([]);
  };

  const columns = useMemo(
    () => [
      {
        key: 'username',
        label: 'Username',
        minWidth: 140,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.username || '-'}
          </Text>
        ),
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
        key: 'phonenumber',
        label: 'Phone Number',
        minWidth: 140,
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
        key: 'alias',
        label: 'Alias',
        minWidth: 120,
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
        key: 'agentname',
        label: 'Agent Name',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.agentname || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter agent..."
            size="xs"
            value={columnFilters.agentname}
            onChange={(e) =>
              handleFilterChange('agentname', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastackBdt',
        label: 'Last Ack (BDT Time)',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.lastackBdt || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter last ack BDT..."
            size="xs"
            value={columnFilters.lastackBdt}
            onChange={(e) =>
              handleFilterChange('lastackBdt', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastack',
        label: 'Last Ack',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.lastack || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter last ack..."
            size="xs"
            value={columnFilters.lastack}
            onChange={(e) =>
              handleFilterChange('lastack', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastsmsdateBdt',
        label: 'Last SMS (BDT Time)',
        minWidth: 170,
        render: (item) => <Text size="sm">{item.lastsmsdateBdt || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter last SMS BDT..."
            size="xs"
            value={columnFilters.lastsmsdateBdt}
            onChange={(e) =>
              handleFilterChange('lastsmsdateBdt', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastsmsdate',
        label: 'Last SMS',
        minWidth: 150,
        render: (item) => <Text size="sm">{item.lastsmsdate || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter last SMS..."
            size="xs"
            value={columnFilters.lastsmsdate}
            onChange={(e) =>
              handleFilterChange('lastsmsdate', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastsmscontent',
        label: 'Last SMS Content',
        minWidth: 220,
        render: (item) => (
          <Text
            size="sm"
            lineClamp={2}
          >
            {item.lastsmscontent || '-'}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter SMS content..."
            size="xs"
            value={columnFilters.lastsmscontent}
            onChange={(e) =>
              handleFilterChange('lastsmscontent', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'lastsn',
        label: 'Last SN',
        minWidth: 130,
        render: (item) => <Text size="sm">{item.lastsn || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter last SN..."
            size="xs"
            value={columnFilters.lastsn}
            onChange={(e) =>
              handleFilterChange('lastsn', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'bankaccno',
        label: 'Bank Account No',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.bankaccno || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank account..."
            size="xs"
            value={columnFilters.bankaccno}
            onChange={(e) =>
              handleFilterChange('bankaccno', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'bankname',
        label: 'Bank Name',
        minWidth: 160,
        render: (item) => <Text size="sm">{item.bankname || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank name..."
            size="xs"
            value={columnFilters.bankname}
            onChange={(e) =>
              handleFilterChange('bankname', e.currentTarget.value)
            }
          />
        ),
      },
      {
        key: 'bankactive',
        label: 'Bank Active',
        minWidth: 140,
        render: (item) => <Text size="sm">{item.bankactive || '-'}</Text>,
        filter: (
          <TextInput
            placeholder="Filter bank active..."
            size="xs"
            value={columnFilters.bankactive}
            onChange={(e) =>
              handleFilterChange('bankactive', e.currentTarget.value)
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
          includesValue(item.username, columnFilters.username) &&
          includesValue(item.phonenumber, columnFilters.phonenumber) &&
          includesValue(item.alias, columnFilters.alias) &&
          includesValue(item.agentname, columnFilters.agentname) &&
          includesValue(item.lastackBdt, columnFilters.lastackBdt) &&
          includesValue(item.lastack, columnFilters.lastack) &&
          includesValue(item.lastsmsdateBdt, columnFilters.lastsmsdateBdt) &&
          includesValue(item.lastsmsdate, columnFilters.lastsmsdate) &&
          includesValue(item.lastsmscontent, columnFilters.lastsmscontent) &&
          includesValue(item.lastsn, columnFilters.lastsn) &&
          includesValue(item.bankaccno, columnFilters.bankaccno) &&
          includesValue(item.bankname, columnFilters.bankname) &&
          includesValue(item.bankactive, columnFilters.bankactive)
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

  const fetchData = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);

    try {
      const response = await smsAPI.getLastAckActiveList();

      if (response.success && response.data) {
        if ((response.data.status || '').toLowerCase() === 'ok') {
          const records = Array.isArray(response.data.records)
            ? response.data.records
            : [];
          setData(records);
        } else {
          showNotification({
            title: 'Error',
            message:
              response.data.message ||
              'Failed to load SMS last ACK active data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load SMS last ACK active data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('SMS last ACK active fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load SMS last ACK active data',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, item) => {
          acc.rows += 1;
          return acc;
        },
        { rows: 0 }
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
                  SMS Last ACK Active
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                View the latest ACK and SMS activity for active devices. Totals
                are shown in the footer.
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

          {/* <Card withBorder radius="md" padding="md" shadow="xs">
            <Group align="center" gap="xs" wrap="wrap">
              <Button
                leftSection={<IconSearch size={18} />}
                color="blue"
                radius="md"
                onClick={() => fetchData()}
              >
                Refresh
              </Button>
            </Group>
          </Card> */}

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
                      <Table.Tr key={`${item.username || idx}-${idx}`}>
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
                      if (index === 0) {
                        return (
                          <Table.Th key={`${col.key}-footer`}>
                            Totals (Rows: {totals.rows})
                          </Table.Th>
                        );
                      }
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

export default SmsLastAckActive;
