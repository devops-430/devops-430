## References
https://securitylabs.datadoghq.com/articles/container-security-fundamentals-part-2/
https://github.com/DeepakBomjan/devops/blob/main/Docker/docker-advanced-tip.md


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


## Networking
 Below are **practical Docker networking commands** to create **custom networks with specific CIDR blocks**, and use them with containers.

---

## 🧱 1. Create a Custom Bridge Network with CIDR

```bash
docker network create \
  --driver bridge \
  --subnet 192.168.100.0/24 \
  --gateway 192.168.100.1 \
  custom-net
```

✅ This creates a user-defined **bridge network** named `custom-net`:
- Subnet: `192.168.100.0/24`
- Gateway: `192.168.100.1`

---

## 🚀 2. Run a Container in That Network

```bash
docker run -dit \
  --name web1 \
  --network custom-net \
  --ip 192.168.100.10 \
  nginx
```

✅ Runs an `nginx` container with a **fixed IP** `192.168.100.10` on `custom-net`.

---

## 🔄 3. Connect Another Container to the Same Network

```bash
docker run -dit \
  --name web2 \
  --network custom-net \
  --ip 192.168.100.11 \
  nginx
```

✅ Now `web1` and `web2` can communicate via IP or container name.

Test connectivity from inside a container:

```bash
docker exec -it web1 ping web2
```

---

## 🧹 4. List Networks

```bash
docker network ls
```

---

## 🔍 5. Inspect a Network

```bash
docker network inspect custom-net
```

---

## ❌ 6. Remove a Network

```bash
docker network rm custom-net
```

⚠️ You must remove or disconnect containers before deleting the network.



## 📥 Copy File **FROM Host TO Container**

```bash
docker cp ./myfile.txt container_name:/app/myfile.txt
```

✅ This copies `myfile.txt` from your local directory into `/app/` inside the container.

Example:
```bash
docker cp config.json web1:/etc/nginx/config.json
```

---

## 📤 Copy File **FROM Container TO Host**

```bash
docker cp container_name:/app/output.log ./output.log
```

✅ This copies `output.log` from the container to your current host directory.

---

## 📁 Copy a Folder (Both Directions Work)

```bash
docker cp ./myfolder container_name:/app/myfolder      # To container
docker cp container_name:/app/myfolder ./myfolder_copy # From container
```

---

## 🧠 Notes

- You can use container **name** or **ID**.
- Paths must be **absolute** inside the container (e.g., `/app/file.txt`, not `app/file.txt`).

## Docker compose
Here’s a complete example of a `docker-compose.yml` file that uses **multiple networks** and **volumes** — a common pattern for microservices or app stacks (e.g., web + db).

---

## 📄 `docker-compose.yml`

```yaml
version: "3.8"

services:
  web:
    image: nginx:latest
    container_name: web-app
    ports:
      - "8080:80"
    networks:
      - frontend
    volumes:
      - web-content:/usr/share/nginx/html

  app:
    image: node:18
    container_name: app-service
    working_dir: /app
    command: ["node", "-e", "require('http').createServer((_,res)=>res.end('Hello')).listen(3000)"]
    networks:
      - frontend
      - backend
    volumes:
      - app-code:/app

  db:
    image: postgres:15
    container_name: db-service
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    networks:
      - backend
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  web-content:
  app-code:
  db-data:

networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24
  backend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.21.0.0/24
```

---

## 🧪 Usage

```bash
docker-compose up -d
```

---

## 🧹 Cleanup

```bash
docker-compose down -v   # Remove containers + volumes
```

---

This sets up:
- Two **networks**: `frontend`, `backend` (isolating app layers)
- Three **volumes**: `web-content`, `app-code`, `db-data`
- Three **services**: NGINX, Node.js, PostgreSQL — with correct scoping.

## Docker Environment Variables

https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/

You can supply **environment variables to Docker containers** in several ways. Here's a clear breakdown of all common methods:

---

## ✅ 1. **Using `docker run` command line**

```bash
docker run -e VAR_NAME=value -e ENV=prod nginx
```

You can pass multiple `-e` options for multiple variables.

---

## ✅ 2. **From an `.env` file via `--env-file`**

Create a file `app.env`:

```env
ENV=production
PORT=8080
```

Then run:

```bash
docker run --env-file app.env nginx
```

> ✅ Loads all variables from the file into the container's environment.

---

## ✅ 3. **In `Dockerfile` using `ENV`**

```Dockerfile
FROM node:18

ENV NODE_ENV=production
ENV PORT=3000
```

> 🔸 These are baked into the image and always present in the container unless overridden.

---

## ✅ 4. **In `docker-compose.yml`**

### a. Inline `environment` block

```yaml
services:
  app:
    image: node:18
    environment:
      - NODE_ENV=production
      - DB_USER=${DB_USER}
```

### b. With `env_file`

```yaml
services:
  app:
    image: node:18
    env_file:
      - .env
```

> 🔸 You can combine both `env_file` and `environment`.

---

## ✅ 5. **Build-time with `--build-arg` and `ARG` (not runtime)**

In `Dockerfile`:

```Dockerfile
ARG APP_VERSION
ENV VERSION=$APP_VERSION
```

Then during build:

```bash
docker build --build-arg APP_VERSION=1.2.3 .
```

> 🧠 `ARG` is available **only at build time**, not at runtime.

---

## 🧪 Priority Order (Override Hierarchy)

| Source                | Overwrites Lower? |
|-----------------------|-------------------|
| `docker run -e`       | ✅ Overrides all   |
| `--env-file`          | ✅ Overrides `ENV` in Dockerfile |
| `docker-compose env`  | ✅ Overrides `.env` |
| `ENV` in Dockerfile   | ❌ Lowest priority |

