package com.restaurant.repository;

import com.restaurant.domain.Chain;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Created by Nikolay on 09.11.2015.
 */
public interface ChainRepository extends JpaRepository<Chain, Long> {
}
