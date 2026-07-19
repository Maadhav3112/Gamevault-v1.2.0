package com.gamevault.repository;

import com.gamevault.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * ProductRepository
 * -------------------
 * Spring Data JPA repository backing the "products" table in PostgreSQL.
 * Extending JpaRepository gives us findAll(), findById(), save(),
 * count(), deleteById(), etc. for free — no SQL to write by hand.
 *
 * Category/brand/platform/search/sort filtering is still applied in
 * ProductController after fetching, which keeps the filter logic in one
 * place and easy to follow at this catalog's size. If the catalog grows
 * much larger, that filtering could move into derived query methods or
 * JPA Specifications here instead.
 */
public interface ProductRepository extends JpaRepository<Product, String> {
}
