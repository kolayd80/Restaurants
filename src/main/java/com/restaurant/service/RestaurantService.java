package com.restaurant.service;

import com.restaurant.domain.Restaurant;
import com.restaurant.repository.RestaurantRepository;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by Nikolay on 09.10.2015.
 */
@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    public Restaurant save(Restaurant restaurant) {
        restaurant.setTotalrating(Math.rint(100.0*(0.4*restaurant.getKitchenrating()+0.3*restaurant.getServicerating()+0.3*restaurant.getInteriorrating())) / 100.0);
        restaurant.setAddingDate(new DateTime());
        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> findAll() {
        return restaurantRepository.findAll();
    }

    public List<Restaurant> findOrderByTotalratingDesc() {
        return restaurantRepository.findByOrderByTotalratingDesc();
    }

    public Restaurant findOne(Long id) {
        return restaurantRepository.findOne(id);
    }

    public void delete(Long id) {
        restaurantRepository.delete(id);
    }

}
