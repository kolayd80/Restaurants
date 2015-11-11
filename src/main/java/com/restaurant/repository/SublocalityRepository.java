package com.restaurant.repository;

import com.restaurant.domain.Locality;
import com.restaurant.domain.Sublocality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

/**
 * Created by Nikolay on 09.11.2015.
 */
public interface SublocalityRepository extends JpaRepository<Sublocality, Long> {

    Sublocality findByNameAndLocality(@Param("name")String name, @Param("locality")Locality locality);

}
