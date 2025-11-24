import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Group,
  Table,
  LoadingOverlay,
  Stack,
  Text,
  Card,
  ScrollArea,
  Popover,
  Paper,
  Grid,
  Select,
  Modal,
} from '@mantine/core';
import { IconRefresh, IconCalendar } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';
import { DateRangePicker, DatePicker } from 'react-date-range';
import { format, subDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const BalanceDifference = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchantList, setMerchantList] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState('ALL');

  // Date range state - default to yesterday
  const yesterday = subDays(new Date(), 1);
  const [dateRange, setDateRange] = useState([
    {
      startDate: yesterday,
      endDate: yesterday,
      key: 'selection',
    },
  ]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);

  // Modal state
  const [modalOpened, setModalOpened] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalDate, setModalDate] = useState(yesterday);
  const [modalMerchant, setModalMerchant] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalDetailData, setModalDetailData] = useState([]);
  const [modalDatePickerOpened, setModalDatePickerOpened] = useState(false);

  // Load merchant list on init
  const loadMerchantList = async () => {
    try {
      const response = await merchantAPI.getMerchantList();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const merchants = response.data.records || [];
          setMerchantList(merchants);
        }
      }
    } catch (error) {
      console.error('Error loading merchant list:', error);
    }
  };

  // Load report data
  const loadReportData = async () => {
    setLoading(true);
    try {
      const fromDate = `${format(
        dateRange[0].startDate,
        'yyyy-MM-dd'
      )} 00:00:00`;
      const toDate = `${format(dateRange[0].endDate, 'yyyy-MM-dd')} 23:59:59`;

      console.log('Request params:', {
        fromDate,
        toDate,
        merchant: selectedMerchant,
      });

      const response = await merchantAPI.getBalanceDifference(
        fromDate,
        toDate,
        selectedMerchant
      );

      console.log('API Response:', response);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          console.log('Setting data with records:', records);
          setData(records);

          if (records.length === 0) {
            showNotification({
              title: 'Info',
              message: 'No data found for selected criteria',
              color: 'blue',
            });
          }
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

  // Load modal detail data
  const loadModalDetailData = async () => {
    setModalLoading(true);
    try {
      const dateStr = format(modalDate, 'yyyy-MM-dd');
      const fromDate = `${dateStr} 00:00:00`;
      const toDate = `${dateStr} 23:59:59`;

      console.log('Modal Request params:', {
        fromDate,
        toDate,
        merchant: modalMerchant,
      });

      const response = await merchantAPI.getBalanceDifference(
        fromDate,
        toDate,
        modalMerchant
      );

      console.log('Modal API Response:', response);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const records = response.data.records || [];
          setModalDetailData(records);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load detail data',
            color: 'red',
          });
        }
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to load detail data',
        color: 'red',
      });
      console.error('Error fetching modal data:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRefresh = () => {
    loadReportData();
  };

  const handleDetail = (item) => {
    // Parse the date string from the item
    const itemDate = new Date(item.date);
    setModalDate(itemDate);
    setModalMerchant(item.merchantcode);
    setModalData(item);
    setModalOpened(true);
  };

  const handleModalRefresh = () => {
    loadModalDetailData();
  };

  // Don't auto-load on mount (init function in AngularJS doesn't call getListData)
  useEffect(() => {
    loadMerchantList();
  }, []);

  // Load modal detail data when modal opens
  useEffect(() => {
    if (modalOpened && modalMerchant) {
      loadModalDetailData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpened]);

  const merchantOptions = [
    { value: 'ALL', label: 'ALL' },
    ...merchantList.map((merchant) => ({
      value: merchant.merchantcode,
      label: merchant.merchantcode,
    })),
  ];

  const maxDate = subDays(new Date(), 1);

  const rows = data.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          size="sm"
          fw={600}
        >
          {item.merchantcode}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{item.date}</Text>
      </Table.Td>
      <Table.Td>
        <Stack gap="xs">
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 80 }}
            >
              Deposit:
            </Text>
            <Text size="sm">{item.diff_deposit || 0}</Text>
          </Group>
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 80 }}
            >
              Withdrawal:
            </Text>
            <Text size="sm">{item.diff_withdraw || 0}</Text>
          </Group>
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 80 }}
            >
              Fee:
            </Text>
            <Text size="sm">{item.diff_fee || 0}</Text>
          </Group>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Button
          size="xs"
          variant="filled"
          color="blue"
          onClick={() => handleDetail(item)}
        >
          Detail
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  const modalRows = modalDetailData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Stack gap="md">
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 180 }}
            >
              Total Deposit:
            </Text>
            <Text size="sm">{item.deposit || 0}</Text>
          </Group>
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 180 }}
            >
              Total Deposit Report:
            </Text>
            <Text size="sm">{item.report_deposit || 0}</Text>
          </Group>
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 180 }}
            >
              Difference Deposit:
            </Text>
            <Text
              size="sm"
              fw={600}
              c={item.diff_deposit !== 0 ? 'red' : undefined}
            >
              {item.diff_deposit || 0}
            </Text>
          </Group>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Stack gap="md">
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 180 }}
            >
              Total Withdraw:
            </Text>
            <Text size="sm">{item.withdraw || 0}</Text>
          </Group>
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 180 }}
            >
              Total Withdraw Report:
            </Text>
            <Text size="sm">{item.report_withdraw || 0}</Text>
          </Group>
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 180 }}
            >
              Difference Withdraw:
            </Text>
            <Text
              size="sm"
              fw={600}
              c={item.diff_withdraw !== 0 ? 'red' : undefined}
            >
              {item.diff_withdraw || 0}
            </Text>
          </Group>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Stack gap="md">
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 180 }}
            >
              Total Bropay Fee:
            </Text>
            <Text size="sm">{item.fee || 0}</Text>
          </Group>
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 180 }}
            >
              Total Bropay Fee Report:
            </Text>
            <Text size="sm">{item.report_fee || 0}</Text>
          </Group>
          <Group gap="xs">
            <Text
              size="xs"
              c="dimmed"
              style={{ minWidth: 180 }}
            >
              Difference Bropay Fee:
            </Text>
            <Text
              size="sm"
              fw={600}
              c={item.diff_fee !== 0 ? 'red' : undefined}
            >
              {item.diff_fee || 0}
            </Text>
          </Group>
        </Stack>
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
                Balance Difference
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Transaction discrepancy report
              </Text>
            </Box>
          </Group>

          {/* Filters */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Popover
                opened={datePickerOpened}
                onChange={setDatePickerOpened}
                width="auto"
                position="bottom-start"
                shadow="md"
              >
                <Popover.Target>
                  <Button
                    variant="light"
                    color="blue"
                    size="sm"
                    leftSection={<IconCalendar size={16} />}
                    onClick={() => setDatePickerOpened((o) => !o)}
                    fullWidth
                  >
                    {format(dateRange[0].startDate, 'dd MMM yyyy')} -{' '}
                    {format(dateRange[0].endDate, 'dd MMM yyyy')}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown p={0}>
                  <Paper>
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={(item) => setDateRange([item.selection])}
                      months={1}
                      direction="horizontal"
                      showDateDisplay={false}
                      maxDate={maxDate}
                    />
                  </Paper>
                </Popover.Dropdown>
              </Popover>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Select
                placeholder="Select merchant"
                data={merchantOptions}
                value={selectedMerchant}
                onChange={setSelectedMerchant}
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Button
                leftSection={<IconRefresh size={18} />}
                onClick={handleRefresh}
                variant="filled"
                color="blue"
                radius="md"
                disabled={loading}
                size="sm"
                fullWidth
              >
                Refresh
              </Button>
            </Grid.Col>
          </Grid>

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
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
                style={{
                  minWidth: 800,
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
                    padding: '16px',
                    fontSize: '14px',
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ minWidth: 150 }}>Merchant Code</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Date</Table.Th>
                    <Table.Th style={{ minWidth: 300 }}>Difference</Table.Th>
                    <Table.Th style={{ minWidth: 100 }}>Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
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
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>
        </Stack>
      </Card>

      {/* Detail Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Balance Difference Detail"
        size="xl"
      >
        <Stack gap="md">
          {/* Modal Filters */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Popover
                opened={modalDatePickerOpened}
                onChange={setModalDatePickerOpened}
                width="auto"
                position="bottom-start"
                shadow="md"
              >
                <Popover.Target>
                  <Button
                    variant="light"
                    color="blue"
                    size="sm"
                    leftSection={<IconCalendar size={16} />}
                    onClick={() => setModalDatePickerOpened((o) => !o)}
                    fullWidth
                  >
                    {format(modalDate, 'dd MMM yyyy')}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown p={0}>
                  <Paper>
                    <DatePicker
                      date={modalDate}
                      onChange={(date) => setModalDate(date)}
                      maxDate={maxDate}
                    />
                  </Paper>
                </Popover.Dropdown>
              </Popover>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                placeholder="Select merchant"
                data={merchantOptions}
                value={modalMerchant}
                onChange={setModalMerchant}
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Button
                leftSection={<IconRefresh size={18} />}
                onClick={handleModalRefresh}
                variant="filled"
                color="blue"
                radius="md"
                disabled={modalLoading}
                size="sm"
                fullWidth
              >
                Refresh
              </Button>
            </Grid.Col>
          </Grid>

          {/* Modal Table */}
          <Box
            pos="relative"
            style={{ minHeight: 300 }}
          >
            <LoadingOverlay
              visible={modalLoading}
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
                verticalSpacing="lg"
                style={{
                  minWidth: 700,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
                styles={{
                  td: {
                    padding: '24px',
                    fontSize: '14px',
                  },
                }}
              >
                <Table.Tbody>
                  {modalRows.length > 0 ? (
                    modalRows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={3}>
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
                        </Stack>
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

export default BalanceDifference;
