package com.gamevault.model;

/**
 * CartResponse
 * -------------
 * Simple acknowledgement payload returned by POST /api/cart.
 * { "status": "success", "message": "Cart received successfully" }
 */
public class CartResponse {

    private String status;
    private String message;

    public CartResponse() {
    }

    public CartResponse(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
