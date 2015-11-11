package com.restaurant.service;

import com.restaurant.domain.Chain;
import com.restaurant.repository.ChainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
public class ChainService {

    @Autowired
    ChainRepository chainRepository;


    public Chain save(Chain chain) {

        if (chain.getCreatedDate()==null) {
            chain.setCreatedDate(LocalDateTime.now());
        }

        return chainRepository.save(chain);

    }

    public Chain findOne(Long id) {
        return chainRepository.findOne(id);
    }

    public List<Chain> findAll() {
        return chainRepository.findAll();
    }

}
