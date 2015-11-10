package com.restaurant.repository;

import com.restaurant.domain.Restaurant;
import com.restaurant.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

/**
 * Created by Nikolay on 09.11.2015.
 */
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Review findByRestaurant(@Param("restaurant")Restaurant restaurant);
}
