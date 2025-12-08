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
import DashboardMerchant from './layouts/Merchant/DashboardMerchant';
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
import ResubmitExpress from './layouts/Resubmit/ResubmitExpress';
import ResubmitExpressSuperAdmin from './layouts/Resubmit/ResubmitExpressSuperAdmin';
import ReportResubmitWithoutAutomation from './layouts/Resubmit/ReportResubmitWithoutAutomation';
import ReportResubmitWithoutAutomationSummary from './layouts/Resubmit/ReportResubmitWithoutAutomationSummary';
import MerchantTransactionHistory from './layouts/Merchant/MerchantTransactionHistory';
import ReportMerchant from './layouts/Merchant/ReportMerchant';
import MerchantDailyReportGMT6 from './layouts/Report/MerchantDailyReportGMT6';
import MerchantDailyReportGMT8 from './layouts/Report/MerchantDailyReportGMT8';
import AgentDailyComplete from './layouts/Report/AgentDailyComplete';
import AgentDailyCompleteGMT6 from './layouts/Report/AgentDailyCompleteGMT6';
import AgentRealtimeReport from './layouts/Report/AgentRealtimeReport';
import AgentRealtimeReportGMT6 from './layouts/Report/AgentRealtimeReportGMT6';
import MerchantTransactionPerHour from './layouts/Merchant/MerchantTransactionPerHour';
import MybankInactiveLog from './layouts/MyBank/MybankInactiveLog';
import BalanceDifference from './layouts/Report/BalanceDifference';
import SmsLogByAgentReport from './layouts/Report/SmsLogByAgentReport';
import DownloadReport from './layouts/Report/DownloadReport';
import MCO from './layouts/Report/MCO';
import BlacklistList from './layouts/Report/BlacklistList';
import SummaryBkashm from './layouts/Report/SummaryBkashm';
import MasterMyBankList from './layouts/MyBank/masterMyBankList';
import MyBankInactiveList from './layouts/MyBank/myBankInactiveList';
import ListOnboardAgent from './layouts/MyBank/listOnboardAgent';
import UpdateMyBank from './layouts/MyBank/updateMyBank';
import UpdateMyBankSelected from './layouts/MyBank/updateMyBankSelected';
import UpdateMerchantBankSelected from './layouts/MyBank/updateMerchantBankSelected';
import MyBankBalance from './layouts/MyBank/myBankBalance';
import MyBankLimit from './layouts/MyBank/myBankLimit';
import MyBankDeactive from './layouts/MyBank/myBankDeactive';
import MasterMyBankForm from './layouts/MyBank/masterMyBankForm';
import DepositDashboard from './layouts/Deposit/DepositDashboard';
import DepositPendingList from './layouts/Deposit/DepositPendingList';
import AutomationDepositList from './layouts/Deposit/AutomationDepositList';
import MerchantTransactionDeposit from './layouts/Deposit/MerchantTransactionDeposit';
import DepositPending from './layouts/Deposit/DepositPending';
import DepositQueueToday from './layouts/Deposit/DepositQueueToday';
import DepositQueueTodayBDT from './layouts/Deposit/DepositQueueTodayBDT';
import DepositQueue from './layouts/Deposit/DepositQueue';
import DepositQueueAlert from './layouts/Deposit/DepositQueueAlert';
import MybankCheckDeposit from './layouts/Deposit/MybankCheckDeposit';
import WithdrawDashboard from './layouts/Withdrawal/WithdrawDashboard';
import WithdrawList from './layouts/Withdrawal/WithdrawList';
import AutomationWithdrawList from './layouts/Withdrawal/AutomationWithdrawList';
import AppiumWithdrawList from './layouts/Withdrawal/AppiumWithdrawList';
import AppiumList from './layouts/Crawler/AppiumList';
import AppiumListNotMatch from './layouts/Crawler/AppiumListNotMatch';
import AppiumWithdrawQueue from './layouts/Crawler/AppiumWithdrawQueue';
import AccountStatusNew from './layouts/Crawler/AccountStatusNew';
import AppiumErrorLog from './layouts/Crawler/AppiumErrorLog';
import ListAgentFailedSummary from './layouts/Crawler/ListAgentFailedSummary';
import AccountBalanceLog from './layouts/Crawler/AccountBalanceLog';
import AgentSummary from './layouts/Crawler/AgentSummary';
import MonthlySummaryReport from './layouts/Crawler/MonthlySummaryReport';
import ReportDifference from './layouts/Crawler/ReportDifference';
import CredentialsBkashm from './layouts/Crawler/CredentialsBkashm';
import SettlementTopup from './layouts/Settlement/SettlementTopup';
import RequestList from './layouts/Settlement/RequestList';
import B2bSendList from './layouts/Settlement/B2bSendList';
import SystemSetting from './layouts/Setting/SystemSetting';
import UpdateGroup from './layouts/Setting/UpdateGroup';
import CpJournal from './layouts/Setting/CpJournal';
import AvailableAccountList from './layouts/Setting/AvailableAccountList';
import WhitelistMerchantIp from './layouts/Setting/WhitelistMerchantIp';
import AvailableAccountNew from './layouts/Setting/AvailableAccountNew';
import AvailableAccountWithMybank from './layouts/Setting/AvailableAccountWithMybank';
import CountAvailableAccountNew from './layouts/Setting/CountAvailableAccountNew';
import AvailableAccountNewWithdraw from './layouts/Setting/AvailableAccountNewWithdraw';
import EmergencyDeposit from './layouts/Setting/EmergencyDeposit';
import ServiceSeleniumList from './layouts/Setting/ServiceSeleniumList';
import ServiceNagadApi from './layouts/Setting/ServiceNagadApi';
import ServiceBkashApi from './layouts/Setting/ServiceBkashApi';
import ServiceResendCallback from './layouts/Setting/ServiceResendCallback';
import AgentTrackerDashboard from './layouts/Setting/AgentTrackerDashboard';
import SmsLogById from './layouts/SMS/SmsLogById';
import SmsCriteriaNotMatchingById from './layouts/SMS/SmsCriteriaNotMatchingById';
import SmsLogBackup from './layouts/SMS/SmsLogBackup';
import SmsLogByBalanceDiff from './layouts/SMS/SmsLogByBalanceDiff';
import SmsLogByCustomerPhone from './layouts/SMS/SmsLogByCustomerPhone';
import SuspectedSms from './layouts/SMS/SuspectedSms';
import SuspectedCustomer from './layouts/SMS/SuspectedCustomer';
import SmsFailedMatch from './layouts/SMS/SmsFailedMatch';
import SmsFailedMatchByNotMatchSameday from './layouts/SMS/SmsFailedMatchByNotMatchSameday';
import DuplicateSms from './layouts/SMS/DuplicateSms';
import SmsLogHistory from './layouts/SMS/SmsLogHistory';
import SmsLastAck from './layouts/SMS/SmsLastAck';
import SmsLastAckActive from './layouts/SMS/SmsLastAckActive';
import ReportSms from './layouts/SMS/ReportSms';
import PhoneWhitelist from './layouts/SMS/PhoneWhitelist';
import ServiceCenterWhitelist from './layouts/SMS/ServiceCenterWhitelist';
import SmsLog from './layouts/SMS/SmsLog';
import WithdrawCheck from './layouts/Withdrawal/WithdrawCheck';
import WithdrawCheckAutomation from './layouts/Withdrawal/WithdrawCheckAutomation';
import WithdrawCheckFilter from './layouts/Withdrawal/WithdrawCheckFilter';
import WithdrawCheckFilterSelected from './layouts/Withdrawal/WithdrawCheckFilterSelected';
import WithdrawAllowedBank from './layouts/Withdrawal/WithdrawAllowedBank';
import MerchantTransactionWithdraw from './layouts/Withdrawal/MerchantTransactionWithdraw';
import WithdrawAssignment from './layouts/Withdrawal/WithdrawAssignment';
import WithdrawAssignmentBulk from './layouts/Withdrawal/WithdrawAssignmentBulk';
import WithdrawAssignmentPending from './layouts/Withdrawal/WithdrawAssignmentPending';
import WithdrawQueue from './layouts/Withdrawal/WithdrawQueue';
import TransactionById from './layouts/Transaction/TransactionById';
import TransactionByIdBackup from './layouts/Transaction/TransactionByIdBackup';
import TransactionByIdEquals from './layouts/Transaction/TransactionByIdEquals';
import FindTransactionMember from './layouts/Transaction/FindTransactionMember';
import TransactionRejected from './layouts/Transaction/TransactionRejected';
import FindTrxid from './layouts/Transaction/FindTrxid';
import TransactionByAccount from './layouts/Transaction/TransactionByAccount';
import TransactionByAccountHistory from './layouts/Transaction/TransactionByAccountHistory';
import TransactionResendCallback from './layouts/Transaction/TransactionResendCallback';
import TransactionCallback502 from './layouts/Transaction/TransactionCallback502';
import TransactionTodayComplete from './layouts/Transaction/TransactionTodayComplete';
import TransactionByIdNoAction from './layouts/Transaction/TransactionByIdNoAction';
import TransactionByIdBackupNoAction from './layouts/Transaction/TransactionByIdBackupNoAction';
import SuspectedTransaction from './layouts/Transaction/SuspectedTransaction';
import SubmittedTransaction from './layouts/Transaction/SubmittedTransaction';
import TransactionPending from './layouts/Transaction/TransactionPending';
import TransactionFlagM from './layouts/Transaction/TransactionFlagM';
import TransactionNotMatchSameday from './layouts/Transaction/TransactionNotMatchSameday';
import TransactionResubmitLog from './layouts/Transaction/TransactionResubmitLog';
import TransactionResubmitAutoMatching from './layouts/Transaction/TransactionResubmitAutoMatching';
import UpdateTransaction from './layouts/Transaction/UpdateTransaction';
import UpdateTransactionStatusNew from './layouts/Transaction/UpdateTransactionStatusNew';
import UpdateTransactionLog from './layouts/Transaction/UpdateTransactionLog';
import CompanyAdjustment from './layouts/Transaction/CompanyAdjustment';
import CompanyAdjustmentMerchant from './layouts/Transaction/CompanyAdjustmentMerchant';
import TransactionResubmit from './layouts/Transaction/TransactionResubmit';

export const mockdataRoutes = [
  {
    title: 'Dashboard',
    links: [
      {
        label: 'Dashboard Merchant',
        icon: <IconLayoutDashboard />,
        link: '/dashboard-merchant',
        element: <DashboardMerchant />,
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
        element: <MybankInactiveLog />,
      },
      {
        label: 'Resubmit Express',
        icon: <IconBolt />,
        link: '/resubmit-express',
        element: <ResubmitExpress />,
      },
      {
        label: 'Resubmit Express - Super Admin',
        icon: <IconBolt />,
        link: '/resubmit-express-new',
        element: <ResubmitExpressSuperAdmin />,
      },
      {
        label: 'Report Resubmit without Automation',
        icon: <IconFileText />,
        link: '/report-resubmit-without-automation',
        element: <ReportResubmitWithoutAutomation />,
      },
      {
        label: 'Report Resubmit without Automation Summary',
        icon: <IconFileText />,
        link: '/report-resubmit-without-automation-summary',
        element: <ReportResubmitWithoutAutomationSummary />,
      },
      {
        label: 'Account Status New',
        icon: <IconSettings />,
        link: '/status-account-crawler-new',
        element: <AccountStatusNew />,
      },
      {
        label: 'Agent Tracker Dashboard',
        icon: <IconUsers />,
        link: '/agent-tracker-dashboard',
        element: <AgentTrackerDashboard />,
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
            element: <SmsLog />,
          },
          {
            label: 'Crawler List',
            icon: <IconRobot />,
            link: '/appium-list',
            element: <AppiumList />,
          },
          {
            label: 'Crawler List Not Match',
            icon: <IconRobot />,
            link: '/appium-list-not-match',
            element: <AppiumListNotMatch />,
          },
          {
            label: 'SMS Log by Id',
            icon: <IconMessage />,
            link: '/smslog-by-id',
            element: <SmsLogById />,
          },
          {
            label: 'Transaction by Id',
            icon: <IconTransfer />,
            link: '/transaction-by-id',
            element: <TransactionById />,
          },
          {
            label: 'Transaction Merchant Hour',
            icon: <IconReportMoney />,
            link: '/transaction-merchant-per-hour',
            element: <MerchantTransactionPerHour />,
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
            element: <UpdateMyBankSelected />,
          },
          {
            label: 'Transaction Resend Callback',
            icon: <IconBrandTelegram />,
            link: '/transaction-callback-empty',
            element: <TransactionResendCallback />,
          },
          {
            label: 'Resend Callback More Than 15 Minute',
            icon: <IconBrandTelegram />,
            link: '/transaction-callback-502',
            element: <TransactionCallback502 />,
          },
          {
            label: 'Resubmit Transaction',
            icon: <IconBolt />,
            link: '/resubmit-transaction',
            element: <TransactionResubmit />,
          },
          {
            label: 'Find Transaction Member',
            icon: <IconTransfer />,
            link: '/find-transaction-member',
            element: <FindTransactionMember />,
          },
          {
            label: 'SMS Failed Match',
            icon: <IconMessage />,
            link: '/sms-failed-match',
            element: <SmsFailedMatch />,
          },
          {
            label: 'Automation Deposit List',
            icon: <IconRobot />,
            link: '/new-deposit-list',
            element: <AutomationDepositList />,
          },
          {
            label: 'Mybank Check Deposit',
            icon: <IconBuildingBank />,
            link: '/mybank-check-deposit',
            element: <MybankCheckDeposit />,
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
            element: <SmsLog />,
          },
          {
            label: 'Transaction by Id',
            icon: <IconTransfer />,
            link: '/transaction-by-id',
            element: <TransactionById />,
          },
          {
            label: 'Withdraw Check',
            icon: <IconArrowUpCircle />,
            link: '/withdraw-ntc',
            element: <WithdrawCheck />,
          },
          {
            label: 'Withdraw Check Filter',
            icon: <IconArrowUpCircle />,
            link: '/withdraw-ntc-filter',
            element: <WithdrawCheckFilter />,
          },
          {
            label: 'Withdraw Check Automation',
            icon: <IconRobot />,
            link: '/withdraw-ntc-automation',
            element: <WithdrawCheckAutomation />,
          },
          {
            label: 'Withdraw Check Filter Bulk',
            icon: <IconArrowUpCircle />,
            link: '/withdraw-ntc-filter-selected',
            element: <WithdrawCheckFilterSelected />,
          },
          {
            label: 'Transaction Merchant Hour',
            icon: <IconShoppingCart />,
            link: '/merchant-transaction-per-hour',
            element: <MerchantTransactionPerHour />,
          },
          {
            label: 'ALL Automation Withdraw List',
            icon: <IconRobot />,
            link: '/Automation-withdraw-list',
            element: <AutomationWithdrawList />,
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
            element: <AccountBalanceLog />,
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
            link: '/master-report-daily-admin-complete-gmt8',
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
        element: <MasterMyBankList />,
      },
      {
        label: 'Data List Inactive',
        icon: <IconBuildingBank />,
        link: '/mybank-inactive',
        element: <MyBankInactiveList />,
      },
      {
        label: 'List Onboard Agent',
        icon: <IconUsers />,
        link: '/list-onboard-agent',
        element: <ListOnboardAgent />,
      },
      {
        label: 'Update MyBank',
        icon: <IconBuildingBank />,
        link: '/update-mybank',
        element: <UpdateMyBank />,
      },
      {
        label: 'Update MyBank Selected',
        icon: <IconBuildingBank />,
        link: '/update-mybank-selected',
        element: <UpdateMyBankSelected />,
      },
      {
        label: 'Update Merchant Bank Acc Selected',
        icon: <IconShoppingCart />,
        link: '/update-merchant-bank-selected',
        element: <UpdateMerchantBankSelected />,
      },
      {
        label: 'MyBank Balance',
        icon: <IconCash />,
        link: '/mybank-balance',
        element: <MyBankBalance />,
      },
      {
        label: 'MyBank Limit',
        icon: <IconCash />,
        link: '/mybank-limit',
        element: <MyBankLimit />,
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
        element: <DepositDashboard />,
      },
      {
        label: 'Deposit List',
        icon: <IconArrowDownCircle />,
        link: '/deposit-pending-list',
        element: <DepositPendingList />,
      },
      {
        label: 'Automation Deposit List',
        icon: <IconRobot />,
        link: '/new-deposit-list',
        element: <AutomationDepositList />,
      },
      {
        label: 'Merchant Transaction Deposit',
        icon: <IconShoppingCart />,
        link: '/transaction-merchant-deposit',
        element: <MerchantTransactionDeposit />,
      },
      {
        label: 'Deposit Pending',
        icon: <IconArrowDownCircle />,
        link: '/deposit-pending',
        element: <DepositPending />,
      },
      {
        label: 'Deposit Queue Today',
        icon: <IconArrowDownCircle />,
        link: '/deposit-queue-today',
        element: <DepositQueueToday />,
      },
      {
        label: 'Deposit Queue Today BDT',
        icon: <IconArrowDownCircle />,
        link: '/deposit-queue-today-bdt',
        element: <DepositQueueTodayBDT />,
      },
      {
        label: 'Deposit Queue Unmatched by Date',
        icon: <IconArrowDownCircle />,
        link: '/deposit-queue',
        element: <DepositQueue />,
      },
      {
        label: 'Deposit Queue Alert',
        icon: <IconAlertTriangle />,
        link: '/deposit-queue-alert',
        element: <DepositQueueAlert />,
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
        element: <WithdrawDashboard />,
      },
      {
        label: 'Withdraw List',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-list',
        element: <WithdrawList />,
      },
      {
        label: 'ALL Automation Withdraw List',
        icon: <IconRobot />,
        link: '/Automation-withdraw-list',
        element: <AutomationWithdrawList />,
      },
      {
        label: 'Automation Withdraw List',
        icon: <IconRobot />,
        link: '/appium-withdraw-transaction-new',
        element: <AppiumWithdrawList />,
      },
      {
        label: 'Withdraw Check',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-ntc',
        element: <WithdrawCheck />,
      },
      {
        label: 'Withdraw Check Automation',
        icon: <IconRobot />,
        link: '/withdraw-ntc-automation',
        element: <WithdrawCheckAutomation />,
      },
      {
        label: 'Withdraw Check Filter',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-ntc-filter',
        element: <WithdrawCheckFilter />,
      },
      {
        label: 'Withdraw Check Filter Bulk',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-ntc-filter-selected',
        element: <WithdrawCheckFilterSelected />,
      },
      {
        label: 'Setting',
        icon: <IconSettings />,
        link: '/withdraw-bank',
        element: <WithdrawAllowedBank />,
      },
      {
        label: 'Merchant Transaction Withdrawal',
        icon: <IconShoppingCart />,
        link: '/transaction-merchant-withdraw',
        element: <MerchantTransactionWithdraw />,
      },
      {
        label: 'Assignment',
        icon: <IconUserShield />,
        link: '/withdraw-assignment',
        element: <WithdrawAssignment />,
      },
      {
        label: 'Assignment Bulk',
        icon: <IconUserShield />,
        link: '/withdraw-ntc-assign-selected',
        element: <WithdrawAssignmentBulk />,
      },
      {
        label: 'Assignment Pending',
        icon: <IconUserShield />,
        link: '/assignment-pending',
        element: <WithdrawAssignmentPending />,
      },
      {
        label: 'Withdraw Queue',
        icon: <IconArrowUpCircle />,
        link: '/withdraw-queue',
        element: <WithdrawQueue />,
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
        element: <TransactionById />,
      },
      {
        label: 'Transaction by Id Backup',
        icon: <IconTransfer />,
        link: '/transaction-by-id-backup',
        element: <TransactionByIdBackup />,
      },
      {
        label: 'Transaction by Id Backup (equals)',
        icon: <IconTransfer />,
        link: '/transaction-by-id-new',
        element: <TransactionByIdEquals />,
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
        element: <TransactionRejected />,
      },
      {
        label: 'Find Trxid',
        icon: <IconTransfer />,
        link: '/find-trxid',
        element: <FindTrxid />,
      },
      {
        label: 'Transaction By Account',
        icon: <IconTransfer />,
        link: '/transaction-account-by-company',
        element: <TransactionByAccount />,
      },
      {
        label: 'Transaction By Account History',
        icon: <IconFileText />,
        link: '/transaction-history',
        element: <TransactionByAccountHistory />,
      },
      {
        label: 'Transaction Resend Callback',
        icon: <IconBrandTelegram />,
        link: '/transaction-callback-empty',
        element: <TransactionResendCallback />,
      },
      {
        label: 'Resend Callback More Than 15 Minute',
        icon: <IconBrandTelegram />,
        link: '/transaction-callback-502',
        element: <TransactionCallback502 />,
      },
      {
        label: 'Transaction Completed Today',
        icon: <IconTransfer />,
        link: '/transaction-today-complete',
        element: <TransactionTodayComplete />,
      },
      {
        label: 'Transaction by Id NA',
        icon: <IconTransfer />,
        link: '/transaction-by-id-noact',
        element: <TransactionByIdNoAction />,
      },
      {
        label: 'Transaction by Id Backup NA',
        icon: <IconTransfer />,
        link: '/transaction-by-id-backup-noact',
        element: <TransactionByIdBackupNoAction />,
      },
      {
        label: 'Suspected Transaction',
        icon: <IconAlertTriangle />,
        link: '/suspected-transaction',
        element: <SuspectedTransaction />,
      },
      {
        label: 'Submitted Transaction',
        icon: <IconTransfer />,
        link: '/submitted-transaction',
        element: <SubmittedTransaction />,
      },
      {
        label: 'Transaction Pending',
        icon: <IconTransfer />,
        link: '/transaction-pending',
        element: <TransactionPending />,
      },
      {
        label: 'Transaction Flag by M',
        icon: <IconAlertTriangle />,
        link: '/transaction-flag-m',
        element: <TransactionFlagM />,
      },
      {
        label: 'Transaction By Not Match Sameday',
        icon: <IconTransfer />,
        link: '/transaction-by-notmatchsameday',
        element: <TransactionNotMatchSameday />,
      },
      {
        label: 'Resubmit Transaction',
        icon: <IconBolt />,
        link: '/resubmit-transaction',
        element: <TransactionResubmit />,
      },
      {
        label: 'Resubmit Transaction Log',
        icon: <IconFileText />,
        link: '/resubmit-transaction-log',
        element: <TransactionResubmitLog />,
      },
      {
        label: 'Resubmit Auto Matching',
        icon: <IconBolt />,
        link: '/resubmit-automatching',
        element: <TransactionResubmitAutoMatching />,
      },
      {
        label: 'Update Transaction',
        icon: <IconSettings />,
        link: '/update-transaction',
        element: <UpdateTransaction />,
      },
      {
        label: 'Update Transaction New',
        icon: <IconSettings />,
        link: '/update-transaction-status-new',
        element: <UpdateTransactionStatusNew />,
      },
      {
        label: 'Update Transaction Log',
        icon: <IconFileText />,
        link: '/update-transaction-log',
        element: <UpdateTransactionLog />,
      },
      {
        label: 'Adjustment Without Fee',
        icon: <IconCash />,
        link: '/company-adjustment-form',
        element: <CompanyAdjustment />,
      },
      {
        label: 'Adjustment Merchant',
        icon: <IconCash />,
        link: '/company-adjustment-merchant-form',
        element: <CompanyAdjustmentMerchant />,
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
        element: <SmsLogById />,
      },
      {
        label: 'SMS Criteria not Matching by Id',
        icon: <IconMessage />,
        link: '/sms-criteria-not-matching-by-id',
        element: <SmsCriteriaNotMatchingById />,
      },
      {
        label: 'SMS Log',
        icon: <IconMessage />,
        link: '/sms-log',
        element: <SmsLog />,
      },
      {
        label: 'SMS Log Backup',
        icon: <IconMessage />,
        link: '/sms-log-backup',
        element: <SmsLogBackup />,
      },
      {
        label: 'SMS Log by Balance Diff',
        icon: <IconMessage />,
        link: '/sms-log-by-balance-diff',
        element: <SmsLogByBalanceDiff />,
      },
      {
        label: 'SMS Log by Customer Phone',
        icon: <IconMessage />,
        link: '/sms-log-by-customer-phone',
        element: <SmsLogByCustomerPhone />,
      },
      {
        label: 'Suspected SMS',
        icon: <IconAlertTriangle />,
        link: '/suspected-sms',
        element: <SuspectedSms />,
      },
      {
        label: 'Suspected Customer',
        icon: <IconAlertTriangle />,
        link: '/suspected-customer',
        element: <SuspectedCustomer />,
      },
      {
        label: 'SMS Failed Match',
        icon: <IconMessage />,
        link: '/sms-failed-match',
        element: <SmsFailedMatch />,
      },
      {
        label: 'SMS Failed Match by Not Match Sameday',
        icon: <IconMessage />,
        link: '/sms-failed-match-by-notmatchsameday',
        element: <SmsFailedMatchByNotMatchSameday />,
      },
      {
        label: 'Duplicate SMS',
        icon: <IconMessage />,
        link: '/duplicate-sms',
        element: <DuplicateSms />,
      },
      {
        label: 'SMS Log History',
        icon: <IconFileText />,
        link: '/smslog-history',
        element: <SmsLogHistory />,
      },
      {
        label: 'SMS Last ACK',
        icon: <IconMessage />,
        link: '/sms-lastack',
        element: <SmsLastAck />,
      },
      {
        label: 'SMS Last ACK Active',
        icon: <IconMessage />,
        link: '/sms-lastack-active',
        element: <SmsLastAckActive />,
      },
      {
        label: 'Report SMS',
        icon: <IconReportMoney />,
        link: '/report-sms',
        element: <ReportSms />,
      },
      {
        label: 'Phone Whitelist',
        icon: <IconUserShield />,
        link: '/phone-whitelist',
        element: <PhoneWhitelist />,
      },
      {
        label: 'Service Center Whitelist',
        icon: <IconUserShield />,
        link: '/servicecenter-whitelist',
        element: <ServiceCenterWhitelist />,
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
        element: <AppiumList />,
      },
      {
        label: 'Crawler List Not Match',
        icon: <IconRobot />,
        link: '/appium-list-not-match',
        element: <AppiumListNotMatch />,
      },
      {
        label: 'Withdraw Queue',
        icon: <IconArrowUpCircle />,
        link: '/crawler-wd-queue',
        element: <AppiumWithdrawQueue />,
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
        element: <AppiumErrorLog />,
      },
      {
        label: 'List Agent Failed Summary',
        icon: <IconFileText />,
        link: '/list-agent-failed-summary',
        element: <ListAgentFailedSummary />,
      },
      {
        label: 'Account Balance Log',
        icon: <IconBuildingBank />,
        link: '/account-balance-log',
        element: <AccountBalanceLog />,
      },
      {
        label: 'Agent Summary',
        icon: <IconReportMoney />,
        link: '/agent-summary',
        element: <AgentSummary />,
      },
      {
        label: 'Monthly Summary Report',
        icon: <IconReportMoney />,
        link: '/monthly-summary-report',
        element: <MonthlySummaryReport />,
      },
      {
        label: 'Report Difference',
        icon: <IconReportMoney />,
        link: '/report-difference',
        element: <ReportDifference />,
      },
      {
        label: 'Credentials BKASHM',
        icon: <IconUserShield />,
        link: '/credentials-bkashm-list',
        element: <CredentialsBkashm />,
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
        element: <SettlementTopup />,
      },
      {
        label: 'Request List',
        icon: <IconFileText />,
        link: '/request-list',
        element: <RequestList />,
      },
      {
        label: 'B2b Send',
        icon: <IconTransfer />,
        link: '/B2b-Send',
        element: <B2bSendList />,
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
        element: <UpdateGroup />,
      },
      {
        label: 'System Setting',
        icon: <IconSettings />,
        link: '/system-setting',
        element: <SystemSetting />,
      },
      {
        label: 'CP Journal',
        icon: <IconFileText />,
        link: '/cp-journal',
        element: <CpJournal />,
      },
      {
        label: 'Available Account List',
        icon: <IconBuildingBank />,
        link: '/available-account-list',
        element: <AvailableAccountList />,
      },
      {
        label: 'Whitelist Merchant IP',
        icon: <IconUserShield />,
        link: '/whitelist-merchant-ip',
        element: <WhitelistMerchantIp />,
      },
      {
        label: 'Available Account New Deposit',
        icon: <IconBuildingBank />,
        link: '/available-account-new-deposit',
        element: <AvailableAccountNew />,
      },
      {
        label: 'Available Account With Mybank',
        icon: <IconBuildingBank />,
        link: '/available-account-with-mybank',
        element: <AvailableAccountWithMybank />,
      },
      {
        label: 'Count Available Account New Deposit',
        icon: <IconReportMoney />,
        link: '/count-available-account-new-deposit',
        element: <CountAvailableAccountNew />,
      },
      {
        label: 'Available Account New Withdraw',
        icon: <IconBuildingBank />,
        link: '/available-account-new-withdraw',
        element: <AvailableAccountNewWithdraw />,
      },
      {
        label: 'Emergency Deposit Page',
        icon: <IconAlertTriangle />,
        link: '/emergency-deposit-page',
        element: <EmergencyDeposit />,
      },
      {
        label: 'Service Selenium List',
        icon: <IconRobot />,
        link: '/service-selenium-list',
        element: <ServiceSeleniumList />,
      },
      {
        label: 'Service NAGAD API',
        icon: <IconSettings />,
        link: '/service-nagad-api',
        element: <ServiceNagadApi />,
      },
      {
        label: 'Service BKASH API',
        icon: <IconSettings />,
        link: '/service-bkash-api',
        element: <ServiceBkashApi />,
      },
      {
        label: 'Service Resend Callback',
        icon: <IconBrandTelegram />,
        link: '/service-resend-callback',
        element: <ServiceResendCallback />,
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
      {
        label: 'Deactive Bank',
        icon: <IconAlertTriangle />,
        link: '/master-mybank-deactive',
        element: <MyBankDeactive />,
      },
      {
        label: 'Master MyBank Form',
        icon: <IconBuildingBank />,
        link: '/master-mybank-form',
        element: <MasterMyBankForm />,
      },
    ],
  },
];
