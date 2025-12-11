# Spring Security Flow Documentation for Your Project


---

## 1. **Overall Authentication Flow (High-Level)**

1. The client sends a **login request** with email + password.
2. The backend validates the credentials using:

   * `CustomerDetailsService` → loads the user by email.
   * `PasswordEncoder` → verifies password.
3. If valid, `JWTService` creates a **JWT Token**.
4. Client stores this token and sends it in **Authorization: Bearer <token>** header for all protected API calls.
5. `JWTFilter` intercepts every request:

   * Extracts token.
   * Validates token.
   * Loads user details.
   * Sets authentication in `SecurityContext`.
6. Spring Security now knows the user is authenticated, and the request reaches the Controller.

---

## 2. **SecurityConfig (Spring Security Setup)**

`SecurityConfig` defines all security rules.

### What it does:

* Disables sessions → stateless API.
* Adds custom JWT filter.
* Defines URL access rules.
* Defines authentication provider and `UserDetailsService`.

### Flow:

1. Any request hits the `SecurityFilterChain`.
2. Spring checks:

   * Does URI need authentication?
3. If yes → request is passed to `JWTFilter`.
4. After passing all filters → it reaches the controller.

---

## 3. **CustomerDetailsService (UserDetailsService Implementation)**

Spring Security **requires** a class that implements `UserDetailsService`.

### Its job:

* Load customer using `email`.
* Convert customer into **UserDetails object** (CustomerPrincipal).

### Flow:

1. When login happens, Spring calls:

   ```java
   loadUserByUsername(email)
   ```
2. It fetches the customer from DB.
3. It returns `CustomerPrincipal(customer)` — Spring Security compatible object.

---

## 4. **CustomerPrincipal (Implements UserDetails)**

Spring Security login ONLY works with classes implementing `UserDetails`.

### What it contains:

* email → username
* password
* authorities (roles)

### Why you don’t have to create UserDetails?

Because Spring Security provides the interface — you just create a class that implements it.

### Flow:

1. Login request arrives.
2. Found customer is wrapped inside `CustomerPrincipal`.
3. Spring now treats this as the authenticated user.

---

## 5. **JWTService (JWT Token Generation & Validation)**

### Responsibilities:

* Generate JWT token.
* Extract username/email from token.
* Validate expiry.

### How it works:

* When login succeeds:

  ```java
  String token = jwtService.generateToken(email);
  ```
* The token is returned to the client.

During subsequent requests:

* Token is extracted.
* Email is extracted from token.
* Validated.

---

## 6. **JWTFilter (Validates JWT on Every Request)**

This is the MOST important part.

### Responsibilities:

1. Read Authorization header.
2. Extract Bearer token.
3. Validate token using `JWTService`.
4. Load user using `CustomerDetailsService`.
5. Create authentication object:

   ```java
   UsernamePasswordAuthenticationToken authToken
   ```
6. Set authentication into:

   ```java
   SecurityContextHolder.getContext().setAuthentication(authToken)
   ```

### Flow Explanation:

* `UsernamePasswordAuthenticationToken` contains:

  * UserDetails object
  * roles
  * credentials (null after login)

* Setting this token means:
  "This request is now authenticated as this user."

---

## 7. **Customer Sign-In Flow**

### Steps:

1. User hits API:

   ```http
   POST /customer/signin
   ```

2. You check:

   * is email present?
   * does password match?

3. If yes:

   ```java
   String token = jwtService.generateToken(email);
   ```

4. API returns token to client.

5. Client then sends token in header for all future requests:

   ```http
   Authorization: Bearer <token>
   ```

6. `JWTFilter` checks token and authenticates user.

---

## 8. **Detailed Step-by-Step Flow (End-to-End)**

### **1. Client requests login → `/customer/signin`**

### **2. Controller receives email + password**

### **3. Check email in DB**

### **4. Match hashed password using PasswordEncoder**

### **5. On match → generate JWT**

### **6. Return JWT to client**

### **7. Client uses JWT with each request**

### **8. Every request → JWTFilter runs**

### **9. JWTService validates token**

### **10. CustomerDetailsService loads user**

### **11. SecurityContext stores authenticated user**

### **12. Controller executes as authenticated user**

---

## 9. Understanding the Most Confusing Part

### `UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(...)`

This object tells Spring:

"This request is authenticated with this user."

### Why `SecurityContextHolder`?

Because Spring Security keeps authentication information there.

Every protected controller call checks:

```java
SecurityContextHolder.getContext().getAuthentication()
```

If NOT null → user is logged in.

---

## 10. Why You Don’t Need to Create UserDetails Class Manually

You **do** create it, but you do not create internal Spring classes.

Your class:

```java
public class CustomerPrincipal implements UserDetails
```

converts your database entity into an object that Spring Security can understand.

Spring Security handles the rest.

---

## 11. Where to Place Each File (Recommended Structure)

```
com.yum.foodyy
│
├── config
│   └── SecurityConfig.java
│
├── jwt
│   ├── JWTService.java
│   └── JWTFilter.java
│
├── customer
│   ├── CustomerInfo.java
│   ├── CustomerRepository.java
│   ├── CustomerDetailsService.java
│   └── CustomerPrincipal.java
│
├── controller
│   └── CustomerAuthController.java
```

---

## 12. Final Summary

Your Spring Security is based on:

### **Login: Controller → DB → Password Match → JWTService → Token Returned**

### **Requests: JWTFilter → JWTService → CustomerDetailsService → SecurityContext → Controller**

Each component has a clear purpose:

* **SecurityConfig** → Rules + Filter Setup
* **JWTService** → Token Creation + Validation
* **JWTFilter** → Validates Auth On Every Request
* **CustomerDetailsService** → Fetch customer from DB
* **CustomerPrincipal** → Wrap customer into UserDetails
* **Customer Sign-In** → Generates JWT after validating credentials

---

# END OF DOCUMENT
