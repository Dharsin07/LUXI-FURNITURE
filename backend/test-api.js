const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('SUCCESS: API is working');
      console.log('Products count:', parsed.data?.length || 0);
    } catch (e) {
      console.log('ERROR: Invalid JSON response');
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});

req.end();
