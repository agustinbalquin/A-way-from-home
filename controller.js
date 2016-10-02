var app = angular.module('afwh', ['ngResource','ngRoute']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'index.html'
        });
}]);

