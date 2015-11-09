package com.restaurant.domain;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "locality")
public class Locality {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "name")
    private String name;

    @ManyToOne
    private Country country;

    @OneToMany(mappedBy = "locality", cascade = CascadeType.ALL)
    private Set<Sublocality> sublocalities = new HashSet<>();

    @OneToMany(mappedBy = "locality")
    private Set<Restaurant> restaurants = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Country getCountry() {
        return country;
    }

    public void setCountry(Country country) {
        this.country = country;
    }

    public Set<Sublocality> getSublocalities() {
        return sublocalities;
    }

    public void setSublocalities(Set<Sublocality> sublocalities) {
        this.sublocalities = sublocalities;
    }

    public Set<Restaurant> getRestaurants() {
        return restaurants;
    }

    public void setRestaurants(Set<Restaurant> restaurants) {
        this.restaurants = restaurants;
    }

}
