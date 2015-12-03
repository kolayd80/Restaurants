package com.restaurant.repository;

import com.restaurant.domain.Chain;
import com.restaurant.domain.Rating;
import com.restaurant.domain.Restaurant;
import com.restaurant.domain.ReviewType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long>, QueryDslPredicateExecutor<Rating> {

    Rating findByRestaurant(@Param("restaurant")Restaurant restaurant);

    Rating findByChain(@Param("chain")Chain chain);

    List<Rating> findByReviewTypeOrRestaurantChainOrderByTotalDesc(@Param("review_type")ReviewType reviewType, @Param("restaurant.chain")Chain chain);

    Page<Rating> findByReviewTypeOrRestaurantChain(@Param("review_type")ReviewType reviewType, @Param("restaurant.chain")Chain chain, Pageable pageable);

}
