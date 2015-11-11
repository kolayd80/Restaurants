package com.restaurant.repository;

import com.restaurant.domain.Country;
import com.restaurant.domain.Locality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

/**
 * Created by Nikolay on 09.11.2015.
 */
public interface LocalityRepository extends JpaRepository<Locality, Long> {

    Locality findByNameAndCountry(@Param("name")String name, @Param("country")Country country);

}
