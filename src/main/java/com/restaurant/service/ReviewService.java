package com.restaurant.service;

import com.mysema.query.types.expr.BooleanExpression;
import com.restaurant.domain.Chain;
import com.restaurant.domain.Restaurant;
import com.restaurant.domain.Review;
import com.restaurant.domain.ReviewType;
import com.restaurant.repository.ReviewRepository;
import com.restaurant.repository.SearchPredicatesBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private ChainService chainService;

    public Review findByRestaurant(Long restaurantId) {
        return reviewRepository.findByRestaurant(restaurantService.findOne(restaurantId));
    }

    public Review findByChain(Long chainId) {
        return reviewRepository.findByChain(chainService.findOne(chainId));
    }

    public Review findOne(Long reviewId) {
        return reviewRepository.findOne(reviewId);
    }

    public Review save(Review review, Long restaurantId) {
        if (review.getCreatedDate()==null) {
            review.setCreatedDate(LocalDateTime.now());
        }
        Restaurant restaurant = restaurantService.findOne(restaurantId);
        review.setRestaurant(restaurant);
        review.setReviewType(ReviewType.RESTAURANT);
        review.setTotal(Math.rint(100.0 * (0.4 * review.getKitchen() + 0.3 * review.getService() + 0.3 * review.getInterior())) / 100.0);
        Review savedReview = reviewRepository.save(review);
        Chain chain = restaurant.getChain();
        if (chain!=null) {
            setRatingForChain(chain);
        }
        return savedReview;
    }

    public Review setRatingForChain(Chain chain) {

        Review chainRating = reviewRepository.findByChain(chain);
        if (chainRating==null) {
            chainRating = new Review();
            chainRating.setChain(chain);
            chainRating.setReviewType(ReviewType.CHAIN);
        }

        Double sumKitchen = 0.0;
        Double sumInterior = 0.0;
        Double sumService = 0.0;
        List<Restaurant> restaurantList = restaurantService.findByChain(chain);
        if (restaurantList.size()>0) {
            for (Restaurant resto:restaurantList) {
                Review restoRating = findByRestaurant(resto.getId());
                sumKitchen = sumKitchen + restoRating.getKitchen();
                sumInterior = sumInterior + restoRating.getInterior();
                sumService = sumService + restoRating.getService();
            }
            chainRating.setKitchen(new BigDecimal(sumKitchen / restaurantList.size()).setScale(2, RoundingMode.HALF_UP).doubleValue());
            chainRating.setInterior(new BigDecimal(sumInterior / restaurantList.size()).setScale(2, RoundingMode.HALF_UP).doubleValue());
            chainRating.setService(new BigDecimal(sumService / restaurantList.size()).setScale(2, RoundingMode.HALF_UP).doubleValue());
        } else {
            chainRating.setKitchen(0.0);
            chainRating.setInterior(0.0);
            chainRating.setService(0.0);
        }
        chainRating.setTotal(Math.rint(100.0 * (0.4 * chainRating.getKitchen() + 0.3 * chainRating.getService() + 0.3 * chainRating.getInterior())) / 100.0);
        return reviewRepository.save(chainRating);

    }

    public Review saveForChain(Review review, Long chainId) {
        if (review.getCreatedDate()==null) {
            review.setCreatedDate(LocalDateTime.now());
        }
        Chain chain = chainService.findOne(chainId);
        review.setChain(chain);
        review.setReviewType(ReviewType.CHAIN);
        return reviewRepository.save(review);
    }

    public Page<Review> findAll(Pageable pageable) {
        return reviewRepository.findByReviewTypeOrRestaurantChain(ReviewType.CHAIN, null, pageable);
    }

    public Page<Review> findAllByQuerydsl(final String search, Pageable pageable) {

        final SearchPredicatesBuilder builder = new SearchPredicatesBuilder();
        if (search != null) {
            final Pattern pattern = Pattern.compile("(\\w+?)(:|<|>)(\\w+?),");
            final Matcher matcher = pattern.matcher(search + ",");
            while (matcher.find()) {
                builder.with(matcher.group(1), matcher.group(2), matcher.group(3));
            }
        }
        final BooleanExpression exp = builder.build();

        return reviewRepository.findAll(exp, pageable);
    }
}
