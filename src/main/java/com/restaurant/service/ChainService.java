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

        return chainRepository.save(chain);

    }

    public Chain findOne(Long id) {
        return chainRepository.findOne(id);
    }

    public List<Chain> findAll() {
        return chainRepository.findAll();
    }

    public void savePreview(Long id, String name) {
        Chain chain = chainRepository.findOne(id);
        chain.setPreviewImage(name.replace("src/main/webapp/", "http://localhost:8080/"));
        chainRepository.save(chain);
    }

    public void delete(Long id) {
        chainRepository.delete(id);
    }

}
