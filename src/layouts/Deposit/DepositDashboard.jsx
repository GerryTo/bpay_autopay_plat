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
  IconArrowDownCircle,
  IconBolt,
  IconClock,
  IconGauge,
  IconRefresh,
} from '@tabler/icons-react';
import { depositAPI } from '../../helper/api';
import { showNotification } from '../../helper/showNotification';

const initialStats = {
  agentHbDisconnect: 0,
  deposit: 0,
  depositPending: 0,
  depositNeedAttention: 0,
  nagadDeposit: 0,
  nagadDepositPending: 0,
  nagadDepositNeedAttention: 0,
  bkashDeposit: 0,
  bkashDepositPending: 0,
  bkashDepositNeedAttention: 0,
  lastDeposit: '-',
  pending5Minute: 0,
  averageNagadSeconds: 0,
  averageBkashSeconds: 0,
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
        {description && (
          <Text
            size="xs"
            c="dimmed"
          >
            {description}
          </Text>
        )}
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

const ChannelCard = ({ title, stats, color, icon }) => (
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
      <Badge
        variant="light"
        color={color}
      >
        Total {formatNumber(stats.total)}
      </Badge>
    </Group>

    <Divider my="xs" />

    <SimpleGrid
      cols={3}
      spacing="sm"
      breakpoints={[
        { maxWidth: 'md', cols: 3 },
        { maxWidth: 'sm', cols: 1 },
      ]}
    >
      <StatCard
        label="Deposit"
        value={formatNumber(stats.total)}
        color={color}
      />
      <StatCard
        label="Pending"
        value={formatNumber(stats.pending)}
        color="orange"
      />
      <StatCard
        label="Need Attention"
        value={formatNumber(stats.needAttention)}
        color="red"
      />
    </SimpleGrid>
  </Card>
);

const DepositDashboard = () => {
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
      const response = await depositAPI.getDashboardMetrics();
      if (response.success && response.data) {
        const payload = response.data;
        if ((payload.status || '').toLowerCase() === 'ok') {
          const record = payload.records?.[0] || {};
          setStats({
            agentHbDisconnect: Number(record.resHBDisconnected?.total) || 0,
            deposit: Number(record.resDeposit?.total) || 0,
            depositPending: Number(record.resDepositPending?.total) || 0,
            depositNeedAttention:
              Number(record.resDepositNeedAttention?.total) || 0,
            nagadDeposit: Number(record.resNagadDeposit?.total) || 0,
            nagadDepositPending:
              Number(record.resNagadDepositPending?.total) || 0,
            nagadDepositNeedAttention:
              Number(record.resNagadDepositNeedAttention?.total) || 0,
            bkashDeposit: Number(record.resBkashDeposit?.total) || 0,
            bkashDepositPending:
              Number(record.resBkashDepositPending?.total) || 0,
            bkashDepositNeedAttention:
              Number(record.resBkashDepositNeedAttention?.total) || 0,
            lastDeposit: record.resLastDeposit?.d_completedate || '-',
            pending5Minute: Number(record.resPending5Minutes?.total) || 0,
            averageNagadSeconds:
              Number(record.resAverageDPNagad?.avg_duration) || 0,
            averageBkashSeconds:
              Number(record.resAverageDPBkash?.avg_duration) || 0,
          });
          setLastUpdated(new Date());
        } else {
          showNotification({
            title: 'Error',
            message: payload.message || 'Failed to load deposit data',
            color: 'red',
          });
        }
      } else {
        showNotification({
          title: 'Error',
          message: response.error || 'Failed to load deposit data',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Deposit dashboard fetch error:', error);
      showNotification({
        title: 'Error',
        message: 'Unable to load deposit dashboard',
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
    }, 5000);
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

  const nagadStats = useMemo(
    () => ({
      total: stats.nagadDeposit,
      pending: stats.nagadDepositPending,
      needAttention: stats.nagadDepositNeedAttention,
    }),
    [
      stats.nagadDeposit,
      stats.nagadDepositNeedAttention,
      stats.nagadDepositPending,
    ]
  );

  const bkashStats = useMemo(
    () => ({
      total: stats.bkashDeposit,
      pending: stats.bkashDepositPending,
      needAttention: stats.bkashDepositNeedAttention,
    }),
    [
      stats.bkashDeposit,
      stats.bkashDepositNeedAttention,
      stats.bkashDepositPending,
    ]
  );

  const averageStats = useMemo(
    () => [
      {
        label: 'Average NAGAD Deposit Time',
        value: formatDuration(stats.averageNagadSeconds),
        color: 'teal',
      },
      {
        label: 'Average BKASH Deposit Time',
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
                Deposit Dashboard Automation
              </Text>
              <Text
                size="sm"
                c="dimmed"
              >
                Daily deposit performance summary
              </Text>
            </Box>

            <Group gap="xs">
              <Text
                size="sm"
                c="dimmed"
              >
                Auto refresh 5s
              </Text>
              <Switch
                checked={autoRefresh}
                onChange={(event) =>
                  setAutoRefresh(event.currentTarget.checked)
                }
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
              cols={5}
              spacing="md"
              breakpoints={[
                { maxWidth: 'lg', cols: 4 },
                { maxWidth: 'md', cols: 3 },
                { maxWidth: 'sm', cols: 1 },
              ]}
            >
              <StatCard
                label="Last Deposit Time"
                value={stats.lastDeposit || '-'}
                description="Completion time of the latest deposit"
                icon={<IconClock size={18} />}
                color="indigo"
              />
              <StatCard
                label="Total Deposit Today"
                value={formatNumber(stats.deposit)}
                icon={<IconArrowDownCircle size={18} />}
                color="blue"
              />
              <StatCard
                label="Pending Today"
                value={formatNumber(stats.depositPending)}
                description="Waiting to be processed"
                icon={<IconClock size={18} />}
                color="orange"
              />
              <StatCard
                label="Need Attention Today"
                value={formatNumber(stats.depositNeedAttention)}
                description="Requires manual review"
                icon={<IconAlertTriangle size={18} />}
                color="red"
              />
              <StatCard
                label="Auto-order need to check"
                value={formatNumber(stats.pending5Minute)}
                description="Pending over 5 minutes"
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
              Average Deposit Time
            </Text>
            <SimpleGrid
              cols={2}
              spacing="md"
              breakpoints={[{ maxWidth: 'sm', cols: 1 }]}
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
              breakpoints={[{ maxWidth: 'md', cols: 1 }]}
            >
              <ChannelCard
                title="NAGAD"
                stats={nagadStats}
                color="teal"
                icon={<IconBolt size={18} />}
              />
              <ChannelCard
                title="BKASH"
                stats={bkashStats}
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

export default DepositDashboard;
