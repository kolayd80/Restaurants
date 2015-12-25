package com.restaurant;

import com.restaurant.controller.RestaurantController;
import com.restaurant.domain.Restaurant;
import com.restaurant.repository.RestaurantRepository;
import com.restaurant.service.RestaurantService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = RestaurantApplication.class)
@WebAppConfiguration
@IntegrationTest
public class RestaurantResource {

    private static final String DEFAULT_NAME = "SAMPLE_NAME";
    private static final String UPDATED_NAME = "UPDATED_NAME";

    private static final Double DEFAULT_LAT = 51.503551808354025;
    private static final Double UPDATED_LAT = 48.854616497770216;

    private static final Double DEFAULT_LONG = -0.1440071314573288;
    private static final Double UPDATED_LONG = 2.348754443228245;

    private static final String DEFAULT_LOCALITY_NAME = "London";
    private static final String UPDATED_LOCALITY_NAME = "Paris";

    @Inject
    private RestaurantRepository restaurantRepository;

    @Inject
    private RestaurantService restaurantService;

    private Restaurant restaurant;

    private MockMvc restRestaurantMockMvc;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        RestaurantController restaurantController = new RestaurantController();
        ReflectionTestUtils.setField(restaurantController, "restaurantService", restaurantService);
        this.restRestaurantMockMvc = MockMvcBuilders.standaloneSetup(restaurantController).build();
    }

    @Before
    public void initTest() {
        restaurant = new Restaurant();
        restaurant.setName(DEFAULT_NAME);
        restaurant.setLatitude(DEFAULT_LAT);
        restaurant.setLongitude(DEFAULT_LONG);
    }

    @Test
    @Transactional
    public void createRestaurant() throws Exception {
        int databaseSizeBeforeCreate = restaurantRepository.findAll().size();

        // Create the Restaurant
        restRestaurantMockMvc.perform(post("/api/restaurants")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(restaurant)))
                .andExpect(status().isCreated());

        // Validate the Restaurant in the database
        List<Restaurant> restaurants = restaurantRepository.findAllOrderById();
        assertThat(restaurants).hasSize(databaseSizeBeforeCreate + 1);
        Restaurant testRestaurant = restaurants.get(restaurants.size() - 1);
        assertThat(testRestaurant.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testRestaurant.getLatitude()).isEqualTo(DEFAULT_LAT);
        assertThat(testRestaurant.getLongitude()).isEqualTo(DEFAULT_LONG);
        assertThat(testRestaurant.getLocality().getName()).isEqualTo(DEFAULT_LOCALITY_NAME);
    }

    @Test
    @Transactional
    public void getAllRestaurants() throws Exception {
        // Initialize the database
        restaurantRepository.saveAndFlush(restaurant);

        // Get all the authors
        restRestaurantMockMvc.perform(get("/api/restaurants"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(restaurant.getId().intValue())))
                .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
    }

    @Test
    @Transactional
    public void getRestaurant() throws Exception {
        // Initialize the database
        restaurantRepository.saveAndFlush(restaurant);

        // Get the restaurant
        restRestaurantMockMvc.perform(get("/api/restaurants/{id}", restaurant.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(restaurant.getId().intValue()))
                .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingRestaurant() throws Exception {
        // Get the restaurant
        restRestaurantMockMvc.perform(get("/api/restaurants/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateRestaurant() throws Exception {
        // Initialize the database
        restaurantRepository.saveAndFlush(restaurant);

        int databaseSizeBeforeUpdate = restaurantRepository.findAll().size();

        // Update the restaurant
        restaurant.setName(UPDATED_NAME);
        restaurant.setLatitude(UPDATED_LAT);
        restaurant.setLongitude(UPDATED_LONG);
        restRestaurantMockMvc.perform(put("/api/restaurants/{id}", restaurant.getId())
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(restaurant)))
                .andExpect(status().isOk());

        // Validate the Restaurant in the database
        List<Restaurant> restaurants = restaurantRepository.findAll();
        assertThat(restaurants).hasSize(databaseSizeBeforeUpdate);
        Restaurant testRestaurant = restaurantService.findOne(restaurant.getId());
        assertThat(testRestaurant.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testRestaurant.getLatitude()).isEqualTo(UPDATED_LAT);
        assertThat(testRestaurant.getLongitude()).isEqualTo(UPDATED_LONG);
        assertThat(testRestaurant.getLocality().getName()).contains(UPDATED_LOCALITY_NAME);
    }

    @Test
    @Transactional
    public void deleteRestaurant() throws Exception {
        // Initialize the database
        restaurantRepository.saveAndFlush(restaurant);

        int databaseSizeBeforeDelete = restaurantRepository.findAll().size();

        // Get the author
        restRestaurantMockMvc.perform(delete("/api/restaurants/{id}", restaurant.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Restaurant> authors = restaurantRepository.findAll();
        assertThat(authors).hasSize(databaseSizeBeforeDelete - 1);
    }


}
