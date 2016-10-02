var app = angular.module('afwh', ['ngResource','ngRoute']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'index.html'
        }),
        .when('customers', {
            templateUrl: 'customers.html',
            controller: 'CustCtrl'
        });
}]);

app.controller('CustCtrl', ['$scope', '$resource', 
    function($scope, $resource){
        var Customer = $resource('/api/customer');
        Customer.query(function(customers){
            $scope.customers = customers;
        });
    }]);