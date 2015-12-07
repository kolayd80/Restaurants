package com.restaurant.repository;
import com.mysema.query.types.expr.BooleanExpression;
import com.restaurant.domain.QReview;
import com.restaurant.domain.ReviewType;

import java.util.ArrayList;
import java.util.List;

public class SearchPredicatesBuilder {

    private final List<SearchCriteria> params;

    public SearchPredicatesBuilder() {
        params = new ArrayList<SearchCriteria>();

    }

    public SearchPredicatesBuilder with(final String key, final String operation, final Object value) {
        params.add(new SearchCriteria(key, operation, value));
        return this;
    }

    public BooleanExpression build() {
        /*if (params.size() == 0) {
            return null;
        }*/

        final List<BooleanExpression> predicates = new ArrayList<BooleanExpression>();
        SearchPredicate predicate;
        for (final SearchCriteria param : params) {
            predicate = new SearchPredicate(param);
            final BooleanExpression exp = predicate.getPredicate();
            if (exp != null) {
                predicates.add(exp);
            }
        }

        BooleanExpression result;
        if (predicates.size() == 0) {
            result = QReview.review.forMainRating.eq(true);
        } else {
            result = predicates.get(0);
            for (int i = 1; i < predicates.size(); i++) {
                result = result.and(predicates.get(i));
            }
        }

        return result;
    }



}
