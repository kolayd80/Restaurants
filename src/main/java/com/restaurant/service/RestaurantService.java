package com.restaurant.service;


import com.restaurant.domain.*;
import com.restaurant.repository.RestaurantRepository;
import com.restaurant.service.util.JsonReader;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.io.IOException;


import org.json.JSONException;
import org.json.JSONObject;

import com.google.common.collect.Maps;

/**
 * Created by Nikolay on 09.10.2015.
 */
@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private AddressService addressService;

    @Autowired
    private ReviewService reviewService;

    public Restaurant save(Restaurant restaurant) {

        if (restaurant.getLatitude() != null) {
            try {
                geoDecoding(restaurant);
            } catch (IOException e) {
                e.printStackTrace();
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        Chain oldChain = null;
        if (restaurant.getId()!=null) {
            oldChain = restaurantRepository.findOne(restaurant.getId()).getChain();
        }

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);

        if (oldChain!=null) {
            reviewService.setRatingForChain(oldChain);
        }

        return savedRestaurant;
    }

    public List<Restaurant> findAll() {
        return restaurantRepository.findAll();
    }

    public List<Restaurant> findAllOrderById() {
        return restaurantRepository.findAllOrderById();
    }

    public List<Restaurant> findByChain(Chain chain) {
        return restaurantRepository.findByChain(chain);
    }

    public List<Restaurant> findByCity(String countryName, String localityName) {
        Country country = addressService.findCountryByName(countryName);
        if (country != null) {
            Locality locality = addressService.findLocalityByName(localityName, country);
            if (locality != null) {
                return restaurantRepository.findByLocality(locality);
            }
        }
        return restaurantRepository.findAll();
    }

    public List<Restaurant> findOrderByTotalratingDesc() {
        return restaurantRepository.findAll();
        //return restaurantRepository.findByOrderByTotalratingDesc();
    }

    public Restaurant findOne(Long id) {
        return restaurantRepository.findOne(id);
    }

    public void delete(Long id) {

        Chain oldChain = null;
        oldChain = restaurantRepository.findOne(id).getChain();

        restaurantRepository.delete(id);

        if (oldChain!=null) {
            reviewService.setRatingForChain(oldChain);
        }
    }

    public void savePreview(Long id, String name) {
        Restaurant restaurant = restaurantRepository.findOne(id);
        restaurant.setPreviewImage(name.replace("src/main/webapp/", "http://localhost:8080/"));
        restaurantRepository.save(restaurant);
    }

    public void geoDecoding(Restaurant restaurant) throws IOException, JSONException {
        final String baseUrl = "http://maps.googleapis.com/maps/api/geocode/json";
        final Map<String, String> params = Maps.newHashMap();
        params.put("language", "en");
        params.put("sensor", "false");
        params.put("latlng", restaurant.getLatitude().toString()+","+restaurant.getLongitude().toString());
        final String url = baseUrl + '?' + AbstractGeo.encodeParams(params);
        final JSONObject response = JsonReader.read(url);
        final JSONObject location = response.getJSONArray("results").getJSONObject(0);
        restaurant.setAddress(location.getString("formatted_address"));

        final JSONArray addressComponents = location.getJSONArray("address_components");

        for (int numComponent=0; numComponent<addressComponents.length(); numComponent++) {
            JSONObject addressComponent = addressComponents.getJSONObject(addressComponents.length() - numComponent - 1);
            if (addressComponent.getString("types").indexOf("street_number")>0) {
                restaurant.setStreetAddress(addressComponent.getString("short_name"));
            } else if (addressComponent.getString("types").indexOf("route")>0) {
                String locationStreet = addressComponent.getString("short_name");
                Street street = addressService.findStreetByName(locationStreet, restaurant.getSublocality());
                if (street==null) {
                    restaurant.setStreet(addressService.saveStreet(locationStreet, restaurant.getSublocality()));
                } else {
                    restaurant.setStreet(street);
                }
            } else if (addressComponent.getString("types").indexOf("sublocality")>0) {
                String locationSublocality = addressComponent.getString("short_name");
                Sublocality sublocality = addressService.findSublocalityByName(locationSublocality, restaurant.getLocality());
                if (sublocality==null) {
                    restaurant.setSublocality(addressService.saveSublocality(locationSublocality, restaurant.getLocality()));
                } else {
                    restaurant.setSublocality(sublocality);
                }
            } else if (addressComponent.getString("types").indexOf("locality")>0) {
                String locationLocality = addressComponent.getString("short_name");
                Locality locality = addressService.findLocalityByName(locationLocality, restaurant.getCountry());
                if (locality==null) {
                    restaurant.setLocality(addressService.saveLocality(locationLocality, restaurant.getCountry()));
                } else {
                    restaurant.setLocality(locality);
                }
            } else if (addressComponent.getString("types").indexOf("country")>0) {
                String locationCountry = addressComponent.getString("long_name");
                Country country = addressService.findCountryByName(locationCountry);
                if (country==null) {
                    restaurant.setCountry(addressService.saveCountry(locationCountry));
                } else {
                    restaurant.setCountry(country);
                }
            }
        }
    }

}
