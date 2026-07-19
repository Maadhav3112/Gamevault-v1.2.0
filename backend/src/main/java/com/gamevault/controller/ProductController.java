package com.gamevault.controller;

import com.gamevault.model.CartRequest;
import com.gamevault.model.CartResponse;
import com.gamevault.model.Product;
import com.gamevault.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ProductController
 * -------------------
 * REST controller exposing the GameVault product catalog and a mock
 * checkout endpoint. Products are persisted in a PostgreSQL "products"
 * table via {@link ProductRepository} (Spring Data JPA); the table is
 * seeded once on first startup by {@code DataSeeder}.
 *
 * Endpoints:
 *   GET  /api/products              -> list, with optional query params:
 *                                       category, brand, platform, search, sort
 *   GET  /api/products/{id}         -> single product lookup
 *   POST /api/cart                  -> mock checkout acknowledgement
 */
@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ------------------------------------------------------------------
    // GET /api/products
    // ------------------------------------------------------------------
    @GetMapping("/products")
    public List<Product> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort) {

        List<Product> result = new ArrayList<>(productRepository.findAll());

        // ---- Filtering ----
        if (category != null && !category.isBlank()) {
            result = result.stream()
                    .filter(p -> p.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        if (brand != null && !brand.isBlank()) {
            result = result.stream()
                    .filter(p -> p.getBrand().equalsIgnoreCase(brand))
                    .collect(Collectors.toList());
        }

        if (platform != null && !platform.isBlank()) {
            result = result.stream()
                    .filter(p -> p.getPlatform().equalsIgnoreCase(platform))
                    .collect(Collectors.toList());
        }

        // ---- Search (matches name, brand, platform, or category) ----
        if (search != null && !search.isBlank()) {
            String query = search.toLowerCase().trim();
            result = result.stream()
                    .filter(p -> p.matchesSearch(query))
                    .collect(Collectors.toList());
        }

        // ---- Sorting ----
        if (sort != null && !sort.isBlank()) {
            result = applySort(result, sort);
        }

        return result;
    }

    /**
     * Applies the requested sort strategy to a (mutable) copy of the list.
     * Supported values: priceAsc, priceDesc, rating, newest, bestSelling.
     * Unrecognized values are ignored and the original order is preserved.
     */
    private List<Product> applySort(List<Product> list, String sort) {
        Comparator<Product> comparator = switch (sort) {
            case "priceAsc" -> Comparator.comparingDouble(Product::getPrice);
            case "priceDesc" -> Comparator.comparingDouble(Product::getPrice).reversed();
            case "rating" -> Comparator.comparingDouble(Product::getRating).reversed();
            // "Newest" and "bestSelling" have no dedicated backing column in
            // this demo schema, so we fall back to table (insertion) order,
            // which the seed data arranges newest/most popular first.
            case "newest", "bestSelling" -> null;
            default -> null;
        };

        if (comparator != null) {
            list.sort(comparator);
        }
        return list;
    }

    // ------------------------------------------------------------------
    // GET /api/products/{id}
    // ------------------------------------------------------------------
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Optional<Product> match = productRepository.findById(id);

        return match.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ------------------------------------------------------------------
    // POST /api/cart
    // ------------------------------------------------------------------
    @PostMapping("/cart")
    public ResponseEntity<CartResponse> receiveCart(@RequestBody CartRequest cartRequest) {
        if (cartRequest == null || cartRequest.getItems() == null || cartRequest.getItems().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new CartResponse("error", "Cart is empty or malformed"));
        }

        // In a real application this would persist an order, check stock,
        // charge payment, etc. For this demo we simply acknowledge receipt.
        return ResponseEntity.ok(new CartResponse("success", "Cart received successfully"));
    }
}
