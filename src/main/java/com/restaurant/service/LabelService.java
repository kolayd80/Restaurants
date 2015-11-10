package com.restaurant.service;

import com.restaurant.domain.Label;
import com.restaurant.domain.Restaurant;
import com.restaurant.repository.LabelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LabelService {

    @Autowired
    private LabelRepository labelRepository;

    @Autowired
    private RestaurantService restaurantService;

    public Label save(Label label, Long restaurantId) {
        Restaurant restaurant = restaurantService.findOne(restaurantId);
        label.setRestaurant(restaurant);
        return labelRepository.save(label);
    }

}