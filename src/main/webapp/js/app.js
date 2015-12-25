'use strict';

angular.module('restaurantsApp', ['restaurants','ngRoute'])
    .config(['$routeProvider', function($routeProvider, $rootScope) {
        $routeProvider
            .when('/list', {templateUrl: 'views/list.html', controller: "ListCtrl"})
            .when('/start', {templateUrl: 'views/start1.html', controller: "StartCtrl"})
            .when('/new', {templateUrl: 'views/new.html', controller: "AddRestaurantCtrl",
                resolve: {loggedIn: function ($location, $q, $cookieStore) {
                    var deferred = $q.defer();
                    var user = $cookieStore.get('user');
                    if (user !== undefined) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                        $location.url('/login');
                    }
                    return deferred.promise;
                }}})
            .when('/edit/:id', {templateUrl: 'views/edit.html', controller: "EditRestaurantCtrl",
                                resolve: {loggedIn: function ($location, $q, $cookieStore) {
                                    var deferred = $q.defer();
                                    var user = $cookieStore.get('user');
                                    if (user !== undefined) {
                                        deferred.resolve();
                                    } else {
                                        deferred.reject();
                                        $location.url('/login');
                                    }
                                    return deferred.promise;
                                }}})
            .when('/view/:id', {templateUrl: 'views/view.html', controller: "ViewRestaurantCtrl"})
            .when('/newchain', {templateUrl: 'views/newchain.html', controller: "AddChainCtrl",
                resolve: {loggedIn: function ($location, $q, $cookieStore) {
                    var deferred = $q.defer();
                    var user = $cookieStore.get('user');
                    if (user !== undefined) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                        $location.url('/login');
                    }
                    return deferred.promise;
                }}})
            .when('/editchain/:id', {templateUrl: 'views/editchain.html', controller: "EditChainCtrl",
                resolve: {loggedIn: function ($location, $q, $cookieStore) {
                    var deferred = $q.defer();
                    var user = $cookieStore.get('user');
                    if (user !== undefined) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                        $location.url('/login');
                    }
                    return deferred.promise;
                }}})
            .when('/viewchain/:id', {templateUrl: 'views/viewchain.html', controller: "ViewChainCtrl"})
            .when('/login', {templateUrl: 'views/login.html', controller: "LoginCtrl"})
            .when('/restaurants', {templateUrl: 'views/restaurants.html', controller: "RestaurantsCtrl",
                resolve: {loggedIn: function ($location, $q, $cookieStore) {
                    var deferred = $q.defer();
                    var user = $cookieStore.get('user');
                    if (user !== undefined) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                        $location.url('/login');
                    }
                    return deferred.promise;
                }}})
            .when('/chains', {templateUrl: 'views/chains.html', controller: "ChainsCtrl",
                resolve: {loggedIn: function ($location, $q, $cookieStore) {
                    var deferred = $q.defer();
                    var user = $cookieStore.get('user');
                    if (user !== undefined) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                        $location.url('/login');
                    }
                    return deferred.promise;
                }}})
            .otherwise({redirectTo: '/start'});

    },
    ]);
