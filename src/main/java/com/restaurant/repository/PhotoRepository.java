package com.restaurant.repository;

import com.restaurant.domain.Photo;
import com.restaurant.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Created by Nikolay on 13.10.2015.
 */
public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findByRestaurant(@Param("restaurant")Restaurant restaurant);

}
