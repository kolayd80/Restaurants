package com.restaurant.controller;

import com.restaurant.domain.Rating;
import com.restaurant.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.ui.Model;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/rating")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @RequestMapping(method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<Rating> ratingList(@RequestParam("page") int pageNumber, @RequestParam("per_page") int pageLimit, @RequestParam("sortby") String sortBy){
//        if (pageNumber == null) {
//            return ratingService.findAllOrderByTotalRating();
//        } else {
//            if (pageLimit == null) {
//                pageLimit = new Long(10);
//            }
            return ratingService.findAll(new PageRequest(pageNumber, pageLimit, Sort.Direction.DESC, sortBy));
        //}
    }

}
