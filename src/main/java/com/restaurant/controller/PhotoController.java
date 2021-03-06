package com.restaurant.controller;

import com.cloudinary.Singleton;
import com.cloudinary.utils.ObjectUtils;
import com.restaurant.controller.util.HeaderUtil;
import com.restaurant.domain.Photo;
import com.restaurant.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/photo")
public class PhotoController {

    @Autowired
    private PhotoService photoService;

    @RequestMapping(value = "/restaurant/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Photo> getRestaurantPhoto(@PathVariable Long id){
        return photoService.findPhoto(id);
    }

    @RequestMapping(value = "/chain/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Photo> getChainPhoto(@PathVariable Long id){
        return photoService.findPhotoByChain(id);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value="/upload", method=RequestMethod.POST)
    public void handleFileUpload(@RequestParam("file") MultipartFile file,
                                                 @RequestParam("idRestaurant") Long restaurantId) throws IOException {


        Map uploadResult = Singleton.getCloudinary().uploader().upload(file.getBytes(),
                ObjectUtils.asMap("resource_type", "auto"));
        photoService.save(restaurantId, (String) uploadResult.get("url"));

//        String name = "src/main/webapp/photo/";
//        UUID fileUuid = UUID.randomUUID();
//        name = name+fileUuid+".jpg";
//        if (!file.isEmpty()) {
//            try {
//                byte[] bytes = file.getBytes();
//                BufferedOutputStream stream =
//                        new BufferedOutputStream(new FileOutputStream(new File(name)));
//                stream.write(bytes);
//                stream.close();
//
//                photoService.save(restaurantId, name);
//
//            } catch (Exception e) {
//                //return "You failed to upload " + name + " => " + e.getMessage();
//            }
//        } else {
//            //return "You failed to upload " + name + " because the file was empty.";
//        }
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value="/chain/upload", method=RequestMethod.POST)
    public void handleFileUploadForChain(@RequestParam("file") MultipartFile file,
                                 @RequestParam("idChain") Long chainId) throws IOException {


        Map uploadResult = Singleton.getCloudinary().uploader().upload(file.getBytes(),
                ObjectUtils.asMap("resource_type", "auto"));
        photoService.save(chainId, (String) uploadResult.get("url"));

//        String name = "src/main/webapp/photo/";
//        UUID fileUuid = UUID.randomUUID();
//        name = name+fileUuid+".jpg";
//        if (!file.isEmpty()) {
//            try {
//                byte[] bytes = file.getBytes();
//                BufferedOutputStream stream =
//                        new BufferedOutputStream(new FileOutputStream(new File(name)));
//                stream.write(bytes);
//                stream.close();
//
//                photoService.saveForChain(chainId, name);
//
//            } catch (Exception e) {
//                //return "You failed to upload " + name + " => " + e.getMessage();
//            }
//        } else {
//            //return "You failed to upload " + name + " because the file was empty.";
//        }
    }

    /**
     * DELETE  /restaurants/:id -> delete the "id" restaurant.
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @RequestMapping(value = "/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> deletePhoto(@PathVariable Long id) {
        photoService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("photo", id.toString())).build();
    }

}
