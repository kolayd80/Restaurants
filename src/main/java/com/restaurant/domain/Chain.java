package com.restaurant.domain;




import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "chain")
public class Chain implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @OneToOne(mappedBy = "chain", cascade = CascadeType.ALL)
    private Review review;

    @OneToOne(mappedBy = "chain", cascade = CascadeType.ALL)
    private Rating rating;

    @OneToMany(mappedBy = "chain", cascade = CascadeType.ALL)
    private Set<Photo> photos = new HashSet<>();

    @OneToMany(mappedBy = "chain", cascade = CascadeType.ALL)
    private Set<Label> labels = new HashSet<>();

    @OneToMany(mappedBy = "chain", cascade = CascadeType.ALL)
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

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public Review getReview() {
        return review;
    }

    public void setReview(Review review) {
        this.review = review;
    }

    public Rating getRating() {
        return rating;
    }

    public void setRating(Rating rating) {
        this.rating = rating;
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

    public Set<Restaurant> getRestaurants() {
        return restaurants;
    }

    public void setRestaurants(Set<Restaurant> restaurants) {
        this.restaurants = restaurants;
    }

}
