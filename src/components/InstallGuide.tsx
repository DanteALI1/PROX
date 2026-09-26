import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Copy, Check, Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  commands?: string[];
  note?: string;
  warning?: string;
}

const sections: { title: string; icon: string; steps: Step[] }[] = [
  {
    title: '1. Подготовка сервера',
    icon: '🖥️',
    steps: [
      {
        id: '1-1',
        title: 'Обновление системы',
        description: 'Обновите все пакеты системы до актуальных версий',
        commands: [
          'sudo dnf update -y',
          'sudo dnf upgrade -y',
          'sudo reboot'
        ],
        note: 'После обновления рекомендуется перезагрузить сервер'
      },
      {
        id: '1-2',
        title: 'Установка базовых зависимостей',
        description: 'Установите необходимые пакеты для работы всех сервисов',
        commands: [
          'sudo dnf install -y epel-release',
          'sudo dnf install -y git curl wget vim htop net-tools',
          'sudo dnf install -y gcc gcc-c++ make openssl-devel',
          'sudo dnf install -y libffi-devel zlib-devel bzip2-devel',
          'sudo dnf install -y readline-devel sqlite-devel',
          'sudo dnf install -y python3 python3-pip python3-devel'
        ]
      },
      {
        id: '1-3',
        title: 'Настройка файрвола',
        description: 'Откройте необходимые порты для HTTP/HTTPS',
        commands: [
          'sudo firewall-cmd --permanent --add-service=http',
          'sudo firewall-cmd --permanent --add-service=https',
          'sudo firewall-cmd --reload',
          'sudo firewall-cmd --list-all'
        ]
      },
      {
        id: '1-4',
        title: 'Настройка hostname',
        description: 'Установите корректное имя хоста',
        commands: [
          'sudo hostnamectl set-hostname rep.local.inion',
          'echo "127.0.0.1 rep.local.inion" | sudo tee -a /etc/hosts'
        ]
      },
      {
        id: '1-5',
        title: 'Создание структуры директорий',
        description: 'Создайте необходимые директории для всех сервисов',
        commands: [
          'sudo mkdir -p /opt/services/{netbox,mediawiki,portal}',
          'sudo mkdir -p /opt/services/configs',
          'sudo mkdir -p /opt/services/backups',
          'sudo mkdir -p /var/log/services',
          'sudo chown -R root:root /opt/services',
          'sudo chmod -R 755 /opt/services'
        ]
      }
    ]
  },
  {
    title: '2. Установка Docker и Docker Compose',
    icon: '🐳',
    steps: [
      {
        id: '2-1',
        title: 'Установка Docker',
        description: 'Установите Docker для контейнеризации сервисов',
        commands: [
          '# Добавление репозитория Docker',
          'sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo',
          '',
          '# Установка Docker',
          'sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin',
          '',
          '# Запуск и автозапуск Docker',
          'sudo systemctl enable --now docker',
          '',
          '# Добавление текущего пользователя в группу docker',
          'sudo usermod -aG docker $USER',
          '',
          '# Проверка установки',
          'docker --version',
          'docker compose version'
        ],
        note: 'После добавления пользователя в группу docker необходимо перелогиниться'
      },
      {
        id: '2-2',
        title: 'Создание Docker-сети',
        description: 'Создайте единую сеть для всех сервисов',
        commands: [
          'docker network create services-network'
        ]
      }
    ]
  },
  {
    title: '3. Установка Nginx (Reverse Proxy)',
    icon: '🌐',
    steps: [
      {
        id: '3-1',
        title: 'Установка Nginx',
        description: 'Установите Nginx как обратный прокси-сервер',
        commands: [
          'sudo dnf install -y nginx',
          'sudo systemctl enable --now nginx'
        ]
      },
      {
        id: '3-2',
        title: 'Создание SSL-директории',
        description: 'Создайте директорию для SSL-сертификатов',
        commands: [
          'sudo mkdir -p /etc/nginx/ssl',
          'sudo chmod 700 /etc/nginx/ssl'
        ],
        note: 'Разместите ваши файлы сертификата: /etc/nginx/ssl/rep.local.inion.crt и /etc/nginx/ssl/rep.local.inion.key'
      },
      {
        id: '3-3',
        title: 'Конфигурация Nginx',
        description: 'Создайте основной конфигурационный файл Nginx',
        commands: [
          '# Создайте файл конфигурации',
          'sudo tee /etc/nginx/conf.d/rep.local.inion.conf << \'EOF\'',
          '',
          '# Редирект HTTP -> HTTPS',
          'server {',
          '    listen 80;',
          '    server_name rep.local.inion;',
          '    return 301 https://$server_name$request_uri;',
          '}',
          '',
          '# Основной HTTPS сервер',
          'server {',
          '    listen 443 ssl http2;',
          '    server_name rep.local.inion;',
          '',
          '    # SSL сертификаты',
          '    ssl_certificate /etc/nginx/ssl/rep.local.inion.crt;',
          '    ssl_certificate_key /etc/nginx/ssl/rep.local.inion.key;',
          '    ssl_protocols TLSv1.2 TLSv1.3;',
          '    ssl_ciphers HIGH:!aNULL:!MD5;',
          '    ssl_prefer_server_ciphers on;',
          '    ssl_session_cache shared:SSL:10m;',
          '    ssl_session_timeout 10m;',
          '',
          '    # Портал (главная страница)',
          '    location / {',
          '        proxy_pass http://127.0.0.1:3000;',
          '        proxy_set_header Host $host;',
          '        proxy_set_header X-Real-IP $remote_addr;',
          '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
          '        proxy_set_header X-Forwarded-Proto $scheme;',
          '    }',
          '',
          '    # NetBox',
          '    location /netbox/ {',
          '        proxy_pass http://127.0.0.1:8000/;',
          '        proxy_set_header Host $host;',
          '        proxy_set_header X-Real-IP $remote_addr;',
          '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
          '        proxy_set_header X-Forwarded-Proto $scheme;',
          '    }',
          '',
          '    # NetBox Static',
          '    location /static/ {',
          '        alias /opt/services/netbox/netbox/static/;',
          '    }',
          '',
          '    # MediaWiki',
          '    location /wiki/ {',
          '        proxy_pass http://127.0.0.1:8080/;',
          '        proxy_set_header Host $host;',
          '        proxy_set_header X-Real-IP $remote_addr;',
          '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
          '        proxy_set_header X-Forwarded-Proto $scheme;',
          '    }',
          '',
          '    # Общие настройки',
          '    client_max_body_size 100M;',
          '    proxy_connect_timeout 60s;',
          '    proxy_send_timeout 60s;',
          '    proxy_read_timeout 60s;',
          '}',
          'EOF'
        ]
      },
      {
        id: '3-4',
        title: 'Проверка и перезапуск Nginx',
        description: 'Проверьте конфигурацию и перезапустите Nginx',
        commands: [
          'sudo nginx -t',
          'sudo systemctl restart nginx',
          'sudo systemctl status nginx'
        ]
      }
    ]
  },
  {
    title: '4. Установка NetBox',
    icon: '📡',
    steps: [
      {
        id: '4-1',
        title: 'Создание docker-compose.yml для NetBox',
        description: 'Создайте файл Docker Compose для NetBox с PostgreSQL и Redis',
        commands: [
          'cd /opt/services/netbox',
          '',
          'tee docker-compose.yml << \'EOF\'',
          'version: "3.8"',
          '',
          'services:',
          '  netbox:',
          '    image: netboxcommunity/netbox:latest',
          '    container_name: netbox',
          '    depends_on:',
          '      - postgres',
          '      - redis',
          '      - redis-cache',
          '    environment:',
          '      SUPERUSER_NAME: admin',
          '      SUPERUSER_EMAIL: admin@local.inion',
          '      SUPERUSER_PASSWORD: ${NETBOX_ADMIN_PASSWORD:-AdminPass123!}',
          '      SUPERUSER_API_TOKEN: ${NETBOX_API_TOKEN:-0123456789abcdef0123456789abcdef01234567}',
          '      DB_HOST: postgres',
          '      DB_PORT: 5432',
          '      DB_NAME: netbox',
          '      DB_USER: netbox',
          '      DB_PASSWORD: ${POSTGRES_PASSWORD:-NetBoxPass123!}',
          '      REDIS_HOST: redis',
          '      REDIS_PORT: 6379',
          '      REDIS_CACHE_HOST: redis-cache',
          '      REDIS_CACHE_PORT: 6379',
          '      SECRET_KEY: ${NETBOX_SECRET_KEY:-change-me-to-random-string-min-50-chars-xxxxxxxxxxxx}',
          '      ALLOWED_HOSTS: rep.local.inion,localhost,127.0.0.1',
          '      SKIP_SUPERUSER: "false"',
          '    ports:',
          '      - "8000:8080"',
          '    volumes:',
          '      - netbox-media:/opt/netbox/netbox/media',
          '      - netbox-reports:/opt/netbox/netbox/reports',
          '      - netbox-scripts:/opt/netbox/netbox/scripts',
          '    restart: unless-stopped',
          '    networks:',
          '      - services-network',
          '',
          '  postgres:',
          '    image: postgres:16-alpine',
          '    container_name: netbox-postgres',
          '    environment:',
          '      POSTGRES_DB: netbox',
          '      POSTGRES_USER: netbox',
          '      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-NetBoxPass123!}',
          '    volumes:',
          '      - postgres-data:/var/lib/postgresql/data',
          '    restart: unless-stopped',
          '    networks:',
          '      - services-network',
          '',
          '  redis:',
          '    image: redis:7-alpine',
          '    container_name: netbox-redis',
          '    command: sh -c "redis-server --appendonly yes"',
          '    volumes:',
          '      - redis-data:/data',
          '    restart: unless-stopped',
          '    networks:',
          '      - services-network',
          '',
          '  redis-cache:',
          '    image: redis:7-alpine',
          '    container_name: netbox-redis-cache',
          '    restart: unless-stopped',
          '    networks:',
          '      - services-network',
          '',
          'volumes:',
          '  netbox-media:',
          '  netbox-reports:',
          '  netbox-scripts:',
          '  postgres-data:',
          '  redis-data:',
          '',
          'networks:',
          '  services-network:',
          '    external: true',
          'EOF'
        ]
      },
      {
        id: '4-2',
        title: 'Создание файла переменных окружения',
        description: 'Создайте .env файл с безопасными паролями',
        commands: [
          'cd /opt/services/netbox',
          '',
          '# Генерация случайного ключа',
          'SECRET=$(openssl rand -base64 50)',
          '',
          'tee .env << EOF',
          'POSTGRES_PASSWORD=NetBoxPass_$(openssl rand -hex 8)',
          'NETBOX_SECRET_KEY=${SECRET}',
          'NETBOX_ADMIN_PASSWORD=AdminPass_$(openssl rand -hex 8)',
          'NETBOX_API_TOKEN=$(openssl rand -hex 20)',
          'EOF',
          '',
          '# Установите права',
          'chmod 600 .env'
        ],
        warning: 'Сохраните содержимое .env файла в безопасном месте! Пароли будут показаны только один раз.'
      },
      {
        id: '4-3',
        title: 'Запуск NetBox',
        description: 'Запустите контейнеры NetBox',
        commands: [
          'cd /opt/services/netbox',
          'docker compose up -d',
          '',
          '# Проверка статуса',
          'docker compose ps',
          '',
          '# Просмотр логов',
          'docker compose logs -f netbox'
        ],
        note: 'Первый запуск может занять 3-5 минут — идёт миграция базы данных'
      }
    ]
  },
  {
    title: '5. Установка MediaWiki',
    icon: '📚',
    steps: [
      {
        id: '5-1',
        title: 'Создание docker-compose.yml для MediaWiki',
        description: 'Создайте файл Docker Compose для MediaWiki с MariaDB',
        commands: [
          'cd /opt/services/mediawiki',
          '',
          'tee docker-compose.yml << \'EOF\'',
          'version: "3.8"',
          '',
          'services:',
          '  mediawiki:',
          '    image: mediawiki:1.41',
          '    container_name: mediawiki',
          '    depends_on:',
          '      - mariadb',
          '    environment:',
          '      MW_DB_HOST: mariadb',
          '      MW_DB_NAME: mediawiki',
          '      MW_DB_USER: wiki',
          '      MW_DB_PASSWORD: ${WIKI_DB_PASSWORD:-WikiPass123!}',
          '    ports:',
          '      - "8080:80"',
          '    volumes:',
          '      - wiki-data:/var/www/html/images',
          '      - wiki-localsettings:/var/www/html/localsettings',
          '    restart: unless-stopped',
          '    networks:',
          '      - services-network',
          '',
          '  mariadb:',
          '    image: mariadb:10.11',
          '    container_name: wiki-mariadb',
          '    environment:',
          '      MYSQL_ROOT_PASSWORD: ${WIKI_ROOT_PASSWORD:-RootPass123!}',
          '      MYSQL_DATABASE: mediawiki',
          '      MYSQL_USER: wiki',
          '      MYSQL_PASSWORD: ${WIKI_DB_PASSWORD:-WikiPass123!}',
          '    volumes:',
          '      - mariadb-data:/var/lib/mysql',
          '    restart: unless-stopped',
          '    networks:',
          '      - services-network',
          '',
          'volumes:',
          '  wiki-data:',
          '  wiki-localsettings:',
          '  mariadb-data:',
          '',
          'networks:',
          '  services-network:',
          '    external: true',
          'EOF'
        ]
      },
      {
        id: '5-2',
        title: 'Создание .env файла',
        description: 'Создайте файл переменных окружения для MediaWiki',
        commands: [
          'cd /opt/services/mediawiki',
          '',
          'tee .env << EOF',
          'WIKI_DB_PASSWORD=WikiPass_$(openssl rand -hex 8)',
          'WIKI_ROOT_PASSWORD=RootPass_$(openssl rand -hex 8)',
          'EOF',
          '',
          'chmod 600 .env'
        ]
      },
      {
        id: '5-3',
        title: 'Запуск MediaWiki',
        description: 'Запустите контейнеры MediaWiki',
        commands: [
          'cd /opt/services/mediawiki',
          'docker compose up -d',
          '',
          '# Проверка статуса',
          'docker compose ps',
          '',
          '# Просмотр логов',
          'docker compose logs -f mediawiki'
        ],
        note: 'После первого запуска откройте https://rep.local.inion/wiki/mw-config/ для завершения установки'
      },
      {
        id: '5-4',
        title: 'Настройка LocalSettings.php',
        description: 'После веб-установки настройте MediaWiki',
        commands: [
          '# После завершения веб-установки, скопируйте LocalSettings.php',
          'docker cp mediawiki:/var/www/html/LocalSettings.php /opt/services/mediawiki/',
          '',
          '# Отредактируйте параметры',
          'sudo tee -a /opt/services/mediawiki/LocalSettings.php << \'EOF\'',
          '',
          '# Базовые настройки',
          '$wgServer = "https://rep.local.inion";',
          '$wgScriptPath = "/wiki";',
          '$wgArticlePath = "/wiki/$1";',
          '',
          '# Визуальный редактор (опционально)',
          'wfLoadExtension( \'VisualEditor\' );',
          '$wgDefaultUserOptions[\'visualeditor-enable\'] = 1;',
          'EOF',
          '',
          '# Скопируйте обратно в контейнер',
          'docker cp /opt/services/mediawiki/LocalSettings.php mediawiki:/var/www/html/',
          '',
          '# Перезапустите контейнер',
          'docker restart mediawiki'
        ]
      }
    ]
  },
  {
    title: '6. Развёртывание Портала',
    icon: '🚀',
    steps: [
      {
        id: '6-1',
        title: 'Сборка портала',
        description: 'Соберите веб-портал и разместите его на сервере',
        commands: [
          '# На машине разработки — скопируйте сборку на сервер',
          'scp -r dist/* user@rep.local.inion:/opt/services/portal/',
          '',
          '# На сервере — создайте Dockerfile для портала',
          'cd /opt/services/portal',
          '',
          'tee Dockerfile << \'EOF\'',
          'FROM nginx:alpine',
          'COPY dist/ /usr/share/nginx/html/',
          'COPY nginx.conf /etc/nginx/conf.d/default.conf',
          'EXPOSE 3000',
          'CMD ["nginx", "-g", "daemon off;"]',
          'EOF',
          '',
          'tee nginx.conf << \'EOF\'',
          'server {',
          '    listen 3000;',
          '    root /usr/share/nginx/html;',
          '    index index.html;',
          '',
          '    location / {',
          '        try_files $uri $uri/ /index.html;',
          '    }',
          '}',
          'EOF'
        ]
      },
      {
        id: '6-2',
        title: 'Создание docker-compose.yml для портала',
        description: 'Создайте файл Docker Compose для портала',
        commands: [
          'cd /opt/services/portal',
          '',
          'tee docker-compose.yml << \'EOF\'',
          'version: "3.8"',
          '',
          'services:',
          '  portal:',
          '    build: .',
          '    container_name: portal',
          '    ports:',
          '      - "3000:3000"',
          '    restart: unless-stopped',
          '    networks:',
          '      - services-network',
          '',
          'networks:',
          '  services-network:',
          '    external: true',
          'EOF'
        ]
      },
      {
        id: '6-3',
        title: 'Запуск портала',
        description: 'Соберите и запустите контейнер портала',
        commands: [
          'cd /opt/services/portal',
          'docker compose up -d --build',
          '',
          '# Проверка',
          'docker compose ps',
          'curl http://localhost:3000'
        ]
      }
    ]
  },
  {
    title: '7. Настройка автозапуска и мониторинга',
    icon: '⚙️',
    steps: [
      {
        id: '7-1',
        title: 'Создание systemd-сервисов',
        description: 'Создайте сервисы для автоматического запуска при загрузке',
        commands: [
          '# Сервис для NetBox',
          'sudo tee /etc/systemd/system/netbox.service << \'EOF\'',
          '[Unit]',
          'Description=NetBox DCIM',
          'Requires=docker.service',
          'After=docker.service',
          '',
          '[Service]',
          'Type=oneshot',
          'RemainAfterExit=yes',
          'WorkingDirectory=/opt/services/netbox',
          'ExecStart=/usr/bin/docker compose up -d',
          'ExecStop=/usr/bin/docker compose down',
          '',
          '[Install]',
          'WantedBy=multi-user.target',
          'EOF',
          '',
          '# Сервис для MediaWiki',
          'sudo tee /etc/systemd/system/mediawiki.service << \'EOF\'',
          '[Unit]',
          'Description=MediaWiki',
          'Requires=docker.service',
          'After=docker.service',
          '',
          '[Service]',
          'Type=oneshot',
          'RemainAfterExit=yes',
          'WorkingDirectory=/opt/services/mediawiki',
          'ExecStart=/usr/bin/docker compose up -d',
          'ExecStop=/usr/bin/docker compose down',
          '',
          '[Install]',
          'WantedBy=multi-user.target',
          'EOF',
          '',
          '# Сервис для Портала',
          'sudo tee /etc/systemd/system/portal.service << \'EOF\'',
          '[Unit]',
          'Description=Server Portal',
          'Requires=docker.service',
          'After=docker.service',
          '',
          '[Service]',
          'Type=oneshot',
          'RemainAfterExit=yes',
          'WorkingDirectory=/opt/services/portal',
          'ExecStart=/usr/bin/docker compose up -d',
          'ExecStop=/usr/bin/docker compose down',
          '',
          '[Install]',
          'WantedBy=multi-user.target',
          'EOF',
          '',
          '# Включите сервисы',
          'sudo systemctl daemon-reload',
          'sudo systemctl enable netbox.service mediawiki.service portal.service'
        ]
      },
      {
        id: '7-2',
        title: 'Скрипт резервного копирования',
        description: 'Создайте скрипт для автоматического бэкапа',
        commands: [
          'sudo tee /opt/services/backups/backup.sh << \'SCRIPT\'',
          '#!/bin/bash',
          'BACKUP_DIR="/opt/services/backups/$(date +%Y%m%d_%H%M%S)"',
          'mkdir -p $BACKUP_DIR',
          '',
          '# Backup NetBox',
          'docker exec netbox-postgres pg_dump -U netbox netbox > $BACKUP_DIR/netbox_db.sql',
          'docker run --rm -v netbox_netbox-media:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/netbox-media.tar.gz -C /data .',
          '',
          '# Backup MediaWiki',
          'docker exec wiki-mariadb mysqldump -u root -p$WIKI_ROOT_PASSWORD mediawiki > $BACKUP_DIR/wiki_db.sql',
          'docker run --rm -v mediawiki_wiki-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/wiki-images.tar.gz -C /data .',
          '',
          '# Backup configs',
          'cp -r /opt/services/*/.env $BACKUP_DIR/ 2>/dev/null',
          'cp /etc/nginx/conf.d/rep.local.inion.conf $BACKUP_DIR/',
          '',
          '# Удаление старых бэкапов (старше 30 дней)',
          'find /opt/services/backups/ -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \\;',
          '',
          'echo "Backup completed: $BACKUP_DIR"',
          'SCRIPT',
          '',
          'sudo chmod +x /opt/services/backups/backup.sh'
        ]
      },
      {
        id: '7-3',
        title: 'Настройка cron для бэкапов',
        description: 'Добавьте автоматический бэкап по расписанию',
        commands: [
          '# Ежедневный бэкап в 3:00',
          '(crontab -l 2>/dev/null; echo "0 3 * * * /opt/services/backups/backup.sh >> /var/log/services/backup.log 2>&1") | crontab -',
          '',
          '# Проверка',
          'crontab -l'
        ]
      }
    ]
  },
  {
    title: '8. Добавление новых систем в будущем',
    icon: '🔧',
    steps: [
      {
        id: '8-1',
        title: 'Шаблон для нового сервиса',
        description: 'Используйте этот шаблон для добавления новых систем',
        commands: [
          '# 1. Создайте директорию для нового сервиса',
          'sudo mkdir -p /opt/services/new-service',
          'cd /opt/services/new-service',
          '',
          '# 2. Создайте docker-compose.yml',
          'tee docker-compose.yml << \'EOF\'',
          'version: "3.8"',
          'services:',
          '  new-service:',
          '    image: image-name:latest',
          '    container_name: new-service',
          '    ports:',
          '      - "PORT:PORT"',
          '    restart: unless-stopped',
          '    networks:',
          '      - services-network',
          '',
          'networks:',
          '  services-network:',
          '    external: true',
          'EOF',
          '',
          '# 3. Запустите сервис',
          'docker compose up -d',
          '',
          '# 4. Добавьте location в Nginx конфигурацию',
          '# sudo vim /etc/nginx/conf.d/rep.local.inion.conf',
          '# Добавьте:',
          '# location /new-service/ {',
          '#     proxy_pass http://127.0.0.1:PORT/;',
          '#     proxy_set_header Host $host;',
          '#     proxy_set_header X-Real-IP $remote_addr;',
          '#     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
          '#     proxy_set_header X-Forwarded-Proto $scheme;',
          '# }',
          '',
          '# 5. Перезапустите Nginx',
          'sudo nginx -t && sudo systemctl reload nginx',
          '',
          '# 6. Добавьте систему через веб-портал'
        ],
        note: 'Каждый новый сервис автоматически подключается к общей Docker-сети services-network'
      }
    ]
  }
];

function CommandBlock({ commands }: { commands: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = commands.filter(c => !c.startsWith('#') && c.trim() !== '').join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-slate-600/50 text-slate-400 hover:text-white hover:bg-slate-600 transition-all opacity-0 group-hover:opacity-100"
        title="Копировать команды"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
      <div className="bg-slate-950/50 rounded-xl border border-slate-700/50 p-4 overflow-x-auto">
        <pre className="text-sm font-mono">
          {commands.map((cmd, i) => (
            <div key={i} className={`${cmd.startsWith('#') ? 'text-slate-500' : cmd === '' ? 'h-3' : 'text-emerald-300'}`}>
              {cmd.startsWith('#') ? cmd : cmd === '' ? '' : `$ ${cmd}`}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

export default function InstallGuide() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ '1': true });

  const toggleSection = (index: string) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-4">
          <Terminal className="w-4 h-4" />
          Пошаговая инструкция
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Установка и настройка сервера
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Полное руководство по развёртыванию NetBox, MediaWiki и Портала на сервере Red OS 8
          с URL <code className="px-2 py-0.5 bg-slate-700 rounded text-violet-300">https://rep.local.inion</code>
        </p>
      </motion.div>

      {/* Architecture overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-xl">🏗️</span> Архитектура решения
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <div className="text-white font-medium">Nginx</div>
            <div className="text-slate-400 text-sm">Reverse Proxy + SSL</div>
            <div className="text-xs text-slate-500 mt-1">Порты 80, 443</div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🐳</div>
            <div className="text-white font-medium">Docker</div>
            <div className="text-slate-400 text-sm">Контейнеризация</div>
            <div className="text-xs text-slate-500 mt-1">Все сервисы</div>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <div className="text-white font-medium">SSL/TLS</div>
            <div className="text-slate-400 text-sm">Шифрование</div>
            <div className="text-xs text-slate-500 mt-1">rep.local.inion</div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-sm text-slate-300">
          <div className="text-center">
            <div className="text-violet-400">Клиент → https://rep.local.inion</div>
            <div className="text-slate-500 my-1">↓</div>
            <div className="text-amber-400">Nginx (443) → SSL Termination</div>
            <div className="text-slate-500 my-1">↓</div>
            <div className="flex justify-center gap-8 text-xs">
              <span className="text-blue-400">:3000 → Портал</span>
              <span className="text-cyan-400">:8000 → NetBox</span>
              <span className="text-emerald-400">:8080 → MediaWiki</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Prerequisites */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Требования к серверу
        </h3>
        <ul className="space-y-2 text-slate-300">
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> ОС: Red OS 8 (или совместимый RHEL 8)</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> RAM: минимум 4 GB (рекомендуется 8 GB)</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Диск: минимум 40 GB SSD</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> CPU: 2+ ядра</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> SSL-сертификат для rep.local.inion</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> DNS-запись rep.local.inion → IP сервера</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Доступ к интернету для загрузки пакетов</li>
        </ul>
      </motion.div>

      {/* Steps */}
      <div className="space-y-4">
        {sections.map((section, sIndex) => (
          <motion.div
            key={sIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sIndex * 0.05 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => toggleSection(String(sIndex))}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              </div>
              {expandedSections[String(sIndex)] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {expandedSections[String(sIndex)] && (
              <div className="px-5 pb-5 space-y-6">
                {section.steps.map((step) => (
                  <div key={step.id} className="border-l-2 border-violet-500/30 pl-4">
                    <h4 className="text-white font-medium mb-1">{step.title}</h4>
                    <p className="text-slate-400 text-sm mb-3">{step.description}</p>

                    {step.commands && <CommandBlock commands={step.commands} />}

                    {step.note && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <span className="shrink-0">ℹ️</span>
                        <span>{step.note}</span>
                      </div>
                    )}

                    {step.warning && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{step.warning}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Final notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Проверка после установки
        </h3>
        <div className="space-y-2 text-slate-300 text-sm">
          <p>После выполнения всех шагов проверьте доступность сервисов:</p>
          <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-xs mt-3">
            <div className="text-emerald-300"># Проверка портала</div>
            <div className="text-white">curl -I https://rep.local.inion/</div>
            <div className="text-emerald-300 mt-2"># Проверка NetBox</div>
            <div className="text-white">curl -I https://rep.local.inion/netbox/</div>
            <div className="text-emerald-300 mt-2"># Проверка MediaWiki</div>
            <div className="text-white">curl -I https://rep.local.inion/wiki/</div>
            <div className="text-emerald-300 mt-2"># Проверка всех контейнеров</div>
            <div className="text-white">docker ps --format "table {'{'} .Names {'}'}\t{'{'} .Status {'}'}\t{'{'} .Ports {'}'}"</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
