import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  IconDeviceFloppy,
  IconFilter,
  IconRefresh,
  IconSettings,
} from '@tabler/icons-react';
import { systemAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';
import { useTableControls } from '../../hooks/useTableControls';
import ColumnActionMenu from '../../components/ColumnActionMenu';

const defaultFilters = {
  id: '',
  label: '',
  value: '',
  option: '',
};

const normalizeSettings = (list = []) =>
  list.map((item) => ({
    ...item,
    label: item.label ?? item.id ?? '',
    value: item.value ?? '',
    options: Array.isArray(item.options)
      ? item.options.map((opt) => ({ ...opt }))
      : [],
  }));

const SystemSetting = () => {
  const [settings, setSettings] = useState([]);
  const [baseline, setBaseline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFilterChange = useCallback((column, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  const handleValueChange = useCallback((id, value) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              value: value ?? '',
            }
          : item
      )
    );
  }, []);

  const fetchSettings = useCallback(async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const response = await systemAPI.getSettings();
      if (response.success && response.data) {
        const payload = response.data;
        const status = (payload.status || '').toLowerCase();
        if (!payload.status || status === 'ok') {
          const list = Array.isArray(payload.data) ? payload.data : [];
          const normalized = normalizeSettings(list);
          setSettings(normalized);
          setBaseline(normalizeSettings(list));
          setCurrentPage(1);
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load system settings',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load system settings',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('System settings fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load system settings',
        color: 'red',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baselineMap = useMemo(
    () =>
      baseline.reduce((acc, item) => {
        acc[item.id] = item.value ?? '';
        return acc;
      }, {}),
    [baseline]
  );

  const hasChanges = useMemo(
    () => settings.some((item) => baselineMap[item.id] !== (item.value ?? '')),
    [settings, baselineMap]
  );

  const resetLocal = () => {
    setSettings(normalizeSettings(baseline));
    setSearch('');
    setColumnFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await systemAPI.saveSettings(settings);
      if (response.success && response.data) {
        const status = (response.data.status || '').toLowerCase();
        if (!response.data.status || status === 'ok') {
          showNotification({
            title: 'Success',
            message: response.data.message || 'System settings saved',
            color: 'green',
          });
          setBaseline(normalizeSettings(settings));
        } else {
          showNotification({
            title: 'Error',
            message: response.data.message || 'Failed to save settings',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to save settings',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('System settings save error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to save system settings',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const includesValue = (field, value) => {
    if (!value) return true;
    return (field ?? '').toString().toLowerCase().includes(value.toLowerCase());
  };

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    return settings.filter((item) => {
      const optionsText = (item.options || [])
        .map((opt) => opt.optionLabel || opt.label || opt.optionId || '')
        .join(' ')
        .toLowerCase();
      const matchesSearch =
        !query ||
        [item.id, item.label, item.value].some((val) =>
          (val ?? '').toString().toLowerCase().includes(query)
        );
      return (
        matchesSearch &&
        includesValue(item.id, columnFilters.id) &&
        includesValue(item.label, columnFilters.label) &&
        includesValue(item.value, columnFilters.value) &&
        includesValue(optionsText, columnFilters.option)
      );
    });
  }, [settings, search, columnFilters]);

  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'Key',
        minWidth: 180,
        render: (item) => (
          <Text
            size="sm"
            fw={600}
          >
            {item.id}
          </Text>
        ),
        filter: (
          <TextInput
            placeholder="Filter key..."
            size="xs"
            value={columnFilters.id}
            onChange={(e) => handleFilterChange('id', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'label',
        label: 'Label',
        minWidth: 220,
        render: (item) => <Text size="sm">{item.label || item.id}</Text>,
        filter: (
          <TextInput
            placeholder="Filter label..."
            size="xs"
            value={columnFilters.label}
            onChange={(e) => handleFilterChange('label', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'value',
        label: 'Value',
        minWidth: 260,
        render: (item) => {
          const options = Array.isArray(item.options) ? item.options : [];
          if (options.length > 0) {
            return (
              <Select
                size="xs"
                data={options.map((opt) => ({
                  value: String(opt.optionId ?? opt.value ?? opt.id ?? ''),
                  label: opt.optionLabel ?? opt.label ?? String(opt.optionId ?? ''),
                }))}
                value={item.value === null || item.value === undefined ? '' : String(item.value)}
                onChange={(val) => handleValueChange(item.id, val ?? '')}
                placeholder="Select option"
                searchable
                nothingFoundMessage="No options"
              />
            );
          }
          return (
            <TextInput
              size="xs"
              value={item.value ?? ''}
              onChange={(e) => handleValueChange(item.id, e.currentTarget.value)}
              placeholder="Enter value"
            />
          );
        },
        filter: (
          <TextInput
            placeholder="Filter value..."
            size="xs"
            value={columnFilters.value}
            onChange={(e) => handleFilterChange('value', e.currentTarget.value)}
          />
        ),
      },
      {
        key: 'options',
        label: 'Options',
        minWidth: 240,
        render: (item) => {
          const list = Array.isArray(item.options) ? item.options : [];
          if (list.length === 0) {
            return (
              <Text
                size="sm"
                c="dimmed"
              >
                -
              </Text>
            );
          }
          return (
            <Text
              size="sm"
              c="dimmed"
            >
              {list
                .map((opt) => opt.optionLabel || opt.label || opt.optionId || '')
                .filter(Boolean)
                .join(', ')}
            </Text>
          );
        },
        filter: (
          <TextInput
            placeholder="Filter options..."
            size="xs"
            value={columnFilters.option}
            onChange={(e) => handleFilterChange('option', e.currentTarget.value)}
          />
        ),
      },
    ],
    [columnFilters, handleFilterChange, handleValueChange]
  );

  const {
    visibleColumns,
    sortConfig,
    handleHideColumn,
    handleSort,
    handleResetAll: resetTableControls,
  } = useTableControls(columns, {
    onResetFilters: () => setColumnFilters(defaultFilters),
  });

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
  }, [search, columnFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const resetEverything = () => {
    resetLocal();
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
          visible={loading || saving}
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
                  System Settings
                </Text>
              </Group>
              <Text
                size="sm"
                c="dimmed"
              >
                Manage configuration values from the legacy System Setting menu.
              </Text>
            </Box>

            <Group gap="xs">
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing}
                onClick={() => fetchSettings({ silent: true })}
              >
                Refresh
              </Button>
              <Button
                variant="light"
                color="gray"
                radius="md"
                size="sm"
                leftSection={<IconFilter size={18} />}
                onClick={resetEverything}
              >
                Reset
              </Button>
              <Button
                leftSection={<IconDeviceFloppy size={18} />}
                color="blue"
                radius="md"
                onClick={handleSave}
                loading={saving}
                disabled={!settings.length}
              >
                Save Changes
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
                <TextInput
                  label="Search"
                  placeholder="Search by key, label, or value"
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  size="sm"
                  style={{ minWidth: 260 }}
                />
                <Badge
                  color={hasChanges ? 'yellow' : 'green'}
                  variant="light"
                >
                  {hasChanges ? 'Unsaved changes' : 'All changes saved'}
                </Badge>
                <Badge
                  color="blue"
                  variant="light"
                >
                  Settings: {filteredData.length}
                </Badge>
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
                    paginatedData.map((item) => (
                      <Table.Tr key={item.id}>
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
                          Total settings: {filteredData.length}
                        </Text>
                        {hasChanges && (
                          <Text
                            size="sm"
                            c="orange"
                          >
                            Changes are only saved after clicking Save Changes.
                          </Text>
                        )}
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

export default SystemSetting;
