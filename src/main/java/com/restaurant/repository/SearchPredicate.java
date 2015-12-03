package com.restaurant.repository;


import com.mysema.query.types.expr.BooleanExpression;
import com.mysema.query.types.path.NumberPath;
import com.mysema.query.types.path.PathBuilder;
import com.mysema.query.types.path.StringPath;
import com.restaurant.domain.QReview;
import com.restaurant.domain.Review;

public class SearchPredicate {

    private SearchCriteria criteria;

    public SearchPredicate() {

    }

    public SearchPredicate(final SearchCriteria criteria) {
        this.criteria = criteria;
    }

    public BooleanExpression getPredicate() {

        final PathBuilder<Review> entityPath = new PathBuilder<Review>(Review.class, "review");

        if (criteria.getKey().equals("country")) {
            final Long value = Long.parseLong(criteria.getValue().toString());
            BooleanExpression str = QReview.review.restaurant.country.id.eq(value);
            return str;
        } else if (criteria.getKey().equals("locality")) {
            final Long value = Long.parseLong(criteria.getValue().toString());
            BooleanExpression str = QReview.review.restaurant.locality.id.eq(value);
            return str;
        } else if (criteria.getKey().equals("sublocality")) {
            final Long value = Long.parseLong(criteria.getValue().toString());
            BooleanExpression str = QReview.review.restaurant.sublocality.id.eq(value);
            return str;
        } else if (criteria.getKey().equals("street")) {
            final Long value = Long.parseLong(criteria.getValue().toString());
            BooleanExpression str = QReview.review.restaurant.street.id.eq(value);
            return str;
        } else if (isNumeric(criteria.getValue().toString())) {

            final NumberPath<Integer> path = entityPath.getNumber(criteria.getKey(), Integer.class);
            final int value = Integer.parseInt(criteria.getValue().toString());
            if (criteria.getOperation().equalsIgnoreCase(":")) {
                return path.eq(value);
            } else if (criteria.getOperation().equalsIgnoreCase(">")) {
                return path.goe(value);
            } else if (criteria.getOperation().equalsIgnoreCase("<")) {
                return path.loe(value);
            }

        } else {
            final StringPath path = entityPath.getString(criteria.getKey());
            if (criteria.getOperation().equalsIgnoreCase(":")) {
                return path.containsIgnoreCase(criteria.getValue().toString());
            }
        }
        return null;
    }

    public SearchCriteria getCriteria() {
        return criteria;
    }

    public void setCriteria(final SearchCriteria criteria) {
        this.criteria = criteria;
    }

    public static boolean isNumeric(final String str) {
        try {
            Integer.parseInt(str);
        } catch (final NumberFormatException e) {
            return false;
        }
        return true;
    }

}
