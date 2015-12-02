'use strict';

angular.module('restaurantsApp', ['restaurants','ngRoute'])
    .config(['$routeProvider', function($routeProvider, $rootScope) {
        $routeProvider
            .when('/list', {templateUrl: 'views/list.html', controller: "ListCtrl"})
            .when('/start', {templateUrl: 'views/start.html', controller: "StartCtrl"})
            .when('/new', {templateUrl: 'views/edit.html', controller: "AddRestaurantCtrl"})
            .when('/edit/:id', {templateUrl: 'views/edit.html', controller: "EditRestaurantCtrl"})
            .when('/view/:id', {templateUrl: 'views/view.html', controller: "EditRestaurantCtrl"})
            .when('/newchain', {templateUrl: 'views/editchain.html', controller: "AddChainCtrl"})
            .when('/editchain/:id', {templateUrl: 'views/editchain.html', controller: "EditChainCtrl"})
            .when('/viewchain/:id', {templateUrl: 'views/viewchain.html', controller: "EditChainCtrl"})
            .when('/login', {templateUrl: 'views/login.html', controller: "LoginCtrl"})
            .otherwise({redirectTo: '/start'});
    },
    ]);
