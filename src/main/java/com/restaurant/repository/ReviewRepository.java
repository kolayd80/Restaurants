package com.restaurant.repository;

import com.restaurant.domain.Chain;
import com.restaurant.domain.Restaurant;
import com.restaurant.domain.Review;
import com.restaurant.domain.ReviewType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long>, QueryDslPredicateExecutor<Review> {

    Review findByRestaurant(@Param("restaurant")Restaurant restaurant);

    Review findByChain(@Param("chain")Chain chain);

    Page<Review> findByReviewTypeOrRestaurantChain(@Param("review_type")ReviewType reviewType, @Param("restaurant.chain")Chain chain, Pageable pageable);

}
