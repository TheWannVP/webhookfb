# Facebook Webhook Integration with n8n

Dự án này cung cấp một backend để xác thực và xử lý webhook từ Facebook, sau đó chuyển tiếp dữ liệu đến n8n.

## Cài đặt

1. Cài đặt các dependencies:
```bash
npm install
```

2. Cấu hình biến môi trường:
- Sao chép file `.env.example` thành `.env`
- Cập nhật các giá trị trong file `.env`:
  - `VERIFY_TOKEN`: Token xác thực cho Facebook webhook
  - `N8N_WEBHOOK_URL`: URL webhook của n8n

## Chạy ứng dụng

```bash
npm start
```

## Cấu hình Facebook Webhook

1. Truy cập Facebook Developer Console
2. Chọn ứng dụng của bạn
3. Vào mục Webhooks
4. Thêm webhook với URL: `https://webhook.your_domain.com/webhook`
5. Nhập Verify Token đã cấu hình trong file `.env`
6. Chọn các sự kiện muốn theo dõi

## Cấu hình n8n

1. Tạo một webhook trigger trong n8n
2. Sao chép URL webhook và cập nhật vào file `.env`
3. Cấu hình các workflow tiếp theo trong n8n để xử lý dữ liệu từ Facebook

## Deploy lên VPS với Subdomain và Cloudflare Tunnel

### Yêu cầu
- VPS với Ubuntu/Debian
- Tài khoản Cloudflare
- Domain đã được quản lý bởi Cloudflare
- Node.js và npm đã được cài đặt

### Các bước thực hiện

1. Cài đặt Cloudflare Tunnel:
```bash
# Tải xuống và cài đặt cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

2. Đăng nhập vào Cloudflare:
```bash
cloudflared tunnel login
```

3. Tạo tunnel mới:
```bash
cloudflared tunnel create webhookfb-tunnel
```

4. Cấu hình DNS cho subdomain:
```bash
cloudflared tunnel route dns webhookfb-tunnel webhook.your_domain.com
```

5. Cài đặt PM2:
```bash
sudo npm install -g pm2
```

6. Deploy ứng dụng:
```bash
# Clone repository
git clone your_repository_url
cd webhookfb

# Cài đặt dependencies
npm install

# Khởi động ứng dụng với PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

7. Khởi động Cloudflare Tunnel:
```bash
# Tạo thư mục cấu hình
mkdir -p /root/.cloudflared

# Copy file cấu hình
cp config.yml /root/.cloudflared/

# Khởi động tunnel
cloudflared tunnel --config /root/.cloudflared/config.yml run webhookfb-tunnel
```

8. Cấu hình tunnel tự động khởi động:
```bash
# Tạo service file
sudo nano /etc/systemd/system/cloudflared.service

# Thêm nội dung sau:
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config /root/.cloudflared/config.yml run webhookfb-tunnel
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target

# Khởi động service
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### Quản lý ứng dụng

- Xem trạng thái ứng dụng: `pm2 status`
- Xem logs ứng dụng: `pm2 logs webhookfb`
- Xem trạng thái tunnel: `systemctl status cloudflared`
- Xem logs tunnel: `journalctl -u cloudflared -f`
- Khởi động lại ứng dụng: `pm2 restart webhookfb`
- Khởi động lại tunnel: `sudo systemctl restart cloudflared` 