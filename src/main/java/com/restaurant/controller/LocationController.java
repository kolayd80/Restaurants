package com.restaurant.controller;

import com.restaurant.domain.Country;
import com.restaurant.domain.Locality;
import com.restaurant.domain.Street;
import com.restaurant.domain.Sublocality;
import com.restaurant.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    @Autowired
    private AddressService locationService;

    /**
     * GET  /chains -> get all the chains.
     */
    @RequestMapping(value = "/country",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Country> getAllCountries() {
        return locationService.findAllCountries();
    }

    /**
     * GET  /restaurants/:id -> get the "id" chain.
     */
    @RequestMapping(value = "/country/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Country> getCountry(@PathVariable Long id) {
        return Optional.ofNullable(locationService.findOneCountry(id))
                .map(country -> new ResponseEntity<>(
                        country,
                        HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @RequestMapping(value = "/country/{countryId}/locality",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Locality> getLocalities(@PathVariable Long countryId) {
        return locationService.findAllLocalitiesByCountry(countryId);
    }

    @RequestMapping(value = "/locality/{localityId}/sublocality",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Sublocality> getSublocalities(@PathVariable Long localityId) {
        return locationService.findAllSublocalitiesByLocality(localityId);
    }

    @RequestMapping(value = "/sublocality/{sublocalityId}/street",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Street> getStreets(@PathVariable Long sublocalityId) {
        return locationService.findAllStreetsBySublocality(sublocalityId);
    }
}
