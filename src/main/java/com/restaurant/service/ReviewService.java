package com.restaurant.service;

import com.restaurant.domain.Restaurant;
import com.restaurant.domain.Review;
import com.restaurant.domain.ReviewType;
import com.restaurant.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RestaurantService restaurantService;

    public Review findByRestaurant(Long restaurantId) {
        return reviewRepository.findByRestaurant(restaurantService.findOne(restaurantId));
    }

    public Review findOne(Long reviewId) {
        return reviewRepository.findOne(reviewId);
    }

    public Review save(Review review, Long restaurantId) {
        Restaurant restaurant = restaurantService.findOne(restaurantId);
        review.setRestaurant(restaurant);
        review.setReviewType(ReviewType.RESTAURANT);
        return reviewRepository.save(review);
    }

}
