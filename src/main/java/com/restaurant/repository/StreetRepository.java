package com.restaurant.repository;

import com.restaurant.domain.Street;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Created by Nikolay on 09.11.2015.
 */
public interface StreetRepository extends JpaRepository<Street, Long> {
}
