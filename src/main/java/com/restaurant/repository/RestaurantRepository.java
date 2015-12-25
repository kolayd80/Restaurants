package com.restaurant.repository;

import com.restaurant.domain.Chain;
import com.restaurant.domain.Locality;
import com.restaurant.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Created by Nikolay on 08.10.2015.
 */
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    //List<Restaurant> findByOrderByTotalratingDesc();

    @Query("select p from Restaurant p order by id asc")
    List<Restaurant> findAllOrderById();

    List<Restaurant> findByChain(Chain chain);

    List<Restaurant> findByLocality(Locality locality);

}
