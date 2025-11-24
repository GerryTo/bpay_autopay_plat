import {
  IconLayoutDashboard,
  IconBolt,
  IconFileText,
  IconBuildingBank,
  IconReportMoney,
  IconUsers,
  IconUserShield,
  IconShoppingCart,
  IconArrowDownCircle,
  IconArrowUpCircle,
  IconTransfer,
  IconMessage,
  IconRobot,
  IconCash,
  IconAlertTriangle,
  IconSettings,
  IconBrandTelegram,
} from '@tabler/icons-react';
import Dashboard from './layouts/dashboardPage';
import AccountList from './layouts/userManagement/accountList';
import AccountForm from './layouts/userManagement/accountForm';
import AutomationList from './layouts/userManagement/automationList';
import AutomationListAdmin from './layouts/userManagement/automationListAdmin';
import AutomationForm from './layouts/userManagement/automationForm';
import ServerList from './layouts/userManagement/serverList';
import ServerForm from './layouts/userManagement/serverForm';
import AutomationError from './layouts/userManagement/automationError';
import AgentGroupList from './layouts/Agent/agentGroupList';
import AgentGroupForm from './layouts/Agent/agentGroupForm';
import AgentCommissionSettlement from './layouts/Agent/agentCommissionSettlement';
import AgentCredit from './layouts/Agent/agentCredit';
import AgentCreditRequest from './layouts/Agent/agentCreditRequest';
import AgentCurrentBalance from './layouts/Agent/agentCurrentBalance';
import AgentTransactionSummary from './layouts/Agent/agentTransactionSummary';
import MerchantMaster from './layouts/Merchant/MerchantMaster';
import MerchantForm from './layouts/Merchant/MerchantForm';
import MerchantBankAcc from './layouts/Merchant/MerchantBankAcc';
import MerchantTransaction from './layouts/Merchant/MerchantTransaction';
import MerchantTransactionHistory from './layouts/Merchant/MerchantTransactionHistory';
import ReportMerchant from './layouts/Merchant/ReportMerchant';
import MerchantDailyReportGMT6 from './layouts/Report/MerchantDailyReportGMT6';
import MerchantDailyReportGMT8 from './layouts/Report/MerchantDailyReportGMT8';
import AgentDailyComplete from './layouts/Report/AgentDailyComplete';
import AgentDailyCompleteGMT6 from './layouts/Report/AgentDailyCompleteGMT6';
import AgentRealtimeReport from './layouts/Report/AgentRealtimeReport';
import AgentRealtimeReportGMT6 from './layouts/Report/AgentRealtimeReportGMT6';
import BalanceDifference from './layouts/Report/BalanceDifference';
import SmsLogByAgentReport from './layouts/Report/SmsLogByAgentReport';
import DownloadReport from './layouts/Report/DownloadReport';
import MCO from './layouts/Report/MCO';
import BlacklistList from './layouts/Report/BlacklistList';
import SummaryBkashm from './layouts/Report/SummaryBkashm';

export const mockdataRoutes = [
  {
    title: 'Dashboard',
    links: [
      {
        label: 'Dashboard Merchant',
        icon: <IconLayoutDashboard />,
        link: '/dashboard-merchant',
        element: <Dashboard />,
      },
    ],
  },
  {
    title: 'NEW Quick Menu',
    links: [
      {
        label: 'Mybank Inactive Log',
        icon: <IconFileText />,
        link: '/mybank-inactive-log',
        element: '',
      },
      {
        label: 'Resubmit Express',
        icon: <IconBolt />,
        link: '/resubmit-express',
        element: '',
      },
      {
        label: 'Resubmit Express - Super Admin',
        icon: <IconBolt />,
        link: '/resubmit-express-new',
        element: '',
      },
      {
        label: 'Report Resubmit without Automation',
        icon: <IconFileText />,
        link: '/report-resubmit-without-automation',
        element: '',
      },
      {
        label: 'Report Resubmit without Automation Summary',
        icon: <IconFileText />,
        link: '/report-resubmit-without-automation-summary',
        element: '',
      },
      {
        label: 'Account Status New',
        icon: <IconSettings />,
        link: '/status-account-crawler-new',
        element: '',
      },
    ],
  },
  {
    title: 'Quick Menu',
    links: [
      {
        label: 'Deposit',
        icon: <IconArrowDownCircle />,
        links: [
          {
            label: 'SMS Log',
            icon: <IconMessage />,
            link: '/sms-log',
            element: '',
          },
          {
            label: 'Crawler List',
            icon: <IconRobot />,
            link: '/appium-list',
            element: '',
          },
          {
            label: 'SMS Log by Id',
            icon: <IconMessage />,
            link: '/smslog-by-id',
            element: '',
          },
          {
            label: 'Transaction by Id',
            icon: <IconTransfer />,
            link: '/transaction-by-id',
            element: '',
          },
          {
            label: 'MCO',
            icon: <IconAlertTriangle />,
            link: '/report-flag',
            element: <MCO />,
          },
          {
            label: 'Update MyBank Selected',
            icon: <IconBuildingBank />,
            link: '/update-mybank-selected',
            element: '',
          },
          {
            label: 'Transaction Resend Callback',
            icon: <IconBrandTelegram />,
            link: '/transaction-callback-empty',
            element: '',
          },
          {
            label: 'Resend Callback More Than 15 Minute',
            icon: <IconBrandTelegram />,
            link: '/transaction-callback-502',
            element: '',
          },
          {
            label: 'Resubmit Transaction',
            icon: <IconBolt />,
            link: '/resubmit-transaction',
            element: '',
          },
          {
            label: 'Find Transaction Member',
            icon: <IconTransfer />,
            link: '/find-transaction-member',
            element: '',
          },
          {
            label: 'SMS Failed Match',
            icon: <IconMessage />,
            link: '/sms-failed-match',
            element: '',
          },
          {
            label: 'Automation Deposit List',
            icon: <IconRobot />,
            link: '/new-deposit-list',
            element: '',
          },
          {
            label: 'Mybank Check Deposit',
            icon: <IconBuildingBank />,
            link: '/mybank-check-deposit',
            element: '',
          },
        ],
      },
      {
        label: 'Withdraw',
        icon: <IconArrowUpCircle />,
        links: [
          {
            label: 'SMS Log',
            icon: <IconMessage />,
            link: '/sms-log',
            element: '',
          },
          {
            label: 'Transaction by Id',
            icon: <IconTransfer />,
            link: '/transaction-by-id',
            element: '',
          },
          {
            label: 'Withdraw Check',
            icon: <IconArrowUpCircle />,
            link: '/withdraw-ntc',
            element: '',
          },
          {
            label: 'Withdraw Check Filter',
            icon: <IconArrowUpCircle />,
            link: '/withdraw-ntc-filter',
            element: '',
          },
          {
            label: 'Withdraw Check Automation',
            icon: <IconRobot />,
            link: '/withdraw-ntc-automation',
            element: '',
          },
          {
            label: 'Withdraw Check Filter Bulk',
            icon: <IconArrowUpCircle />,
            link: '/withdraw-ntc-filter-selected',
            element: '',
          },
          {
            label: 'Transaction Merchant Hour',
            icon: <IconShoppingCart />,
            link: '/merchant-transaction-per-hour',
            element: '',
          },
          {
            label: 'ALL Automation Withdraw List',
            icon: <IconRobot />,
            link: '/Automation-withdraw-list',
            element: '',
          },
        ],
      },
      {
        label: 'Report',
        icon: <IconFileText />,
        links: [
          {
            label: 'Download Report',
            icon: <IconFileText />,
            link: '/report',
            element: <DownloadReport />,
          },
          {
            label: 'Account Balance Log',
            icon: <IconBuildingBank />,
            link: '/account-balance-log',
            element: '',
          },
          {
            label: 'Merchant Daily (GMT+6)',
            icon: <IconReportMoney />,
            link: '/master-report-daily-admin-complete',
            element: <MerchantDailyReportGMT6 />,
          },
          {
            label: 'Merchant Daily (GMT+8)',
            icon: <IconReportMoney />,
            link: '/master-report-daily-admin-complete',
            element: <MerchantDailyReportGMT8 />,
          },
          {
            label: 'Agent Daily complete (GMT+8)',
            icon: <IconReportMoney />,
            link: '/acc-report-daily-complete',
            element: <AgentDailyComplete />,
          },
          {
            label: 'Agent success Trans Realtime (GMT+6)',
            icon: <IconReportMoney />,
            link: '/acc-report-daily-realtime-6',
            element: <AgentDailyCompleteGMT6 />,
          },
        ],
      },
      {
        label: 'Fraud',
        icon: <IconAlertTriangle />,
        links: [
          {
            label: 'MCO',
            icon: <IconAlertTriangle />,
            link: '/report-flag',
            element: '',
          },
          {
            label: 'Find Transaction Member',
            icon: <IconTransfer />,
            link: '/find-transaction-member',
            element: '',
          },
          {
            label: 'Blacklist List',
            icon: <IconAlertTriangle />,
            link: '/report-blacklist',
            element: <BlacklistList />,
          },
          // {
          //   label: 'Release Blacklist',
          //   icon: <IconAlertTriangle />,
          //   link: '/report-blacklist-release',
          //   element: '',
          // },
        ],
      },
    ],
  },
  {
    title: 'My BankACC',
    links: [
      {
        label: 'Data List',
        icon: <IconBuildingBank />,
        link: '/master-mybank',
        element: '',
      },
      {
        label: 'Data List Inactive',
        icon: <IconBuildingBank />,
        link: '/mybank-inactive',
        element: '',
      },
      {
        label: 'List Onboard Agent',
        icon: <IconUsers />,
        link: '/list-onboard-agent',
        element: '',
      },
      {
        label: 'Update MyBank',
        icon: <IconBuildingBank />,
        link: '/update-mybank',
        element: '',
      },
      {
        label: 'Update MyBank Selected',
        icon: <IconBuildingBank />,
        link: '/update-mybank-selected',
        element: '',
      },
      {
        label: 'Update Merchant Bank Acc Selected',
        icon: <IconShoppingCart />,
        link: '/update-merchant-bank-selected',
        element: '',
      },
      {
        label: 'MyBank Balance',
        icon: <IconCash />,
        link: '/mybank-balance',
        element: '',
      },
      {
        label: 'MyBank Limit',
        icon: <IconCash />,
        link: '/mybank-limit',
        element: '',
      },
    ],
  },
  {
    title: 'Report',
    links: [
      {
        label: 'Merchant Daily (GMT+8)',
        icon: <IconReportMoney />,
        link: '/master-report-daily-admin-complete-gmt8',
        element: <MerchantDailyReportGMT8 />,
      },
      {
        label: 'Merchant Daily (GMT+6)',
        icon: <IconReportMoney />,
        link: '/master-report-daily-admin-complete-Gmt6',
        element: <MerchantDailyReportGMT6 />,
      },
      {
        label: 'Agent Daily complete (GMT+8)',
        icon: <IconReportMoney />,
        link: '/acc-report-daily-complete',
        element: <AgentDailyComplete />,
      },
      {
        label: 'Agent success Trans Realtime (GMT+8)',
        icon: <IconReportMoney />,
        link: '/acc-report-daily-realtime',
        element: <AgentRealtimeReport />,
      },
      {
        label: 'Agent Daily complete (GMT+6)',
        icon: <IconReportMoney />,
        link: '/acc-report-daily-complete-6',
        element: <AgentDailyCompleteGMT6 />,
      },
      {
        label: 'Agent success Trans Realtime (GMT+6)',
        icon: <IconReportMoney />,
        link: '/acc-report-daily-realtime-6',
        element: <AgentRealtimeReportGMT6 />,
      },
      {
        label: 'Balance Difference',
        icon: <IconCash />,
        link: '/balance-difference',
        element: <BalanceDifference />,
      },
      {
        label: 'Account Report By SMS Daily',
        icon: <IconMessage />,
        link: '/sms-log-by-agent-report',
        element: <SmsLogByAgentReport />,
      },
      {
        label: 'Download Report',
        icon: <IconFileText />,
        link: '/report',
        element: <DownloadReport />,
      },
      {
        label: 'MCO',
        icon: <IconAlertTriangle />,
        link: '/report-flag',
        element: <MCO />,
      },
      {
        label: 'Blacklist List',
        icon: <IconAlertTriangle />,
        link: '/report-blacklist',
        element: <BlacklistList />,
      },
      // {
      //   label: 'Release Blacklist',
      //   icon: <IconAlertTriangle />,
      //   link: '/report-blacklist-release',
      //   element: '',
      // },
      {
        label: 'Summary Bkashm',
        icon: <IconFileText />,
        link: '/summary-bkashm',
        element: <SummaryBkashm />,
      },
    ],
  },
  {
    title: 'User Management',
    links: [
      {
        label: 'Accounts',
        icon: <IconUsers />,
        link: '/login-list',
        element: <AccountList />,
      },
      {
        label: 'Automation List',
        icon: <IconRobot />,
        link: '/automation-create-list',
        element: <AutomationList />,
      },
      {
        label: 'Automation List Admin',
        icon: <IconRobot />,
        link: '/automation-create-list-admin',
        element: <AutomationListAdmin />,
      },
      {
        label: 'Server List',
        icon: <IconSettings />,
        link: '/server-list',
        element: <ServerList />,
      },
      {
        label: 'Automation Error',
        icon: <IconAlertTriangle />,
        link: '/automation-error-list',
        element: <AutomationError />,
      },
    ],
  },
  {
    title: 'Agent',
    links: [
      {
        label: 'Agent Group',
        icon: <IconUsers />,
        link: '/agentgroup',
        element: <AgentGroupList />,
      },
      {
        label: 'Agent Comm. Settlement',
        icon: <IconCash />,
        link: '/agent-commission-settlement',
        element: <AgentCommissionSettlement />,
      },
      {
        label: 'Agent Credit',
        icon: <IconCash />,
        link: '/agent-credit',
        element: <AgentCredit />,
      },
      {
        label: 'Agent Credit Monitoring',
        icon: <IconCash />,
        link: '/agent-credit-monitoring',
        element: '',
      },
      {
        label: 'Agent Credit Request',
        icon: <IconCash />,
        link: '/agent-credit-request',
        element: <AgentCreditRequest />,
      },
      {
        label: 'Agent Report Transaction',
        icon: <IconReportMoney />,
        link: '/agent-report-transaction',
        element: '',
      },
      {
        label: 'Agent Current Balance GMT+6',
        icon: <IconCash />,
        link: '/current-balance-by-agent-5-new-latest',
        element: '',
      },
      {
        label: 'Agent Current Balance GMT+6 NEW',
        icon: <IconCash />,
        link: '/current-balance-by-agent-live-latest',
        element: <AgentCurrentBalance />,
      },
      {
        label: 'Transaction Summary by Agent NEW (GMT +6)',
        icon: <IconReportMoney />,
        link: '/transaction-summary-by-agent-new',
        element: <AgentTransactionSummary />,
      },
    ],
  },
  {
    title: 'Merchant',
    links: [
      {
        label: 'Merchant Master',
        icon: <IconShoppingCart />,
        link: '/master-merchant-superadmin',
        element: <MerchantMaster />,
      },
      {
        label: 'Merchant Bank Acc',
        icon: <IconBuildingBank />,
        link: '/merchant-bankacc',
        element: <MerchantBankAcc />,
      },
      {
        label: 'Merchant Transaction',
        icon: <IconTransfer />,
        link: '/transaction-merchant',
        element: <MerchantTransaction />,
      },
      {
        label: 'Merchant Transaction History',
        icon: <IconFileText />,
        link: '/transaction-merchant-history',
        element: <MerchantTransactionHistory />,
      },
      {
        label: 'Report Merchant',
        icon: <IconReportMoney />,
        link: '/report-merchant',
        element: <ReportMerchant />,
      },
    ],
  },
  {
    title: 'Deposits',
    links: [
      {
        label: 'Deposit Dashboard Automation',
        icon: <IconLayoutDashboard />,
        link: '/deposit-dashboard',
        element: '',
      },
      {
        label: 'Deposit List',
        icon: <IconArrowDownCircle />,
        link: '/deposit-pending-list',
        element: '',
      },
      {
        label: 'Automation Deposit List',
        icon: <IconRobot />,
        link: '/new-deposit-list',
        element: '',
      },
      {
        label: 'Merchant Transaction Deposit',
        icon: <IconShoppingCart />,
        link: '/transaction-merchant-deposit',
        element: '',
      },
      {
        label: 'Deposit Pending',
        icon: <IconArrowDownCircle />,
        link: '/deposit-pending',
        element: '',
      },
      {
        label: 'Deposit Queue Today',
        icon: <IconArrowDownCircle />,
        link: '/deposit-queue-today',
        element: '',
      },
      {
        label: 'Deposit Queue Today BDT',
        icon: <IconArrowDownCircle />,
        link: '/deposit-queue-today-bdt',
        element: '',
      },
      {
        label: 'Deposit Queue Unmatched by Date',
        icon: <IconArrowDownCircle />,
        link: '/deposit-queue',
        element: '',
      },
      {
        label: 'Deposit Queue Alert',
        icon: <IconAlertTriangle />,
        link: '/deposit-queue-alert',
        element: '',
      },
    ],
  },
  {
    title: 'Withdrawal',
    links: [
      {
        label: 'Withdraw Dashboard Automation',
        icon: <IconLayoutDashboard />,
        link: '/withdraw-dashboard',
        element: '',
      },
      {
        label: 'Withdraw List',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-list',
        element: '',
      },
      {
        label: 'ALL Automation Withdraw List',
        icon: <IconRobot />,
        link: '/Automation-withdraw-list',
        element: '',
      },
      {
        label: 'Automation Withdraw List',
        icon: <IconRobot />,
        link: '/appium-withdraw-transaction-new',
        element: '',
      },
      {
        label: 'Withdraw Check',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-ntc',
        element: '',
      },
      {
        label: 'Withdraw Check Automation',
        icon: <IconRobot />,
        link: '/withdraw-ntc-automation',
        element: '',
      },
      {
        label: 'Withdraw Check Filter',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-ntc-filter',
        element: '',
      },
      {
        label: 'Withdraw Check Filter Bulk',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-ntc-filter-selected',
        element: '',
      },
      {
        label: 'Setting',
        icon: <IconSettings />,
        link: '/withdraw-bank',
        element: '',
      },
      {
        label: 'Merchant Transaction Withdrawal',
        icon: <IconShoppingCart />,
        link: '/transaction-merchant-withdraw',
        element: '',
      },
      {
        label: 'Assignment',
        icon: <IconUserShield />,
        link: '/withdraw-assignment',
        element: '',
      },
      {
        label: 'Assignment Bulk',
        icon: <IconUserShield />,
        link: '/withdraw-ntc-assign-selected',
        element: '',
      },
      {
        label: 'Assignment Pending',
        icon: <IconUserShield />,
        link: '/assignment-pending',
        element: '',
      },
      {
        label: 'Withdraw Queue',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-queue',
        element: '',
      },
    ],
  },
  {
    title: 'Transaction',
    links: [
      {
        label: 'Transaction by Id',
        icon: <IconTransfer />,
        link: '/transaction-by-id',
        element: '',
      },
      {
        label: 'Transaction by Id Backup',
        icon: <IconTransfer />,
        link: '/transaction-by-id-backup',
        element: '',
      },
      {
        label: 'Transaction by Id Backup (equals)',
        icon: <IconTransfer />,
        link: '/transaction-by-id-new',
        element: '',
      },
      {
        label: 'Find Member Transaction',
        icon: <IconTransfer />,
        link: '/find-transaction-member',
        element: '',
      },
      {
        label: 'Rejected transaction log',
        icon: <IconAlertTriangle />,
        link: '/rejected-transactions-log',
        element: '',
      },
      {
        label: 'Find Trxid',
        icon: <IconTransfer />,
        link: '/find-trxid',
        element: '',
      },
      {
        label: 'Transaction By Account',
        icon: <IconTransfer />,
        link: '/transaction-account-by-company',
        element: '',
      },
      {
        label: 'Transaction By Account History',
        icon: <IconFileText />,
        link: '/transaction-history',
        element: '',
      },
      {
        label: 'Transaction Resend Callback',
        icon: <IconBrandTelegram />,
        link: '/transaction-callback-empty',
        element: '',
      },
      {
        label: 'Resend Callback More Than 15 Minute',
        icon: <IconBrandTelegram />,
        link: '/transaction-callback-502',
        element: '',
      },
      {
        label: 'Transaction Completed Today',
        icon: <IconTransfer />,
        link: '/transaction-today-complete',
        element: '',
      },
      {
        label: 'Transaction by Id NA',
        icon: <IconTransfer />,
        link: '/transaction-by-id-noact',
        element: '',
      },
      {
        label: 'Transaction by Id Backup NA',
        icon: <IconTransfer />,
        link: '/transaction-by-id-backup-noact',
        element: '',
      },
      {
        label: 'Suspected Transaction',
        icon: <IconAlertTriangle />,
        link: '/suspected-transaction',
        element: '',
      },
      {
        label: 'Submitted Transaction',
        icon: <IconTransfer />,
        link: '/submitted-transaction',
        element: '',
      },
      {
        label: 'Transaction Pending',
        icon: <IconTransfer />,
        link: '/transaction-pending',
        element: '',
      },
      {
        label: 'Transaction Flag by M',
        icon: <IconAlertTriangle />,
        link: '/transaction-flag-m',
        element: '',
      },
      {
        label: 'Transaction By Not Match Sameday',
        icon: <IconTransfer />,
        link: '/transaction-by-notmatchsameday',
        element: '',
      },
      {
        label: 'Resubmit Transaction',
        icon: <IconBolt />,
        link: '/resubmit-transaction',
        element: '',
      },
      {
        label: 'Resubmit Transaction Log',
        icon: <IconFileText />,
        link: '/resubmit-transaction-log',
        element: '',
      },
      {
        label: 'Resubmit Auto Matching',
        icon: <IconBolt />,
        link: '/resubmit-automatching',
        element: '',
      },
      {
        label: 'Update Transaction',
        icon: <IconSettings />,
        link: '/update-transaction',
        element: '',
      },
      {
        label: 'Update Transaction New',
        icon: <IconSettings />,
        link: '/update-transaction-status-new',
        element: '',
      },
      {
        label: 'Update Transaction Log',
        icon: <IconFileText />,
        link: '/update-transaction-log',
        element: '',
      },
      {
        label: 'Adjustment Without Fee',
        icon: <IconCash />,
        link: '/company-adjustment-form',
        element: '',
      },
      {
        label: 'Adjustment Merchant',
        icon: <IconCash />,
        link: '/company-adjustment-merchant-form',
        element: '',
      },
    ],
  },
  {
    title: 'SMS',
    links: [
      {
        label: 'SMS Log by Id',
        icon: <IconMessage />,
        link: '/smslog-by-id',
        element: '',
      },
      {
        label: 'SMS Criteria not Matching by Id',
        icon: <IconMessage />,
        link: '/sms-criteria-not-matching-by-id',
        element: '',
      },
      {
        label: 'SMS Log',
        icon: <IconMessage />,
        link: '/sms-log',
        element: '',
      },
      {
        label: 'SMS Log Backup',
        icon: <IconMessage />,
        link: '/sms-log-backup',
        element: '',
      },
      {
        label: 'SMS Log by Balance Diff',
        icon: <IconMessage />,
        link: '/sms-log-by-balance-diff',
        element: '',
      },
      {
        label: 'SMS Log by Customer Phone',
        icon: <IconMessage />,
        link: '/sms-log-by-customer-phone',
        element: '',
      },
      {
        label: 'Suspected SMS',
        icon: <IconAlertTriangle />,
        link: '/suspected-sms',
        element: '',
      },
      {
        label: 'Suspected Customer',
        icon: <IconAlertTriangle />,
        link: '/suspected-customer',
        element: '',
      },
      {
        label: 'SMS Failed Match',
        icon: <IconMessage />,
        link: '/sms-failed-match',
        element: '',
      },
      {
        label: 'SMS Failed Match by Not Match Sameday',
        icon: <IconMessage />,
        link: '/sms-failed-match-by-notmatchsameday',
        element: '',
      },
      {
        label: 'Duplicate SMS',
        icon: <IconMessage />,
        link: '/duplicate-sms',
        element: '',
      },
      {
        label: 'SMS Log History',
        icon: <IconFileText />,
        link: '/smslog-history',
        element: '',
      },
      {
        label: 'SMS Last ACK',
        icon: <IconMessage />,
        link: '/sms-lastack',
        element: '',
      },
      {
        label: 'SMS Last ACK Active',
        icon: <IconMessage />,
        link: '/sms-lastack-active',
        element: '',
      },
      {
        label: 'Report SMS',
        icon: <IconReportMoney />,
        link: '/report-sms',
        element: '',
      },
      {
        label: 'Phone Whitelist',
        icon: <IconUserShield />,
        link: '/phone-whitelist',
        element: '',
      },
      {
        label: 'Service Center Whitelist',
        icon: <IconUserShield />,
        link: '/servicecenter-whitelist',
        element: '',
      },
    ],
  },
  {
    title: 'Crawler',
    links: [
      {
        label: 'Crawler List',
        icon: <IconRobot />,
        link: '/appium-list',
        element: '',
      },
      {
        label: 'Crawler List Not Match',
        icon: <IconRobot />,
        link: '/appium-list-not-match',
        element: '',
      },
      {
        label: 'Withdraw Queue',
        icon: <IconArrowUpCircle />,
        link: '/crawler-wd-queue',
        element: '',
      },
      {
        label: 'Account Status New',
        icon: <IconSettings />,
        link: '/status-account-crawler-new',
        element: '',
      },
      {
        label: 'Automation Error',
        icon: <IconAlertTriangle />,
        link: '/automation-error-list',
        element: <AutomationError />,
      },
      {
        label: 'Error Log',
        icon: <IconAlertTriangle />,
        link: '/crawler-errorlog',
        element: '',
      },
      {
        label: 'List Agent Failed Summary',
        icon: <IconFileText />,
        link: '/list-agent-failed-summary',
        element: '',
      },
      {
        label: 'Account Balance Log',
        icon: <IconBuildingBank />,
        link: '/account-balance-log',
        element: '',
      },
      {
        label: 'Agent Summary',
        icon: <IconReportMoney />,
        link: '/agent-summary',
        element: '',
      },
      {
        label: 'Monthly Summary Report',
        icon: <IconReportMoney />,
        link: '/monthly-summary-report',
        element: '',
      },
      {
        label: 'Report Difference',
        icon: <IconReportMoney />,
        link: '/report-difference',
        element: '',
      },
      {
        label: 'Credentials BKASHM',
        icon: <IconUserShield />,
        link: '/credentials-bkashm-list',
        element: '',
      },
    ],
  },
  {
    title: 'Settlement',
    links: [
      {
        label: 'Settlement & Topup',
        icon: <IconCash />,
        link: '/request-manual',
        element: '',
      },
      {
        label: 'Request List',
        icon: <IconFileText />,
        link: '/request-list',
        element: '',
      },
      {
        label: 'B2b Send',
        icon: <IconTransfer />,
        link: '/B2b-Send',
        element: '',
      },
    ],
  },
  {
    title: 'Settings',
    links: [
      {
        label: 'Update Group',
        icon: <IconSettings />,
        link: '/update-group',
        element: '',
      },
      {
        label: 'System Setting',
        icon: <IconSettings />,
        link: '/system-setting',
        element: '',
      },
      {
        label: 'CP Journal',
        icon: <IconFileText />,
        link: '/cp-journal',
        element: '',
      },
      {
        label: 'Available Account List',
        icon: <IconBuildingBank />,
        link: '/available-account-list',
        element: '',
      },
      {
        label: 'Whitelist Merchant IP',
        icon: <IconUserShield />,
        link: '/whitelist-merchant-ip',
        element: '',
      },
      {
        label: 'Available Account New Deposit',
        icon: <IconBuildingBank />,
        link: '/available-account-new-deposit',
        element: '',
      },
      {
        label: 'Available Account With Mybank',
        icon: <IconBuildingBank />,
        link: '/available-account-with-mybank',
        element: '',
      },
      {
        label: 'Count Available Account New Deposit',
        icon: <IconReportMoney />,
        link: '/count-available-account-new-deposit',
        element: '',
      },
      {
        label: 'Available Account New Withdraw',
        icon: <IconBuildingBank />,
        link: '/available-account-new-withdraw',
        element: '',
      },
      {
        label: 'Emergency Deposit Page',
        icon: <IconAlertTriangle />,
        link: '/emergency-deposit-page',
        element: '',
      },
      {
        label: 'Service Selenium List',
        icon: <IconRobot />,
        link: '/service-selenium-list',
        element: '',
      },
      {
        label: 'Service NAGAD API',
        icon: <IconSettings />,
        link: '/service-nagad-api',
        element: '',
      },
      {
        label: 'Service Resend Callback',
        icon: <IconBrandTelegram />,
        link: '/service-resend-callback',
        element: '',
      },
    ],
  },
  {
    title: 'Hidden Routes',
    hidden: true, // This section won't be displayed in navbar
    links: [
      {
        label: 'Account Form',
        icon: <IconUsers />,
        link: '/login-form',
        element: <AccountForm />,
      },
      {
        label: 'Automation Form',
        icon: <IconRobot />,
        link: '/automation-create-form',
        element: <AutomationForm />,
      },
      {
        label: 'Server Form',
        icon: <IconSettings />,
        link: '/server-form',
        element: <ServerForm />,
      },
      {
        label: 'Agent Group Form',
        icon: <IconUsers />,
        link: '/agentgroup-form',
        element: <AgentGroupForm />,
      },
      {
        label: 'Merchant Form',
        icon: <IconShoppingCart />,
        link: '/merchant-form',
        element: <MerchantForm />,
      },
    ],
  },
];
