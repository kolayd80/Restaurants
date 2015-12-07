package com.restaurant.service;

import com.restaurant.domain.Country;
import com.restaurant.domain.Locality;
import com.restaurant.domain.Street;
import com.restaurant.domain.Sublocality;
import com.restaurant.repository.CountryRepository;
import com.restaurant.repository.LocalityRepository;
import com.restaurant.repository.StreetRepository;
import com.restaurant.repository.SublocalityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    CountryRepository countryRepository;

    @Autowired
    LocalityRepository localityRepository;

    @Autowired
    SublocalityRepository sublocalityRepository;

    @Autowired
    StreetRepository streetRepository;

    public Country findCountryByName(String name) {
        return countryRepository.findByName(name);
    }

    public Country saveCountry(String name) {
        Country country = new Country();
        country.setName(name);
        return countryRepository.save(country);
    }

    public Sublocality findSublocalityByName(String name, Locality locality) {
        return sublocalityRepository.findByNameAndLocality(name, locality);
    }

    public Locality findLocalityByName(String name, Country country) {
        return localityRepository.findByNameAndCountry(name, country);
    }

    public Locality saveLocality(String name, Country country) {
        Locality locality = new Locality();
        locality.setName(name);
        locality.setCountry(country);
        return localityRepository.save(locality);
    }

    public Sublocality saveSublocality(String name, Locality locality) {
        Sublocality sublocality = new Sublocality();
        sublocality.setName(name);
        sublocality.setLocality(locality);
        return sublocalityRepository.save(sublocality);
    }

    public Street findStreetByName(String name, Sublocality sublocality) {
        return streetRepository.findByNameAndSublocality(name, sublocality);
    }

    public Street saveStreet(String name, Sublocality sublocality) {
        Street street = new Street();
        street.setName(name);
        street.setSublocality(sublocality);
        return streetRepository.save(street);
    }

    public List<Country> findAllCountries() {
        return countryRepository.findAll();
    }

    public Country findOneCountry(Long id) {
        return countryRepository.findOne(id);
    }

    public List<Locality> findAllLocalitiesByCountry(Long id) {
        return localityRepository.findByCountry(countryRepository.findOne(id));
    }

    public List<Sublocality> findAllSublocalitiesByLocality(Long id) {
        return sublocalityRepository.findByLocality(localityRepository.findOne(id));
    }

    public List<Street> findAllStreetsBySublocality(Long id) {
        return streetRepository.findBySublocality(sublocalityRepository.findOne(id));
    }
}
