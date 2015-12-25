'use strict';

var marker=null;
var mapOfRestaurants=null;
var markers=[];
var xAuthTokenHeaderName = 'x-auth-token';

var app = angular.module("restaurants", ["ngResource", "ngCookies", "ui.bootstrap"]).run(function($rootScope, $http, $location, $cookieStore, LoginService) {

    $rootScope.enforceAdminControls = false;
    $rootScope.editablePage = false;

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

    $rootScope.restaurantsList = function() {
        $location.path("/restaurants");
    };

    $rootScope.chainsList = function() {
        $location.path("/chains");
    };

    $rootScope.edit = function() {
        var originalPath = $location.path();
        var newPath = "#" + originalPath.replace("/view", "/edit");
        document.location = newPath;
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

    var onlyLoggedIn = function ($location, $q) {
        var deferred = $q.defer();
        if (user !== undefined) {
            deferred.resolve();
        } else {
            deferred.reject();
            $location.url('/login');
        }
        return deferred.promise;
    };

});

app.factory("Restaurant", function ($resource) {
    return $resource('/api/restaurants/:id', {id: "@id"}, {
        update: {method:'PUT'},
    });
});

app.factory("RestaurantsOfChain", function ($resource) {
    return $resource('/api/restaurants/chain/:chainId', {chainId: "@chainId"}, {
        query: {method:'GET', isArray:true},
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
    return $resource('/api/review/search/:id', {id: "@id"}, {
        query: {params: {
            search: "@search",
            page: "@page",
            per_page: "@perpage",
            sortby: "@sortby"
        }},
        update: {method:'PUT'},
    });
});

app.factory("Country", function ($resource) {
    return $resource('/api/location/country/:id', {id: "@id"}, {
        update: {method:'PUT'},
    });
});

app.factory("Locality", function ($resource) {
    return $resource('/api/location/country/:countryId/locality/:localityId', {countryId:"@countryId", localityId: "@localityId"}, {
        update: {method:'PUT'},
    });
});

app.factory("Sublocality", function ($resource) {
    return $resource('/api/location/locality/:localityId/sublocality/:sublocalityId', {localityId:"@localityId", sublocalityId: "@sublocalityId"}, {
        update: {method:'PUT'},
    });
});

app.factory("Street", function ($resource) {
    return $resource('/api/location/sublocality/:sublocalityId/street/:streetId', {sublocalityId:"@sublocalityId", streetId: "@streetId"}, {
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

app.controller("EditRestaurantCtrl", function ($scope, $http, $rootScope, $routeParams, $sce, $timeout, Restaurant, Photo, Label, Review, Chain) {

    var map;

    function fb(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5";
        fjs.parentNode.insertBefore(js, fjs);


    };

    function init() {

        $rootScope.editablePage = false;

        fb(document, 'script', 'facebook-jssdk');


        var itemRestaurant = Restaurant.get({"id": $routeParams.id}, function () {
            var itemLatitude = itemRestaurant.latitude;
            var itemLongitude = itemRestaurant.longitude;

            if (itemLatitude == null && itemLongitude == null) {
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
                        map = new google.maps.Map(
                            document.getElementById("mapContainer"), mapOptions
                        );
                        marker = new google.maps.Marker({
                            position: coords,
                            map: map,
                            draggable: true,
                            title: "Вы здесь"
                        });
                    }, function (err) {
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
                        map = new google.maps.Map(
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
            } else {
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
                map = new google.maps.Map(
                    document.getElementById("mapContainer"), mapOptions
                );
                marker = new google.maps.Marker({
                    position: coords,
                    map: map,
                    draggable: true,
                    title: itemRestaurant.name
                });
            }


        });
        $scope.restaurant = itemRestaurant;

        $scope.labels = Label.query({"restaurantId": $routeParams.id});

        var itemReview = Review.get({"restaurantId": $routeParams.id}, function () {
            var kitchenrating = itemReview.kitchen;
            var kitchen_star_width = kitchenrating * 16 + Math.ceil(kitchenrating);
            $('#kitchen_votes').width(kitchen_star_width);
            var interiorrating = itemReview.interior;
            var interior_star_width = interiorrating * 16 + Math.ceil(interiorrating);
            $('#interior_votes').width(interior_star_width);
            var servicerating = itemReview.service;
            var service_star_width = servicerating * 16 + Math.ceil(servicerating);
            $('#service_votes').width(service_star_width);

            $scope.kitchenRating = kitchenrating;
            $scope.interiorRating = interiorrating;
            $scope.serviceRating = servicerating;

            $scope.kitchenNewRating = kitchenrating;
            $scope.interiorNewRating = interiorrating;
            $scope.serviceNewRating = servicerating;

            $scope.reviewHtml = $sce.trustAsHtml(itemReview.content);

            if (itemReview.createdDate != undefined) {
                var formattedDate = itemReview.createdDate[0] + '-';
                for (var j in itemReview.createdDate) {
                    if (j > 0) {
                        var str = '00' + itemReview.createdDate[j];
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

                $scope.reviewDate = "Posted: " + formattedDate;
            }


            $timeout(function () {
                FB.XFBML.parse();
            }, 1000);


        });

        $scope.review = itemReview;


        // Set of Photos
        $scope.slides = Photo.query({"id": $routeParams.id});

        $scope.itemsList = Chain.query();


    }

    $('#kitchen_rating').hover(function () {
            $('#kitchen_votes, #kitchen_hover').toggle();
        },
        function () {
            $('#kitchen_votes, #kitchen_hover').toggle();
        });

    var margin_kitchen = $("#kitchen_rating").offset();
    $("#kitchen_rating").mousemove(function(e){
        var widht_votes = e.pageX - margin_kitchen.left;
        $scope.kitchenNewRating = Math.ceil(widht_votes/17);
        $('#kitchen_hover').width($scope.kitchenNewRating*17);
    });

    $('#kitchen_rating').click(function(){
        $scope.kitchenRating = $scope.kitchenNewRating;
        var kitchen_star_width = $scope.kitchenRating * 16 + Math.ceil($scope.kitchenRating);
        $('#kitchen_votes').width(kitchen_star_width);
    });

    $('#interior_rating').hover(function () {
            $('#interior_votes, #interior_hover').toggle();
        },
        function () {
            $('#interior_votes, #interior_hover').toggle();
        });

    var margin_interior = $("#interior_rating").offset();
    $("#interior_rating").mousemove(function(e){
        var widht_votes = e.pageX - margin_interior.left;
        $scope.interiorNewRating = Math.ceil(widht_votes/17);
        $('#interior_hover').width($scope.interiorNewRating*17);
    });

    $('#interior_rating').click(function(){
        $scope.interiorRating = $scope.interiorNewRating;
        var interior_star_width = $scope.interiorRating * 16 + Math.ceil($scope.interiorRating);
        $('#interior_votes').width(interior_star_width);
    });

    $('#service_rating').hover(function () {
            $('#service_votes, #service_hover').toggle();
        },
        function () {
            $('#service_votes, #service_hover').toggle();
        });

    var margin_service = $("#service_rating").offset();
    $("#service_rating").mousemove(function(e){
        var widht_votes = e.pageX - margin_service.left;
        $scope.serviceNewRating = Math.ceil(widht_votes/17);
        $('#service_hover').width($scope.serviceNewRating*17);
    });

    $('#service_rating').click(function(){
        $scope.serviceRating = $scope.serviceNewRating;
        var service_star_width = $scope.serviceRating * 16 + Math.ceil($scope.serviceRating);
        $('#service_votes').width(service_star_width);
    });

    $scope.newCenterMap = function (details) {
        map.setCenter(details.geometry.location);
        marker.setPosition(details.geometry.location);
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
        }).success(function() {
            $scope.slides = Photo.query({"id": $routeParams.id});
        });
    };

    $scope.uploadPreviewImage = function () {
        $http({
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
        }).success(function() {
            var tempRestaurant = Restaurant.get({"id": $routeParams.id}, function() {
                document.getElementById('resto_preview_img').setAttribute('src', tempRestaurant.previewImage);
                $scope.restaurant.previewImage = tempRestaurant.previewImage;
            });
        });


    };

    $scope.deletePreviewImage = function () {
        $scope.restaurant.previewImage = "";
        document.getElementById('resto_preview_img').removeAttribute('src');
    };

    $scope.deletePhoto = function () {
        if ($scope.slides.length > 0) {
            for (var slideId in $scope.slides) {
                if ($scope.slides[slideId].active) {
                    $http({
                        method: 'DELETE',
                        url: '/api/photo/' + $scope.slides[slideId].id
                    }).success(function() {
                        $scope.slides = Photo.query({"id": $routeParams.id});
                    });
                    break;
                }
            }
        }
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
            review.kitchen = $scope.kitchenRating;
            review.interior = $scope.interiorRating;
            review.service = $scope.serviceRating;
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
            document.location="#/list";
        });

    };

    $scope.addEditor = function(tag) {
        var obj = document.getElementById('field_review');
        if(document.selection) obj.value += "<" + tag + "></" + tag + ">";
        else if(typeof(obj.selectionStart) == "number")
        {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            obj.select();
            if(start != end)
            {
                obj.value = value.substr(0,start) + "<" + tag + ">" + value.substr(start,end - start) + "</" + tag + ">" + value.substr(end);
                obj.setSelectionRange(start,end + tag.length * 2 + 5);
                $scope.review.content = obj.value;
            }
            else
            {
                obj.value = value.substr(0,start) + "<" + tag + "></" + tag + ">" + value.substr(start);
                obj.setSelectionRange(start + tag.length + 2,start + tag.length + 2);
            }
        }
    };

    $scope.createLabel = function() {
        var obj = document.getElementById('field_review');
        if(!document.selection && typeof(obj.selectionStart) == "number") {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            if(start != end) {
                var labelValue = value.substr(start,end - start);
                $scope.labels.push({
                    id: null,
                    name: labelValue,
                    restaurant: Restaurant
                });
            }
        }
    };

    init();

});

app.controller("ViewRestaurantCtrl", function ($scope, $http, $rootScope, $routeParams, $sce, $timeout, Restaurant, Photo, Label, Review, Chain) {


    function fb(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5";
        fjs.parentNode.insertBefore(js, fjs);



    };

    function init() {

        $rootScope.editablePage = true;

        fb(document, 'script', 'facebook-jssdk');




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
                draggable: false,
                icon: 'https://maps.google.com/mapfiles/kml/pal2/icon32.png',
                title: itemRestaurant.name
            });



        });
        $scope.restaurant = itemRestaurant;

        $scope.labels = Label.query({"restaurantId": $routeParams.id});

        var itemReview = Review.get({"restaurantId": $routeParams.id}, function(){
            var kitchenrating = itemReview.kitchen;
            var kitchen_star_width = kitchenrating*16 + Math.ceil(kitchenrating);
            $('#kitchen_votes').width(kitchen_star_width);
            var interiorrating = itemReview.interior;
            var interior_star_width = interiorrating*16 + Math.ceil(interiorrating);
            $('#interior_votes').width(interior_star_width);
            var servicerating = itemReview.service;
            var service_star_width = servicerating*16 + Math.ceil(servicerating);
            $('#service_votes').width(service_star_width);

            $scope.reviewHtml = $sce.trustAsHtml(itemReview.content);

            var formattedDate = itemReview.createdDate[0] + '-';
            for (var j in itemReview.createdDate) {
                if (j > 0) {
                    var str = '00' + itemReview.createdDate[j];
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

            $scope.reviewDate = "Posted: " + formattedDate;


            $timeout(function(){
                FB.XFBML.parse();
            }, 1000);



        });

        $scope.review = itemReview;



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
        }).success(function() {
            $scope.slides = Photo.query({"id": $routeParams.id});
        });
    };

    $scope.uploadPreviewImage = function () {
        $http({
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
        }).success(function() {
            var tempRestaurant = Restaurant.get({"id": $routeParams.id}, function() {
                document.getElementById('resto_preview_img').setAttribute('src', tempRestaurant.previewImage);
                $scope.restaurant.previewImage = tempRestaurant.previewImage;
            });
        });


    };

    $scope.deletePreviewImage = function () {
        $scope.restaurant.previewImage = "";
        document.getElementById('resto_preview_img').removeAttribute('src');
    };

    $scope.deletePhoto = function () {
        if ($scope.slides.length > 0) {
            for (var slideId in $scope.slides) {
                if ($scope.slides[slideId].active) {
                    $http({
                        method: 'DELETE',
                        url: '/api/photo/' + $scope.slides[slideId].id
                    }).success(function() {
                        $scope.slides = Photo.query({"id": $routeParams.id});
                    });
                    break;
                }
            }
        }
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
            document.location="#/list";
        });

    };

    $scope.addEditor = function(tag) {
        var obj = document.getElementById('field_review');
        if(document.selection) obj.value += "<" + tag + "></" + tag + ">";
        else if(typeof(obj.selectionStart) == "number")
        {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            obj.select();
            if(start != end)
            {
                obj.value = value.substr(0,start) + "<" + tag + ">" + value.substr(start,end - start) + "</" + tag + ">" + value.substr(end);
                obj.setSelectionRange(start,end + tag.length * 2 + 5);
                $scope.review.content = obj.value;
            }
            else
            {
                obj.value = value.substr(0,start) + "<" + tag + "></" + tag + ">" + value.substr(start);
                obj.setSelectionRange(start + tag.length + 2,start + tag.length + 2);
            }
        }
    };

    $scope.createLabel = function() {
        var obj = document.getElementById('field_review');
        if(!document.selection && typeof(obj.selectionStart) == "number") {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            if(start != end) {
                var labelValue = value.substr(start,end - start);
                $scope.labels.push({
                    id: null,
                    name: labelValue,
                    restaurant: Restaurant
                });
            }
        }
    };

    init();

});

app.controller("AddRestaurantCtrl", function ($scope, $http, $rootScope, Restaurant, Label, Review, Chain) {

    var map;

    function init() {

        $rootScope.editablePage = false;


        $scope.labels = [];
        $scope.review = {
            id: null,
            content: "",
            kitchen: 0,
            interior: 0,
            service: 0,
            restaurant: null
        };

        //$scope.itemsList = Chain.query();

        $scope.result1 = '';
        $scope.options1 = null;
        $scope.details1 = '';

    }

    $scope.newCenterMap = function (details) {
        map.setCenter(details.geometry.location);
        marker.setPosition(details.geometry.location);
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
        //restaurant.latitude = marker.getPosition().lat();
        //restaurant.longitude = marker.getPosition().lng();
        restaurant.$save({}, function(){
            //for (var i in $scope.labels) {
            //    var label = new Label($scope.labels[i]);
            //    label.$save({"restaurantId":restaurant.id});
            //};
            //
            //var review = new Review($scope.review);
            //review.$save({"restaurantId":restaurant.id}, function() {
            //    document.location="#/edit/" + restaurant.id;
            //});

            document.location="#/edit/" + restaurant.id;

            /*var rating = new Rating($scope.rating);
            rating.$save({"restaurantId":restaurant.id});*/

        });



    };

    $scope.addEditor = function(tag) {
        var obj = document.getElementById('field_review');
        if(document.selection) obj.value += "<" + tag + "></" + tag + ">";
        else if(typeof(obj.selectionStart) == "number")
        {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            obj.select();
            if(start != end)
            {
                obj.value = value.substr(0,start) + "<" + tag + ">" + value.substr(start,end - start) + "</" + tag + ">" + value.substr(end);
                obj.setSelectionRange(start,end + tag.length * 2 + 5);
                $scope.review.content = obj.value;
            }
            else
            {
                obj.value = value.substr(0,start) + "<" + tag + "></" + tag + ">" + value.substr(start);
                obj.setSelectionRange(start + tag.length + 2,start + tag.length + 2);
            }
        }
    };

    $scope.createLabel = function() {
        var obj = document.getElementById('field_review');
        if(!document.selection && typeof(obj.selectionStart) == "number") {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            if(start != end) {
                var labelValue = value.substr(start,end - start);
                $scope.labels.push({
                    id: null,
                    name: labelValue,
                    restaurant: Restaurant
                });
            }
        }
    };

    init();

});

app.controller("RestaurantsCtrl", function ($scope, $rootScope, Restaurant, CommonReview) {

    function init() {
        $rootScope.editablePage = false;
        $scope.getRestaurants();
    }

    $scope.getRestaurants = function () {

        $scope.restaurants = Restaurant.query();

    };

    $scope.deleteRestaurant = function (id) {
        Restaurant.delete({"id":id}, function() {
            $scope.restaurants = Restaurant.query();
        });

    };

    $scope.edit = function (id) {
        document.location="#/edit/" + id;

    };

    $scope.createNew = function () {
        document.location="#/new";
    };

    init();

});

app.controller("ChainsCtrl", function ($scope, $rootScope, Chain) {

    function init() {
        $rootScope.editablePage = false;
        $scope.getChains();
    }

    $scope.getChains = function () {

        $scope.chains = Chain.query();

    };

    $scope.delete = function (id) {
        Chain.delete({"id":id}, function() {
            $scope.chains = Chain.query();
        });

    };

    $scope.edit = function (id) {
        document.location="#/editchain/" + id;

    };

    $scope.createNew = function () {
        document.location="#/newchain";
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

    $rootScope.editablePage = false;

});

app.controller("EditChainCtrl", function ($scope, $http, $rootScope, $routeParams, $sce, $timeout, Chain, CLabel, CReview, CPhoto, RestaurantsOfChain) {

    function init() {



        $rootScope.editablePage = false;

        $scope.chain = Chain.get({"id": $routeParams.id});

        $scope.labels = CLabel.query({"chainId": $routeParams.id});



        var itemReview = CReview.get({"chainId": $routeParams.id}, function(){
            var kitchenrating = itemReview.kitchen;
            var kitchen_star_width = kitchenrating*16 + Math.ceil(kitchenrating);
            $('#kitchen_votes').width(kitchen_star_width);
            var interiorrating = itemReview.interior;
            var interior_star_width = interiorrating*16 + Math.ceil(interiorrating);
            $('#interior_votes').width(interior_star_width);
            var servicerating = itemReview.service;
            var service_star_width = servicerating*16 + Math.ceil(servicerating);
            $('#service_votes').width(service_star_width);

            $scope.reviewHtml = $sce.trustAsHtml(itemReview.content);


        });

        $scope.review = itemReview;

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
        }).success(function() {
            $scope.slides = CPhoto.query({"id": $routeParams.id});
        });
    };

    $scope.uploadPreviewImage = function () {
        $http({
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
        }).success(function() {
            var tempRestaurant = Chain.get({"id": $routeParams.id}, function() {
                document.getElementById('chain_preview_img').setAttribute('src', tempRestaurant.previewImage);
                $scope.chain.previewImage = tempRestaurant.previewImage;
            });
        });


    };

    $scope.deletePreviewImage = function () {
        $scope.chain.previewImage = "";
        document.getElementById('chain_preview_img').removeAttribute('src');
    };

    $scope.deletePhoto = function () {
        if ($scope.slides.length > 0) {
            for (var slideId in $scope.slides) {
                if ($scope.slides[slideId].active) {
                    $http({
                        method: 'DELETE',
                        url: '/api/photo/' + $scope.slides[slideId].id
                    }).success(function() {
                        $scope.slides = CPhoto.query({"id": $routeParams.id});
                    });
                    break;
                }
            }
        }
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

    $scope.edit = function() {
        document.location="#/editchain/" + $routeParams.id;
    };

    $scope.addEditor = function(tag) {
        var obj = document.getElementById('field_review');
        if(document.selection) obj.value += "<" + tag + "></" + tag + ">";
        else if(typeof(obj.selectionStart) == "number")
        {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            obj.select();
            if(start != end)
            {
                obj.value = value.substr(0,start) + "<" + tag + ">" + value.substr(start,end - start) + "</" + tag + ">" + value.substr(end);
                obj.setSelectionRange(start,end + tag.length * 2 + 5);
                $scope.review.content = obj.value;
            }
            else
            {
                obj.value = value.substr(0,start) + "<" + tag + "></" + tag + ">" + value.substr(start);
                obj.setSelectionRange(start + tag.length + 2,start + tag.length + 2);
            }
        }
    };

    $scope.createLabel = function() {
        var obj = document.getElementById('field_review');
        if(!document.selection && typeof(obj.selectionStart) == "number") {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            if(start != end) {
                var labelValue = value.substr(start,end - start);
                $scope.labels.push({
                    id: null,
                    name: labelValue,
                    chain: Chain
                });
            }
        }
    };


    init();

});

app.controller("ViewChainCtrl", function ($scope, $http, $rootScope, $routeParams, $sce, $timeout, Chain, CLabel, CReview, CPhoto, RestaurantsOfChain) {

    function init() {

        function fb(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5";
            fjs.parentNode.insertBefore(js, fjs);
        };

        $rootScope.editablePage = true;

        $scope.chain = Chain.get({"id": $routeParams.id});

        $scope.labels = CLabel.query({"chainId": $routeParams.id});



        var itemReview = CReview.get({"chainId": $routeParams.id}, function(){
            var kitchenrating = itemReview.kitchen;
            var kitchen_star_width = kitchenrating*16 + Math.ceil(kitchenrating);
            $('#kitchen_votes').width(kitchen_star_width);
            var interiorrating = itemReview.interior;
            var interior_star_width = interiorrating*16 + Math.ceil(interiorrating);
            $('#interior_votes').width(interior_star_width);
            var servicerating = itemReview.service;
            var service_star_width = servicerating*16 + Math.ceil(servicerating);
            $('#service_votes').width(service_star_width);

            $scope.reviewHtml = $sce.trustAsHtml(itemReview.content);

            if (itemReview.createdDate != undefined) {
                var formattedDate = itemReview.createdDate[0] + '-';
                for (var j in itemReview.createdDate) {
                    if (j > 0) {
                        var str = '00' + itemReview.createdDate[j];
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

                $scope.reviewDate = "Posted: " + formattedDate;
            }
        });

        $scope.review = itemReview;

        $scope.slides = CPhoto.query({"id": $routeParams.id});

        fb(document, 'script', 'facebook-jssdk');

        //window.fbAsyncInit = function(){  // this gets triggered when FB object gets initialized
        //    FB.XFBML.parse(document.getElementById('fb-button'));
        //};

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
                var listOfRestaurants = RestaurantsOfChain.query({"chainId": $routeParams.id}, function () {
                    for (re in listOfRestaurants) {
                        var latlng = new google.maps.LatLng(listOfRestaurants[re].latitude, listOfRestaurants[re].longitude);
                        var newMarker = new google.maps.Marker({
                            position: latlng,
                            map: mapOfRestaurants,
                            icon: 'https://maps.google.com/mapfiles/kml/pal2/icon32.png',
                            title: listOfRestaurants[re].name
                        });
                        var markerUrl = 'index.html#/view/' + listOfRestaurants[re].id;
                        google.maps.event.addListener(newMarker, 'click', function (markerUrl) {
                            return function () {
                                document.location = markerUrl;
                            }
                        }(markerUrl));
                        markers.push(newMarker);
                    }
                });
                $scope.restaurants = listOfRestaurants;

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
                var listOfRestaurants = RestaurantsOfChain.query({"chainId": $routeParams.id}, function () {
                    for (re in listOfRestaurants) {
                        var latlng = new google.maps.LatLng(listOfRestaurants[re].latitude, listOfRestaurants[re].longitude);
                        var newMarker = new google.maps.Marker({
                            position: latlng,
                            map: mapOfRestaurants,
                            icon: 'https://maps.google.com/mapfiles/kml/pal2/icon32.png',
                            title: listOfRestaurants[re].name
                        });
                        var markerUrl = 'index.html#/view/' + listOfRestaurants[re].id;
                        google.maps.event.addListener(newMarker, 'click', function (markerUrl) {
                            return function () {
                                document.location = markerUrl;
                            }
                        }(markerUrl));
                        markers.push(newMarker);
                    }
                });
                $scope.restaurants = listOfRestaurants;
            })};


        $timeout(function(){
            FB.XFBML.parse();
        }, 1000);


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
        }).success(function() {
            $scope.slides = CPhoto.query({"id": $routeParams.id});
        });
    };

    $scope.uploadPreviewImage = function () {
        $http({
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
        }).success(function() {
            var tempRestaurant = Chain.get({"id": $routeParams.id}, function() {
                document.getElementById('chain_preview_img').setAttribute('src', tempRestaurant.previewImage);
                $scope.chain.previewImage = tempRestaurant.previewImage;
            });
        });


    };

    $scope.deletePreviewImage = function () {
        $scope.chain.previewImage = "";
        document.getElementById('chain_preview_img').removeAttribute('src');
    };

    $scope.deletePhoto = function () {
        if ($scope.slides.length > 0) {
            for (var slideId in $scope.slides) {
                if ($scope.slides[slideId].active) {
                    $http({
                        method: 'DELETE',
                        url: '/api/photo/' + $scope.slides[slideId].id
                    }).success(function() {
                        $scope.slides = CPhoto.query({"id": $routeParams.id});
                    });
                    break;
                }
            }
        }
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

    $scope.edit = function() {
        document.location="#/editchain/" + $routeParams.id;
    };

    $scope.addEditor = function(tag) {
        var obj = document.getElementById('field_review');
        if(document.selection) obj.value += "<" + tag + "></" + tag + ">";
        else if(typeof(obj.selectionStart) == "number")
        {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            obj.select();
            if(start != end)
            {
                obj.value = value.substr(0,start) + "<" + tag + ">" + value.substr(start,end - start) + "</" + tag + ">" + value.substr(end);
                obj.setSelectionRange(start,end + tag.length * 2 + 5);
                $scope.review.content = obj.value;
            }
            else
            {
                obj.value = value.substr(0,start) + "<" + tag + "></" + tag + ">" + value.substr(start);
                obj.setSelectionRange(start + tag.length + 2,start + tag.length + 2);
            }
        }
    };

    $scope.createLabel = function() {
        var obj = document.getElementById('field_review');
        if(!document.selection && typeof(obj.selectionStart) == "number") {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            if(start != end) {
                var labelValue = value.substr(start,end - start);
                $scope.labels.push({
                    id: null,
                    name: labelValue,
                    chain: Chain
                });
            }
        }
    };


    init();

});

app.controller("AddChainCtrl", function ($scope, $http, $rootScope, Chain, CLabel, CReview) {

    function init() {

        $rootScope.editablePage = false;

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
            review.$save({"chainId":chain.id}, function() {
                document.location="#/editchain/" + chain.id;
            });

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

    $scope.addEditor = function(tag) {
        var obj = document.getElementById('field_review');
        if(document.selection) obj.value += "<" + tag + "></" + tag + ">";
        else if(typeof(obj.selectionStart) == "number")
        {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            obj.select();
            if(start != end)
            {
                obj.value = value.substr(0,start) + "<" + tag + ">" + value.substr(start,end - start) + "</" + tag + ">" + value.substr(end);
                obj.setSelectionRange(start,end + tag.length * 2 + 5);
                $scope.review.content = obj.value;
            }
            else
            {
                obj.value = value.substr(0,start) + "<" + tag + "></" + tag + ">" + value.substr(start);
                obj.setSelectionRange(start + tag.length + 2,start + tag.length + 2);
            }
        }
    };

    $scope.createLabel = function() {
        var obj = document.getElementById('field_review');
        if(!document.selection && typeof(obj.selectionStart) == "number") {
            var start = obj.selectionStart;
            var end = obj.selectionEnd;
            var value = obj.value;
            if(start != end) {
                var labelValue = value.substr(start,end - start);
                $scope.labels.push({
                    id: null,
                    name: labelValue,
                    chain: Chain
                });
            }
        }
    };

    init();

});

app.controller("StartCtrl", function ($scope, $rootScope, Restaurant, CommonReview) {

    function init() {
        $rootScope.editablePage = false;
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
                    //,
                    //scrollwheel: false
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
                            icon: 'https://maps.google.com/mapfiles/kml/pal2/icon32.png',
                            title: listOfRestaurants[re].name
                        });
                        var markerUrl = 'index.html#/view/' + listOfRestaurants[re].id;
                        google.maps.event.addListener(newMarker, 'click', function (markerUrl) {
                            return function () {
                                document.location = markerUrl;
                            }
                        }(markerUrl));
                        markers.push(newMarker);
                    }
                });
                $scope.restaurants = listOfRestaurants;

                var reviewsTop = CommonReview.query({"search": "", "page": 0, "per_page": 10, "sortby": 'total'}, function () {
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
                            icon: 'https://maps.google.com/mapfiles/kml/pal2/icon32.png',
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
                var reviewsTop = CommonReview.query({"search": "", "page": 0, "per_page": 10, "sortby": 'total'}, function () {
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

app.controller("ListCtrl", function ($scope, $rootScope, Restaurant, Label, CLabel, CommonReview, Country, Locality, Sublocality, Street) {

    function init() {
        $rootScope.editablePage = false;
        $scope.orderBy = 'total';
        $scope.pageNum = 0;
        $scope.countryList = Country.query();
        $scope.flSearch = "";
        getItems();
    }

    function getItems() {

        var searchText = "";
        if ($scope.flSearch != "") {
            searchText = "filter:" + $scope.flSearch + ",";
        }
        if ($scope.flStreet != null) {
            searchText = searchText + "street:" + $scope.flStreet.id;
        } else if ($scope.flSublocality != null) {
            searchText = searchText + "sublocality:" + $scope.flSublocality.id;
        } else if ($scope.flLocality != null) {
            searchText = searchText + "locality:" + $scope.flLocality.id;
        } else if ($scope.flCountry != null) {
            searchText = searchText + "country:" + $scope.flCountry.id;
        }

            var reviews = CommonReview.query({"search": searchText, "page": $scope.pageNum, "per_page": 10, "sortby": $scope.orderBy}, function () {
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

    $scope.viewItem = function(item) {
        if (item.reviewType=='RESTAURANT') {
            location.href = "#/view/" + item.restaurant.id;
        } else {
            location.href = "#/viewchain/" + item.chain.id;
        }
    }

    $scope.selectCountry = function() {
        $scope.flLocality = null;
        $scope.flSublocality = null;
        $scope.flStreet = null;
        getItems();
        if ($scope.flCountry==null) {

        } else {
            $scope.localityList = Locality.query({"countryId": $scope.flCountry.id});
        }
    }

    $scope.selectLocality = function() {
        $scope.flSublocality = null;
        $scope.flStreet = null;
        getItems();
        if ($scope.flLocality==null) {

        } else {
            $scope.sublocalityList = Sublocality.query({"localityId": $scope.flLocality.id});
        }
    }

    $scope.selectSublocality = function() {
        $scope.flStreet = null;
        getItems();
        if ($scope.flSublocality==null) {

        } else {
            $scope.streetList = Street.query({"sublocalityId": $scope.flSublocality.id});
        }
    }

    $scope.selectStreet = function() {
        getItems();
        if ($scope.flStreet==null) {

        } else {

        }
    }

    $scope.selectSearch = function() {
        getItems();
    }

    init();

});

app.directive('ngAutocomplete', function($parse) {
    return {

        scope: {
            details: '=',
            ngAutocomplete: '=',
            newCenterMap: '=',
            options: '='
        },

        link: function($scope, element, attrs, model) {

            //options for autocomplete
            var opts;

            //convert options provided to opts
            var initOpts = function() {
                opts = {};
                if ($scope.options) {
                    if ($scope.options.types) {
                        opts.types = [];
                        opts.types.push(scope.options.types);
                    }
                    if ($scope.options.bounds) {
                        opts.bounds = scope.options.bounds
                    }
                    if ($scope.options.country) {
                        opts.componentRestrictions = {
                            country: scope.options.country
                        }
                    }
                }
            };
            initOpts();

            //create new autocomplete
            //reinitializes on every change of the options provided
            var newAutocomplete = function() {
                $scope.gPlace = new google.maps.places.Autocomplete(element[0], opts);
                google.maps.event.addListener($scope.gPlace, 'place_changed', function() {
                    $scope.$apply(function() {
//              if (scope.details) {
                        $scope.details = $scope.gPlace.getPlace();
//              }
                        $scope.ngAutocomplete = element.val();

                        $scope.newCenterMap($scope.details);
                    });
                })
            };
            newAutocomplete();

            //watch options provided to directive
            $scope.watchOptions = function () {
                return $scope.options
            };
            $scope.$watch($scope.watchOptions, function () {
                initOpts();
                newAutocomplete();
                element[0].value = '';
                $scope.ngAutocomplete = element.val();
            }, true);
        }
    };
});






