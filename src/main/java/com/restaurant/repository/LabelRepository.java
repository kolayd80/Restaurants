package com.restaurant.repository;

import com.restaurant.domain.Chain;
import com.restaurant.domain.Label;
import com.restaurant.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Created by Nikolay on 09.11.2015.
 */
public interface LabelRepository extends JpaRepository<Label, Long> {

    List<Label> findByRestaurant(@Param("restaurant")Restaurant restaurant);

    List<Label> findByChain(@Param("chain")Chain chain);

}
