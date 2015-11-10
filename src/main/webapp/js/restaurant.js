'use strict';

var marker=null;
var mapOfRestaurants=null;
var markers=[];
var xAuthTokenHeaderName = 'x-auth-token';

var app = angular.module("restaurants", ["ngResource", "ngCookies", "ui.bootstrap"]).run(function($rootScope, $http, $location, $cookieStore, LoginService) {

    $rootScope.enforceAdminControls = false;

    /* Reset error when a new view is loaded */
    $rootScope.$on('$viewContentLoaded', function() {
        delete $rootScope.error;
    });

    $rootScope.hasRole = function(role) {

        if ($rootScope.user === undefined) {
            return false;
        }

        if ($rootScope.user.roles[role] === undefined) {
            return false;
        }

        return $rootScope.user.roles[role];
    };



    $rootScope.logout = function() {
        delete $rootScope.user;
        delete $http.defaults.headers.common[xAuthTokenHeaderName];
        $cookieStore.remove('user');
        $location.path("/login");
    };

    // Todo: monitor if the token is revoked / expired
    /* Try getting valid user from cookie or go to login page */
    var originalPath = $location.path();
    //$location.path("/login");
    var user = $cookieStore.get('user');
    if (user !== undefined) {
        $rootScope.user = user;
        $http.defaults.headers.common[xAuthTokenHeaderName] = user.token;

        $location.path(originalPath);
    }

});

app.factory("Restaurant", function ($resource) {
    return $resource('/api/restaurants/:id', {id: "@id"}, {
        update: {method:'PUT'},
    });
});

app.factory("Photo", function ($resource) {
    return $resource('/api/photo/restaurant/:id', {id: "@id"}, {
        query: {method:'GET', isArray:true},
    });
});

app.factory("Label", function ($resource) {
    return $resource('/api/restaurant/:restaurantId/label/:labelId', {restaurantId:"@restaurantId", labelId: "@labelid"}, {
        update: {method:'PUT'},
    });
});

app.factory("Review", function ($resource) {
    return $resource('/api/restaurant/:restaurantId/review/:reviewId', {restaurantId:"@restaurantId", reviewId: "@reviewId"}, {
        update: {method:'PUT'},
    });
});

app.factory("LoginService", function ($resource) {
    return $resource(':action', {},
        {
            authenticate: {
                method: 'POST',
                params: {'action' : 'authenticate'},
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
            }
        }
    );
});

app.controller("EditRestaurantCtrl", function ($scope, $http, $routeParams, Restaurant, Photo, Label, Review) {

    function init() {
        var itemRestaurant = Restaurant.get({"id": $routeParams.id}, function(){
            var itemLatitude = itemRestaurant.latitude;
            var itemLongitude = itemRestaurant.longitude;
            var coords = new google.maps.LatLng(itemLatitude, itemLongitude);
            var mapOptions = {
                zoom: 15,
                center: coords,
                mapTypeControl: true,
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.SMALL
                },
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(
                document.getElementById("mapContainer"), mapOptions
            );
            marker = new google.maps.Marker({
                position: coords,
                map: map,
                draggable: true,
                title: itemRestaurant.name
            });
            var kitchenrating = $scope.restaurant.kitchenrating;
            var kitchen_star_width = kitchenrating*16 + Math.ceil(kitchenrating);
            $('#rating_votes').width(kitchen_star_width);
            var interiorrating = $scope.restaurant.interiorrating;
            var interior_star_width = interiorrating*16 + Math.ceil(interiorrating);
            $('#interior_votes').width(interior_star_width);
            var servicerating = $scope.restaurant.servicerating;
            var service_star_width = servicerating*16 + Math.ceil(servicerating);
            $('#service_votes').width(service_star_width);
        });
        $scope.restaurant = itemRestaurant;

        $scope.labels = Label.query({"restaurantId": $routeParams.id});

        $scope.review = Review.get({"restaurantId": $routeParams.id});

        // Set of Photos
        $scope.slides = Photo.query({"id": $routeParams.id});



    }

    $scope.uploadPhoto = function () {
        return $http({
            method: 'POST',
            url: '/api/photo/upload',
            headers: {
                'Content-Type': undefined
            },
            data: {
                file: file.files[0],
                idRestaurant: $scope.restaurant.id
            },
            transformRequest: function(data) {
                var fd = new FormData();
                angular.forEach(data, function(value, key) {
                    fd.append(key, value);
                });
                return fd;
            }
        });
    };

    $scope.deleteLabel = function(label) {
        $scope.labels.splice($scope.labels.indexOf(label), 1);
    }

    $scope.addLabel = function() {
        $scope.labels.push({
            id: null,
            name: "",
            restaurant: Restaurant
        });
    }

    $scope.saveRestaurant = function () {
        var restaurant = new Restaurant($scope.restaurant);
        restaurant.latitude = marker.getPosition().lat();
        restaurant.longitude = marker.getPosition().lng();
        restaurant.$update({}, function(){
            var savedLabels = Label.query({"restaurantId": restaurant.id}, function(){
                for (var indLabel in savedLabels) {
                    if(isNaN(indLabel)){
                        continue;
                    };
                    var foundLabel = false;
                    for (var i in $scope.labels) {
                        if(isNaN(i)){
                            continue;
                        };
                        if(savedLabels[indLabel].id==$scope.labels[i].id) {
                            foundLabel = true;
                            break;
                        };
                    };
                    if(!foundLabel) {
                        Label.delete({"restaurantId":restaurant.id, "labelId":savedLabels[indLabel].id});
                    };
                };
                for (var i in $scope.labels) {
                    if(isNaN(i)){
                        continue;
                    };
                    var label = new Label($scope.labels[i]);
                    if($scope.labels[i].id==null) {
                        label.$save({"restaurantId":restaurant.id});
                    } else {
                        label.$update({"restaurantId":restaurant.id, "labelId":$scope.labels[i].id});
                    };
                };
            });
            var review = new Review($scope.review);
            if($scope.review.id==null|undefined) {
                review.$save({"restaurantId":restaurant.id});
            } else {
                review.$update({"restaurantId":restaurant.id, "reviewId":$scope.review.id});
            };
        });
        document.location="#/list";
    };

    init();

});

app.controller("AddRestaurantCtrl", function ($scope, $http, Restaurant, Label, Review) {

    function init() {
        function errorNavigator(err) {
            alert('err');
            if(err.code == 1) {
                alert("Error: Access is denied!");
            }

            else if( err.code == 2) {
                alert("Error: Position is unavailable!");
            }
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var itemLatitude = position.coords.latitude;
                var itemLongitude = position.coords.longitude;
                var coords = new google.maps.LatLng(itemLatitude, itemLongitude);
                var mapOptions = {
                    zoom: 15,
                    center: coords,
                    mapTypeControl: true,
                    navigationControlOptions: {
                        style: google.maps.NavigationControlStyle.SMALL
                    },
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var map = new google.maps.Map(
                    document.getElementById("mapContainer"), mapOptions
                );
                marker = new google.maps.Marker({
                    position: coords,
                    map: map,
                    draggable: true,
                    title: "Вы здесь"
                });
            }, errorNavigator)
        } else {
            alert("Geolocation API не поддерживается в вашем браузере");
        }
        ;
        $scope.labels = [];
        $scope.review = {
            id: null,
            content: "",
            restaurant: null
        };
    }

    $scope.deleteLabel = function(label) {
        $scope.labels.splice($scope.labels.indexOf(label), 1);
    }

    $scope.addLabel = function() {
        $scope.labels.push({
            id: null,
            name: "",
            restaurant: Restaurant
        });
    }

    $scope.saveRestaurant = function () {
        var restaurant = new Restaurant($scope.restaurant);
        restaurant.latitude = marker.getPosition().lat();
        restaurant.longitude = marker.getPosition().lng();
        restaurant.$save({}, function(){
            for (var i in $scope.labels) {
                var label = new Label($scope.labels[i]);
                label.$save({"restaurantId":restaurant.id});
            };
            var review = new Review($scope.review);
            review.$save({"restaurantId":restaurant.id});
        });


        document.location="#/list";
    };

    init();

});

app.controller("RestaurantsCtrl", function ($scope, Restaurant) {

    function init() {
        $scope.getRestaurants();
    }

    $scope.getRestaurants = function () {

        function errorNavigator(err) {
            alert('err');
            if(err.code == 1) {
                alert("Error: Access is denied!");
            }

            else if( err.code == 2) {
                alert("Error: Position is unavailable!");
            }
        }


        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;

                var coords = new google.maps.LatLng(latitude, longitude);
                var mapOptions = {
                    zoom: 15,
                    center: coords,
                    mapTypeControl: true,
                    navigationControlOptions: {
                        style: google.maps.NavigationControlStyle.SMALL
                    },
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                mapOfRestaurants = new google.maps.Map(
                    document.getElementById("mapContainer"), mapOptions
                );

                var i;
                for (i in markers) {
                    markers[i].setMap(null);
                }
                markers = [];

                var re;
                var listOfRestaurants = Restaurant.query(function(){
                    for (re in listOfRestaurants) {
                        var latlng = new google.maps.LatLng(listOfRestaurants[re].latitude, listOfRestaurants[re].longitude);
                        var newMarker = new google.maps.Marker({
                            position: latlng,
                            map: mapOfRestaurants,
                            title: listOfRestaurants[re].name
                        });
                        var markerUrl = 'index.html#/edit/'+listOfRestaurants[re].id;
                        google.maps.event.addListener(newMarker, 'click', function(markerUrl) {
                            return function() {document.location = markerUrl;}
                        }(markerUrl));
                        markers.push(newMarker);
                    }
                });
                $scope.restaurants = listOfRestaurants;
            }, errorNavigator)
        } else {
            alert("Geolocation API не поддерживается в вашем браузере");
        }
        ;



    };

    $scope.deleteRestaurant = function (id) {
        Restaurant.delete({"id":id});
        $scope.restaurants = Restaurant.query();
    };

    $scope.createRestaurant = function () {
        var restaurant = new Restaurant($scope.restaurant);
        restaurant.latitude = marker.getPosition().lat();
        restaurant.longitude = marker.getPosition().lng();
        restaurant.$save({});
    };

    init();

});

app.controller("LoginCtrl", function ($scope, $rootScope, $location, $http, $cookieStore, LoginService) {

    $scope.login = function() {
        LoginService.authenticate($.param({username: $scope.username, password: $scope.password}), function(user) {
            $rootScope.user = user;
            $http.defaults.headers.common[ xAuthTokenHeaderName ] = user.token;
            $cookieStore.put('user', user);
            $location.path("/");
        });
        if(!$rootScope.user){
            $scope.error = true;
        }
    };

});








