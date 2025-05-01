## References
https://securitylabs.datadoghq.com/articles/container-security-fundamentals-part-2/

The `BUILD ARG` (build-time argument) in a Dockerfile allows you to pass variables during the **image build process**, not at runtime. These are helpful for customizing image builds without hardcoding values.

---

### 🔧 Basic Syntax in Dockerfile

```Dockerfile
# Declare a build-time variable
ARG VERSION=1.0

# Use it later in the build
FROM node:${VERSION}

# You can also use it in commands
RUN echo "Building with Node version ${VERSION}"
```

---

### 🏗️ Building with `--build-arg`

When you build the image, pass the argument like this:

```bash
docker build --build-arg VERSION=18 -t my-node-app .
```

---

### 🔒 Important Notes

- `ARG` values are **not persisted** in the final image.
- They are **not available** at container runtime like `ENV`.
- You can set defaults (`ARG VERSION=1.0`) or require passing explicitly.

---

### 🧪 Example: Customize Environment Based on ARG

```Dockerfile
ARG ENVIRONMENT=development
FROM python:3.10-slim

ARG ENVIRONMENT
RUN echo "Environment is $ENVIRONMENT"

# Optional: Set an ENV from ARG
ENV APP_ENV=$ENVIRONMENT
```

Then build with:

```bash
docker build --build-arg ENVIRONMENT=production -t my-app .
```
The `EXPOSE` instruction in a Dockerfile **declares** which port(s) the container will listen on **at runtime** — it's a form of documentation and **does not actually publish the port**.

---

### 🧾 Syntax

```Dockerfile
EXPOSE <port> [<port>/<protocol>...]
```

Examples:
```Dockerfile
EXPOSE 80        # Defaults to TCP
EXPOSE 8080/tcp  # Explicit TCP
EXPOSE 5432/udp  # UDP
```

---

### 📦 What It Does

- **Informs** users of the image which ports are intended to be published.
- **Does not publish** the port outside the container by default.
- Works as a hint for tools like `docker run` or `docker-compose`.

---

### 🚀 To Actually Publish the Port

You still need to publish the port when running the container:

```bash
docker run -p 8080:80 my-image
```

This maps **host port 8080** to **container port 80**.

---

### 💡 Use Case Example

```Dockerfile
FROM nginx
EXPOSE 80
```

Then:

```bash
docker run -p 8080:80 my-nginx
```

You access the container's NGINX via `http://localhost:8080`.

---

The `ONBUILD` instruction in a Dockerfile sets up a **trigger** that will execute **later**, *when the image is used as the base image in another Dockerfile*. It's mainly used to define instructions that should only run when someone builds **FROM your image**, not when your image is built directly.

---

### 🧠 Think of It Like:

> “When someone uses **this image** as a base, also run **this command** during their build.”

---

### 🧾 Syntax

```Dockerfile
ONBUILD <instruction>
```

Commonly used with `COPY`, `ADD`, `RUN`, `ENV`, etc.

---

### 🔧 Example

#### Base Image (`Dockerfile`)

```Dockerfile
# This is the parent image
FROM node:18
ONBUILD COPY . /app
ONBUILD RUN npm install
```

Build it:

```bash
docker build -t my-node-base .
```

---

#### Child Image (`Dockerfile`)

```Dockerfile
FROM my-node-base
CMD ["node", "/app/index.js"]
```

When you build this, the `ONBUILD` triggers will automatically:

- `COPY . /app`
- `RUN npm install`

---

### ⚠️ Caution

- `ONBUILD` triggers **accumulate**, so be careful with recursive inheritance.
- Not ideal for general-purpose base images like `ubuntu`, `alpine`.
- Mostly used in **builder/base images** for frameworks (e.g., Node.js apps).


Let’s walk through a **practical use case** of `ONBUILD`: creating a reusable **base image for Node.js microservices**.

---

## 🧱 Goal:
You want to:
- Standardize how all your Node.js microservices are built.
- Reuse a base image that automatically sets up the app.

---

### ✅ Step 1: Create a Base Image with `ONBUILD`

Create a file `Dockerfile.base`:

```Dockerfile
# Base image with Node
FROM node:18

# ONBUILD triggers to be executed in child images
ONBUILD WORKDIR /app
ONBUILD COPY package*.json ./
ONBUILD RUN npm install
ONBUILD COPY . .
ONBUILD EXPOSE 3000

# Entry point can still be defined in the child image
```

Then build it:

```bash
docker build -f Dockerfile.base -t mycompany/node-base .
```

---

### ✅ Step 2: Create a Microservice Using the Base

In your microservice directory:

```Dockerfile
# Use the base image
FROM mycompany/node-base

# Only define CMD or other service-specific config
CMD ["npm", "start"]
```

Now just build the microservice:

```bash
docker build -t my-microservice .
```

It **automatically**:
- Copies `package.json`
- Installs dependencies
- Copies source code
- Exposes port 3000

---

### 🚀 Benefits

- All microservices have the same Dockerfile structure.
- DRY: You avoid repeating common build steps.
- Easy onboarding for teams using your base image.

