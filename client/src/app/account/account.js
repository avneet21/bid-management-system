angular.module('account.index', ['ngRoute', 'security.authorization','services.utility', 'services.adminResource']);
angular.module('account.index').config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider
    .when('/account', {
      templateUrl: 'account/account.tpl.html',
      controller: 'AccountCtrl',
      title: 'Account Area',
      resolve: {
          statuses: ['$q', '$location', '$log', 'securityAuthorization', 'adminResource', function($q, $location, $log, securityAuthorization, adminResource){
              //get app stats only for admin-user, otherwise redirect to /account
              var redirectUrl;
              var promise = securityAuthorization.requireAdminUser()
                  .then(function(){
                      //handles url with query(search) parameter
                      return adminResource.findStatuses($location.search());
                  }, function(reason){
                      //rejected either user is un-authorized or un-authenticated
                      redirectUrl = reason === 'unauthorized-client'? '/account': '/login';
                      return $q.reject();
                  })
                  .catch(function(){
                      //handles url with query(search) parameter
                      return adminResource.findStatuses($location.search());
                  });
              return promise;
          }]
      }
    });
}]);
angular.module('account.index').controller('AccountCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'statuses',
    function($scope, $route, $location, $log, utility, adminResource, data){
        // local var
        var deserializeData = function(data){
            $scope.items = data.items;
            $scope.pages = data.pages;
            $scope.filters = data.filters;
            $scope.statuses = data.data;
        };

        var fetchStatuses = function(){
            adminResource.findStatuses($scope.filters).then(function(data){
                deserializeData(data);

                //update url in browser addr bar
                $location.search($scope.filters);
            }, function(e){
                $log.error(e);
            });
        };

        // $scope methods
        $scope.canSave = utility.canSave;
        $scope.filtersUpdated = function(){
            //reset pagination after filter(s) is updated
            $scope.filters.page = undefined;
            fetchStatuses();
        };
        $scope.prev = function(){
            $scope.filters.page = $scope.pages.prev;
            fetchStatuses();
        };
        $scope.next = function(){
            $scope.filters.page = $scope.pages.next;
            fetchStatuses();
        };
        $scope.addStatus = function(){
            adminResource.addStatus($scope.add).then(function(data){
                $scope.add = {};
                if(data.success){
                    $route.reload();
                }else if (data.errors && data.errors.length > 0){
                    alert(data.errors[0]);
                }else {
                    alert('unknown error.');
                }
            }, function(e){
                $scope.add = {};
                $log.error(e);
            });
        };

        // $scope vars
        //select elements and their associating options
        $scope.sorts = [
            {label: "Id \u25B2", value: "_id"},
            {label: "Id \u25BC", value: "-_id"},
            {label: "Amount \u25B2", value: "amount"},
            {label: "Amount \u25BC", value: "-amount"},
            {label: "Bid Date \u25B2", value: "createdOn"},
            {label: "Bid Date \u25BC", value: "-createdOn"}
        ];
        $scope.limits = [
            {label: "10 items", value: 10},
            {label: "20 items", value: 20},
            {label: "50 items", value: 50},
            {label: "100 items", value: 100}
        ];

        //initialize $scope variables
        deserializeData(data);
        //$scope.statuses = [];
        // for(var i=0;i<20;i++){
        //   $scope.statuses.push({
        //     id  : 100000+i,
        //     title : "My Bid For Project "+i,
        //     description : "This bid is related to We Development project",
        //     createdOn : "19th May 2018",
        //     amount : (300+50*i) + " USD",
        //     createdBy : "Admin User"
        //   })
        // }
    }
]);

