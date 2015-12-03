package com.restaurant.service;

import com.mysema.query.types.expr.BooleanExpression;
import com.restaurant.domain.Chain;
import com.restaurant.domain.Rating;
import com.restaurant.domain.Restaurant;
import com.restaurant.domain.ReviewType;
import com.restaurant.repository.RatingRepository;
import com.restaurant.repository.SearchPredicatesBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private ChainService chainService;

    public Rating save(Rating rating, Long restaurantId) {
        Restaurant restaurant = restaurantService.findOne(restaurantId);
        rating.setRestaurant(restaurant);
        rating.setReviewType(ReviewType.RESTAURANT);
        rating.setTotal(Math.rint(100.0 * (0.4 * rating.getKitchen() + 0.3 * rating.getService() + 0.3 * rating.getInterior())) / 100.0);
        Rating savedRating = ratingRepository.save(rating);
        Chain chain = restaurant.getChain();
        if (chain!=null) {
            setRatingForChain(chain);
        }
        return savedRating;
    }

    public Rating findOne(Long ratingId) {
        return ratingRepository.findOne(ratingId);
    }

    public Rating findByRestaurant(Long restaurantId) {
        return ratingRepository.findByRestaurant(restaurantService.findOne(restaurantId));
    }

    public Rating findByChain(Long chainId) {
        return ratingRepository.findByChain(chainService.findOne(chainId));
    }

    public Rating setRatingForChain(Chain chain) {

        Rating chainRating = ratingRepository.findByChain(chain);
        if (chainRating==null) {
            chainRating = new Rating();
            chainRating.setChain(chain);
            chainRating.setReviewType(ReviewType.CHAIN);
        }

        Double sumKitchen = 0.0;
        Double sumInterior = 0.0;
        Double sumService = 0.0;
        List<Restaurant> restaurantList = restaurantService.findByChain(chain);
        if (restaurantList.size()>0) {
            for (Restaurant resto:restaurantList) {
                Rating restoRating = findByRestaurant(resto.getId());
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
        return ratingRepository.save(chainRating);

    }

    public List<Rating> findAllOrderByTotalRating() {
        return ratingRepository.findByReviewTypeOrRestaurantChainOrderByTotalDesc(ReviewType.CHAIN, null);
    }

    public Page<Rating> findAll(Pageable pageable) {
        return ratingRepository.findByReviewTypeOrRestaurantChain(ReviewType.CHAIN, null, pageable);
    }

    public Page<Rating> findAllByQuerydsl(final String search, Pageable pageable) {

        final SearchPredicatesBuilder builder = new SearchPredicatesBuilder();
        if (search != null) {
            final Pattern pattern = Pattern.compile("(\\w+?)(:|<|>)(\\w+?),");
            final Matcher matcher = pattern.matcher(search + ",");
            while (matcher.find()) {
                builder.with(matcher.group(1), matcher.group(2), matcher.group(3));
            }
        }
        final BooleanExpression exp = builder.build();

        return ratingRepository.findAll(exp, pageable);
    }
}
