package com.restaurant.repository;

import com.restaurant.domain.Street;
import com.restaurant.domain.Sublocality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

/**
 * Created by Nikolay on 09.11.2015.
 */
public interface StreetRepository extends JpaRepository<Street, Long> {

    Street findByNameAndSublocality(@Param("name")String name, @Param("sublocality")Sublocality sublocality);

}
