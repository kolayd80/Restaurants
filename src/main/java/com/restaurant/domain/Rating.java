package com.restaurant.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "rating")
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type")
    private ReviewType reviewType;

    @OneToOne
    private Restaurant restaurant;

    @OneToOne
    private Chain chain;

    @Column(name = "kitchen")
    private Integer kitchen;

    @Column(name = "interior")
    private Integer interior;

    @Column(name = "service")
    private Integer service;

    @Column(name = "kitchen_chain")
    private Double kitchenChain;

    @Column(name = "interior_chain")
    private Double interiorChain;

    @Column(name = "service_chain")
    private Double serviceChain;

    @Column(name = "total")
    private Double total;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getKitchen() {
        return kitchen;
    }

    public void setKitchen(Integer kitchen) {
        this.kitchen = kitchen;
    }

    public Integer getInterior() {
        return interior;
    }

    public void setInterior(Integer interior) {
        this.interior = interior;
    }

    public Integer getService() {
        return service;
    }

    public void setService(Integer service) {
        this.service = service;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public Double getKitchenChain() {
        return kitchenChain;
    }

    public void setKitchenChain(Double kitchenChain) {
        this.kitchenChain = kitchenChain;
    }

    public Double getInteriorChain() {
        return interiorChain;
    }

    public void setInteriorChain(Double interiorChain) {
        this.interiorChain = interiorChain;
    }

    public Double getServiceChain() {
        return serviceChain;
    }

    public void setServiceChain(Double serviceChain) {
        this.serviceChain = serviceChain;
    }
}
