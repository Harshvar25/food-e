# **Technical Retrospective: Full-Stack Dockerization of FoodE**

**Date:** December 22, 2025

**Project Stack:** Spring Boot (Java 21), React, PostgreSQL 17, Nginx

---

## **1. Build Context & Performance**

* **The Problem:** Docker builds were extremely slow (15+ minutes), transferring nearly 400MB of data to the Docker daemon.
* **The Cause:** Docker was including the `node_modules` and `target` folders in the "build context," trying to upload thousands of local dependency files from frontend side.
* **The Solution:** Created a `.dockerignore` file in both frontend and backend directories.
* **Key Learning:** Always exclude local dependencies and build artifacts from the Docker context to keep builds lightweight.

---

## **2. Java Runtime Compatibility**

* **The Problem:** Backend container crashed with `UnsupportedClassVersionError` (Class file version 65.0 vs 61.0).
* **The Cause:** The code was compiled with **JDK 21** locally, but the Docker image was using **JDK 17**.
* **The Solution:** Updated the `Dockerfile` base image to `eclipse-temurin:21-jdk-alpine`.
* **Key Learning:** The Docker JRE version must be equal to or higher than the JDK version used for compilation.

---

## **3. Docker Networking & Service Discovery**

* **The Problem:** Backend logs showed `Connection Refused` at `127.0.0.1:5432`.
* **The Cause:** Inside a container, `localhost` (127.0.0.1) refers to that specific container. It cannot "see" the database container via that address.
* **The Solution:**
  1. Updated `SPRING_DATASOURCE_URL` to use the service name: `jdbc:postgresql://postgres:5432/yum`.
  2. Used **Docker Compose Environment Variables** to override hardcoded properties in the JAR.
* **Key Learning:** Containers communicate using their service names defined in `docker-compose.yml`, which Docker resolves via internal DNS.

---

## **4. Single Page Application (SPA) Routing**

* **The Problem:** The app worked on the home page, but manual refreshes on `/login` or `/signup` resulted in a **404 Not Found** from Nginx.
* **The Cause:** Nginx looked for a physical file named `/login`. In React, routing is client-side; there is no `/login` file on the server.
* **The Solution:** Created a custom `nginx.conf` using the `try_files $uri $uri/ /index.html;` directive.
* **Key Learning:** For SPAs, the web server must be told to redirect all unknown paths to `index.html` so the frontend router can take over.

---

## **5. Database Persistence & Permissions**

* **The Problem:** Postgres crashed with an "18+ configuration" error regarding subdirectory boundaries.
* **The Cause:** Conflict between Windows file system permissions and Linux-based Postgres requirements when using "Bind Mounts" (local folders).
* **The Solution:** Switched to a **Named Volume** (`pgdata`) at the bottom of the `docker-compose.yml`.
* **Key Learning:** Named volumes are managed by Docker and avoid host-OS permission issues, making them more reliable for databases on Windows/macOS.

---

## **6. Cross-Origin Resource Sharing (CORS)**

* **The Problem:** Frontend could display the UI but failed to "fetch" data from the Backend API.
* **The Cause:** The browser blocked the request because the Frontend (port 3000) and Backend (port 8080) are considered different "Origins."
* **The Solution:** Added a `WebConfig` class in Spring Boot with `@Configuration` to explicitly allow `http://localhost:3000`.
* **Key Learning:** Security headers must be explicitly configured in the backend to allow modern frontend frameworks to communicate.

---

## **7. Deployment Workflow (The Golden Rule)**

* **The Problem:** Changes made to Java code were not appearing in the Docker container.
* **The Cause:** `docker compose build` only packages the existing `.jar` file; it does not re-compile your Java code.
* **The Fixed Workflow:**
  1. `./mvnw clean package -DskipTests` (Build the fresh JAR)
  2. `docker compose up --build` (Build the fresh Image and Start)



---