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
  Select,
  Grid,
  Anchor,
} from '@mantine/core';
import { IconRefresh, IconDownload } from '@tabler/icons-react';
import { showNotification } from '../../helper/showNotification';
import { merchantAPI } from '../../helper/api';

const DownloadReport = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [merchantList, setMerchantList] = useState([]);
  const [reportList, setReportList] = useState([]);

  // Filter states
  const [selectedMerchant, setSelectedMerchant] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('daily');
  const [selectedReport, setSelectedReport] = useState('Deposit');

  // Category options
  const categoryList = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const categorySmsList = [{ value: 'daily', label: 'Daily' }];

  // Get available categories based on selected merchant
  const getAvailableCategories = () => {
    if (selectedMerchant === 'SMS') {
      return categorySmsList;
    }
    return categoryList;
  };

  // Validate category when merchant changes
  useEffect(() => {
    if (selectedMerchant === 'SMS' && selectedCategory !== 'daily') {
      setSelectedCategory('daily');
    }
  }, [selectedMerchant, selectedCategory]);

  // Load merchant list on init
  const loadMerchantList = async () => {
    try {
      const response = await merchantAPI.getMerchantList();

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'ok') {
          const merchants = response.data.records || [];
          // Add SMS option
          merchants.push({ merchantcode: 'SMS' });
          setMerchantList(merchants);
        }
      }
    } catch (error) {
      console.error('Error loading merchant list:', error);
    }
  };

  // Load report list on init
  const loadReportList = async () => {
    // Fallback list for DPAY server
    const defaultReports = [
      { report: 'Deposit', name: 'Deposit' },
      { report: 'Withdraw', name: 'Withdraw' },
      { report: 'Adjustment', name: 'Adjustment' },
      { report: 'Deposit_byComplete', name: 'Deposit By Complete' },
      { report: 'Withdraw_byComplete', name: 'Withdraw By Complete' },
      { report: 'Adjustment_byComplete', name: 'Adjustment By Complete' },
      { report: 'Deposit_GMT+6', name: 'Deposit GMT+6' },
      { report: 'Withdraw_GMT+6', name: 'Withdraw GMT+6' },
      { report: 'Deposit_byComplete_GMT+6', name: 'Deposit By Complete GMT+6' },
      {
        report: 'Withdraw_byComplete_GMT+6',
        name: 'Withdraw By Complete GMT+6',
      },
    ];

    try {
      const response = await merchantAPI.getReportList();

      if (response.success && response.data) {
        const records = response.data.records || [];
        if (records.length > 0) {
          setReportList(records);
          setSelectedReport(records[0].report);
          return;
        }
      }

      // Use fallback if API doesn't return valid data
      console.log('Using fallback report list');
      setReportList(defaultReports);
      setSelectedReport('Deposit');
    } catch (error) {
      console.error('Error loading report list:', error);
      // Use fallback if API fails
      setReportList(defaultReports);
      setSelectedReport('Deposit');
    }
  };

  // Load report files
  const loadReportFiles = async () => {
    setLoading(true);
    try {
      console.log('Request params:', {
        report: selectedReport,
        category: selectedCategory,
        merchantCode: selectedMerchant,
      });

      const response = await merchantAPI.getReportFiles(
        selectedReport,
        selectedCategory,
        selectedMerchant
      );

      console.log('API Response:', response);

      if (response.success && response.data) {
        if (response.data.status?.toLowerCase() === 'success') {
          const records = response.data.records || [];
          console.log('Setting files with records:', records);
          setFiles(records);

          if (records.length === 0) {
            showNotification({
              title: 'Info',
              message: 'No files available',
              color: 'blue',
            });
          }
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to load files',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load files',
          color: 'red',
        });
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to load files',
        color: 'red',
      });
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadReportFiles();
  };

  // Init - load merchant list and report list
  useEffect(() => {
    loadMerchantList();
    loadReportList();
  }, []);

  const merchantOptions = [
    { value: 'ALL', label: 'ALL' },
    ...merchantList.map((merchant) => ({
      value: merchant.merchantcode,
      label: merchant.merchantcode,
    })),
  ];

  const reportOptions = reportList.map((report) => ({
    value: report.report,
    label: report.name || report.report,
  }));

  const rows = files.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>
        <Text size="sm">{item.filename}</Text>
      </Table.Td>
      <Table.Td>
        <Anchor
          href={item.link}
          target="_blank"
          underline="never"
        >
          <Button
            size="xs"
            variant="filled"
            color="blue"
            leftSection={<IconDownload size={16} />}
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
                Download Report
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Download pre-generated report files
              </Text>
            </Box>
          </Group>

          {/* Filters */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 2.5 }}>
              <Select
                label="Merchant"
                placeholder="Select merchant"
                data={merchantOptions}
                value={selectedMerchant}
                onChange={setSelectedMerchant}
                size="sm"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Select
                label="Category"
                placeholder="Select category"
                data={getAvailableCategories()}
                value={selectedCategory}
                onChange={setSelectedCategory}
                size="sm"
              />
            </Grid.Col>
            {selectedMerchant !== 'SMS' && (
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Select
                  label="Report Type"
                  placeholder="Select report"
                  data={reportOptions}
                  value={selectedReport}
                  onChange={setSelectedReport}
                  size="sm"
                />
              </Grid.Col>
            )}
            <Grid.Col
              span={{ base: 12, md: 2 }}
              style={{ display: 'flex', alignItems: 'flex-end' }}
            >
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
                  minWidth: 600,
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
                    padding: '10px 16px',
                    fontSize: '14px',
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ minWidth: 400 }}>File Name</Table.Th>
                    <Table.Th style={{ minWidth: 130 }}>Link</Table.Th>
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
    </Box>
  );
};

export default DownloadReport;
