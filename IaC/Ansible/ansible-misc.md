Here's a complete set of **Ansible examples** covering:

- `conditionals`
- `debug`
- `tags`
- `register`
- `{{ variables }}`
- `filters`
- `loops`

Each includes a **realistic use case** so you can learn them practically.

---

## ✅ 1. **Conditionals** (`when:`)

### 🔧 Use Case: Only install Apache on Debian-based systems

```yaml
- name: Install Apache on Debian systems
  ansible.builtin.apt:
    name: apache2
    state: present
  when: ansible_os_family == "Debian"
```

---

## ✅ 2. **Debug** (`ansible.builtin.debug`)

### 🔧 Use Case: Print the value of a variable

```yaml
- name: Show default gateway
  ansible.builtin.debug:
    msg: "The default gateway is {{ ansible_default_ipv4.gateway }}"
```

---

## ✅ 3. **Tags** (`tags:`)

### 🔧 Use Case: Run only user-related tasks

```yaml
- name: Create DevOps user
  ansible.builtin.user:
    name: devops
    state: present
  tags: [users, devops]
```

### ✅ Run with tags only:

```bash
ansible-playbook site.yml --tags users
```

---

## ✅ 4. **Register**

### 🔧 Use Case: Store service status and act on result

```yaml
- name: Check if nginx is running
  ansible.builtin.shell: systemctl is-active nginx
  register: nginx_status
  ignore_errors: true

- name: Restart nginx if not running
  ansible.builtin.systemd:
    name: nginx
    state: restarted
  when: nginx_status.stdout != "active"
```

---

## ✅ 5. **Jinja2 `{{ }}` Variable Substitution**

### 🔧 Use Case: Templating a config file

```yaml
- name: Create a config file
  ansible.builtin.template:
    src: app.conf.j2
    dest: /etc/app.conf
```

### 📝 Template `app.conf.j2`:
```jinja2
server_name = {{ ansible_hostname }}
app_port = {{ app_port | default(8080) }}
```

---

## ✅ 6. **Filters** (`|`)

### 🔧 Use Case: Format a timestamp

```yaml
- name: Show current date
  ansible.builtin.debug:
    msg: "Today is {{ ansible_date_time.date | to_datetime('%Y-%m-%d') | strftime('%A, %d %B %Y') }}"
```

### 🔧 Use Case: Convert a list to comma-separated string

```yaml
- name: Join list into string
  ansible.builtin.debug:
    msg: "{{ ['nginx', 'curl', 'git'] | join(', ') }}"
```

---

## ✅ 7. **Loops** (`loop:`)

### 🔧 Use Case: Install multiple packages

```yaml
- name: Install dev packages
  ansible.builtin.package:
    name: "{{ item }}"
    state: present
  loop:
    - git
    - htop
    - curl
```

### 🔧 Use Case: Create multiple users

```yaml
- name: Create users
  ansible.builtin.user:
    name: "{{ item.name }}"
    shell: "{{ item.shell }}"
  loop:
    - { name: 'alice', shell: '/bin/bash' }
    - { name: 'bob', shell: '/bin/zsh' }
```

---

## ✅ Bonus: Combine All in One

```yaml
- name: Conditional loop with debug and tags
  ansible.builtin.user:
    name: "{{ item }}"
    state: present
  loop: "{{ users }}"
  when: ansible_distribution == 'Ubuntu'
  tags: user_setup

- name: Show created users
  ansible.builtin.debug:
    msg: "Created user: {{ item }}"
  loop: "{{ users }}"
```

### 🔧 group_vars/all.yml:
```yaml
users:
  - dev1
  - dev2
  - qa1
```

---
