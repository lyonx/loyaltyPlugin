'use strict';

(function (angular, buildfire) {
  angular
    .module('loyaltyPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'ViewStack', 'LoyaltyAPI', 'STATUS_CODE', 'TAG_NAMES', 'LAYOUTS', 'DataStore',
      function ($scope, ViewStack, LoyaltyAPI, STATUS_CODE, TAG_NAMES, LAYOUTS, DataStore) {

        var WidgetHome = this;
        WidgetHome.currentLoggedInUser = null;

        WidgetHome.openReward = function (reward) {
          ViewStack.push({
            template: 'Item_Details'
          });
        };

        WidgetHome.getLoyaltyPoints = function (userId) {
          var success = function (result) {
              console.info('Points>>>>>>>>>>>>>>>.', result);
              WidgetHome.loyaltyPoints = result.totalPoints;
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting points data', err);
              }
            };
          var successLoyaltyRewards = function (result) {
              WidgetHome.loyaltyRewards = result;
              if (!WidgetHome.loyaltyRewards)
                WidgetHome.loyaltyRewards = [];
              console.info('Rewards>>>>>>>>>>>>>>.:', result);
            }
            , errorLoyaltyRewards = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data loyaltyRewards', err);
              }
            };
          LoyaltyAPI.getRewards('e22494ec-73ea-44ac-b82b-75f64b8bc535').then(successLoyaltyRewards, errorLoyaltyRewards);
          LoyaltyAPI.getLoyaltyPoints(userId, 'ouOUQF7Sbx9m1pkqkfSUrmfiyRip2YptbcEcEcoX170=', 'e22494ec-73ea-44ac-b82b-75f64b8bc535').then(success, error);
        };

        buildfire.auth.getCurrentUser(function (user) {
          console.log("_______________________", user);
          if (user) {
            WidgetHome.currentLoggedInUser = user;
            WidgetHome.getLoyaltyPoints(user._id);
            $scope.$digest();
          }
        });

        WidgetHome.openGetPoints = function () {
          console.log(">>>>>>>>>>>>>>");
          ViewStack.push({
            template: 'Amount'
          });
        };

        WidgetHome.openLogin = function () {
          buildfire.auth.login({}, function () {

          });
        };

        /*
         * Fetch user's data from datastore
         */

        var init = function () {
          var success = function (result) {
              WidgetHome.data = result.data;
              if (!WidgetHome.data.design)
                WidgetHome.data.design = {};
              if (!WidgetHome.data.settings)
                WidgetHome.data.settings = {};
              if (!WidgetHome.data.design.listLayout) {
                WidgetHome.data.design.listLayout = LAYOUTS.listLayout[0].name;
              }
            }
            , error = function (err) {
              console.error('Error while getting data', err);
            };
          DataStore.get(TAG_NAMES.LOYALTY_INFO).then(success, error);
        };

        var loginCallback = function () {
          buildfire.auth.getCurrentUser(function (user) {
            console.log("_______________________", user);
            if (user) {
              WidgetHome.currentLoggedInUser = user;
              $scope.$digest();
            }
          });
        };

        buildfire.auth.onLogin(loginCallback);

        var onUpdateCallback = function (event) {
          console.log("++++++++++++++++++++++++++", event);
          setTimeout(function () {
            if (event && event.tag) {
              switch (event.tag) {
                case TAG_NAMES.LOYALTY_INFO:
                  WidgetHome.data = event.data;
                  if (!WidgetHome.data.design)
                    WidgetHome.data.design = {};
                  if (!WidgetHome.data.design.listLayout) {
                    WidgetHome.data.design.listLayout = LAYOUTS.listLayout[0].name;
                  }
                  break;
              }
              $scope.$digest();
            }
          }, 0);
        };

        /**
         * DataStore.onUpdate() is bound to listen any changes in datastore
         */
        DataStore.onUpdate().then(null, null, onUpdateCallback);

        init();

      }]);
})(window.angular, window.buildfire);

