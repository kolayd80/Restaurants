package com.restaurant.service;

import com.restaurant.domain.Photo;
import com.restaurant.domain.Restaurant;
import com.restaurant.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by Nikolay on 13.10.2015.
 */
@Service
public class PhotoService {

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private ChainService chainService;

    public Photo save(Long restaurantId, String filePath){
        Photo photo = new Photo();
        photo.setRestaurant(restaurantService.findOne(restaurantId));
        photo.setName(filePath);
        return photoRepository.save(photo);
    }

    public Photo saveForChain(Long chainId, String filePath){
        Photo photo = new Photo();
        photo.setChain(chainService.findOne(chainId));
        photo.setName(filePath);
        return photoRepository.save(photo);
    }

    public List<Photo> findPhoto(Long restaurantId){
        List<Photo> photos = photoRepository.findByRestaurant(restaurantService.findOne(restaurantId));
        for (Photo photo:photos) {
            //photo.setName(photo.getName().replace("src/main/webapp/", "http://localhost:8080/"));
            photo.setName(photo.getName());
        }
        return photos;
    }

    public List<Photo> findPhotoByChain(Long chainId){
        List<Photo> photos = photoRepository.findByChain(chainService.findOne(chainId));
        for (Photo photo:photos) {
            //photo.setName(photo.getName().replace("src/main/webapp/", "http://localhost:8080/"));
            photo.setName(photo.getName());
        }
        return photos;
    }

    public Photo findOne(Long id) {
        return photoRepository.findOne(id);
    }

    public void delete(Long id) {
        photoRepository.delete(id);
    }
}
