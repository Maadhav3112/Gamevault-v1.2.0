# GameVault — Gaming E-Commerce Product Catalog

A full-stack demo storefront: a Spring Boot REST API backing a vanilla
HTML/CSS/JS dark-themed gaming marketplace.

## Project Structure

```
gamevault/
├── backend/                          Spring Boot API (Maven project)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/gamevault/
│       │   ├── GameVaultApplication.java
│       │   ├── config/CorsConfig.java, DataSeeder.java
│       │   ├── model/Product.java, CartItem.java, CartRequest.java, CartResponse.java
│       │   ├── repository/ProductRepository.java
│       │   └── controller/ProductController.java
│       └── resources/application.properties
└── frontend/                         Static site (no build step)
    ├── index.html
    ├── styles.css
    └── app.js
```

## Database setup (PostgreSQL)

The backend now persists products in a real PostgreSQL `products` table via Spring Data JPA, instead of an in-memory list. You need a running PostgreSQL server before starting the backend.

1. **Create the database** (once):
   ```bash
   createdb gamevault
   # or, from the psql prompt:
   # CREATE DATABASE gamevault;
   ```

2. **Point the app at your server.** Defaults in `application.properties` assume `localhost:5432`, database `gamevault`, user/password `postgres`/`postgres`. Override with environment variables if yours differ:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=gamevault
   export DB_USERNAME=your_username
   export DB_PASSWORD=your_password
   ```

3. **First run seeds the table automatically.** `DataSeeder` checks whether `products` is empty on startup and, if so, inserts the 14 demo products. Hibernate creates the table itself (`spring.jpa.hibernate.ddl-auto=update`), so there's no schema file to run by hand. Subsequent restarts skip seeding and keep whatever's already in the table.

## Running the backend

Requires Java 17+, Maven, and a running PostgreSQL server (see above).

For local development, run it directly — this uses the embedded Tomcat and behaves exactly like before:

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. Verify with:

```bash
curl http://localhost:8080/api/products
```

### Deploying as a WAR to an external Tomcat

This project packages as a `.war` (see `pom.xml`) rather than an executable jar, so it can be dropped into an existing Tomcat's `webapps/` folder:

```bash
cd backend
mvn clean package
# produces target/gamevault-backend.war
cp target/gamevault-backend.war $CATALINA_HOME/webapps/
```

Tomcat will deploy it under the context path `/gamevault-backend` (matching the WAR's filename), so the API would be reachable at `http://your-host:8080/gamevault-backend/api/products`. Update `API_BASE_URL` in `frontend/app.js` to match if you deploy this way instead of running it locally.

### Endpoints

| Method | Path                          | Notes                                                        |
|--------|-------------------------------|----------------------------------------------------------------|
| GET    | `/api/products`               | Optional query params: `category`, `brand`, `platform`, `search`, `sort` (`priceAsc`, `priceDesc`, `rating`, `newest`, `bestSelling`) |
| GET    | `/api/products/{id}`          | Single product lookup, 404 if not found                       |
| POST   | `/api/cart`                   | Body: `{ "items": [{ "productId": "PS5-001", "quantity": 1 }] }` |

CORS is open (`CorsConfig.java`) so the static frontend can call the API from any origin/port during local development.

## Running the frontend

The frontend is plain static files — no build tooling needed. Easiest options:

1. **Open directly**: double-click `frontend/index.html`.
2. **Or serve it** (recommended, avoids some browsers' `file://` quirks):
   ```bash
   cd frontend
   python3 -m http.server 5500
   ```
   Then visit **http://localhost:5500**.

Make sure the backend is running on port 8080 first — `app.js` points at
`http://localhost:8080/api` via the `API_BASE_URL` constant at the top of the
file. Change that constant if you deploy the API elsewhere.

## Notes

- Products are persisted in a PostgreSQL `products` table via Spring Data JPA — data now survives restarts. `DataSeeder` only seeds an empty table, so it won't duplicate rows on subsequent runs.
- `spring.jpa.hibernate.ddl-auto=update` is convenient for this demo but not ideal for a real production app — once your schema is stable, switch to `validate` and manage schema changes with a migration tool like Flyway instead.
- Product images use placeholder URLs (`placehold.co`) styled with the app's color palette; swap in real image URLs for production use.
- The storage/color "variant" dropdowns on product cards are a cosmetic UI convenience (the backend model stores one storage/color value per product); wire them to real variant inventory if you extend this into a production catalog.
