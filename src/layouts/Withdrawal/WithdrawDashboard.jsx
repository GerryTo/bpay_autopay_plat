import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowUpCircle,
  IconBolt,
  IconClock,
  IconGauge,
  IconRefresh,
} from '@tabler/icons-react';
import { withdrawAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const initialStats = {
  agentHbDisconnect: 0,
  withdrawCompleted: 0,
  withdrawPending: 0,
  withdrawProcessing: 0,
  withdrawNeedAttention: 0,
  pending5Minute: 0,
  lastWithdraw: '-',
  averageNagadSeconds: 0,
  averageBkashSeconds: 0,
  bkashProcessing: 0,
  bkashReady: 0,
  bkashAvailable: 0,
  bkashLowBalance: 0,
  bkashPending: 0,
  bkashAssigned: 0,
  bkashNeedAttention: 0,
  nagadProcessing: 0,
  nagadReady: 0,
  nagadAvailable: 0,
  nagadLowBalance: 0,
  nagadPending: 0,
  nagadAssigned: 0,
  nagadNeedAttention: 0,
};

const formatNumber = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '0';
  return numeric.toLocaleString('en-US');
};

const formatDuration = (seconds) => {
  const totalSeconds = Number(seconds) || 0;
  const minutes = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return `${minutes}m ${secs}s`;
};

const StatCard = ({ label, value, description, icon, color = 'blue' }) => (
  <Paper
    withBorder
    radius="md"
    p="md"
    shadow="xs"
  >
    <Group
      justify="space-between"
      align="flex-start"
    >
      <Stack gap={4}>
        <Text
          size="sm"
          c="dimmed"
        >
          {label}
        </Text>
        <Text
          size="xl"
          fw={700}
        >
          {value}
        </Text>
        {description ? (
          <Text
            size="xs"
            c="dimmed"
          >
            {description}
          </Text>
        ) : null}
      </Stack>
      {icon ? (
        <ThemeIcon
          variant="light"
          color={color}
          radius="md"
          size={38}
        >
          {icon}
        </ThemeIcon>
      ) : null}
    </Group>
  </Paper>
);

const ChannelCard = ({ title, metrics, color, icon }) => (
  <Card
    withBorder
    radius="md"
    padding="md"
    shadow="xs"
  >
    <Group
      justify="space-between"
      align="center"
      mb="xs"
    >
      <Group gap="xs">
        <ThemeIcon
          color={color}
          variant="light"
          radius="md"
        >
          {icon}
        </ThemeIcon>
        <Text fw={700}>{title}</Text>
      </Group>
    </Group>

    <Divider my="xs" />

    <SimpleGrid
      cols={3}
      spacing="sm"
      breakpoints={[
        { maxWidth: 'md', cols: 2 },
        { maxWidth: 'sm', cols: 1 },
      ]}
    >
      {metrics.map((item) => (
        <StatCard
          key={`${title}-${item.label}`}
          label={item.label}
          value={formatNumber(item.value)}
          color={item.color}
        />
      ))}
    </SimpleGrid>
  </Card>
);

const WithdrawDashboard = () => {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetchingRef = useRef(false);

  const fetchDashboard = useCallback(async ({ silent = false } = {}) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await withdrawAPI.getDashboardMetrics();
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          const record = payload.records?.[0] || {};
          const toNumber = (value) => Number(value) || 0;

          setStats({
            agentHbDisconnect: toNumber(record.resHBDisconnected?.total),
            withdrawNeedAttention: toNumber(record.resFailed2Times?.total),
            withdrawProcessing: toNumber(record.resWithdrawTBP?.total),
            withdrawCompleted: toNumber(record.resWithdrawCompleted?.total),
            withdrawPending: toNumber(record.resWdPending?.total),
            pending5Minute: toNumber(record.resPending5Minutes?.total),
            lastWithdraw: record.resLastWD?.d_completedate || '-',
            averageNagadSeconds: toNumber(record.resAverageWDNagad?.avg_duration),
            averageBkashSeconds: toNumber(record.resAverageWDBkash?.avg_duration),
            bkashProcessing: toNumber(record.resBkashWithdrawTBP?.total),
            bkashReady: toNumber(record.resBkashAFW?.total),
            bkashAvailable: toNumber(record.resBkashA?.total),
            bkashLowBalance: toNumber(record.resBkashLow?.total),
            bkashPending: toNumber(record.resBkashPending?.total),
            bkashAssigned: toNumber(record.resBkashAssigned?.total),
            bkashNeedAttention: toNumber(record.resBkashNeedAttention?.total),
            nagadProcessing: toNumber(record.resNagadWithdrawTBP?.total),
            nagadReady: toNumber(record.resNagadAFW?.total),
            nagadAvailable: toNumber(record.resNagadA?.total),
            nagadLowBalance: toNumber(record.resNagadLow?.total),
            nagadPending: toNumber(record.resNagadPending?.total),
            nagadAssigned: toNumber(record.resNagadAssigned?.total),
            nagadNeedAttention: toNumber(record.resNagadNeedAttention?.total),
          });
          setLastUpdated(new Date());
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load withdraw data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load withdraw data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Withdraw dashboard fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load withdraw dashboard',
        color: 'red',
      });
    } finally {
      fetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = setInterval(() => {
      fetchDashboard({ silent: true });
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboard]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return 'No updates yet';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(lastUpdated);
  }, [lastUpdated]);

  const nagadMetrics = useMemo(
    () => [
      { label: 'Processing', value: stats.nagadProcessing, color: 'teal' },
      { label: 'Pending', value: stats.nagadPending, color: 'orange' },
      { label: 'Assigned', value: stats.nagadAssigned, color: 'blue' },
      { label: 'Need Attention', value: stats.nagadNeedAttention, color: 'red' },
      { label: 'Agent Ready', value: stats.nagadReady, color: 'green' },
      { label: 'Agent Available', value: stats.nagadAvailable, color: 'lime' },
      { label: 'Low Balance', value: stats.nagadLowBalance, color: 'yellow' },
    ],
    [
      stats.nagadAssigned,
      stats.nagadAvailable,
      stats.nagadLowBalance,
      stats.nagadNeedAttention,
      stats.nagadPending,
      stats.nagadProcessing,
      stats.nagadReady,
    ]
  );

  const bkashMetrics = useMemo(
    () => [
      { label: 'Processing', value: stats.bkashProcessing, color: 'cyan' },
      { label: 'Pending', value: stats.bkashPending, color: 'orange' },
      { label: 'Assigned', value: stats.bkashAssigned, color: 'blue' },
      { label: 'Need Attention', value: stats.bkashNeedAttention, color: 'red' },
      { label: 'Agent Ready', value: stats.bkashReady, color: 'green' },
      { label: 'Agent Available', value: stats.bkashAvailable, color: 'lime' },
      { label: 'Low Balance', value: stats.bkashLowBalance, color: 'yellow' },
    ],
    [
      stats.bkashAssigned,
      stats.bkashAvailable,
      stats.bkashLowBalance,
      stats.bkashNeedAttention,
      stats.bkashPending,
      stats.bkashProcessing,
      stats.bkashReady,
    ]
  );

  const averageStats = useMemo(
    () => [
      {
        label: 'Average NAGAD Withdraw Time',
        value: formatDuration(stats.averageNagadSeconds),
        color: 'teal',
      },
      {
        label: 'Average BKASH Withdraw Time',
        value: formatDuration(stats.averageBkashSeconds),
        color: 'cyan',
      },
    ],
    [stats.averageBkashSeconds, stats.averageNagadSeconds]
  );

  return (
    <Box p="md">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{ position: 'relative' }}
      >
        <LoadingOverlay
          visible={loading}
          overlayProps={{ radius: 'md', blur: 2 }}
          loaderProps={{ color: 'blue', type: 'dots' }}
        />

        <Stack gap="lg">
          <Group
            justify="space-between"
            align="flex-start"
          >
            <Box>
              <Text
                size="xl"
                fw={700}
              >
                Withdraw Dashboard Automation
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Realtime withdraw performance summary (styled like Data List)
              </Text>
            </Box>

            <Group gap="xs">
              <Text
                size="sm"
                c="dimmed"
              >
                Auto refresh 10s
              </Text>
              <Switch
                checked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.currentTarget.checked)}
                color="blue"
              />
              <Button
                leftSection={<IconRefresh size={18} />}
                variant="light"
                color="blue"
                radius="md"
                loading={refreshing}
                onClick={() => fetchDashboard({ silent: true })}
              >
                Refresh
              </Button>
            </Group>
          </Group>

          <Group gap="sm">
            <Badge
              variant="light"
              color="gray"
            >
              Last update: {lastUpdatedLabel}
            </Badge>
            {stats.agentHbDisconnect ? (
              <Badge
                leftSection={<IconActivity size={14} />}
                color="red"
                variant="light"
              >
                HB Disconnect: {formatNumber(stats.agentHbDisconnect)}
              </Badge>
            ) : null}
          </Group>

          <Stack gap="sm">
            <Text
              fw={700}
              size="sm"
              c="dimmed"
            >
              Today's Summary
            </Text>
            <SimpleGrid
              cols={3}
              spacing="md"
              breakpoints={[
                { maxWidth: 'lg', cols: 3 },
                { maxWidth: 'md', cols: 2 },
                { maxWidth: 'sm', cols: 1 },
              ]}
            >
              <StatCard
                label="Last Withdraw Time"
                value={stats.lastWithdraw || '-'}
                description="Completion time of the latest withdraw"
                icon={<IconClock size={18} />}
                color="indigo"
              />
              <StatCard
                label="Withdraw Completed"
                value={formatNumber(stats.withdrawCompleted)}
                icon={<IconArrowUpCircle size={18} />}
                color="green"
              />
              <StatCard
                label="Withdraw Pending"
                value={formatNumber(stats.withdrawPending)}
                description="Waiting to be processed"
                icon={<IconClock size={18} />}
                color="orange"
              />
              <StatCard
                label="Withdraw Processing"
                value={formatNumber(stats.withdrawProcessing)}
                description="Currently in progress"
                icon={<IconRefresh size={18} />}
                color="blue"
              />
              <StatCard
                label="Need Attention"
                value={formatNumber(stats.withdrawNeedAttention)}
                description="Failed twice or manual review"
                icon={<IconAlertTriangle size={18} />}
                color="red"
              />
              <StatCard
                label="Pending > 5 Minutes"
                value={formatNumber(stats.pending5Minute)}
                description="Auto-order to check"
                icon={<IconBolt size={18} />}
                color="teal"
              />
            </SimpleGrid>
          </Stack>

          <Stack gap="sm">
            <Text
              fw={700}
              size="sm"
              c="dimmed"
            >
              Average Withdraw Time
            </Text>
            <SimpleGrid
              cols={2}
              spacing="md"
              breakpoints={[
                { maxWidth: 'sm', cols: 1 },
              ]}
            >
              {averageStats.map((item) => (
                <StatCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  icon={<IconGauge size={18} />}
                  color={item.color}
                />
              ))}
            </SimpleGrid>
          </Stack>

          <Stack gap="sm">
            <Text
              fw={700}
              size="sm"
              c="dimmed"
            >
              By Channel
            </Text>
            <SimpleGrid
              cols={2}
              spacing="md"
              breakpoints={[
                { maxWidth: 'md', cols: 1 },
              ]}
            >
              <ChannelCard
                title="NAGAD"
                metrics={nagadMetrics}
                color="teal"
                icon={<IconBolt size={18} />}
              />
              <ChannelCard
                title="BKASH"
                metrics={bkashMetrics}
                color="cyan"
                icon={<IconActivity size={18} />}
              />
            </SimpleGrid>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default WithdrawDashboard;
