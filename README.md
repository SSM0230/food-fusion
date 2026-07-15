# Food Fusion

Food Fusion is a Spring Boot food-delivery demo application. It includes customer ordering, restaurant owner management, delivery partner workflows, admin controls, coupons, group ordering, chat, reviews, and PDF invoices.

## Project Structure

```text
src/
  main/
    java/com/foodfusion/app/
      config/        Spring MVC setup and demo data seeding
      controller/    REST API endpoints
      dto/           Request payload objects
      entity/        JPA entities
      repository/    Spring Data JPA repositories
      service/       Business logic
    resources/
      static/        Browser UI assets
      application.properties
  test/              Spring Boot tests
```

## Run Locally

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

Then open:

- Landing page: `http://localhost:8080/`
- App: `http://localhost:8080/app`
- H2 console: `http://localhost:8080/h2-console`

## Demo Users

The in-memory H2 database is seeded on startup when empty.

| Role | Username | Password |
| --- | --- | --- |
| Customer | `customer` | `password` |
| Owner | `owner1` | `password` |
| Delivery | `delivery1` | `password` |
| Admin | `admin` | `password` |

## Development Notes

- Generated build output belongs in `target/` and should not be committed.
- IDE folders such as `.idea/` and `.vscode/` are ignored.
- Keep controllers thin, put business rules in services, and use repositories only for persistence access.
