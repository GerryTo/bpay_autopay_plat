import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Table,
  ScrollArea,
  Select,
  Grid,
  Anchor,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';

const ReportMerchant = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchantList, setMerchantList] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    merchantCode: 'ALL',
    category: 'daily',
    report: 'Deposit',
  });

  // Category options
  const categoryList = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  // Report type options
  const reportList = [
    { value: 'Deposit', label: 'Deposit' },
    { value: 'Withdraw', label: 'Withdraw' },
    { value: 'Adjustment', label: 'Adjustment' },
    { value: 'Adjustment_Deposit', label: 'Adjustment Deposit' },
    { value: 'Adjustment_Withdraw', label: 'Adjustment Withdraw' },
    { value: 'Deposit_byComplete', label: 'Deposit By Complete' },
    { value: 'Withdraw_byComplete', label: 'Withdraw By Complete' },
    { value: 'Adjustment_byComplete', label: 'Adjustment By Complete' },
    {
      value: 'Adjustment_Deposit_byComplete',
      label: 'Adjustment Deposit By Complete',
    },
    {
      value: 'Adjustment_Withdraw_byComplete',
      label: 'Adjustment Withdraw By Complete',
    },
    { value: 'Deposit_gmt+8', label: 'Deposit GMT+8' },
    { value: 'Withdraw_gmt+8', label: 'Withdraw GMT+8' },
    { value: 'Adjustment_gmt+8', label: 'Adjustment GMT+8' },
    { value: 'Adjustment_Deposit_gmt+8', label: 'Adjustment Deposit GMT+8' },
    {
      value: 'Adjustment_Withdraw_gmt+8',
      label: 'Adjustment Withdraw GMT+8',
    },
    { value: 'Deposit_byComplete_gmt+8', label: 'Deposit By Complete GMT+8' },
    {
      value: 'Withdraw_byComplete_gmt+8',
      label: 'Withdraw By Complete GMT+8',
    },
    {
      value: 'Adjustment_byComplete_gmt+8',
      label: 'Adjustment By Complete GMT+8',
    },
    {
      value: 'Adjustment_Deposit_byComplete_gmt+8',
      label: 'Adjustment Deposit By Complete GMT+8',
    },
    {
      value: 'Adjustment_Withdraw_byComplete_gmt+8',
      label: 'Adjustment Withdraw By Complete GMT+8',
    },
  ];

  // Load merchant list on init
  const loadMerchantList = async () => {
    try {
      const response = await merchantAPI.getMerchantList();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const merchants = response.data.records || [];
          setMerchantList(merchants);

          // Auto-select first merchant if available
          if (merchants.length > 0) {
            setFilters((prev) => ({
              ...prev,
              merchantCode: merchants[0].merchantcode,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading merchant list:', error);
    }
  };

  // Load report files
  const loadReportFiles = async () => {
    setLoading(true);
    try {
      const response = await merchantAPI.getMerchantReportFiles(
        filters.report,
        filters.category,
        filters.merchantCode
      );

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'success') {
          setData(response.data.records || []);
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load report files',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load report files',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to load report files',
        color: 'red',
      });
      console.error('Error fetching report files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadReportFiles();
  };

  // Init
  useEffect(() => {
    loadMerchantList();
  }, []);

  const rows = data.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text
          size="sm"
          fw={500}
        >
          {item.filename}
        </Text>
      </Table.Td>
      <Table.Td>
        <Anchor
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="xs"
            variant="filled"
            color="blue"
          >
            Download
          </Button>
        </Anchor>
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
                Report Merchant
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Download merchant report files
              </Text>
            </Box>
          </Group>

          {/* Filters */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Select
                label="Category"
                value={filters.category}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
                data={categoryList}
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Report Type"
                value={filters.report}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, report: value }))
                }
                data={reportList}
                size="sm"
                searchable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Box style={{ marginTop: 24 }}>
                <Button
                  leftSection={<IconRefresh size={18} />}
                  onClick={handleRefresh}
                  variant="filled"
                  color="blue"
                  radius="md"
                  disabled={loading}
                  size="sm"
                >
                  Refresh
                </Button>
              </Box>
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
            >
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                horizontalSpacing="md"
                verticalSpacing="sm"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>File Name</Table.Th>
                    <Table.Th style={{ width: 150 }}>Link</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={2}>
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
                            Click Refresh to load report files
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
    </Box>
  );
};

export default ReportMerchant;
