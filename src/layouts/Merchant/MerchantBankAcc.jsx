import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Select,
  Table,
  ScrollArea,
  Paper,
  Pagination,
  Badge,
} from '@mantine/core';
import { IconRefresh, IconSearch } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';

const MerchantBankAcc = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchantList, setMerchantList] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column-specific filters
  const [columnFilters, setColumnFilters] = useState({
    alias: '',
    bankAccNo: '',
    bankAccName: '',
    bankCode: '',
    login: '',
    type: '',
    active: '',
    locked: '',
    lastused: '',
    agentCommission: '',
    groupId: '',
  });

  // Filter data based on column filters
  const filteredData = data.filter((item) => {
    const aliasMatch =
      !columnFilters.alias ||
      item.alias?.toLowerCase().includes(columnFilters.alias.toLowerCase());

    const bankAccNoMatch =
      !columnFilters.bankAccNo ||
      item.bankAccNo?.toLowerCase().includes(columnFilters.bankAccNo.toLowerCase());

    const bankAccNameMatch =
      !columnFilters.bankAccName ||
      item.bankAccName?.toLowerCase().includes(columnFilters.bankAccName.toLowerCase());

    const bankCodeMatch =
      !columnFilters.bankCode ||
      item.bankCode?.toLowerCase().includes(columnFilters.bankCode.toLowerCase());

    const loginMatch =
      !columnFilters.login ||
      item.login?.toLowerCase().includes(columnFilters.login.toLowerCase());

    const typeMatch =
      !columnFilters.type ||
      item.type?.toLowerCase().includes(columnFilters.type.toLowerCase());

    const activeMatch =
      !columnFilters.active ||
      item.active?.toLowerCase().includes(columnFilters.active.toLowerCase());

    const lockedMatch =
      !columnFilters.locked ||
      item.locked?.toLowerCase().includes(columnFilters.locked.toLowerCase());

    const lastusedMatch =
      !columnFilters.lastused ||
      item.lastused?.toLowerCase().includes(columnFilters.lastused.toLowerCase());

    const agentCommissionMatch =
      !columnFilters.agentCommission ||
      item.agentCommission
        ?.toString()
        .toLowerCase()
        .includes(columnFilters.agentCommission.toLowerCase());

    const groupIdMatch =
      !columnFilters.groupId ||
      item.groupId?.toLowerCase().includes(columnFilters.groupId.toLowerCase());

    return (
      aliasMatch &&
      bankAccNoMatch &&
      bankAccNameMatch &&
      bankCodeMatch &&
      loginMatch &&
      typeMatch &&
      activeMatch &&
      lockedMatch &&
      lastusedMatch &&
      agentCommissionMatch &&
      groupIdMatch
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, selectedMerchant]);

  // Update column filter
  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setColumnFilters({
      alias: '',
      bankAccNo: '',
      bankAccName: '',
      bankCode: '',
      login: '',
      type: '',
      active: '',
      locked: '',
      lastused: '',
      agentCommission: '',
      groupId: '',
    });
  };

  // Load merchant list
  const loadMerchantList = async () => {
    try {
      const response = await merchantAPI.getMerchantList();

      if (response.success && response.data.status?.toLowerCase() === 'ok') {
        const merchants = response.data.records || [];
        setMerchantList(merchants);
        if (merchants.length > 0 && selectedMerchant === 'ALL') {
          // Keep ALL as default
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.data?.message || 'Failed to load merchant list',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error loading merchant list:', error);
    }
  };

  // Load bank account data
  const loadBankAccData = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getMerchantBankAccList(selectedMerchant);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          setData(records);
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
      showNotification({
        title: 'Error',
        message: 'Failed to load data',
        color: 'red',
      });
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMerchantList();
  }, []);

  useEffect(() => {
    if (selectedMerchant) {
      loadBankAccData();
    }
  }, [selectedMerchant]);

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return Number(value).toFixed(2);
  };

  const rows = paginatedData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text size="sm">{item.alias}</Text>
      </Table.Td>
      <Table.Td>
        <Text
          size="sm"
          fw={600}
        >
          {item.bankAccNo}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.bankAccName}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.bankCode}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.login}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.type}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={item.active === 'Y' ? 'green' : 'red'}>{item.active}</Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={item.locked === 'Y' ? 'red' : 'green'}>{item.locked}</Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.lastused}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text size="sm">{formatNumber(item.agentCommission)}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.groupId}</Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Box p="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
      >
        <Stack gap="lg">
          {/* Header */}
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
                Merchant Bank Account
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                View merchant bank account information
              </Text>
            </Box>
          </Group>

          {/* Filter Container */}
          <Group
            justify="space-between"
            wrap="wrap"
          >
            <Group>
              <Select
                placeholder="Select Merchant"
                data={[
                  { value: 'ALL', label: 'ALL' },
                  ...merchantList.map((m) => ({
                    value: m.merchantcode,
                    label: m.merchantcode,
                  })),
                ]}
                value={selectedMerchant}
                onChange={(value) => setSelectedMerchant(value)}
                style={{ width: 200 }}
              />
              <Button
                leftSection={<IconRefresh size={18} />}
                onClick={loadBankAccData}
                variant="light"
                color="gray"
                radius="md"
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                leftSection={<IconSearch size={18} />}
                onClick={handleClearFilters}
                variant="light"
                color="red"
                radius="md"
              >
                Clear All Filters
              </Button>
            </Group>

            <Badge
              size="lg"
              variant="light"
              color="blue"
            >
              {filteredData.length} of {data.length} records
            </Badge>
          </Group>

          {/* Table */}
          <Box
            pos="relative"
            style={{ minHeight: 400 }}
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
              styles={{
                scrollbar: {
                  '&[data-orientation="horizontal"]': {
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                  },
                  '&[data-orientation="horizontal"] .mantine-ScrollArea-thumb': {
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                  },
                },
              }}
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 1600,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
                styles={{
                  th: {
                    backgroundColor: '#f8f9fa',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#0f1012ff',
                    whiteSpace: 'nowrap',
                    padding: '12px 16px',
                  },
                  td: {
                    padding: '10px 16px',
                    fontSize: '14px',
                  },
                }}
              >
                <Table.Thead>
                  {/* Header Row */}
                  <Table.Tr>
                    <Table.Th style={{ minWidth: 120 }}>Alias</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Account No</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Account Name</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Bank</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Login</Table.Th>
                    <Table.Th style={{ minWidth: 80 }}>Type</Table.Th>
                    <Table.Th style={{ minWidth: 80 }}>Active</Table.Th>
                    <Table.Th style={{ minWidth: 80 }}>Locked</Table.Th>
                    <Table.Th style={{ minWidth: 150 }}>Last Used</Table.Th>
                    <Table.Th style={{ minWidth: 120, textAlign: 'right' }}>
                      Agent Commission
                    </Table.Th>
                    <Table.Th style={{ minWidth: 120 }}>Group ID</Table.Th>
                  </Table.Tr>

                  {/* Filter Row */}
                  <Table.Tr style={{ backgroundColor: '#e7f5ff' }}>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.alias}
                        onChange={(e) => handleFilterChange('alias', e.currentTarget.value)}
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.bankAccNo}
                        onChange={(e) =>
                          handleFilterChange('bankAccNo', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.bankAccName}
                        onChange={(e) =>
                          handleFilterChange('bankAccName', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.bankCode}
                        onChange={(e) =>
                          handleFilterChange('bankCode', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.login}
                        onChange={(e) => handleFilterChange('login', e.currentTarget.value)}
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.type}
                        onChange={(e) => handleFilterChange('type', e.currentTarget.value)}
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.active}
                        onChange={(e) => handleFilterChange('active', e.currentTarget.value)}
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.locked}
                        onChange={(e) => handleFilterChange('locked', e.currentTarget.value)}
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.lastused}
                        onChange={(e) =>
                          handleFilterChange('lastused', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.agentCommission}
                        onChange={(e) =>
                          handleFilterChange('agentCommission', e.currentTarget.value)
                        }
                      />
                    </Table.Th>
                    <Table.Th style={{ padding: '8px' }}>
                      <TextInput
                        placeholder="Filter..."
                        size="xs"
                        value={columnFilters.groupId}
                        onChange={(e) => handleFilterChange('groupId', e.currentTarget.value)}
                      />
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={11}>
                        <Stack
                          align="center"
                          gap="xs"
                          py="xl"
                        >
                          <Text
                            size="lg"
                            fw={500}
                          >
                            No Data Available
                          </Text>
                          <Text
                            size="sm"
                            c="dimmed"
                          >
                            {Object.values(columnFilters).some((val) => val !== '')
                              ? 'Try adjusting your filters'
                              : 'Select a merchant to view bank accounts'}
                          </Text>
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            {/* Footer with Pagination */}
            <Paper
              p="md"
              mt="md"
              withBorder
              radius="md"
              bg="gray.0"
            >
              <Group
                justify="space-between"
                wrap="wrap"
              >
                <Group gap="md">
                  <Text
                    size="sm"
                    c="dimmed"
                    fw={500}
                  >
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of{' '}
                    {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
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
                      Per page:
                    </Text>
                    <Select
                      size="xs"
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
                      style={{ width: 70 }}
                    />
                  </Group>
                </Group>

                {totalPages > 1 && (
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={setCurrentPage}
                    size="sm"
                    radius="md"
                    withEdges
                  />
                )}
              </Group>
            </Paper>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
};

export default MerchantBankAcc;
