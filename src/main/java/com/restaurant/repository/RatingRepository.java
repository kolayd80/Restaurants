package com.restaurant.repository;

import com.restaurant.domain.Rating;
import com.restaurant.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

/**
 * Created by Nikolay on 09.11.2015.
 */
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Rating findByRestaurant(@Param("restaurant")Restaurant restaurant);
}
