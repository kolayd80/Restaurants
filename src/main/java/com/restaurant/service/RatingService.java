package com.restaurant.service;

import com.restaurant.domain.Chain;
import com.restaurant.domain.Rating;
import com.restaurant.domain.Restaurant;
import com.restaurant.domain.ReviewType;
import com.restaurant.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
            chainRating.setKitchenChain(sumKitchen / restaurantList.size());
            chainRating.setInteriorChain(sumInterior / restaurantList.size());
            chainRating.setServiceChain(sumService / restaurantList.size());
        } else {
            chainRating.setKitchenChain(0.0);
            chainRating.setInteriorChain(0.0);
            chainRating.setServiceChain(0.0);
        }
        chainRating.setTotal(Math.rint(100.0 * (0.4 * chainRating.getKitchenChain() + 0.3 * chainRating.getServiceChain() + 0.3 * chainRating.getInteriorChain())) / 100.0);
        return ratingRepository.save(chainRating);

    }
}
