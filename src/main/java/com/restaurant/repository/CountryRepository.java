package com.restaurant.repository;

import com.restaurant.domain.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

/**
 * Created by Nikolay on 09.11.2015.
 */
public interface CountryRepository extends JpaRepository<Country, Long> {

    Country findByName(@Param("name")String name);

}
