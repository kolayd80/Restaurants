package com.restaurant.controller;

import com.restaurant.controller.util.HeaderUtil;
import com.restaurant.domain.Label;
import com.restaurant.domain.Rating;
import com.restaurant.domain.Restaurant;
import com.restaurant.domain.Review;
import com.restaurant.service.LabelService;
import com.restaurant.service.RatingService;
import com.restaurant.service.RestaurantService;
import com.restaurant.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;


/**
 * Created by Nikolay on 08.10.2015.
 */
@RestController
@RequestMapping("/api")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private LabelService labelService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private RatingService ratingService;

    /**
     * POST  /restaurants -> Create a new restaurant.
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurants",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Restaurant> createRestaurant(@Valid @RequestBody Restaurant restaurant) throws URISyntaxException {
        if (restaurant.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new restaurant cannot already have an ID").body(null);
        }
        Restaurant result = restaurantService.save(restaurant);
        return ResponseEntity.created(new URI("/api/restaurants/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("restaurant", result.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurant/{restaurantId}/label",
             method = RequestMethod.POST,
             produces = MediaType.APPLICATION_JSON_VALUE)
     public ResponseEntity<Label> createRestaurantLabel(@Valid @RequestBody Label label,
                                                        @PathVariable Long restaurantId) throws URISyntaxException {

        Label result = labelService.save(label, restaurantId);
        return ResponseEntity.created(new URI("/api/label/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("label", result.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurant/{restaurantId}/review",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Review> createRestaurantReview(@Valid @RequestBody Review review,
                                                       @PathVariable Long restaurantId) throws URISyntaxException {

        Review result = reviewService.save(review, restaurantId);
        return ResponseEntity.created(new URI("/api/review/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("review", result.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurant/{restaurantId}/rating",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Rating> createRestaurantRating(@Valid @RequestBody Rating rating,
                                                         @PathVariable Long restaurantId) throws URISyntaxException {

        Rating result = ratingService.save(rating, restaurantId);
        return ResponseEntity.created(new URI("/api/rating/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("rating", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /restaurants -> Updates an existing restaurant.
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurants/{id}",
            method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @Valid @RequestBody Restaurant restaurant) throws URISyntaxException {
        Restaurant oldRestaurant = restaurantService.findOne(id);
        if (oldRestaurant == null) {
            return createRestaurant(restaurant);
        }
        Restaurant result = restaurantService.save(restaurant);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("restaurant", restaurant.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurant/{restaurantId}/label/{labelId}",
            method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Label> updateRestaurantLabel(@PathVariable Long restaurantId, @PathVariable Long labelId, @Valid @RequestBody Label label) throws URISyntaxException {
        Label oldLabel = labelService.findOne(labelId);
        if (oldLabel == null) {
            return createRestaurantLabel(label, restaurantId);
        }
        Label result = labelService.save(label, restaurantId);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("label", label.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurant/{restaurantId}/review/{reviewId}",
            method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Review> updateRestaurantReview(@PathVariable Long restaurantId, @PathVariable Long reviewId, @Valid @RequestBody Review review) throws URISyntaxException {
        Review oldReview = reviewService.findOne(reviewId);
        if (oldReview == null) {
            return createRestaurantReview(review, restaurantId);
        }
        Review result = reviewService.save(review, restaurantId);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("review", review.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurant/{restaurantId}/rating/{ratingId}",
            method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Rating> updateRestaurantRating(@PathVariable Long restaurantId, @PathVariable Long ratingId, @Valid @RequestBody Rating rating) throws URISyntaxException {
        Rating oldRating = ratingService.findOne(ratingId);
        if (oldRating == null) {
            return createRestaurantRating(rating, restaurantId);
        }
        Rating result = ratingService.save(rating, restaurantId);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("rating", rating.getId().toString()))
                .body(result);
    }

    /**
     * GET  /restaurants -> get all the restaurants.
     */
    @RequestMapping(value = "/restaurants",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.findOrderByTotalratingDesc();
    }

    /**
     * GET  /restaurants/:id -> get the "id" restaurant.
     */
    @RequestMapping(value = "/restaurants/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Restaurant> getRestaurant(@PathVariable Long id) {
        return Optional.ofNullable(restaurantService.findOne(id))
                .map(restaurant -> new ResponseEntity<>(
                        restaurant,
                        HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @RequestMapping(value = "/restaurant/{restauranId}/label",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Label> getRestaurantLabels(@PathVariable Long restauranId) {
        return labelService.findByRestaurant(restauranId);
    }

    @RequestMapping(value = "/restaurant/{restauranId}/review",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Review getRestaurantReview(@PathVariable Long restauranId) {
        return reviewService.findByRestaurant(restauranId);
    }

    @RequestMapping(value = "/restaurant/{restauranId}/rating",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Rating getRestaurantRating(@PathVariable Long restauranId) {
        return ratingService.findByRestaurant(restauranId);
    }

    /**
     * DELETE  /restaurants/:id -> delete the "id" restaurant.
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurants/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        restaurantService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("restaurant", id.toString())).build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/restaurant/{restaurantId}/label/{labelId}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> deleteRestaurantLabel(@PathVariable Long restaurantId, @PathVariable Long labelId) {
        labelService.delete(restaurantId, labelId);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("label", labelId.toString())).build();
    }

}
