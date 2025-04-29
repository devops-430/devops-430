## Setup Ansible
1. [Install Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-and-upgrading-ansible-with-pip)


> Error
```
python3 -m pip install --user ansible
ERROR: Can not perform a '--user' install. User site-packages are not visible in this virtualenv.
(venv) deepakbroadway@03c8606be71c:~$
```
```bash
python3 -m pip install ansible
```

2. Check Ansible Version
```bash
ansible --version
```

 
You see this line:

> `config file = None`

because **Ansible is not finding any `ansible.cfg` file** right now.

---

✅ To make **your current directory** the working configuration location,  
you simply **create an `ansible.cfg`** file in your current directory.

👉 Here's **how to do it quickly:**

### 1. Create `ansible.cfg` in your project folder:

```bash
touch ansible.cfg
```

or edit directly:

```bash
nano ansible.cfg
```

---

### 2. Example minimal `ansible.cfg`:

```ini
[defaults]
inventory = ./hosts
remote_user = ubuntu
host_key_checking = False
retry_files_enabled = False
```

**Explanation:**
- `inventory = ./hosts` → expects a file called `hosts` (inventory) in the same directory.
- `remote_user = ubuntu` → default SSH user.
- `host_key_checking = False` → disables annoying "are you sure you want to connect" prompts.
- `retry_files_enabled = False` → don't create `.retry` files on failure.

---

### 3. Make a basic `hosts` inventory:

```bash
echo '[myservers]
192.168.1.100
192.168.1.101' > hosts
```

---

### 4. Now test:

```bash
ansible all -m ping
```

(If your SSH access is working, the remote servers should respond with "pong".)

---

### 🔥 Important order of how Ansible looks for config files:
When you run Ansible, it looks for `ansible.cfg` in this order:
1. In **current directory** (where you run ansible commands)
2. In **$ANSIBLE_CONFIG** environment variable
3. In **~/.ansible.cfg** (home directory)
4. In **/etc/ansible/ansible.cfg** (system-wide)

➡️ So **having `ansible.cfg` in the current folder** gives you **full control** for that project.

---

### 🛠️ Quick Summary Commands:

```bash
touch ansible.cfg
nano ansible.cfg

echo -e '[all]\nlocalhost ansible_connection=local' > hosts
```

3. Check Inventory
```bash
 ansible-inventory --list
{
    "_meta": {
        "hostvars": {
            "localhost": {
                "ansible_connection": "local"
            }
        }
    },
    "all": {
        "children": [
            "ungrouped"
        ]
    },
    "ungrouped": {
        "hosts": [
            "localhost"
        ]
    }
}
```

```bash
(venv) deepakbroadway@03c8606be71c:~$ ansible --version
ansible [core 2.17.11]
  config file = /home/deepakbroadway/ansible.cfg
  configured module search path = ['/home/deepakbroadway/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /home/deepakbroadway/venv/lib/python3.10/site-packages/ansible
  ansible collection location = /home/deepakbroadway/.ansible/collections:/usr/share/ansible/collections
  executable location = /home/deepakbroadway/venv/bin/ansible
  python version = 3.10.12 (main, Feb  4 2025, 14:57:36) [GCC 11.4.0] (/home/deepakbroadway/venv/bin/python3)
  jinja version = 3.1.6
  libyaml = True
(venv) deepakbroadway@03c8606be71c:~$ cd openlabfree/IaC/Ansible/
(venv) deepakbroadway@03c8606be71c:~/openlabfree/IaC/Ansible$ ls
README.md  create_user.yaml
(venv) deepakbroadway@03c8606be71c:~/openlabfree/IaC/Ansible$ ansible --version
ansible [core 2.17.11]
  config file = None
  configured module search path = ['/home/deepakbroadway/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /home/deepakbroadway/venv/lib/python3.10/site-packages/ansible
  ansible collection location = /home/deepakbroadway/.ansible/collections:/usr/share/ansible/collections
  executable location = /home/deepakbroadway/venv/bin/ansible
  python version = 3.10.12 (main, Feb  4 2025, 14:57:36) [GCC 11.4.0] (/home/deepakbroadway/venv/bin/python3)
  jinja version = 3.1.6
  libyaml = True
```


✅ **Explanation:**  
- When you were in `~` (your home directory), Ansible **found** `ansible.cfg` at `/home/deepakbroadway/ansible.cfg`.
- After you `cd` into `~/openlabfree/IaC/Ansible/`, suddenly **no `ansible.cfg` is found**.
  
That's **expected behavior** because **Ansible searches `ansible.cfg` like this** (in this order):

| Search Order | Where |
|:-------------|:------|
| 1️⃣ | `ANSIBLE_CONFIG` environment variable (if set) |
| 2️⃣ | `ansible.cfg` in **current working directory** |
| 3️⃣ | `~/.ansible.cfg` (in your home) |
| 4️⃣ | `/etc/ansible/ansible.cfg` (global default) |

---

In your case:
- In `~`, Ansible found `/home/deepakbroadway/ansible.cfg`.
- After `cd openlabfree/IaC/Ansible/`, no `ansible.cfg` in **current folder**, so Ansible **stopped** and didn’t fall back.
  
**Result:** `config file = None`

---

# 📋 How to fix this smartly?

✅ **Option 1:**  
**Copy or symlink** your `ansible.cfg` into your project folder:

```bash
cp ~/ansible.cfg ~/openlabfree/IaC/Ansible/
```

or

```bash
ln -s ~/ansible.cfg ~/openlabfree/IaC/Ansible/ansible.cfg
```

✅ **Option 2:**  
Set an environment variable **permanent or temporary**:

```bash
export ANSIBLE_CONFIG=~/ansible.cfg
```

✅ **Option 3:**  
Create a **dedicated ansible.cfg per project** in your repo.  
This is the **best practice** if you want project isolation.

Example minimal `ansible.cfg`:

```ini
[defaults]
inventory = ./inventory
host_key_checking = False
retry_files_enabled = False
gathering = smart
forks = 10
timeout = 30
```

---

# 🔥 Bonus Tip

You can always ask Ansible:
```bash
ansible-config dump --only-changed
```
or
```bash
ansible-config list
```
to see **which config settings are being applied and from where**!

---

```bash
localhost | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/home/deepakbroadway/venv/bin/python3.10"
    },
    "changed": false,
    "ping": "pong"
}
34.228.24.168 | UNREACHABLE! => {
    "changed": false,
    "msg": "Failed to connect to the host via ssh: Warning: Permanently added '34.228.24.168' (ED25519) to the list of known hosts.\r\nubuntu@34.228.24.168: Permission denied (publickey).",
    "unreachable": true
}
34.202.161.192 | UNREACHABLE! => {
    "changed": false,
    "msg": "Failed to connect to the host via ssh: Warning: Permanently added '34.202.161.192' (ED25519) to the list of known hosts.\r\nubuntu@34.202.161.192: Permission denied (publickey).",
    "unreachable": true
}
34.203.240.174 | UNREACHABLE! => {
    "changed": false,
    "msg": "Failed to connect to the host via ssh: Warning: Permanently added '34.203.240.174' (ED25519) to the list of known hosts.\r\nubuntu@34.203.240.174: Permission denied (publickey).",
    "unreachable": true
}
```

Option 1:
```ini
[my_hosts]
34.228.24.168 ansible_ssh_user=ubuntu ansible_ssh_private_key_file=~/.ssh/my_private_key
34.202.161.192 ansible_ssh_user=ubuntu ansible_ssh_private_key_file=~/.ssh/my_private_key
34.203.240.174 ansible_ssh_user=ubuntu ansible_ssh_private_key_file=~/.ssh/my_private_key
```
Option 2:
```ini
[defaults]
private_key_file = ~/.ssh/my_private_key

```

Option 3:
```bash
ansible-playbook -i your_inventory_file create_user.yaml --private-key=~/.ssh/my_private_key
```
Option 4: 
Use username/password
```ini
[all]
localhost ansible_connection=local

[db]
34.228.24.168 mysql_port=3307 ansible_ssh_user=ubuntu ansible_ssh_pass='your_password'
34.202.161.192 ansible_ssh_user=ubuntu ansible_ssh_pass='your_password'
34.203.240.174 ansible_ssh_user=ubuntu ansible_ssh_pass='your_password'
```
Or
```ini
[all]
localhost ansible_connection=local

[db]
34.228.24.168 mysql_port=3307
34.202.161.192
34.203.240.174

[db:vars]
ansible_ssh_user=ubuntu
ansible_ssh_pass='your_password'
```


## 10 Ansible modules you need to know

1. Module: Package management
```yaml
- name: install nginx
  apt:
    name: nginx
  state: present
```
2. Module: Service
```yaml
- name: Start service foo, based on running process /usr/bin/foo
  service:
    name: foo
    pattern: /usr/bin/foo
    state: started
```
3. Module: Copy
```yaml
- name: Copy a new "ntp.conf file into place, backing up the original if it differs from the copied version
  copy:
    src: /mine/ntp.conf
    dest: /etc/ntp.conf
    owner: root
    group: root
    mode: '0644'
    backup: yes
```
4. Module: Debug
```yaml
- name: Display all variables/facts known for a host
  debug:
    var: hostvars[inventory_hostname]
    verbosity: 4
```
```yaml
- name: Write some content in a file /tmp/foo.txt
  copy:
    dest: /tmp/foo.txt
    content: |
      Good Morning!
      Awesome sunshine today.
    register: display_file_content
- name: Debug display_file_content
    debug:
      var: display_file_content
      verbosity: 2
```
5. Module: File
```yaml
- name: Change file ownership, group and permissions
  file:
    path: /etc/foo.conf
    owner: foo
    group: foo
    mode: '0644'
```
```yaml
- name: Create a directory if it does not exist
  file:
    path: /etc/some_directory
    state: directory
    mode: '0755'
```
6. Module: Lineinfile
```yaml
- name: Ensure SELinux is set to enforcing mode
  lineinfile:
    path: /etc/selinux/config
    regexp: '^SELINUX='
    line: SELINUX=enforcing
```
7. Module: Git
```yaml
# Example Create git archive from repo
- git:
    repo: https://github.com/ansible/ansible-examples.git
    dest: /src/ansible-examples
    archive: /tmp/ansible-examples.zip
```
8. Module: Archive
```yaml
- name: Compress directory /path/to/foo/ into /path/to/foo.tgz
  archive:
    path: /path/to/foo
    dest: /path/to/foo.tgz
```
9. Module: Command
```yaml
- name: return motd to registered var
  command: cat /etc/motd
  register: mymotd
```
```yaml
- name: Change the working directory to somedir/ and run the command as db_owner if /path/to/database does not exist.
  command: /usr/bin/make_database.sh db_user db_name
  become: yes
  become_user: db_owner
  args:
    chdir: somedir/
    creates: /path/to/database
```

## Reference
1. Ansible Built in modules
https://docs.ansible.com/ansible/latest/collections/ansible/builtin/index.html

2. Ansible Special Variables
https://docs.ansible.com/ansible/latest/reference_appendices/special_variables.html#special-variables
3. Ansible Facts
https://docs.ansible.com/ansible/latest/reference_appendices/special_variables.html#special-variables
