package com.gamevault.model;

/**
 * CartItem
 * ---------
 * Represents a single line item sent by the frontend when the user
 * checks out, e.g. { "productId": "PS5-001", "quantity": 1 }.
 */
public class CartItem {

    private String productId;
    private int quantity;

    public CartItem() {
    }

    public CartItem(String productId, int quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
