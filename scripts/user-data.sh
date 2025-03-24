#!/bin/bash
yum update -y
yum install -y httpd php php-mysqlnd git
curl -sfL https://get.k3s.io | sh -

# Clone the PHP application from GitHub (Update with your repo)
cd /var/www/html
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_PHP_REPO.git app
chown -R apache:apache /var/www/html/app
chmod -R 755 /var/www/html/app

# Start Apache and enable it at boot
systemctl start httpd
systemctl enable httpd

# Allow Apache through the firewall
firewall-cmd --permanent --add-service=http
firewall-cmd --reload
