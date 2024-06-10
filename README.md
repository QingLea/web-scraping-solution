# Project Structure

This solution consists of two components: the frontend and the backend. Given the expected limited usage, potentially by a single user, the structure is not overly complex. The primary aim is to design a simple and efficient data flow. The frontend handles the user interface (UI), user experience (UX), and backend API requests. The backend scrapes data from the website, organizes it, and stores it in the database for search functionalities.

## Backend

The primary component is the backend. I've designed the scraper as a separate module and encapsulated it into a scraping class. This approach ensures proper control and is considered a good practice. All models are located in the common module because the scraper, the user, and search modules require them. The scraper, user, and search app all provide web endpoints. These will be thoroughly described in the API document.

## Frontend

The frontend, a single-page application, is mainly focusing on controlling how backend works. It includes user profile, scraping control, and product searching modules.

The user profile module offers services such as user authentication, registration, and profile management. Given the limited requirements, it has a simple design. The module includes four functionalities: login, logout, signup, and profile management. The profile management page only allows users to update passwords, as per the requirements. All functionalities are implemented using the RESTful API provided by the backend project.

Technically, I've broken down a large page into smaller components, as you can see from the folder tree. I believe this approach makes it easier to reuse and manage components across pages.

## Docker

I've implemented two Dockerfiles: one for the backend and one for the frontend. While they can be deployed independently, I recommend using docker-compose for a more streamlined system deployment using a single command. I have also prepared a docker-compose file, which includes not only the configurations for the backend/frontend service containers but also for the database service container. However, the services are not heavily dependent on Docker. I have set all the necessary environment variables and their default values. This means you can start each server directly with the proper settings. I also believe it's good practice to have code that can run both in development and production environments without requiring extensive manual settings. In addition to these, I've used `pnpm` to reduce the frontend’s image size, which is also a crucial aspect of performance.

## How to run

This project uses Django for the backend, PostgreSQL for data storage, and Next.js for the user interface. Additionally, Docker is utilized for containerization to fulfill project requirements.

### Start

```bash
# Start containers with building process
docker-compose up --build
```

### Shutdown

You can easily shut down processes gracefully in the terminal using Ctrl+C.



# Database Design

### 1. common_category

This table stores the categories of products.

- **Attributes**:
    - `id`: integer, primary key
    - `name`: varchar(255), not null
    - `slug`: varchar(255), not null

### 2. common_subcategory

This table stores the subcategories of products, which are linked to the categories.

- **Attributes**:
    - `id`: integer, primary key
    - `name`: varchar(255), not null
    - `category_id`: integer, foreign key (references `common_category(id)`)

### 3. common_store

This table stores information about different stores.

- **Attributes**:
    - `id`: varchar(50), primary key

### 4. common_product

This table stores detailed information about products, including their pricing, categorization, and association with stores.

- **Attributes**:
    - `id`: varchar(50), primary key
    - `name`: varchar(255), not null
    - `price`: numeric(10,2), not null
    - `comparison_price`: numeric(10,2), nullable
    - `comparison_unit`: varchar(50), nullable
    - `currency`: varchar(10), not null
    - `image`: varchar(255), nullable
    - `created`: timestamp with time zone, not null
    - `updated`: timestamp with time zone, not null
    - `category_id`: integer, foreign key (references `common_category(id)`)
    - `sub_category_id`: integer, foreign key (references `common_subcategory(id)`)
    - `store_id`: varchar(50), foreign key (references `common_store(id)`)

## Relationships

1. **Category to Subcategory**:
    - One-to-Many: One category can have multiple subcategories.
    - The `category_id` in `common_subcategory` references the `id` in `common_category`.
2. **Subcategory to Product**:
    - One-to-Many: One subcategory can have multiple products.
    - The `sub_category_id` in `common_product` references the `id` in `common_subcategory`.
3. **Category to Product**:
    - One-to-Many: One category can have multiple products.
    - The `category_id` in `common_product` references the `id` in `common_category`.
4. **Store to Product**:
    - One-to-Many: One store can have multiple products.
    - The `store_id` in `common_product` references the `id` in `common_store`.