package com.restaurant.controller;

import com.restaurant.controller.util.HeaderUtil;
import com.restaurant.domain.Restaurant;
import com.restaurant.service.RestaurantService;
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

}
