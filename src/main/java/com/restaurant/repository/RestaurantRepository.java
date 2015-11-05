package com.restaurant.repository;

import com.restaurant.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Created by Nikolay on 08.10.2015.
 */
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    List<Restaurant> findByOrderByTotalratingDesc();

}
