package com.restaurant.domain;



import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.restaurant.domain.util.JSR310DateTimeSerializer;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "review")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "content", length=1000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type")
    private ReviewType reviewType;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "kitchen")
    private Double kitchen;

    @Column(name = "interior")
    private Double interior;

    @Column(name = "service")
    private Double service;

    @Column(name = "total")
    private Double total;

    @Column(name = "for_main_rating")
    private Boolean forMainRating;

    @OneToOne
    private Restaurant restaurant;

    @OneToOne
    private Chain chain;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public ReviewType getReviewType() {
        return reviewType;
    }

    public void setReviewType(ReviewType reviewType) {
        this.reviewType = reviewType;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    public Chain getChain() {
        return chain;
    }

    public void setChain(Chain chain) {
        this.chain = chain;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public Double getKitchen() {
        return kitchen;
    }

    public void setKitchen(Double kitchen) {
        this.kitchen = kitchen;
    }

    public Double getInterior() {
        return interior;
    }

    public void setInterior(Double interior) {
        this.interior = interior;
    }

    public Double getService() {
        return service;
    }

    public void setService(Double service) {
        this.service = service;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public Boolean getForMainRating() {
        return forMainRating;
    }

    public void setForMainRating(Boolean forMainRating) {
        this.forMainRating = forMainRating;
    }
}
