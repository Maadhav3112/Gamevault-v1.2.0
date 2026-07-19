package com.gamevault.config;

import com.gamevault.model.Product;
import com.gamevault.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DataSeeder
 * -----------
 * Runs once on application startup. If the "products" table is empty
 * (e.g. a brand-new database), it populates it with the GameVault demo
 * catalog. On subsequent restarts the table already has rows, so this
 * is a no-op — your data persists across restarts instead of resetting
 * every time, unlike the old in-memory version of this app.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return; // Already seeded — leave existing data alone.
        }

        productRepository.saveAll(List.of(

                // ---- Consoles ----
                new Product(
                        "PS5-001", "PlayStation 5 Slim", "Sony", "Consoles", "PlayStation",
                        "1TB", "N/A", 499.99, 4.8, 42,
                        "https://placehold.co/500x500/1f2937/00A8FF?text=PS5+Slim",
                        "The redesigned PlayStation 5 Slim delivers lightning-fast loading with an ultra-high-speed SSD, haptic feedback, and stunning 4K graphics in a smaller footprint."
                ),
                new Product(
                        "PS5-002", "PlayStation 5 Pro", "Sony", "Consoles", "PlayStation",
                        "2TB", "N/A", 699.99, 4.9, 18,
                        "https://placehold.co/500x500/1f2937/00A8FF?text=PS5+Pro",
                        "The most powerful PlayStation ever built, featuring enhanced ray tracing, higher and more stable frame rates, and AI-driven upscaling."
                ),
                new Product(
                        "XSX-001", "Xbox Series X", "Microsoft", "Consoles", "Xbox",
                        "1TB", "N/A", 499.99, 4.7, 35,
                        "https://placehold.co/500x500/1f2937/7C3AED?text=Xbox+Series+X",
                        "The fastest, most powerful Xbox ever, featuring 12 teraflops of raw graphic processing power for true 4K gaming."
                ),
                new Product(
                        "XSS-001", "Xbox Series S", "Microsoft", "Consoles", "Xbox",
                        "512GB", "N/A", 299.99, 4.5, 60,
                        "https://placehold.co/500x500/1f2937/7C3AED?text=Xbox+Series+S",
                        "The smallest, sleekest Xbox console yet, delivering next-gen speed and performance in an all-digital design."
                ),
                new Product(
                        "NSW-OLED-001", "Nintendo Switch OLED", "Nintendo", "Consoles", "Nintendo",
                        "64GB", "White", 349.99, 4.8, 50,
                        "https://placehold.co/500x500/1f2937/00D084?text=Switch+OLED",
                        "Featuring a vibrant 7-inch OLED screen, a wide adjustable stand, and enhanced audio for handheld and tabletop play."
                ),
                new Product(
                        "NSW2-001", "Nintendo Switch 2", "Nintendo", "Consoles", "Nintendo",
                        "256GB", "Black", 449.99, 4.9, 22,
                        "https://placehold.co/500x500/1f2937/00D084?text=Switch+2",
                        "Nintendo's next-generation hybrid console with a larger display, upgraded performance, and backward compatibility."
                ),
                new Product(
                        "SDK-OLED-001", "Steam Deck OLED", "Valve", "Handheld", "PC",
                        "1TB", "N/A", 549.99, 4.7, 27,
                        "https://placehold.co/500x500/1f2937/00A8FF?text=Steam+Deck+OLED",
                        "A vibrant HDR OLED display, longer battery life, and access to your entire PC gaming library, all in one handheld."
                ),
                new Product(
                        "ROG-ALLY-X-001", "ASUS ROG Ally X", "ASUS", "Handheld", "PC",
                        "1TB", "White", 799.99, 4.6, 15,
                        "https://placehold.co/500x500/1f2937/7C3AED?text=ROG+Ally+X",
                        "A powerful Windows-based handheld gaming PC with extended battery life and a larger memory footprint for demanding titles."
                ),

                // ---- Controllers ----
                new Product(
                        "DS-001", "DualSense Wireless Controller", "Sony", "Controllers", "PlayStation",
                        "N/A", "Midnight Black", 74.99, 4.7, 120,
                        "https://placehold.co/500x500/1f2937/00A8FF?text=DualSense",
                        "Immerse yourself with haptic feedback, dynamic adaptive triggers, and a built-in microphone for the PlayStation 5."
                ),
                new Product(
                        "XWC-001", "Xbox Wireless Controller", "Microsoft", "Controllers", "Xbox",
                        "N/A", "Carbon Black", 59.99, 4.6, 150,
                        "https://placehold.co/500x500/1f2937/7C3AED?text=Xbox+Controller",
                        "Sculpted surfaces and refined ergonomics for a comfortable feel, with Bluetooth support for PC and mobile gaming."
                ),
                new Product(
                        "NSPC-001", "Nintendo Switch Pro Controller", "Nintendo", "Controllers", "Nintendo",
                        "N/A", "Black", 69.99, 4.8, 80,
                        "https://placehold.co/500x500/1f2937/00D084?text=Switch+Pro",
                        "A traditional controller shape with motion controls, HD rumble, and a long-lasting rechargeable battery."
                ),
                new Product(
                        "8BD-ULT-001", "8BitDo Ultimate Controller", "8BitDo", "Controllers", "Multi-platform",
                        "N/A", "White", 49.99, 4.5, 95,
                        "https://placehold.co/500x500/1f2937/00A8FF?text=8BitDo+Ultimate",
                        "A premium wireless controller with hall-effect joysticks, remappable back buttons, and a slick charging dock."
                ),

                // ---- Accessories ----
                new Product(
                        "ACC-DOCK-001", "GameVault Fast-Charge Dual Dock", "GameVault", "Accessories", "Multi-platform",
                        "N/A", "Black", 34.99, 4.4, 200,
                        "https://placehold.co/500x500/1f2937/00D084?text=Charging+Dock",
                        "Charge two wireless controllers simultaneously with LED status indicators and a non-slip base."
                ),
                new Product(
                        "ACC-HEADSET-001", "GameVault Pro Gaming Headset", "GameVault", "Accessories", "Multi-platform",
                        "N/A", "Blue/Black", 89.99, 4.6, 75,
                        "https://placehold.co/500x500/1f2937/7C3AED?text=Gaming+Headset",
                        "7.1 surround sound, a noise-cancelling boom mic, and memory-foam ear cushions for marathon gaming sessions."
                )
        ));
    }
}
