package com.restaurant.controller;


import com.restaurant.domain.Review;
import com.restaurant.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @RequestMapping(method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<Review> reviewList(@RequestParam("page") int pageNumber, @RequestParam("per_page") int pageLimit, @RequestParam("sortby") String sortBy) {
        return reviewService.findAll(new PageRequest(pageNumber, pageLimit, Sort.Direction.DESC, sortBy));
    }

    @RequestMapping(value = "/search", method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<Review> ratingListByQuerydsl(@RequestParam(value = "search") final String search, @RequestParam("page") int pageNumber, @RequestParam("per_page") int pageLimit, @RequestParam("sortby") String sortBy){

        return reviewService.findAllByQuerydsl(search, new PageRequest(pageNumber, pageLimit, Sort.Direction.DESC, sortBy));
    }
}
