package com.restaurant.service;

import com.restaurant.domain.Chain;
import com.restaurant.domain.Label;
import com.restaurant.domain.Restaurant;
import com.restaurant.repository.LabelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabelService {

    @Autowired
    private LabelRepository labelRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private ChainService chainService;

    public Label save(Label label, Long restaurantId) {
        Restaurant restaurant = restaurantService.findOne(restaurantId);
        label.setRestaurant(restaurant);
        return labelRepository.save(label);
    }

    public Label saveForChain(Label label, Long restaurantId) {
        Chain chain = chainService.findOne(restaurantId);
        label.setChain(chain);
        return labelRepository.save(label);
    }

    public List<Label> findByRestaurant(Long restaurantId) {
        return labelRepository.findByRestaurant(restaurantService.findOne(restaurantId));
    }

    public List<Label> findByChain(Long chainId) {
        return labelRepository.findByChain(chainService.findOne(chainId));
    }

    public void delete(Long resraurantId, Long labelId) {
        labelRepository.delete(labelId);
    }

    public Label findOne(Long labelId) {
        return labelRepository.findOne(labelId);
    }

}
