<?php
session_start();
require_once('../menu.php');
$type = $_SESSION['emoney_type'];
$access = $_SESSION['emoney_access'];

?>
<div class="wrapper">
  <div class="nav-container">
    <div class="menu-container">
      <div class="pull-left menuu">
        <?php
        if ($_SESSION['emoney_username'] != 'KRIKYACS2') {
        ?>
          <img src="images/blank.jpg" ng-click="changePage('form-update-photo')" class="image-circle center-block" alt="User Image" style="padding:10px" ng-show="defaultphoto=='1'">
          <img src="{{photo}}" ng-click="changePage('form-update-photo')" class="image-circle center-block" alt="User Image" style="width:50px" ng-show="defaultphoto=='0'">
        <?php
        } else {
        ?>
          <img src="images/blank.jpg" class="image-circle center-block" alt="User Image" style="padding:10px" ng-show="defaultphoto=='1'">
          <img src="{{photo}}" class="image-circle center-block" alt="User Image" style="width:50px" ng-show="defaultphoto=='0'">
        <?php
        }
        ?>
        <div class="name-profile center-block">Welcome <?php echo $_SESSION["emoney_username"]; ?> </div>
      </div>
      <div class="row"> </div>
      <div class="menu" ng-click="menuHandle()" style="background-color:#131d55;padding-left:14px;">
        <p class="decription-menu" style="font-size:16px;padding-right:20px">
          <b><i class="fa fa-circle" style="font-size:9px;"></i> Menu :</b>
          <i class="fa" style="float:right" ng-class="{'fa-caret-down': status.all, 'fa-caret-right': !status.all}"></i>
        </p>
      </div>
      <div style="clear:both"></div>
      <?php
      if ($_SESSION['emoney_username'] == 'KRIKYACS2') {
      ?>
        <div class="menu" ng-click="changePage('transaction-merchant')">
          <p class="decription-menu">Merchant Transaction </p>
        </div>


      <?php
      } else {
      ?>

        <?php
        if ($_SESSION["emoney_type"] == 'R') {
        ?>
          <!-- <div class="menu" ng-click="changePage('master-dashboard-reseller')"> -->
            <!--<img src="{{menulang.dashboard}}" class="img-responsive" width="30%" title="D" > </img>-->
            <!-- <p class="decription-menu">Dashboard </p>
          </div> -->
        <?php
        }
        ?>
        <?php
        if ($_SESSION["emoney_type"] == 'M' && $_SESSION["emoney_access"] & $MENU_NAV['Transaction by Id NA'] == 0) {

        ?>
          <!-- <div class="menu" ng-click="changePage('master-dashboard-merchant')" >	 -->
          <!--<img src="{{menulang.dashboard}}" class="img-responsive" width="30%" title="D" > </img> -->
          <!-- <p class="decription-menu">Dashboard </p>
			</div> -->
          <div class="menu" ng-click="changePage('master-report-merchant')">
            <!--<img src="{{menulang.dashboard}}" class="img-responsive" width="30%" title="D" > </img> -->
            <p class="decription-menu">Report Monthly</p>
          </div>
          <!-- <div class="menu" ng-click="changePage('master-report-daily-merchant')" > -->
          <!--<img src="{{menulang.dashboard}}" class="img-responsive" width="30%" title="D" > </img> -->
          <!-- <p class="decription-menu">Report Daily </p>
			</div>	 -->
          <div class="menu" ng-click="changePage('master-report-daily-merchant-new')">
            <!--<img src="{{menulang.dashboard}}" class="img-responsive" width="30%" title="D" > </img> -->
            <p class="decription-menu">Report Daily New</p>
          </div>
        <?php
        }
        ?>
        <uib-accordion close-others="false">

          <?php
          if ($access & $MENU_NAV['Transaction by Id NA'] == 0) {
          ?>
            <div class="menu" ng-click="changePage('inbox')">
              <div class="canvas-notification" ng-show="notification1 != 0">
                <div class="notification" style="float:left">{{notification1}} </div>

              </div>
              <!-- <i class="{{menulang.inbox}}" aria-hidden="true" style="font-size:50px" title="inbox"></i>-->
              <p class="decription-menu">Inbox </p>
            </div>
          <?php
          }
          ?>
          <div uib-accordion-group class="menuAccordion" is-open="status[0].a40">
            <uib-accordion-heading>
              <div class="dasboard-decription" style="font-size: 15px;">
                Dashboard <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a0, 'glyphicon-chevron-right': !status[0].a0}"></i>
              </div>
            </uib-accordion-heading>
            <?php if ($type == 'R') { ?>
              <!-- <div class="menu" ng-click="changePage('master-dashboard-reseller')">
                <p class="decription-menu">Dashboard </p>
              </div> -->
            <?php }
            if ($type == 'A' || $type == 'S') { ?>
              <!-- <div class="menu" ng-click="changePage('master-dashboard-admin')">
                <p class="decription-menu">Dashboard </p>
              </div> -->
            <?php } ?>
              <div class="menu" ng-click="changePage('master-dashboard-merchant')">
                <p class="decription-menu">Dashboard Merchant</p>
              </div>
              <div class="menu" ng-click="changePage('agent-tracker')">
                <p class="decription-menu">Agent Status</p>
              </div>
          </div>
          <?php if ($type == 'S') { ?>
          <div uib-accordion-group class="menuAccordion" is-open="status[0].a30">
            <uib-accordion-heading>
              <div class="description-menu" style="font-size: 15px;">
                NEW Quick Menu <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a0, 'glyphicon-chevron-right': !status[0].a0}"></i>
              </div>
            </uib-accordion-heading>
            <div class="menu" ng-click="changePage('mybank-inactive-log')">
              <p class="decription-menu">Mybank Inactive Log</p>
            </div>
            <div class="menu" ng-click="changePage('resubmit-express')">
              <p class="decription-menu">Resubmit Express</p>
            </div>
            <div class="menu" ng-click="changePage('resubmit-express-new')">
              <p class="decription-menu">Resubmit Express - Super Admin</p>
            </div>
            <!-- <div class="menu" ng-click="changePage('resubmit-crawler-new')">
              <p class="decription-menu">Resubmit Crawler - Super Admin</p>
            </div> -->
            <div class="menu" ng-click="changePage('report-resubmit-without-automation')">
              <p class="decription-menu">Report Resubmit Express without Automation</p>
            </div>
            <div class="menu" ng-click="changePage('report-resubmit-without-automation-summary')">
              <p class="decription-menu">Report Resubmit Express without Automation Summary</p>
            </div>
            <div class="menu" ng-click="changePage('status-account-crawler-new')">
              <p class="decription-menu">Account Status New</p>
            </div>
          </div>
          <?php } ?>
          <div uib-accordion-group class="menuAccordion" is-open="status[0].a0">
            <uib-accordion-heading>
              <div class="description-menu" style="font-size: 15px;">
                Quick Menu <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a0, 'glyphicon-chevron-right': !status[0].a0}"></i>
              </div>
            </uib-accordion-heading>
            <?php
            if ($type == 'A' || $type == 'S') { ?>
              <div uib-accordion-group class="menuAccordion" is-open="status[0].a21">
                <uib-accordion-heading>
                  <div class="description-menu" style="font-size: 15px;">
                    Deposit <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a0, 'glyphicon-chevron-right': !status[0].a0}"></i>
                  </div>
                </uib-accordion-heading>
                <?php
                if ($type == 'A' || $type == 'S') { ?>
                  <div class="menu" ng-click="changePage('sms-log')">
                    <p class="decription-menu">SMS Log</p>
                  </div>
                  <div class="menu" ng-click="changePage('appium-list')">
                    <p class="decription-menu">Crawler List</p>
                  </div>
                  <div class="menu" ng-click="changePage('smslog-by-id')">
                    <p class="decription-menu">SMS Log by Id</p>
                  </div>
                  <div class="menu" ng-click="changePage('transaction-by-id')">
                    <p class="decription-menu">Transaction by Id</p>
                  </div>
                  <div class="menu" ng-click="changePage('report-flag')">
                    <p class="decription-menu">MCO</p>
                  </div>
                  <div class="menu" ng-click="changePage('update-mybank-selected')">
                    <p class="decription-menu">Update MyBank Selected</p>
                  </div>
                  <div class="menu" ng-click="changePage('transaction-callback-empty')">
                    <p class="decription-menu">Transaction Resend Callback</p>
                  </div>
                  <div class="menu" ng-click="changePage('transaction-callback-502')">
                    <p class="decription-menu">Resend Callback More Than 15 Minute</p>
                  </div>
                  <div class="menu" ng-click="changePage('resubmit-transaction')">
                    <p class="decription-menu">Resubmit Transaction</p>
                  </div>
                  <div class="menu" ng-click="changePage('find-transaction-member')">
                    <p class="decription-menu">Find Transaction Member</p>
                  </div>
                  <div class="menu" ng-click="changePage('sms-failed-match')">
                    <p class="decription-menu">SMS Failed Match</p>
                  </div>
                  <div class="menu" ng-click="changePage('new-deposit-list')">
                    <p class="decription-menu">Automation Deposit List</p>
                  </div>
                  <div class="menu" ng-click="changePage('mybank-check-deposit')">
                    <p class="decription-menu">Mybank Check Deposit</p>
                  </div>



                  <!-- Quick Menu Lama
                  <div class="menu" ng-click="changePage('deposit-dashboard')">
                    <p class="decription-menu">Deposit Dashboard Automation</p>
                  </div>
                  <div class="menu" ng-click="changePage('deposit-pending-list')">
                    <p class="decription-menu">Deposit List</p>
                  </div>
                  <div class="menu" ng-click="changePage('deposit-list-by-complete')">
                    <p class="decription-menu">Deposit List By Complete Date</p>
                  </div>
                  <div class="menu" ng-click="changePage('new-deposit-list')">
                    <p class="decription-menu">Automation Deposit List</p>
                  </div>
                  <div class="menu" ng-click="changePage('transaction-by-id')">
                    <p class="decription-menu">Transaction by Id</p>
                  </div>
                  <div class="menu" ng-click="changePage('deposit-list-failed-bulk')">
                    <p class="decription-menu">Deposit Failed Selected</p>
                  </div>
                  <div class="menu" ng-click="changePage('master-report-daily-admin-complete')">
                    <p class="decription-menu">Report Daily New by Complete Date</p>
                  </div>
                  <div class="menu" ng-click="changePage('acc-report-daily-complete')">
                    <p class="decription-menu">Account Report By Transaction Complete Date</p>
                  </div>
                  <div class="menu" ng-click="changePage('report')">
                    <p class="decription-menu">Download Report</p>
                  </div> -->
                <?php } ?>
              </div>
              <div uib-accordion-group class="menuAccordion" is-open="status[0].a22">
                <uib-accordion-heading>
                  <div class="description-menu" style="font-size: 15px;">
                    Withdraw <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a0, 'glyphicon-chevron-right': !status[0].a0}"></i>
                  </div>
                </uib-accordion-heading>
                <?php
                if ($type == 'A' || $type == 'S') { ?>
                  <div class="menu" ng-click="changePage('sms-log')">
                    <p class="decription-menu">SMS Log</p>
                  </div>
                  <div class="menu" ng-click="changePage('transaction-by-id')">
                    <p class="decription-menu">Transaction by Id</p>
                  </div>
                  <div class="menu" ng-click="changePage('withdraw-ntc')">
                    <p class="decription-menu">Withdraw Check </p>
                  </div>
                  <div class="menu" ng-click="changePage('withdraw-ntc-filter')">
                    <p class="decription-menu">Withdraw Check Filter </p>
                  </div>
                  <div class="menu" ng-click="changePage('withdraw-ntc-automation')">
                    <p class="decription-menu">Withdraw Check Automation</p>
                  </div>
                  <div class="menu" ng-click="changePage('withdraw-ntc-filter-selected')">
                    <p class="decription-menu">Withdraw Check Filter Bulk </p>
                  </div>
                  <div class="menu" ng-click="changePage('merchant-transaction-per-hour')">
                    <p class="decription-menu">Transaction Merchant Hour</p>
                  </div>
                  <div class="menu" ng-click="changePage('Automation-withdraw-list')">
                    <p class="decription-menu">ALL Automation Withdraw List</p>
                  </div>

                  <!-- Quick Menu Lama
                  <div class="menu" ng-click="changePage('withdraw-dashboard')">
                    <p class="decription-menu">Withdraw Dashboard Automation</p>
                  </div>
                  <div class="menu" ng-click="changePage('withdraw-list')">
                    <p class="decription-menu">Withdraw List </p>
                  </div>
                  <div class="menu" ng-click="changePage('appium-withdraw-transaction-new')">
                    <p class="decription-menu">Automation Withdraw List </p>
                  </div>
                  <div class="menu" ng-click="changePage('transaction-by-id')">
                    <p class="decription-menu">Transaction by Id</p>
                  </div>
                  <div class="menu" ng-click="changePage('master-mybank')">
                    <p class="decription-menu">MyBank ACC </p>
                  </div> -->
                <?php } ?>
              </div>
            <?php } ?>
              <div uib-accordion-group class="menuAccordion" is-open="status[0].a23">
                <uib-accordion-heading>
                  <div class="description-menu" style="font-size: 15px;">
                    Report <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a0, 'glyphicon-chevron-right': !status[0].a0}"></i>
                  </div>
                </uib-accordion-heading>
                <?php
                if ($type == 'A' || $type == 'S') { ?>
                  <div class="menu" ng-click="changePage('report')">
                    <p class="decription-menu">Download Report</p>
                  </div>
                  <div class="menu" ng-click="changePage('account-balance-log')">
                    <p class="decription-menu">Account Balance Log</p>
                  </div>
                  <div class="menu" ng-click="changePage('master-report-daily-admin-complete')">
                    <p class="decription-menu">Merchant Daily (GMT+8)</p>
                  </div>
                  <div class="menu" ng-click="changePage('acc-report-daily-complete')">
                    <p class="decription-menu">Agent Daily complete (GMT+8)</p>
                  </div>
                                  <div class="menu" ng-click="changePage('acc-report-daily-realtime-6')">
                  <p class="decription-menu">Agent success Trans Realtime (GMT+6)</p>
                </div>

                <?php } ?>
              </div>

              <div uib-accordion-group class="menuAccordion" is-open="status[0].a24">
                <uib-accordion-heading>
                  <div class="description-menu" style="font-size: 15px;">
                    Fraud <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a0, 'glyphicon-chevron-right': !status[0].a0}"></i>
                  </div>
                </uib-accordion-heading>
                <?php
                if ($type == 'A' || $type == 'S') { ?>
                <div class="menu" ng-click="changePage('report-flag')">
                  <p class="decription-menu">MCO</p>
                </div>
                <div class="menu" ng-click="changePage('find-transaction-member')">
                    <p class="decription-menu">Find Transaction Member</p>
                </div>
                <div class="menu" ng-click="changePage('report-blacklist')">
                  <p class="decription-menu">Blacklist List</p>
                </div>
                <!-- <div class="menu" ng-click="changePage('report-blacklist-release')">
                  <p class="decription-menu">Release Blacklist</p>
                </div> -->
                <div class="menu" ng-click="changePage('costumer-code-flag')">
                  <p class="decription-menu">Spammer Transaction</p>
                </div>
                <?php } ?>
              </div>
            <?php if ($access & $MENU_NAV['Master MyBank']) { ?>
                <!-- <div class="menu" ng-click="changePage('master-mybank')">
                  <p class="decription-menu">MyBank ACC </p>
                </div> -->
            <?php }
            if ($type == 'A' || $type == 'S') { ?>
              <!-- <div class="menu" ng-click="changePage('smslog-by-id')">
                <p class="decription-menu">SMS Log by Id</p>
              </div>
              <div class="menu" ng-click="changePage('sms-log')">
                <p class="decription-menu">SMS Log</p>
              </div>
              <div class="menu" ng-click="changePage('sms-lastack')">
                <p class="decription-menu">SMS Last ACK</p>
              </div>
              <div class="menu" ng-click="changePage('transaction-by-id')">
                <p class="decription-menu">Transaction by Id</p>
              </div> -->
              <?php //}
              //if($access && $MENU_NAV['Withdraw List']) { 
              ?>
              <!-- <div class="menu" ng-click="changePage('withdraw-ntc-c')">
                <p class="decription-menu">Withdraw Check </p>
              </div>
              <div class="menu" ng-click="changePage('withdraw-ntc-filter')">
                <p class="decription-menu">Withdraw Check Filter </p>
              </div>
              <div class="menu" ng-click="changePage('withdraw-ntc-filter-selected')">
                <p class="decription-menu">Withdraw Check Filter Bulk </p>
              </div>
              <div class="menu" ng-click="changePage('withdraw-ntc-filter-new')">
                <p class="decription-menu">Withdraw Check Filter New </p>
              </div>
              <div class="menu" ng-click="changePage('withdraw-ntc-assign-selected')">
                <p class="decription-menu">Assignment Bulk </p>
              </div> -->
            <?php }
            if ($type == 'A' || $type == 'S') { ?>
              <!-- <div class="menu" ng-click="changePage('resubmit-transaction')">
                <p class="decription-menu">Resubmit Transaction</p>
              </div>
              <div class="menu" ng-click="changePage('update-mybank')">
                <p class="decription-menu">Update MyBank </p>
              </div> -->
            <?php } ?>
          </div>
          <?php if ($type == 'A' || $type == 'S') { ?>
            <div uib-accordion-group class="menuAccordion" is-open="status[0].a1">
              <uib-accordion-heading>
                <div class="description-menu" style="font-size: 15px;">
                  My BankACC <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a1, 'glyphicon-chevron-right': !status[0].a1}"></i>
                </div>
              </uib-accordion-heading>
              <div class="menu" ng-click="changePage('master-mybank')">
                <p class="decription-menu">Data List </p>
              </div>
              <div class="menu" ng-click="changePage('mybank-inactive')">
                <p class="decription-menu">Data List Inactive </p>
              </div>
              <div class="menu" ng-click="changePage('list-onboard-agent')">
                <p class="decription-menu">List Onboard Agent </p>
              </div>
              <!-- <div class="menu" ng-click="changePage('master-mybank-new')">
                <p class="decription-menu">Data List New </p>
              </div> -->
              <?php if ($access && $MENU_NAV['Master MyBank']) { ?>
                <div class="menu" ng-click="changePage('update-mybank')">
                  <p class="decription-menu">Update MyBank </p>
                </div>
                <div class="menu" ng-click="changePage('update-mybank-selected')">
                  <p class="decription-menu">Update MyBank Selected</p>
                </div>
                <!-- <div class="menu" ng-click="changePage('update-mybank-selected-merchant')">
                  <p class="decription-menu">Update MyBank Merchant Selected</p>
                </div> -->
                <div class="menu" ng-click="changePage('update-merchant-bank-selected')">
                  <p class="decription-menu">Update Merchant Bank Acc Selected</p>
                </div>
                <!-- <div class="menu" ng-click="changePage('update-mybank-selected-merchant-new')">
                  <p class="decription-menu">Bulk Merchant Update</p>
                </div> -->
              <?php } ?>
              <div class="menu" ng-click="changePage('mybank-balance')">
                <p class="decription-menu">MyBank Balance </p>
              </div>
              <div class="menu" ng-click="changePage('mybank-limit')">
                <p class="decription-menu">MyBank Limit </p>
              </div>
            </div>
          <?php }
          if (($type == 'A' || $type == 'S') || ($type == 'M' && $access && $MENU_NAV['Transaction by Id NA'] == 0)) { ?>
            <div uib-accordion-group class="menuAccordion" is-open="status[0].a2">
              <uib-accordion-heading>
                <div class="description-menu" style="font-size: 15px;">
                  Report <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a2, 'glyphicon-chevron-right': !status[0].a2}"></i>
                </div>
              </uib-accordion-heading>
              <?php if ($type == 'A' || $type == 'S') { ?>
                <!-- <div class="menu" ng-click="changePage('master-report-admin')">
                  <p class="decription-menu">Report Monthly</p>
                </div>
                <div class="menu" ng-click="changePage('master-report-daily-admin')">
                  <p class="decription-menu">Report Daily</p>
                </div>
                <div class="menu" ng-click="changePage('master-report-daily-admin-new')">
                  <p class="decription-menu">Report Daily New</p>
                </div> -->
                <div class="menu" ng-click="changePage('master-report-daily-admin-complete')">
                  <p class="decription-menu">Merchant Daily (GMT+8)</p>
                </div>
                <div class="menu" ng-click="changePage('master-report-daily-admin-complete-Gmt6')">
                  <p class="decription-menu">Merchant Daily (GMT+6)</p>
                </div>
                <!-- <div class="menu" ng-click="changePage('acc-report-daily-new')">
                  <p class="decription-menu">Account Report By Transaction Daily New</p>
                </div> -->
                <div class="menu" ng-click="changePage('acc-report-daily-complete')">
                  <p class="decription-menu"> Agent Daily complete (GMT+8)</p>
                </div>
                <div class="menu" ng-click="changePage('acc-report-daily-realtime')">
                  <p class="decription-menu">Agent success Trans Realtime (GMT+8)</p>
                </div>
                <!-- <div class="menu" ng-click="changePage('acc-report-daily-new-6')">
                  <p class="decription-menu">Account Report By Transaction Daily New (GMT+6)</p>
                </div> -->
                <div class="menu" ng-click="changePage('acc-report-daily-complete-6')">
                  <p class="decription-menu">Agent Daily complete (GMT+6)</p>
                </div>
                <div class="menu" ng-click="changePage('acc-report-daily-realtime-6')">
                  <p class="decription-menu">Agent success Trans Realtime (GMT+6)</p>
                </div>
                <!-- <div class="menu" ng-click="changePage('acc-report-daily')">
                  <p class="decription-menu">Account Report By Transaction Daily</p>
                </div> -->
                <div class="menu" ng-click="changePage('balance-difference')">
                  <p class="decription-menu">Balance Difference</p>
                </div>
                <div class="menu" ng-click="changePage('sms-log-by-agent-report')">
                  <p class="decription-menu">Account Report By SMS Daily</p>
                </div>
              <?php }
              if ($type == 'M' && $access && $MENU_NAV['Transaction by Id NA'] == 0) { ?>
                <div class="menu" ng-click="changePage('master-report-merchant')">
                  <p class="decription-menu">Report Monthly</p>
                </div>
                <!-- <div class="menu" ng-click="changePage('master-report-daily-admin')" >
            <p class="decription-menu">Report Daily</p>
          </div> -->
                <div class="menu" ng-click="changePage('master-report-daily-merchant-new')">
                  <p class="decription-menu">Report Daily New</p>
                </div>
                <div class="menu" ng-click="changePage('balance-difference')">
                  <p class="decription-menu">Balance Difference</p>
                </div>
              <?php }
              if ($type == 'A' || $type == 'S') { ?>
                <div class="menu" ng-click="changePage('report')">
                  <p class="decription-menu">Download Report</p>
                </div>
                <div class="menu" ng-click="changePage('report-flag')">
                  <p class="decription-menu">MCO</p>
                </div>
                <div class="menu" ng-click="changePage('report-blacklist')">
                  <p class="decription-menu">Blacklist List</p>
                </div>
                <!-- <div class="menu" ng-click="changePage('report-blacklist-release')">
                  <p class="decription-menu">Release Blacklist</p>
                </div> -->
                <div class="menu" ng-click="changePage('summary-bkashm')">
                  <p class="decription-menu"> Summary Bkashm</p>
                </div>
              <?php } ?>
            </div>
          <?php }
          if ($access & $MENU_NAV['Login List']) { ?>
            <div uib-accordion-group class="menuAccordion" is-open="status[0].a3">
              <uib-accordion-heading>
                <div class="description-menu" style="font-size: 15px;">
                  User<br>Management <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a3, 'glyphicon-chevron-right': !status[0].a3}"></i>
                </div>
              </uib-accordion-heading>
              <div class="menu" ng-click="changePage('login-list')">
                <p class="decription-menu">Accounts</p>
              </div>
              <div class="menu" ng-click="changePage('automation-create-list')">
                <p class="decription-menu">Automation List</p>
              </div>
              <div class="menu" ng-click="changePage('automation-create-list-admin')">
                <p class="decription-menu">Automation List Admin</p>
              </div>
              <div class="menu" ng-click="changePage('server-list')">
                <p class="decription-menu">Server List</p>
              </div>
              <div class="menu" ng-click="changePage('automation-error-list')">
                <p class="decription-menu">Automation Error</p>
              </div>
            </div>
            <div uib-accordion-group class="menuAccordion" is-open="status[0].a4">
              <uib-accordion-heading>
                <div class="description-menu" style="font-size: 15px;">
                  Agent <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a4, 'glyphicon-chevron-right': !status[0].a4}"></i>
                </div>
              </uib-accordion-heading>
              <div class="menu" ng-click="changePage('agentgroup')">
                <p class="decription-menu">Agent Group </p>
              </div>
              <div class="menu" ng-click="changePage('agent-commission-settlement')">
                <p class="decription-menu">Agent Comm. Settlement </p>
              </div>
              <div class="menu" ng-click="changePage('agent-credit')">
                <p class="decription-menu">Agent Credit</p>
              </div>
              <div class="menu" ng-click="changePage('agent-credit-monitoring')">
                <p class="decription-menu">Agent Credit Monitoring</p>
              </div>
              <div class="menu" ng-click="changePage('agent-credit-request')">
                <p class="decription-menu">Agent Credit Request </p>
              </div>
              <div class="menu" ng-click="changePage('agent-report-transaction')">
                <p class="decription-menu">Agent Report Transaction </p>
              </div>
              <div class="menu" ng-click="changePage('current-balance-by-agent-5-new-latest')">
                <p class="decription-menu">Agent Current Balance GMT+6</p>
              </div>
              <div class="menu" ng-click="changePage('current-balance-by-agent-live-latest')">
                <p class="decription-menu">Agent Current Balance GMT+6 NEW</p>
              </div>
              <div class="menu" ng-click="changePage('transaction-summary-by-agent-new')">
                <p class="decription-menu">Transaction Summary by Agent NEW (GMT +6)</p>
              </div>
            </div>
          <?php } ?>
          <div uib-accordion-group class="menuAccordion" is-open="status[0].a5">
            <uib-accordion-heading>
              <div class="description-menu" style="font-size: 15px;">
                Merchant <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a5, 'glyphicon-chevron-right': !status[0].a5}"></i>
              </div>
            </uib-accordion-heading>
            <?php if ($access & $MENU_NAV['Master Merchant']) { ?>
              <!-- <div class="menu" ng-click="changePage('master-merchant')">
                <p class="decription-menu">Merchant Master </p>
              </div> -->
              <?php if ($_SESSION["emoney_type"] == 'S') { ?>
                <div class="menu" ng-click="changePage('master-merchant-superadmin')">
                  <p class="decription-menu">Merchant Master </p>
                </div>
              <?php } ?>
              <div class="menu" ng-click="changePage('merchant-bankacc')">
                <p class="decription-menu">Merchant Bank Acc </p>
              </div>
            <?php }
            if ($access && $MENU_NAV['Transaction Merchant']) { ?>
              <div class="menu" ng-click="changePage('transaction-merchant')">
                <p class="decription-menu">Merchant Transaction </p>
              </div>
              <div class="menu" ng-click="changePage('transaction-merchant-history')">
                <p class="decription-menu">Merchant Transaction History</p>
              </div>
              <div class="menu" ng-click="changePage('report-merchant')">
                <p class="decription-menu">Report Merchant</p>
              </div>
            <?php } ?>
          </div>
          <div uib-accordion-group class="menuAccordion" is-open="status[0].a6">
            <uib-accordion-heading>
              <div class="description-menu" style="font-size: 15px;">
                Deposits <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a6, 'glyphicon-chevron-right': !status[0].a6}"></i>
              </div>
            </uib-accordion-heading>
            <div class="menu" ng-click="changePage('deposit-dashboard')">
              <p class="decription-menu">Deposit Dashboard Automation</p>
            </div>
            <div class="menu" ng-click="changePage('deposit-pending-list')">
              <p class="decription-menu">Deposit List</p>
            </div>
            <div class="menu" ng-click="changePage('new-deposit-list')">
              <p class="decription-menu">Automation Deposit List</p>
            </div>
            <?php if ($access && $MENU_NAV['Transaction Merchant']) { ?>
              <!-- <div class="menu" ng-click="changePage('transaction-merchant-deposit')">
                <p class="decription-menu">Merchant Transaction Deposit</p>
              </div> -->
            <?php  }
            if ($access && $MENU_NAV['Deposit Queue']) { ?>
              <div class="menu" ng-click="changePage('deposit-pending')">
                <p class="decription-menu">Deposit Pending</p>
              </div>
              <!-- <div class="menu" ng-click="changePage('deposit-queue-today')">
                <p class="decription-menu">Deposit Queue Today</p>
              </div> -->
              <!-- <div class="menu" ng-click="changePage('deposit-queue-today-bdt')">
                <p class="decription-menu">Deposit Queue Today BDT</p>
              </div>
              <div class="menu" ng-click="changePage('deposit-queue')">
                <p class="decription-menu">Deposit Queue Unmatched by Date </p>
              </div>
              <div class="menu" ng-click="changePage('deposit-queue-alert')">
                <p class="decription-menu">Deposit Queue Alert</p>
              </div> -->
            <?php } ?>
          </div>
          <div uib-accordion-group class="menuAccordion" is-open="status[0].a7">
            <uib-accordion-heading>
              <div class="description-menu" style="font-size: 15px;">
                Withdrawal <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a7, 'glyphicon-chevron-right': !status[0].a7}"></i>
              </div>
            </uib-accordion-heading>
            <?php if ($access && $MENU_NAV['Withdraw List']) { ?>
              <div class="menu" ng-click="changePage('withdraw-dashboard')">
                <p class="decription-menu">Withdraw Dashboard Automation</p>
              </div>
              <div class="menu" ng-click="changePage('withdraw-list')">
                <p class="decription-menu">Withdraw List </p>
              </div>
              <div class="menu" ng-click="changePage('Automation-withdraw-list')">
                <p class="decription-menu">ALL Automation Withdraw List</p>
              </div>
              <div class="menu" ng-click="changePage('appium-withdraw-transaction-new')">
                <p class="decription-menu">Automation Withdraw List</p>
              </div>
              <?php if ($type == 'A' || $type == 'S') { ?>
                <div class="menu" ng-click="changePage('withdraw-ntc')">
                  <p class="decription-menu">Withdraw Check </p>
                </div>
                <div class="menu" ng-click="changePage('withdraw-ntc-automation')">
                  <p class="decription-menu">Withdraw Check Automation </p>
                </div>
                <div class="menu" ng-click="changePage('withdraw-ntc-filter')">
                  <p class="decription-menu">Withdraw Check Filter </p>
                </div>
                <div class="menu" ng-click="changePage('withdraw-ntc-filter-selected')">
                  <p class="decription-menu">Withdraw Check Filter Bulk </p>
                </div>
                <!-- <div class="menu" ng-click="changePage('withdraw-ntc-filter-new')">
                  <p class="decription-menu">Withdraw Check Filter New </p>
                </div> -->
              <?php } ?>
              <!-- <div class="menu" ng-click="changePage('withdraw-bank')">
                <p class="decription-menu">Setting </p>
              </div> -->
            <?php }
            if ($access && $MENU_NAV['Transaction Merchant']) { ?>
              <div class="menu" ng-click="changePage('transaction-merchant-withdraw')">
                <p class="decription-menu">Merchant Transaction Withdrawal </p>
              </div>
            <?php }
            if ($access && $MENU_NAV['Withdraw List']) { ?>
              <div class="menu" ng-click="changePage('withdraw-assignment')">
                <p class="decription-menu">Assignment </p>
              </div>
              <div class="menu" ng-click="changePage('withdraw-ntc-assign-selected')">
                <p class="decription-menu">Assignment Bulk </p>
              </div>
              <!-- <div class="menu" ng-click="changePage('assignment-pending')">
                <p class="decription-menu">Assignment Pending</p>
              </div> -->
              <!-- <div class="menu" ng-click="changePage('withdraw-queue')">
                <p class="decription-menu">Withdraw Queue </p>
              </div> -->
            <?php } ?>
          </div>
          <div uib-accordion-group class="menuAccordion" is-open="status[0].a8">
            <uib-accordion-heading>
              <div class="description-menu" style="font-size: 15px;">
                Transaction <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a8, 'glyphicon-chevron-right': !status[0].a8}"></i>
              </div>
            </uib-accordion-heading>
            <?php if (($type == 'A' || $type == 'S') || ($access && $MENU_NAV['Transaction Account - Company'])) { ?>
              <div class="menu" ng-click="changePage('transaction-by-id')">
                <p class="decription-menu">Transaction by Id</p>
              </div>
              <div class="menu" ng-click="changePage('transaction-by-id-backup')">
                <p class="decription-menu">Transaction by Id Backup</p>
              </div>
              <div class="menu" ng-click="changePage('transaction-by-id-new')">
                <p class="decription-menu">Transaction by Id Backup (equals)</p>
              </div>
              <div class="menu" ng-click="changePage('find-transaction-member')">
                <p class="decription-menu">Find Member Transaction</p>
              </div>
              <div class="menu" ng-click="changePage('rejected-transactions-log')">
                <p class="decription-menu">Rejected transaction log</p>
              </div>
              <div class="menu" ng-click="changePage('find-trxid')">
                <p class="decription-menu">Find Trxid</p>
              </div>
            <?php }
            if ($access && $MENU_NAV['Transaction Account - Company']) { ?>
              <div class="menu" ng-click="changePage('transaction-account-by-company')">
                <p class="decription-menu">Transaction By Account </p>
              </div>
              <div class="menu" ng-click="changePage('transaction-history')">
                <p class="decription-menu">Transaction By Account History</p>
              </div>
              <div class="menu" ng-click="changePage('transaction-callback-empty')">
                <p class="decription-menu">Transaction Resend Callback</p>
              </div>
              <div class="menu" ng-click="changePage('transaction-callback-502')">
                <p class="decription-menu">Resend Callback More Than 15 Minute</p>
              </div>
            <?php }
            if ($type == 'A' || $type == 'S') { ?>
              <div class="menu" ng-click="changePage('transaction-today-complete')">
                <p class="decription-menu">Transaction Completed Today</p>
              </div>
            <?php }
            if ($access && $MENU_NAV['Transaction by Id NA']) { ?>
              <div class="menu" ng-click="changePage('transaction-by-id-noact')">
                <p class="decription-menu">Transaction by Id NA</p>
              </div>
              <div class="menu" ng-click="changePage('transaction-by-id-backup-noact')">
                <p class="decription-menu">Transaction by Id Backup NA</p>
              </div>
            <?php }
            if ($access && $MENU_NAV['Transaction Account - Company']) { ?>
              <div class="menu" ng-click="changePage('suspected-transaction')">
                <p class="decription-menu">Suspected Transaction </p>
              </div>
              <div class="menu" ng-click="changePage('submitted-transaction')">
                <p class="decription-menu">Submitted Transaction </p>
              </div>
              <div class="menu" ng-click="changePage('transaction-pending')">
                <p class="decription-menu">Transaction Pending</p>
              </div>
              <div class="menu" ng-click="changePage('transaction-flag-m')">
                <p class="decription-menu">Transaction Flag by M</p>
              </div>
              <div class="menu" ng-click="changePage('transaction-by-notmatchsameday')">
                <p class="decription-menu">Transaction By Not Match Sameday </p>
              </div>
            <?php }
            if ($type == 'A' || $type == 'S') { ?>
              <div class="menu" ng-click="changePage('resubmit-transaction')">
                <p class="decription-menu">Resubmit Transaction</p>
              </div>
              <div class="menu" ng-click="changePage('resubmit-transaction-log')">
                <p class="decription-menu">Resubmit Transaction Log</p>
              </div>
              <div class="menu" ng-click="changePage('resubmit-automatching')">
                <p class="decription-menu">Resubmit Auto Matching</p>
              </div>
            <?php }
            if ($access & $MENU_NAV['Update Transaction']) { ?>
              <div class="menu" ng-click="changePage('update-transaction')">
                <p class="decription-menu">Update Transaction</p>
              </div>
              <div class="menu" ng-click="changePage('update-transaction-status-new')">
                <p class="decription-menu">Update Transaction New</p>
              </div>
              <div class="menu" ng-click="changePage('update-transaction-log')">
                <p class="decription-menu">Update Transaction Log</p>
              </div>
              <?php }
            if ($access && $MENU_NAV['Transaction Account - Company']) {
              if ($type == 'A' || $type == 'S') { ?>
                <div class="menu" ng-click="changePage('company-adjustment-form')">
                  <p class="decription-menu">Adjustment Without Fee</p>
                </div>
              <?php } ?>
              <div class="menu" ng-click="changePage('company-adjustment-merchant-form')">
                <p class="decription-menu">Adjustment Merchant</p>
              </div>
            <?php } ?>
          </div>
          <?php if ($type == 'A' || $type == 'S') { ?>
            <div uib-accordion-group class="menuAccordion" is-open="status[0].a9">
              <uib-accordion-heading>
                <div class="description-menu" style="font-size: 15px;">
                  SMS <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a9, 'glyphicon-chevron-right': !status[0].a9}"></i>
                </div>
              </uib-accordion-heading>
              <div class="menu" ng-click="changePage('smslog-by-id')">
                <p class="decription-menu">SMS Log by Id</p>
              </div>
              <!-- <div class="menu" ng-click="changePage('sms-criteria-not-matching-by-id')">
                <p class="decription-menu">SMS Criteria not Matching by Id</p>
              </div> -->
              <div class="menu" ng-click="changePage('sms-log')">
                <p class="decription-menu">SMS Log</p>
              </div>
              <div class="menu" ng-click="changePage('sms-log-backup')">
                <p class="decription-menu">SMS Log Backup</p>
              </div>
              <!-- <div class="menu" ng-click="changePage('sms-log-by-balance-diff')">
                <p class="decription-menu">SMS Log by Balance Diff</p>
              </div>
              <div class="menu" ng-click="changePage('sms-log-by-customer-phone')">
                <p class="decription-menu">SMS Log by Customer Phone</p>
              </div>
              <div class="menu" ng-click="changePage('suspected-sms')">
                <p class="decription-menu">Suspected SMS</p>
              </div> -->
              <!-- <div class="menu" ng-click="changePage('suspected-customer')">
                <p class="decription-menu">Suspected Customer</p>
              </div> -->
              <!-- <div class="menu" ng-click="changePage('duplicate-sms')">
                <p class="decription-menu">Duplicate SMS</p>
              </div> -->
              <div class="menu" ng-click="changePage('smslog-history')">
                <p class="decription-menu">SMS Log History</p>
              </div>
              <div class="menu" ng-click="changePage('sms-lastack')">
                <p class="decription-menu">SMS Last ACK</p>
              </div>
              <div class="menu" ng-click="changePage('sms-lastack-active')">
                <p class="decription-menu">SMS Last ACK Active</p>
              </div>
              <div class="menu" ng-click="changePage('report-sms')">
                <p class="decription-menu">Report SMS</p>
              </div>
              <!-- <div class="menu" ng-click="changePage('phone-whitelist')">
                <p class="decription-menu">Phone Whitelist</p>
              </div> -->
              <div class="menu" ng-click="changePage('servicecenter-whitelist')">
                <p class="decription-menu">Service Center Whitelist</p>
              </div>

              <?php if ($type == 'S') { ?>
                <div class="menu" ng-click="changePage('sms-failed-match')">
                  <p class="decription-menu">SMS Failed Match</p>
                </div>
                <div class="menu" ng-click="changePage('sms-failed-match-by-notmatchsameday')">
                  <p class="decription-menu">SMS Failed Match by Not Match Sameday</p>
                </div>        
              <?php } ?>
            </div>

            <div uib-accordion-group class="menuAccordion" is-open="status[0].a12">
              <uib-accordion-heading>
                <div class="description-menu" style="font-size: 15px;">
                  Crawler <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a12, 'glyphicon-chevron-right': !status[0].a12}"></i>
                </div>
              </uib-accordion-heading>
              <div class="menu" ng-click="changePage('appium-list')">
                <p class="decription-menu">Crawler List</p>
              </div>
              <div class="menu" ng-click="changePage('automation-list-h')">
                <p class="decription-menu">Crawler History List</p>
              </div>
                <div class="menu" ng-click="changePage('appium-list-wd-new')">
                <p class="decription-menu">Crawler List WD</p>
              </div>
              <?php if ($type == 'S') { ?>
                <div class="menu" ng-click="changePage('appium-list-wd')">
                <p class="decription-menu">Crawler List WD Admin</p>
              </div>
              <div class="menu" ng-click="changePage('appium-list-not-match')">
                <p class="decription-menu">Crawler List Not Match</p>
              </div>
              <div class="menu" ng-click="changePage('crawler-wd-queue')">
                <p class="decription-menu">Withdraw Queue </p>
              </div>
              <div class="menu" ng-click="changePage('create-b2b-transaction')">
                <p class="decription-menu">Create Transaction B2B</p>
              </div>
              <div class="menu" ng-click="changePage('status-account-crawler-new')">
                <p class="decription-menu">Account Status New</p>
              </div>
              <div class="menu" ng-click="changePage('automation-error-list')">
                <p class="decription-menu">Automation Error</p>
              </div>
              <div class="menu" ng-click="changePage('crawler-errorlog')">
                <p class="decription-menu">Error Log </p>
              </div>
              <div class="menu" ng-click="changePage('list-agent-failed-summary')">
                <p class="decription-menu">List Agent Failed Summary</p>
              </div>
              <div class="menu" ng-click="changePage('agent-summary')">
                <p class="decription-menu">Agent Summary</p>
              </div>
              <div class="menu" ng-click="changePage('report-difference')">
                <p class="decription-menu">Report Difference</p>
              </div>
               <?php } ?>

              <div class="menu" ng-click="changePage('account-balance-log')">
                <p class="decription-menu">Account Balance Log</p>
              </div>
              <!-- <div class="menu" ng-click="changePage('agent-summary-report')">
                <p class="decription-menu">Agent Summary Report</p>
              </div> -->
              <div class="menu" ng-click="changePage('monthly-summary-report')">
                <p class="decription-menu">Monthly Summary Report</p>
              </div>
              <div class="menu" ng-click="changePage('credentials-bkashm-list')">
                <p class="decription-menu">Credentials BKASHM</p>
              </div>
            </div>

            <div uib-accordion-group class="menuAccordion" is-open="status[0].a10">
              <uib-accordion-heading>
                <div class="description-menu" style="font-size: 15px;">
                  Settlement <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a10, 'glyphicon-chevron-right': !status[0].a10}"></i>
                </div>
              </uib-accordion-heading>
              <div class="menu" ng-click="changePage('request-manual')">
                <p class="decription-menu">
                  <?php
                  if ($_SESSION["emoney_type"] == 'M') {
                    echo 'Setlement & Topup';
                  } else {
                    echo 'Setlement';
                  }
                  ?>
                </p>
              </div>
              <div class="menu" ng-click="changePage('request-list')">
                <p class="decription-menu">{{menulang.requestlist}}</p>
              </div>
              <div class="menu" ng-click="changePage('B2b-Send')">
                <p class="decription-menu">B2b Send</p>
              </div>
            </div>
            <div uib-accordion-group class="menuAccordion" is-open="status[0].a11">
              <uib-accordion-heading>
                <div class="description-menu" style="font-size: 15px;">
                  Setting <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status[0].a11, 'glyphicon-chevron-right': !status[0].a11}"></i>
                </div>
              </uib-accordion-heading>
              <div class="menu" ng-click="changePage('update-group')">
                <p class="decription-menu">Update Group</p>
              </div>
              <div class="menu" ng-click="changePage('system-setting')">
                <p class="decription-menu">System Setting</p>
              </div>
              <div class="menu" ng-click="changePage('cpjournal')">
                <p class="decription-menu">CP Journal</p>
              </div>
              <div class="menu" ng-click="changePage('available-account-list')">
                <p class="decription-menu">Available Account List</p>
              </div>
              <div class="menu" ng-click="changePage('whitelist-merchant-ip')">
                <p class="decription-menu">Whitelist Merchant IP</p>
              </div>
              <div class="menu" ng-click="changePage('available-account-new')">
                <p class="decription-menu">Available Account New Deposit</p>
              </div>
              <div class="menu" ng-click="changePage('available-account-mybank')">
                <p class="decription-menu">Available Account With Mybank</p>
              </div>
              <div class="menu" ng-click="changePage('count-available-account-new')">
                <p class="decription-menu">Count Available Account New Deposit</p>
              </div>
              <div class="menu" ng-click="changePage('available-account-new-wd')">
                <p class="decription-menu">Available Account New Withdraw</p>
              </div>
              <?php if ($type == 'S') { ?>
                <div class="menu" ng-click="changePage('emergency-deposit-page')">
                  <p class="decription-menu">Emergency Deposit Page</p>
                </div>
                <div class="menu" ng-click="changePage('service-list')">
                  <p class="decription-menu">Service Selenium List</p>
                </div>
                <div class="menu" ng-click="changePage('service-nagad-api')">
                  <p class="decription-menu">Service NAGAD API</p>
                </div>
                <div class="menu" ng-click="changePage('service-bkash-api')">
                  <p class="decription-menu">Service BKASH API</p>
                </div>
                <div class="menu" ng-click="changePage('service-resend-callback')">
                  <p class="decription-menu">Service Resend Callback</p>
                </div>
              <?php } ?>
            </div>
          <?php } ?>
          <div class="menu" ng-click="changePage('logout')">
            <p class="decription-menu"> Logout </p>
          </div>
        </uib-accordion>
      <?php
      }
      ?>
    </div>
  </div>