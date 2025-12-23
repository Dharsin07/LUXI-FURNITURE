require('dotenv').config();
const productService = require('./src/services/productService');

console.log('Testing productService.getProducts()...');

async function testProductService() {
  try {
    const result = await productService.getProducts({});
    console.log('SUCCESS: Products fetched:', result.products?.length || 0);
    console.log('First product:', result.products?.[0]?.name || 'None');
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Full error:', error);
  }
}

testProductService();
