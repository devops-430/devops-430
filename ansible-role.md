Here's a **GitHub-ready Ansible project structure** based on the above modules, organized into roles and group variables. This will give you a clean, reusable, and professional layout.

---

## ✅ **Project Directory Structure**

```
ansible-admin-playbook/
├── README.md
├── inventory
│   └── hosts
├── group_vars
│   └── all.yml
├── site.yml
├── roles/
│   ├── system/
│   │   └── tasks/main.yml
│   ├── files/
│   │   └── tasks/main.yml
│   ├── users/
│   │   └── tasks/main.yml
│   ├── packages/
│   │   └── tasks/main.yml
│   ├── services/
│   │   └── tasks/main.yml
│   ├── network/
│   │   └── tasks/main.yml
│   ├── security/
│   │   └── tasks/main.yml
│   ├── updates/
│   │   └── tasks/main.yml
│   ├── reboot/
│   │   └── tasks/main.yml
│   └── templates/
│       └── config.j2
└── files/
    ├── myapp.conf
    └── audit.rules
```

---

## 🧾 **site.yml** (Main entry playbook)

```yaml
- name: Admin Playbook for All Servers
  hosts: all
  become: yes
  roles:
    - system
    - files
    - users
    - packages
    - services
    - network
    - security
    - updates
    - reboot
```

---

## 🧩 **group_vars/all.yml**

```yaml
dev_user: devuser
packages_common:
  - htop
  - curl
```

---

## 🧱 **Role: `system/tasks/main.yml`**

```yaml
- name: Gather system facts
  ansible.builtin.setup:

- name: Set hostname
  ansible.builtin.hostname:
    name: "{{ inventory_hostname }}"

- name: Add a cron job
  ansible.builtin.cron:
    name: "Update System"
    minute: "0"
    hour: "3"
    job: "/usr/bin/apt update && /usr/bin/apt upgrade -y"
```

---

## 🧱 **Role: `files/tasks/main.yml`**

```yaml
- name: Create directory
  ansible.builtin.file:
    path: /opt/mydir
    state: directory
    mode: '0755'

- name: Copy configuration file
  ansible.builtin.copy:
    src: myapp.conf
    dest: /etc/myapp.conf

- name: Use config template
  ansible.builtin.template:
    src: config.j2
    dest: /etc/myapp/config.conf
```

---

## 🧱 **Role: `users/tasks/main.yml`**

```yaml
- name: Ensure user exists
  ansible.builtin.user:
    name: "{{ dev_user }}"
    shell: /bin/bash
    create_home: yes

- name: Add SSH key
  ansible.builtin.authorized_key:
    user: "{{ dev_user }}"
    key: "{{ lookup('file', 'files/keys/devuser.pub') }}"
```

---

## 🧱 **Role: `packages/tasks/main.yml`**

```yaml
- name: Install common packages
  ansible.builtin.package:
    name: "{{ packages_common }}"
    state: present

- name: Install pip package
  ansible.builtin.pip:
    name: requests
```

---

## 🧱 **Role: `services/tasks/main.yml`**

```yaml
- name: Ensure nginx is running
  ansible.builtin.systemd:
    name: nginx
    state: started
    enabled: yes
```

---

## 🧱 **Role: `network/tasks/main.yml`**

```yaml
- name: Enable HTTP service in firewall
  ansible.posix.firewalld:
    service: http
    permanent: yes
    state: enabled
    immediate: yes

- name: Set SELinux to permissive
  ansible.builtin.selinux:
    policy: targeted
    state: permissive
```

---

## 🧱 **Role: `security/tasks/main.yml`**

```yaml
- name: Apply audit rules
  ansible.builtin.copy:
    src: audit.rules
    dest: /etc/audit/rules.d/audit.rules

- name: Set SELinux boolean
  ansible.posix.seboolean:
    name: httpd_can_network_connect
    state: true
    persistent: yes
```

---

## 🧱 **Role: `updates/tasks/main.yml`**

```yaml
- name: Update APT packages
  ansible.builtin.apt:
    update_cache: yes
    upgrade: dist
  when: ansible_os_family == 'Debian'

- name: Update YUM packages
  ansible.builtin.yum:
    name: '*'
    state: latest
  when: ansible_os_family == 'RedHat'
```

---

## 🧱 **Role: `reboot/tasks/main.yml`**

```yaml
- name: Reboot system
  ansible.builtin.reboot:
    reboot_timeout: 600

- name: Wait for SSH
  ansible.builtin.wait_for:
    port: 22
    timeout: 300
```

---

## 📝 **README.md** (Sample)

```markdown
# Ansible Administrative Playbook

This playbook automates essential administrative tasks across Linux hosts, including:

- System updates and reboot
- User and group management
- Package installation
- File templating and configuration
- Service and firewall management
- Security hardening

## Usage

```bash
ansible-playbook -i inventory/hosts site.yml
```

Edit `group_vars/all.yml` to customize default users and packages.
```
