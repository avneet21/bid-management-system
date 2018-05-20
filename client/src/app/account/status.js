angular.module('account.statuses.detail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'ui.bootstrap']);
angular.module('account.statuses.detail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/status/:id', {
      templateUrl: 'account/status.tpl.html',
      controller: 'AccountStatusesDetailCtrl',
      title: 'Statuses / Details',
      resolve: {
        status: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              var id = $route.current.params.id || '';
              if(id){
                return adminResource.findStatus(id);
              }else{
                redirectUrl = '/admin/statuses';
                return $q.reject();
              }
            }, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unauthorized-client'? '/account': '/login';
              return $q.reject();
            })
            .catch(function(){
                var id = $route.current.params.id || '';
                if(id){
                    return adminResource.findStatus(id);
                } else{
                    redirectUrl = '/account';
                    return $q.reject();
                }
            });
          return promise;
        }]
      }
    });
}]);
angular.module('account.statuses.detail').controller('AccountStatusesDetailCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'status',
  function($scope, $route, $location, $log, utility, adminResource, data) {
    // local vars
    var deserializeData = function(data){
      $scope.status = data;
        $scope.status.amount = parseFloat($scope.status.amount)
    };
    var closeAlert = function(alert, ind){
      alert.splice(ind, 1);
    };
    //$scope vars
    $scope.detailAlerts = [];
    $scope.deleteAlerts = [];
    $scope.canSave = utility.canSave;
    $scope.hasError = utility.hasError;
    $scope.showError = utility.showError;
    $scope.closeDetailAlert = function(ind){
      closeAlert($scope.detailAlerts, ind);
    };
    $scope.closeDeleteAlert = function(ind){
      closeAlert($scope.deleteAlerts, ind);
    };
    $scope.update = function(){
      $scope.detailAlerts = [];
      var data = {
        title: $scope.status.title,
        description: $scope.status.description,
          amount: $scope.status.amount,
      };
      adminResource.updateStatus($scope.status._id, data).then(function(result){
        if(result.success){
          deserializeData(result.status);
          $scope.detailAlerts.push({ type: 'info', msg: 'Changes have been saved.'});
        }else{
          angular.forEach(result.errors, function(err, index){
            $scope.detailAlerts.push({ type: 'danger', msg: err });
          });
        }
      }, function(x){
        $scope.detailAlerts.push({ type: 'danger', msg: 'Error updating status: ' + x });
      });
    };
    $scope.deleteStatus = function(){
      $scope.deleteAlerts =[];
      if(confirm('Are you sure?')){
        adminResource.deleteStatus($scope.status._id).then(function(result){
          if(result.success){
            //redirect to admin statuses index page
            $location.path('/account');
          }else{
            //error due to server side validation
            angular.forEach(result.errors, function(err, index){
              $scope.deleteAlerts.push({ type: 'danger', msg: err});
            });
          }
        }, function(x){
          $scope.deleteAlerts.push({ type: 'danger', msg: 'Error deleting status: ' + x });
        });
      }
    };

    //initialize
    deserializeData(data);
  }
]);