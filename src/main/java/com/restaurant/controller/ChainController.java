package com.restaurant.controller;

import com.restaurant.controller.util.HeaderUtil;
import com.restaurant.domain.Chain;
import com.restaurant.domain.Label;
import com.restaurant.domain.Review;
import com.restaurant.service.ChainService;
import com.restaurant.service.LabelService;
import com.restaurant.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chain")
public class ChainController {

    @Autowired
    private ChainService chainService;

    @Autowired
    private LabelService labelService;

    @Autowired
    private ReviewService reviewService;

    /**
     * POST  /restaurants -> Create a new chain.
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Chain> createChain(@Valid @RequestBody Chain chain) throws URISyntaxException {
        if (chain.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new chain cannot already have an ID").body(null);
        }
        Chain result = chainService.save(chain);
        return ResponseEntity.created(new URI("/api/chain/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("chain", result.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/{chainId}/label",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Label> createChainLabel(@Valid @RequestBody Label label,
                                                       @PathVariable Long chainId) throws URISyntaxException {

        Label result = labelService.saveForChain(label, chainId);
        return ResponseEntity.created(new URI("/api/label/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("label", result.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/{chainId}/review",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Review> createChainReview(@Valid @RequestBody Review review,
                                                         @PathVariable Long chainId) throws URISyntaxException {

        Review result = reviewService.saveForChain(review, chainId);
        return ResponseEntity.created(new URI("/api/review/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("review", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /restaurants -> Updates an existing chain.
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/{id}",
            method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Chain> updateChain(@PathVariable Long id, @Valid @RequestBody Chain chain) throws URISyntaxException {
        Chain oldChain = chainService.findOne(id);
        if (oldChain == null) {
            return createChain(chain);
        }
        Chain result = chainService.save(chain);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("chain", chain.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/{chainId}/label/{labelId}",
            method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Label> updateChainLabel(@PathVariable Long chainId, @PathVariable Long labelId, @Valid @RequestBody Label label) throws URISyntaxException {
        Label oldLabel = labelService.findOne(labelId);
        if (oldLabel == null) {
            return createChainLabel(label, chainId);
        }
        Label result = labelService.saveForChain(label, chainId);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("label", label.getId().toString()))
                .body(result);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/{chainId}/review/{reviewId}",
            method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Review> updateChainReview(@PathVariable Long chainId, @PathVariable Long reviewId, @Valid @RequestBody Review review) throws URISyntaxException {
        Review oldReview = reviewService.findOne(reviewId);
        if (oldReview == null) {
            return createChainReview(review, chainId);
        }
        Review result = reviewService.saveForChain(review, chainId);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("review", review.getId().toString()))
                .body(result);
    }

    /**
     * GET  /chains -> get all the chains.
     */
    @RequestMapping(method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Chain> getAllChains() {
        return chainService.findAll();
    }

    /**
     * GET  /restaurants/:id -> get the "id" chain.
     */
    @RequestMapping(value = "/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Chain> getChain(@PathVariable Long id) {
        return Optional.ofNullable(chainService.findOne(id))
                .map(chain -> new ResponseEntity<>(
                        chain,
                        HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @RequestMapping(value = "/{chainId}/label",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Label> getChainLabels(@PathVariable Long chainId) {
        return labelService.findByChain(chainId);
    }

    @RequestMapping(value = "/{chainId}/review",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public Review getChainReview(@PathVariable Long chainId) {
        return reviewService.findByChain(chainId);
    }


    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/{chainId}/label/{labelId}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> deleteChainLabel(@PathVariable Long chainId, @PathVariable Long labelId) {
        labelService.delete(chainId, labelId);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("label", labelId.toString())).build();
    }
}
