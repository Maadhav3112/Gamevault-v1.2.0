package com.gamevault.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Product
 * --------
 * JPA entity representing a single item in the GameVault catalog (a
 * console, controller, or accessory), persisted in the "products" table
 * of a PostgreSQL database. Jackson serializes instances of this class
 * directly to JSON for the REST API responses, and the field names here
 * intentionally match what the frontend (app.js) expects.
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    private String id;

    private String name;
    private String brand;
    private String category;   // Consoles | Controllers | Handheld | Accessories
    private String platform;   // PlayStation | Xbox | Nintendo | PC | Multi-platform
    private String storage;    // e.g. "825GB", "1TB", "512GB", "N/A"
    private String color;      // e.g. "Midnight Black", "White", "N/A"
    private double price;
    private double rating;     // 0.0 - 5.0
    private int stock;         // units available

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 2000)
    private String description;

    public Product() {
        // Default constructor required for Jackson deserialization
    }

    public Product(String id, String name, String brand, String category, String platform,
                    String storage, String color, double price, double rating, int stock,
                    String imageUrl, String description) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.platform = platform;
        this.storage = storage;
        this.color = color;
        this.price = price;
        this.rating = rating;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.description = description;
    }

    // ---- Getters & Setters ----

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getStorage() {
        return storage;
    }

    public void setStorage(String storage) {
        this.storage = storage;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Convenience helper used by the controller's search filter.
     * Checks whether the given (already-lowercased) query term appears in
     * the name, brand, platform, or category of this product.
     */
    public boolean matchesSearch(String lowerCaseQuery) {
        return name.toLowerCase().contains(lowerCaseQuery)
                || brand.toLowerCase().contains(lowerCaseQuery)
                || platform.toLowerCase().contains(lowerCaseQuery)
                || category.toLowerCase().contains(lowerCaseQuery);
    }
}
