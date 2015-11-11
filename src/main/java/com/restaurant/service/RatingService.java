package com.restaurant.service;

import com.restaurant.domain.Rating;
import com.restaurant.domain.Restaurant;
import com.restaurant.domain.ReviewType;
import com.restaurant.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private RestaurantService restaurantService;

    public Rating save(Rating rating, Long restaurantId) {
        Restaurant restaurant = restaurantService.findOne(restaurantId);
        rating.setRestaurant(restaurant);
        rating.setReviewType(ReviewType.RESTAURANT);
        rating.setTotal(Math.rint(100.0 * (0.4 * rating.getKitchen() + 0.3 * rating.getService() + 0.3 * rating.getInterior())) / 100.0);
        return ratingRepository.save(rating);
    }

    public Rating findOne(Long ratingId) {
        return ratingRepository.findOne(ratingId);
    }

    public Rating findByRestaurant(Long restaurantId) {
        return ratingRepository.findByRestaurant(restaurantService.findOne(restaurantId));
    }
}
