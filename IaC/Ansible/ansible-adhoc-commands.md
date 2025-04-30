A list of commonly used **Ansible ad-hoc commands** for Linux system administration tasks. These commands are useful for quick, one-off operations without writing a playbook.

---

### 🖥️ **System Info & Management**
| Task | Command |
|------|---------|
| Ping all hosts | `ansible all -m ping` |
| Gather facts | `ansible all -m setup` |
| Get uptime | `ansible all -a "uptime"` |
| Check disk usage | `ansible all -a "df -h"` |
| List logged-in users | `ansible all -a "who"` |
| Check memory usage | `ansible all -a "free -m"` |
| Check OS version | `ansible all -a "cat /etc/os-release"` |

---

### 📁 **File & Directory Operations**
| Task | Command |
|------|---------|
| Create a directory | `ansible all -m file -a "path=/tmp/testdir state=directory"` |
| Remove a directory | `ansible all -m file -a "path=/tmp/testdir state=absent"` |
| Copy file to remote host | `ansible all -m copy -a "src=/etc/hosts dest=/tmp/hosts"` |
| Change file permissions | `ansible all -m file -a "path=/tmp/testfile mode=0644"` |
| Download file from URL | `ansible all -m get_url -a "url=https://example.com/file.tar.gz dest=/tmp"` |

---

### 👤 **User & Group Management**
| Task | Command |
|------|---------|
| Add user | `ansible all -m user -a "name=testuser state=present"` |
| Delete user | `ansible all -m user -a "name=testuser state=absent"` |
| Add user to group | `ansible all -m user -a "name=testuser groups=sudo append=yes"` |
| Create a group | `ansible all -m group -a "name=testgroup state=present"` |

---

### 🔧 **Package Management**
**(Debian/Ubuntu – `apt`, RedHat/CentOS – `yum` or `dnf`)**

| Task | Debian | RHEL |
|------|--------|------|
| Install package | `ansible all -m apt -a "name=htop state=present"` | `ansible all -m yum -a "name=htop state=present"` |
| Remove package | `ansible all -m apt -a "name=htop state=absent"` | `ansible all -m yum -a "name=htop state=absent"` |
| Update all packages | `ansible all -m apt -a "upgrade=yes update_cache=yes"` | `ansible all -m yum -a "name='*' state=latest"` |

---

### 🔌 **Service Management**
| Task | Command |
|------|---------|
| Start service | `ansible all -m service -a "name=nginx state=started"` |
| Stop service | `ansible all -m service -a "name=nginx state=stopped"` |
| Restart service | `ansible all -m service -a "name=nginx state=restarted"` |
| Enable service | `ansible all -m service -a "name=nginx enabled=yes"` |

---

### 🔐 **Permissions & Ownership**
| Task | Command |
|------|---------|
| Change file owner | `ansible all -m file -a "path=/tmp/testfile owner=root group=root"` |
| Set file mode | `ansible all -m file -a "path=/tmp/testfile mode=0755"` |

---

### 🧪 **Other Useful Commands**
| Task | Command |
|------|---------|
| Run a shell script | `ansible all -a "/path/to/script.sh"` |
| Reboot remote hosts | `ansible all -a "reboot"` or `ansible all -m reboot` |
| Check Ansible version | `ansible --version` |
| List hosts in inventory | `ansible all --list-hosts` |

---
