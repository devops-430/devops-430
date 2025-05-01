To simulate Docker-like isolation using Linux namespaces (`nsenter`, `lsns`, and `unshare`), you can manually create a minimal containerized environment. Below is a step-by-step guide that uses these tools to create a separate namespace for processes, similar to how Docker containers work.

---

### ✅ Goal
Create a lightweight container-like environment using:
- `unshare`: to create new namespaces
- `lsns`: to view namespaces
- `nsenter`: to enter a namespace

---

### 🛠 Requirements

Ensure you're running as **root** (or use `sudo`) and have these tools:
```bash
apt install util-linux
```

---

## 1. **Create a new namespace (like a container)**

```bash
sudo unshare --fork --pid --mount --uts --ipc --net --user --map-root-user bash
```

### This starts a new shell with:
- Isolated PID tree
- New mount namespace
- Own hostname
- Isolated IPC and network
- New user namespace

---

## 2. **Inside the isolated shell**

You can now:
```bash
hostname container1   # Set a unique hostname
mount -t proc proc /proc  # Mount /proc for the new PID namespace
bash                   # Run another shell if needed
ps                     # See only isolated processes
```

Try running a few processes to see they're limited to this shell.

---

## 3. **Check namespaces from outside**

In another terminal:

```bash
lsns
```

You’ll see entries for each namespace type. Look at the `PID` and `NS` columns to see which process belongs to which namespace.

---

## 4. **Use `nsenter` to enter the namespaces**

Find the PID of the containerized shell:

```bash
ps aux | grep unshare
```

Then:

```bash
sudo nsenter --target <PID> --pid --mount --uts --ipc --net bash
```

You’ll be dropped *inside* the namespace created by `unshare`, similar to how `docker exec` works.

---

## ✅ Summary vs Docker

| Feature             | Docker         | `unshare` + tools       |
|---------------------|----------------|--------------------------|
| Process isolation   | Yes (PID ns)   | Yes                      |
| Filesystem isolation| Yes (overlayfs)| Partial (needs chroot)  |
| Network isolation   | Yes (bridge)   | Yes                      |
| User namespace      | Yes            | Yes                      |
| Tools               | docker         | unshare, nsenter, lsns  |

For full Docker-like isolation, you'd also need `chroot` or `pivot_root`, `cgroups`, and more complex networking.

**you can use `nsenter` to enter a running Docker container**, but with a key detail: you need the **PID of the container's main process on the host**. Docker runs containers as isolated processes, and you can attach to their namespaces using `nsenter`.

---

### ✅ Steps to Enter a Docker Container Using `nsenter`

---

#### 1. **Find the Container’s PID**
You can find the PID of the container's main process like this:

```bash
docker inspect --format '{{.State.Pid}}' <container_name_or_id>
```

Example:
```bash
docker inspect --format '{{.State.Pid}}' my-nginx
```

---

#### 2. **Use `nsenter` to Access the Container’s Namespaces**

```bash
sudo nsenter --target <PID> --mount --uts --ipc --net --pid --user bash
```

- `--mount`: Enter the container’s mount namespace
- `--uts`: Enter the container’s hostname namespace
- `--ipc`: Enter the container’s IPC namespace
- `--net`: Enter the container’s network namespace
- `--pid`: Enter its PID namespace
- `--user`: Enter its user namespace (optional, if supported)

---

### ✅ Example Full Command

```bash
sudo nsenter --target 12345 --mount --uts --ipc --net --pid bash
```

Now you're inside the container shell, like `docker exec`.

---

### 📌 Notes

- If the container is running as a **non-root user**, entering its user namespace may require extra steps (or you may lack permissions).
- This approach is useful for debugging when `docker exec` is not working or not installed.

---
The error you're seeing:

```
nsenter: reassociate to namespace 'ns/user' failed: Invalid argument
```

means that you're trying to enter the **user namespace**, but that particular container may **not be using a separate user namespace**, or the **host kernel doesn't support joining it** in the way you're attempting.

---

### ✅ Solution

Simply **omit the `--user` flag**, and the rest will work fine:

```bash
sudo nsenter --target 3720 --mount --uts --ipc --net --pid bash
```

This will drop you into a shell **inside the Jenkins container** with access to:

- The container’s filesystem (`--mount`)
- Its hostname (`--uts`)
- IPC
- Network stack
- PID namespace (you’ll only see container processes)

---

### 📝 Notes

- Most Docker containers **do not use user namespaces by default**, unless you explicitly configure Docker with the `"userns-remap"` feature.
- If user namespaces are enabled, extra care is needed for mapping UID/GID properly — but in most default Docker setups, it's safe to skip `--user`.

