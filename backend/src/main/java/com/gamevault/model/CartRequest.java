package com.gamevault.model;

import java.util.List;

/**
 * CartRequest
 * ------------
 * Deserialized body of a POST /api/cart request:
 * { "items": [ { "productId": "PS5-001", "quantity": 1 }, ... ] }
 */
public class CartRequest {

    private List<CartItem> items;

    public CartRequest() {
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }
}
