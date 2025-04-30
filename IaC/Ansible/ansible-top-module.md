**Top Ansible modules** commonly used in **Linux system administration**, grouped by their purpose:

---

### 🛠️ 1. **System Management Modules**
| Module | Description |
|--------|-------------|
| `setup` | Gathers system facts (like hardware, OS, network, etc.) |
| `command` | Executes commands on remote nodes (no shell features) |
| `shell` | Executes shell commands (supports pipes, redirection) |
| `raw` | Executes raw shell commands without module support (used for bootstrapping) |
| `script` | Runs a local script on remote machines |
| `cron` | Manages cron jobs |
| `hostname` | Manages system hostnames |

---

### 📁 2. **File & Directory Modules**
| Module | Description |
|--------|-------------|
| `file` | Creates/removes files, directories, sets permissions/ownership |
| `copy` | Copies files from control node to remote |
| `fetch` | Fetches files from remote hosts to control node |
| `template` | Processes Jinja2 templates before copying |
| `lineinfile` | Ensures a particular line is in a file |
| `replace` | Replaces text in a file using regex |
| `blockinfile` | Inserts/updates/removes text blocks in files |

---

### 👥 3. **User & Group Management Modules**
| Module | Description |
|--------|-------------|
| `user` | Manages user accounts |
| `group` | Manages groups |
| `authorized_key` | Adds SSH keys to user accounts |
| `pam_limits` | Sets limits on users (like max open files, memory, etc.) |

---

### 📦 4. **Package Management Modules**
| Module | OS Family | Description |
|--------|-----------|-------------|
| `apt` | Debian-based | Manages APT packages |
| `yum` / `dnf` | Red Hat-based | Manages YUM/DNF packages |
| `package` | Generic | Abstract module that works with available package manager |
| `snap` | Ubuntu | Manages Snap packages |
| `pip` | Python | Manages Python packages using pip |

---

### 🔌 5. **Service Management Modules**
| Module | Description |
|--------|-------------|
| `service` | Manages SysV/init.d services |
| `systemd` | Manages systemd services (recommended for modern systems) |
| `supervisorctl` | Manages processes via Supervisor |
| `docker_container` | Manages Docker containers if used |

---

### 🌐 6. **Network & Firewall Modules**
| Module | Description |
|--------|-------------|
| `firewalld` | Manages firewalld on RHEL/CentOS |
| `ufw` | Manages UFW on Ubuntu |
| `iptables` | Manages iptables rules |
| `nmcli` | Manages NetworkManager connections |
| `selinux` | Manages SELinux mode (enforcing/permissive/disabled) |

---

### 🔐 7. **Security Modules**
| Module | Description |
|--------|-------------|
| `seboolean` | Manages SELinux booleans |
| `openssh_keypair` | Creates SSH key pairs |
| `authorized_key` | Installs public keys for SSH |
| `firewalld` / `ufw` | Manages firewall rules |
| `auditd` | Configures auditd (optional custom modules or templates) |

---

### 💻 8. **System Update & Reboot**
| Module | Description |
|--------|-------------|
| `reboot` | Reboots systems and waits for them to come back |
| `apt` / `yum` | Used for system updates (`state=latest`) |
| `wait_for` | Waits for a condition, such as a port to be open (used after reboots) |

---
Here are the **top Ansible modules for text processing** — essential for modifying configuration files, inserting lines, replacing text, and managing file content programmatically.

---

### ✏️ **Top Text Processing Modules in Ansible**

| Module | Purpose |
|--------|---------|
| **`lineinfile`** | Ensures a specific line exists (or is absent) in a file. Ideal for simple line-level changes. |
| **`replace`** | Performs **regex-based replacements** in a file. Great for modifying dynamic values. |
| **`blockinfile`** | Inserts, updates, or removes a **multi-line block** of text between markers. Useful for config blocks. |
| **`copy`** | Copies a full file (can be templated or static). Not ideal for edits, but good for replacing files entirely. |
| **`template`** | Copies a file after processing **Jinja2** templates. Use for advanced, dynamic configurations. |
| **`assemble`** | Assembles a file from multiple parts (fragments). Useful for modular config files. |
| **`slurp`** | Reads file content from a remote host and encodes it as base64 (useful for processing or backup). |

---

### 🔧 Common Use Cases

| Task | Suggested Module |
|------|------------------|
| Add a line to `/etc/sysctl.conf` | `lineinfile` |
| Replace IP in config file | `replace` |
| Insert custom block in `/etc/ssh/sshd_config` | `blockinfile` |
| Create dynamic config from a template | `template` |
| Concatenate multiple config fragments | `assemble` |



Here is a **working Ansible playbook example** for **every key module** mentioned earlier under your **administrative categories** (system, file, user, packages, services, network, security, reboot, and text processing)**—with practical use cases. These are grouped by module purpose:

---

## 🛠️ **1. System Management Modules**

```yaml
- name: System Management Tasks
  hosts: all
  become: yes
  tasks:
    - name: Gather system facts
      ansible.builtin.setup:

    - name: Run a basic command
      ansible.builtin.command: uptime

    - name: Run a shell command with pipes
      ansible.builtin.shell: "cat /etc/passwd | grep root"

    - name: Run raw command (bootstrap case)
      ansible.builtin.raw: "yum install -y python3"

    - name: Run local script on remote
      ansible.builtin.script: scripts/setup.sh

    - name: Ensure a cron job exists
      ansible.builtin.cron:
        name: "System Update"
        minute: "0"
        hour: "2"
        job: "/usr/bin/yum update -y"

    - name: Set system hostname
      ansible.builtin.hostname:
        name: webserver01
```

---

## 📁 **2. File & Directory Modules**

```yaml
- name: File Management
  hosts: all
  become: yes
  tasks:
    - name: Create a directory
      ansible.builtin.file:
        path: /opt/mydir
        state: directory
        mode: '0755'

    - name: Copy file to remote
      ansible.builtin.copy:
        src: files/myapp.conf
        dest: /etc/myapp.conf

    - name: Fetch file from remote
      ansible.builtin.fetch:
        src: /etc/hosts
        dest: ./backup/
        flat: yes

    - name: Use a template
      ansible.builtin.template:
        src: templates/config.j2
        dest: /etc/myapp/config.conf

    - name: Ensure a line in a file
      ansible.builtin.lineinfile:
        path: /etc/sysctl.conf
        line: "net.ipv4.ip_forward = 1"

    - name: Replace a string
      ansible.builtin.replace:
        path: /etc/hosts
        regexp: '127\.0\.1\.1'
        replace: '127.0.0.1'

    - name: Insert a block of lines
      ansible.builtin.blockinfile:
        path: /etc/ssh/sshd_config
        block: |
          PermitRootLogin no
          PasswordAuthentication no
```

---

## 👥 **3. User & Group Management**

```yaml
- name: User and Group Management
  hosts: all
  become: yes
  tasks:
    - name: Create a new user
      ansible.builtin.user:
        name: devuser
        shell: /bin/bash
        create_home: yes

    - name: Create a group
      ansible.builtin.group:
        name: devops

    - name: Add SSH key to user
      ansible.builtin.authorized_key:
        user: devuser
        key: "{{ lookup('file', 'keys/devuser.pub') }}"

    - name: Set user limits
      community.general.pam_limits:
        domain: devuser
        limit_type: hard
        limit_item: nofile
        value: 65535
```

---

## 📦 **4. Package Management**

```yaml
- name: Install Packages
  hosts: all
  become: yes
  tasks:
    - name: Install package via apt
      ansible.builtin.apt:
        name: htop
        state: present
      when: ansible_os_family == "Debian"

    - name: Install via yum
      ansible.builtin.yum:
        name: git
        state: present
      when: ansible_os_family == "RedHat"

    - name: Generic package install
      ansible.builtin.package:
        name: curl
        state: latest

    - name: Install Snap package
      community.general.snap:
        name: hello-world

    - name: Install Python package
      ansible.builtin.pip:
        name: requests
```

---

## 🔌 **5. Service Management**

```yaml
- name: Manage Services
  hosts: all
  become: yes
  tasks:
    - name: Start Nginx with systemd
      ansible.builtin.systemd:
        name: nginx
        state: started
        enabled: yes

    - name: Use service module (generic)
      ansible.builtin.service:
        name: cron
        state: restarted

    - name: Manage Supervisor program
      community.general.supervisorctl:
        name: myapp
        state: restarted

    - name: Start Docker container
      community.docker.docker_container:
        name: myapp
        image: nginx
        state: started
        published_ports:
          - "8080:80"
```

---

## 🌐 **6. Network & Firewall**

```yaml
- name: Network & Firewall
  hosts: all
  become: yes
  tasks:
    - name: Allow HTTP in firewalld
      ansible.posix.firewalld:
        service: http
        permanent: yes
        state: enabled
        immediate: yes

    - name: Allow OpenSSH in UFW
      community.general.ufw:
        rule: allow
        name: OpenSSH

    - name: Add iptables rule
      community.general.iptables:
        chain: INPUT
        protocol: tcp
        destination_port: 22
        jump: ACCEPT

    - name: Configure static IP via nmcli
      community.general.nmcli:
        conn_name: eth0
        ifname: eth0
        type: ethernet
        ip4: 192.168.1.100/24
        gw4: 192.168.1.1

    - name: Set SELinux to permissive
      ansible.builtin.selinux:
        policy: targeted
        state: permissive
```

---

## 🔐 **7. Security Modules**

```yaml
- name: Security Configurations
  hosts: all
  become: yes
  tasks:
    - name: Set SELinux boolean
      ansible.posix.seboolean:
        name: httpd_can_network_connect
        state: true
        persistent: yes

    - name: Generate SSH keypair
      community.crypto.openssh_keypair:
        path: /home/devuser/.ssh/id_rsa
        owner: devuser
        group: devuser
        mode: '0600'

    - name: Install public key
      ansible.builtin.authorized_key:
        user: devuser
        key: "{{ lookup('file', 'keys/devuser.pub') }}"

    - name: Allow SSH in firewalld
      ansible.posix.firewalld:
        service: ssh
        state: enabled
        permanent: yes

    - name: Configure auditd rules
      ansible.builtin.copy:
        src: files/audit.rules
        dest: /etc/audit/rules.d/audit.rules
        mode: '0644'
```

---

## 💻 **8. System Update & Reboot**

```yaml
- name: System Update and Reboot
  hosts: all
  become: yes
  tasks:
    - name: Update system packages
      ansible.builtin.apt:
        update_cache: yes
        upgrade: dist
      when: ansible_os_family == "Debian"

    - name: Ensure latest yum packages
      ansible.builtin.yum:
        name: "*"
        state: latest
      when: ansible_os_family == "RedHat"

    - name: Reboot the system
      ansible.builtin.reboot:
        reboot_timeout: 600

    - name: Wait for SSH after reboot
      ansible.builtin.wait_for:
        port: 22
        timeout: 300
```

---

Do you want this structured as a **GitHub-ready playbook directory** with `group_vars`, templates, and roles?
