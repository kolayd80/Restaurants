package com.restaurant.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * A Restaurant.
 */
@Entity
@Table(name = "restaurant")
public class Restaurant implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "review", length=1000)
    private String review;

    @Column(name = "label")
    private String label;

    @NotNull        
    @Column(name = "kitchenrating", nullable = false)
    private Integer kitchenrating;

    @NotNull        
    @Column(name = "interiorrating", nullable = false)
    private Integer interiorrating;

    @NotNull        
    @Column(name = "servicerating", nullable = false)
    private Integer servicerating;
    
    @Column(name = "totalrating")
    private Double totalrating;
    
    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;

    @OneToMany(mappedBy = "restaurant")
    @JsonIgnore
    private Set<Photo> photos = new HashSet<>();

    @OneToMany(mappedBy = "restaurant")
    @JsonIgnore
    private Set<Label> labels = new HashSet<>();

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

    public String getReview() {
        return review;
    }

    public void setReview(String review) {
        this.review = review;
    }

    public Integer getKitchenrating() {
        return kitchenrating;
    }

    public void setKitchenrating(Integer kitchenrating) {
        this.kitchenrating = kitchenrating;
    }

    public Integer getInteriorrating() {
        return interiorrating;
    }

    public void setInteriorrating(Integer interiorrating) {
        this.interiorrating = interiorrating;
    }

    public Integer getServicerating() {
        return servicerating;
    }

    public void setServicerating(Integer servicerating) {
        this.servicerating = servicerating;
    }

    public Double getTotalrating() {
        return totalrating;
    }

    public void setTotalrating(Double totalrating) {
        this.totalrating = totalrating;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Set<Photo> getPhotos() {
        return photos;
    }

    public void setPhotos(Set<Photo> photos) {
        this.photos = photos;
    }

    public Set<Label> getLabels() {
        return labels;
    }

    public void setLabels(Set<Label> labels) {
        this.labels = labels;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }



    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Restaurant restaurant = (Restaurant) o;

        if ( ! Objects.equals(id, restaurant.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Restaurant{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", review='" + review + "'" +
                ", label='" + label + "'" +
                ", kitchenrating='" + kitchenrating + "'" +
                ", interiorrating='" + interiorrating + "'" +
                ", servicerating='" + servicerating + "'" +
                ", totalrating='" + totalrating + "'" +
                ", latitude='" + latitude + "'" +
                ", longitude='" + longitude + "'" +
                '}';
    }

    Restaurant(){

    }

    public Restaurant(String name, String review, String label, Integer kitchenrating, Integer interiorrating, Integer servicerating, Double totalrating, Double latitude, Double longitude) {
        this.name = name;
        this.review = review;
        this.label = label;
        this.kitchenrating = kitchenrating;
        this.interiorrating = interiorrating;
        this.servicerating = servicerating;
        this.totalrating = totalrating;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
