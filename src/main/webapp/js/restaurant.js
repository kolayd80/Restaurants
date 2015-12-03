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

/*app.factory("Rating", function ($resource) {
    return $resource('/api/restaurant/:restaurantId/rating/:ratingId', {restaurantId:"@restaurantId", ratingId: "@ratingId"}, {
        update: {method:'PUT'},
    });
});*/

app.factory("Chain", function ($resource) {
    return $resource('/api/chain/:id', {id: "@id"}, {
        update: {method:'PUT'},
    });
});

app.factory("CLabel", function ($resource) {
    return $resource('/api/chain/:chainId/label/:labelId', {chainId:"@chainId", labelId: "@labelid"}, {
        update: {method:'PUT'},
    });
});

app.factory("CReview", function ($resource) {
    return $resource('/api/chain/:chainId/review/:reviewId', {chainId:"@chainId", reviewId: "@reviewId"}, {
        update: {method:'PUT'},
    });
});

/*app.factory("CRating", function ($resource) {
    return $resource('/api/chain/:chainId/rating/:ratingId', {chainId:"@chainId", ratingId: "@ratingId"}, {
        update: {method:'PUT'},
    });
});*/

app.factory("CPhoto", function ($resource) {
    return $resource('/api/photo/chain/:id', {id: "@id"}, {
        query: {method:'GET', isArray:true},
    });
});
/*
app.factory("CommonRating", function ($resource) {
    return $resource('/api/rating/:id', {id: "@id"}, {
        query: {params: {
            page: "@page",
            per_page: "@perpage",
            sortby: "@sortby"
        }},
        update: {method:'PUT'},
    });
});*/

app.factory("CommonReview", function ($resource) {
    return $resource('/api/review/:id', {id: "@id"}, {
        query: {params: {
            page: "@page",
            per_page: "@perpage",
            sortby: "@sortby"
        }},
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

app.controller("EditRestaurantCtrl", function ($scope, $http, $routeParams, Restaurant, Photo, Label, Review, Chain) {

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



        });
        $scope.restaurant = itemRestaurant;

        $scope.labels = Label.query({"restaurantId": $routeParams.id});

        $scope.review = Review.get({"restaurantId": $routeParams.id});

        var kitchenrating = $scope.review.kitchen;
        var kitchen_star_width = kitchenrating*16 + Math.ceil(kitchenrating);
        $('#rating_votes').width(kitchen_star_width);
        var interiorrating = $scope.review.interior;
        var interior_star_width = interiorrating*16 + Math.ceil(interiorrating);
        $('#interior_votes').width(interior_star_width);
        var servicerating = $scope.review.service;
        var service_star_width = servicerating*16 + Math.ceil(servicerating);
        $('#service_votes').width(service_star_width);

        // Set of Photos
        $scope.slides = Photo.query({"id": $routeParams.id});

        $scope.itemsList = Chain.query();


    }

    $scope.forceClearChain = function () {
        $scope.restaurant.chain = null;
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

    $scope.uploadPreviewImage = function () {
        return $http({
            method: 'POST',
            url: '/api/preview/upload',
            headers: {
                'Content-Type': undefined
            },
            data: {
                file: fileP.files[0],
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

            /*var rating = new Rating($scope.rating);
            if($scope.rating.id==null|undefined) {
                rating.$save({"restaurantId":restaurant.id});
            } else {
                rating.$update({"restaurantId":restaurant.id, "ratingId":$scope.rating.id});
            };*/
        });
        document.location="#/list";
    };

    init();

});

app.controller("AddRestaurantCtrl", function ($scope, $http, Restaurant, Label, Review, Chain) {

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
            }, function (err){
                var itemLatitude = 46.4879;
                var itemLongitude = 30.7409;

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
                    title: ""
                });
            });
        } else {
            alert("Geolocation API не поддерживается в вашем браузере");
        }
        ;
        $scope.labels = [];
        $scope.review = {
            id: null,
            content: "",
            kitchen: 0,
            interior: 0,
            service: 0,
            restaurant: null
        };

        $scope.itemsList = Chain.query();

    }

    $scope.forceClearChain = function () {
        $scope.restaurant.chain = null;
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

            /*var rating = new Rating($scope.rating);
            rating.$save({"restaurantId":restaurant.id});*/
        });


        document.location="#/list";
    };

    init();

});

app.controller("RestaurantsCtrl", function ($scope, Restaurant, CommonReview) {

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
                var listOfRestaurants = Restaurant.query(function () {
                    for (re in listOfRestaurants) {
                        var latlng = new google.maps.LatLng(listOfRestaurants[re].latitude, listOfRestaurants[re].longitude);
                        var newMarker = new google.maps.Marker({
                            position: latlng,
                            map: mapOfRestaurants,
                            title: listOfRestaurants[re].name
                        });
                        var markerUrl = 'index.html#/edit/' + listOfRestaurants[re].id;
                        google.maps.event.addListener(newMarker, 'click', function (markerUrl) {
                            return function () {
                                document.location = markerUrl;
                            }
                        }(markerUrl));
                        markers.push(newMarker);
                    }
                });
                $scope.restaurants = listOfRestaurants;
                $scope.reviews = CommonReview.query();
            }, function (err){
                var latitude = 46.4879;
                var longitude = 30.7409;

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
                var listOfRestaurants = Restaurant.query(function () {
                    for (re in listOfRestaurants) {
                        var latlng = new google.maps.LatLng(listOfRestaurants[re].latitude, listOfRestaurants[re].longitude);
                        var newMarker = new google.maps.Marker({
                            position: latlng,
                            map: mapOfRestaurants,
                            title: listOfRestaurants[re].name
                        });
                        var markerUrl = 'index.html#/edit/' + listOfRestaurants[re].id;
                        google.maps.event.addListener(newMarker, 'click', function (markerUrl) {
                            return function () {
                                document.location = markerUrl;
                            }
                        }(markerUrl));
                        markers.push(newMarker);
                    }
                });
                $scope.restaurants = listOfRestaurants;
                $scope.reviews = CommonReview.query();
            });


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

app.controller("EditChainCtrl", function ($scope, $http, $routeParams, Chain, CLabel, CReview, CPhoto) {

    function init() {
        $scope.chain = Chain.get({"id": $routeParams.id});

        $scope.labels = CLabel.query({"chainId": $routeParams.id});

        $scope.review = CReview.get({"chainId": $routeParams.id});

        $scope.slides = CPhoto.query({"id": $routeParams.id});

    }

    $scope.uploadPhoto = function () {
        return $http({
            method: 'POST',
            url: '/api/photo/chain/upload',
            headers: {
                'Content-Type': undefined
            },
            data: {
                file: file.files[0],
                idChain: $scope.chain.id
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

    $scope.uploadPreviewImage = function () {
        return $http({
            method: 'POST',
            url: '/api/chain/preview/upload',
            headers: {
                'Content-Type': undefined
            },
            data: {
                file: fileP.files[0],
                idChain: $scope.chain.id
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
            chain: Chain
        });
    }

    $scope.saveChain = function () {
        var chain = new Chain($scope.chain);
        chain.$update({}, function(){
            var savedLabels = CLabel.query({"chainId": chain.id}, function(){
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
                        Label.delete({"chainId":chain.id, "labelId":savedLabels[indLabel].id});
                    };
                };
                for (var i in $scope.labels) {
                    if(isNaN(i)){
                        continue;
                    };
                    var label = new CLabel($scope.labels[i]);
                    if($scope.labels[i].id==null) {
                        label.$save({"chainId":chain.id});
                    } else {
                        label.$update({"chainId":chain.id, "labelId":$scope.labels[i].id});
                    };
                };
            });

            var review = new CReview($scope.review);
            if($scope.review.id==null|undefined) {
                review.$save({"chainId":chain.id});
            } else {
                review.$update({"chainId":chain.id, "reviewId":$scope.review.id});
            };


        });
        document.location="#/list";
    };

    init();

});

app.controller("AddChainCtrl", function ($scope, $http, Chain, CLabel, CReview) {

    function init() {

        $scope.labels = [];
        $scope.review = {
            id: null,
            content: "",
            chain: null
        };

    }

    $scope.deleteLabel = function(Clabel) {
        $scope.labels.splice($scope.labels.indexOf(label), 1);
    }

    $scope.addLabel = function() {
        $scope.labels.push({
            id: null,
            name: "",
            chain: Chain
        });
    }

    $scope.saveChain = function () {
        var chain = new Chain($scope.chain);
        chain.$save({}, function(){
            for (var i in $scope.labels) {
                var label = new CLabel($scope.labels[i]);
                label.$save({"chainId":chain.id});
            };

            var review = new CReview($scope.review);
            review.$save({"chainId":chain.id});

            if (fileP.files.length > 0) {
                $http({
                    method: 'POST',
                    url: '/api/chain/preview/upload',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {
                        file: fileP.files[0],
                        idChain: chain.id
                    },
                    transformRequest: function (data) {
                        var fd = new FormData();
                        angular.forEach(data, function (value, key) {
                            fd.append(key, value);
                        });
                        return fd;
                    }
                })
            }
            document.location="#/list";
        });



    };

    $scope.uploadPreviewImage = function () {
        var chain = new Chain($scope.chain);
        chain.$save({}, function(){
            $http({
                method: 'POST',
                url: '/api/chain/preview/upload',
                headers: {
                    'Content-Type': undefined
                },
                data: {
                    file: fileP.files[0],
                    idChain: chain.id
                },
                transformRequest: function(data) {
                    var fd = new FormData();
                    angular.forEach(data, function(value, key) {
                        fd.append(key, value);
                    });
                    return fd;
                }
            })}
        );
    };

    init();

});

app.controller("StartCtrl", function ($scope, Restaurant, CommonReview) {

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
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: false
                };
                mapOfRestaurants = new google.maps.Map(
                    document.getElementById("mapContainerWide"), mapOptions
                );
                var i;
                for (i in markers) {
                    markers[i].setMap(null);
                }
                markers = [];

                var re;
                var listOfRestaurants = Restaurant.query(function () {
                    for (re in listOfRestaurants) {
                        var latlng = new google.maps.LatLng(listOfRestaurants[re].latitude, listOfRestaurants[re].longitude);
                        var newMarker = new google.maps.Marker({
                            position: latlng,
                            map: mapOfRestaurants,
                            title: listOfRestaurants[re].name
                        });
                        var markerUrl = 'index.html#/edit/' + listOfRestaurants[re].id;
                        google.maps.event.addListener(newMarker, 'click', function (markerUrl) {
                            return function () {
                                document.location = markerUrl;
                            }
                        }(markerUrl));
                        markers.push(newMarker);
                    }
                });
                $scope.restaurants = listOfRestaurants;

                var reviewsTop = CommonReview.query({"page": 0, "per_page": 10, "sortby": 'total'}, function () {
                    $scope.reviews = reviewsTop.content;
                });

            }, function (err){
                var latitude = 46.4879;
                var longitude = 30.7409;

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
                    document.getElementById("mapContainerWide"), mapOptions
                );
                var i;
                for (i in markers) {
                    markers[i].setMap(null);
                }
                markers = [];

                var re;
                var listOfRestaurants = Restaurant.query(function () {
                    for (re in listOfRestaurants) {
                        var latlng = new google.maps.LatLng(listOfRestaurants[re].latitude, listOfRestaurants[re].longitude);
                        var newMarker = new google.maps.Marker({
                            position: latlng,
                            map: mapOfRestaurants,
                            title: listOfRestaurants[re].name
                        });
                        var markerUrl = 'index.html#/edit/' + listOfRestaurants[re].id;
                        google.maps.event.addListener(newMarker, 'click', function (markerUrl) {
                            return function () {
                                document.location = markerUrl;
                            }
                        }(markerUrl));
                        markers.push(newMarker);
                    }
                });
                $scope.restaurants = listOfRestaurants;
                var reviewsTop = CommonReview.query({"page": 0, "per_page": 10, "sortby": 'total'}, function () {
                    $scope.reviews = reviewsTop.content;
                });
            });


        } else {
            alert("Geolocation API не поддерживается в вашем браузере");
        }
        ;
    };



    init();

});

app.controller("ListCtrl", function ($scope, Restaurant, Label, CLabel, CommonReview) {

    function init() {
        $scope.orderBy = 'total';
        $scope.pageNum = 0;
        getItems();
    }

    function getItems() {

            var reviews = CommonReview.query({"page": $scope.pageNum, "per_page": 10, "sortby": $scope.orderBy}, function () {
                var items = reviews.content;
                for(var i in items) {
                    var item = items[i];
                    if ($scope.orderBy == 'createdDate') {
                        var formattedDate = item.createdDate[0] + '-';
                        for (var j in item.createdDate) {
                            if (j > 0) {
                                var str = '00' + item.createdDate[j];
                                str = str.substr(str.length - 2);
                                formattedDate = formattedDate + str;
                                if (j == 1) {
                                    formattedDate = formattedDate + '-';
                                }
                                if (j == 2) {
                                    formattedDate = formattedDate + ' ';
                                }
                                if (j == 3) {
                                    formattedDate = formattedDate + ':';
                                }
                                if (j == 4) {
                                    formattedDate = formattedDate + ':';
                                }
                                if (j == 5) {
                                    break;
                                }
                            }
                        }
                        item.sortcol = formattedDate;
                    } else {
                        item.sortcol = item[$scope.orderBy];
                    }
                    if(item.reviewType == 'RESTAURANT') {
                        item.labels = Label.query({"restaurantId": item.restaurant.id});
                    } else {
                        item.labels = CLabel.query({"chainId": item.chain.id});
                    };
                };
                $scope.items = items;
                $scope.totalPages = reviews.totalPages;
                var pagesArray = [];
                var i;
                var firstPageNum;
                if ($scope.pageNum<=2) {
                    firstPageNum = 0;
                } else {
                    firstPageNum = $scope.pageNum - 2;
                };
                for(i=0; i<Math.min(5, reviews.totalPages); i++) {
                    pagesArray[i] = firstPageNum + i;
                };
                $scope.pagesArray = pagesArray;
            });

    }

    $scope.sortBy = function(order) {
        $scope.orderBy = order;
        $scope.pageNum = 0;
        getItems();
    }

    $scope.showPage = function(pageToShow) {
        $scope.pageNum = pageToShow;
        getItems();
    }

    init();

});






