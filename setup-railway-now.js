// Автоматическая настройка Railway через API
const https = require('https');

const RAILWAY_API_TOKEN = 'ae83fcae-811e-4d87-ab54-3430b5c9aa3a';
const PROJECT_ID = 'a6111262-b4c7-468f-97e6-099305db819c';

const headers = {
  'Authorization': `Bearer ${RAILWAY_API_TOKEN}`,
  'Content-Type': 'application/json'
};

function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function setupRailway() {
  console.log('🚀 Автоматическая настройка Railway...\n');

  try {
    // Получаем список сервисов
    console.log('📋 Получение списка сервисов...');
    const servicesRes = await makeRequest(`https://api.railway.app/v1/projects/${PROJECT_ID}/services`);
    
    if (servicesRes.status !== 200) {
      throw new Error(`HTTP ${servicesRes.status}: ${JSON.stringify(servicesRes.data)}`);
    }

    const services = servicesRes.data.services || [];
    
    if (services.length === 0) {
      console.log('⚠️  Сервисы не найдены.');
      console.log('Создайте сервис через Dashboard или подключите GitHub репозиторий.');
      console.log(`https://railway.app/project/${PROJECT_ID}`);
      return;
    }

    const mainService = services[0];
    const SERVICE_ID = mainService.service.id;
    const serviceName = mainService.service.name;
    
    console.log(`✅ Найден сервис: ${serviceName} (ID: ${SERVICE_ID})\n`);

    // Настраиваем переменные окружения
    console.log('📋 Настройка переменных окружения...');
    
    const jwtSecret = `hunslor-railway-secret-key-production-2024-${Math.floor(Math.random() * 900000 + 100000)}-min-32-chars`;
    
    const variables = {
      'JWT_SECRET': jwtSecret,
      'TELEGRAM_BOT_TOKEN': '8395474547:AAHM9sBQalUeNgvTyahr-6pdlaCaPW_0054',
      'TELEGRAM_ADMIN_ID': '8372817782',
      'OPENAI_API_KEY': 'sk-proj-****************',
      'NODE_ENV': 'production'
    };
    
    let successCount = 0;
    for (const [key, value] of Object.entries(variables)) {
      try {
        const varRes = await makeRequest(
          `https://api.railway.app/v1/services/${SERVICE_ID}/variables`,
          'POST',
          { name: key, value: value }
        );
        
        if (varRes.status === 200 || varRes.status === 201) {
          console.log(`  ✅ ${key}`);
          successCount++;
        } else if (varRes.status === 409) {
          // Переменная существует, обновляем
          const updateRes = await makeRequest(
            `https://api.railway.app/v1/services/${SERVICE_ID}/variables/${key}`,
            'PATCH',
            { value: value }
          );
          if (updateRes.status === 200) {
            console.log(`  ✅ ${key} (обновлен)`);
            successCount++;
          } else {
            console.log(`  ⚠️  ${key} (ошибка обновления: ${updateRes.status})`);
          }
        } else {
          console.log(`  ⚠️  ${key} (ошибка: ${varRes.status})`);
          console.log(`      Ответ: ${JSON.stringify(varRes.data)}`);
        }
      } catch (error) {
        console.log(`  ⚠️  ${key} (ошибка: ${error.message})`);
      }
    }
    
    console.log(`\n✅ Установлено переменных: ${successCount} из ${Object.keys(variables).length}\n`);
    
    // Проверяем PostgreSQL
    console.log('📋 Проверка PostgreSQL...');
    const hasPostgres = services.some(service => {
      const name = (service.service.name || '').toLowerCase();
      const type = service.service.serviceType || '';
      return name.includes('postgres') || 
             name.includes('database') || 
             type === 'postgresql';
    });
    
    if (hasPostgres) {
      const postgresService = services.find(service => {
        const name = (service.service.name || '').toLowerCase();
        const type = service.service.serviceType || '';
        return name.includes('postgres') || name.includes('database') || type === 'postgresql';
      });
      console.log(`  ✅ PostgreSQL найден: ${postgresService.service.name}`);
    } else {
      console.log('  ⚠️  PostgreSQL не найден');
      console.log('  Добавьте через Dashboard: + New → Database → Add PostgreSQL');
    }
    
    console.log('\n✅ Настройка завершена!');
    console.log(`\nПроверьте Railway Dashboard:`);
    console.log(`https://railway.app/project/${PROJECT_ID}`);
    console.log('\nRailway автоматически задеплоит приложение при следующем push в GitHub.');
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.log('\nНастройте вручную через Dashboard:');
    console.log(`https://railway.app/project/${PROJECT_ID}/variables`);
  }
}

setupRailway();
