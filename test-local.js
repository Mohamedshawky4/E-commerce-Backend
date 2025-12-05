// Test script for local serverless-offline
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    section: (msg) => console.log(`\n${colors.yellow}━━━ ${msg} ━━━${colors.reset}`)
};

async function testEndpoint(method, path, data = null, description) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${path}`,
            ...(data && { data })
        };

        const response = await axios(config);
        log.success(`${description} - Status: ${response.status}`);
        return response.data;
    } catch (error) {
        log.error(`${description} - ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Error: ${JSON.stringify(error.response.data)}`);
        }
        return null;
    }
}

async function runTests() {
    console.log('\n🚀 Testing Serverless Offline API\n');

    // Test 1: Health Check
    log.section('Health Check');
    await testEndpoint('GET', '/', null, 'Root endpoint');

    // Test 2: Products
    log.section('Products API');
    const products = await testEndpoint('GET', '/api/products', null, 'Get all products');
    if (products && products.length > 0) {
        log.info(`Found ${products.length} products`);
    }

    // Test 3: Categories
    log.section('Categories API');
    const categories = await testEndpoint('GET', '/api/categories', null, 'Get all categories');
    if (categories && categories.length > 0) {
        log.info(`Found ${categories.length} categories`);
    }

    // Test 4: User Registration (Regular User)
    log.section('User API - Regular User');
    const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
    };
    const registeredUser = await testEndpoint('POST', '/api/users/register', testUser, 'Register new user');

    let authToken = null;
    if (registeredUser && registeredUser.token) {
        authToken = registeredUser.token;
        log.success('User registration successful - Token received');
        log.info(`User role: ${registeredUser.user.role}`);
    }

    // Test 5: User Login
    const loginData = {
        email: testUser.email,
        password: testUser.password
    };
    const loggedInUser = await testEndpoint('POST', '/api/users/login', loginData, 'User login');

    // Test 6: Cart (requires authentication)
    if (authToken) {
        log.section('Cart API (Authenticated)');
        try {
            const cartResponse = await axios.get(`${BASE_URL}/api/cart`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            log.success(`Get cart - Status: ${cartResponse.status}`);
        } catch (error) {
            log.error(`Get cart - ${error.message}`);
        }
    }

    // Test 7: Wishlist (requires authentication)
    if (authToken) {
        log.section('Wishlist API (Authenticated)');
        try {
            const wishlistResponse = await axios.get(`${BASE_URL}/api/wishlist`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            log.success(`Get wishlist - Status: ${wishlistResponse.status}`);
        } catch (error) {
            log.error(`Get wishlist - ${error.message}`);
        }
    }

    // Test 8: User's Orders (requires authentication)
    if (authToken) {
        log.section('My Orders API (Authenticated)');
        try {
            const ordersResponse = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            log.success(`Get my orders - Status: ${ordersResponse.status}`);
        } catch (error) {
            log.error(`Get my orders - ${error.message}`);
        }
    }

    // Test 9: User's Reviews (requires authentication)
    if (authToken) {
        log.section('My Reviews API (Authenticated)');
        try {
            const reviewsResponse = await axios.get(`${BASE_URL}/api/reviews/user`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            log.success(`Get my reviews - Status: ${reviewsResponse.status}`);
        } catch (error) {
            log.error(`Get my reviews - ${error.message}`);
        }
    }

    // Test 10: User Profile (requires authentication)
    if (authToken) {
        log.section('User Profile API (Authenticated)');
        try {
            const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            log.success(`Get user profile - Status: ${profileResponse.status}`);
        } catch (error) {
            log.error(`Get user profile - ${error.message}`);
        }
    }

    // Test 11: Admin Login
    log.section('Admin API - Login with Admin Account');
    const adminCredentials = {
        email: 'mohamedshawky4@example.com',
        password: 'password123'
    };
    const adminUser = await testEndpoint('POST', '/api/users/login', adminCredentials, 'Admin login');

    let adminToken = null;
    if (adminUser && adminUser.token) {
        adminToken = adminUser.token;
        log.success('Admin login successful - Token received');
        log.info(`Admin role: ${adminUser.user.role}`);
    }

    // Test 12: Get All Orders (Admin Only)
    if (adminToken) {
        log.section('Admin - Get All Orders');
        try {
            const allOrdersResponse = await axios.get(`${BASE_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            log.success(`Get all orders - Status: ${allOrdersResponse.status}`);
            if (allOrdersResponse.data && allOrdersResponse.data.length !== undefined) {
                log.info(`Total orders in system: ${allOrdersResponse.data.length}`);
            }
        } catch (error) {
            log.error(`Get all orders - ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
            }
        }
    }

    // Test 13: Get All Reviews (Admin Only)
    if (adminToken) {
        log.section('Admin - Get All Reviews');
        try {
            const allReviewsResponse = await axios.get(`${BASE_URL}/api/reviews`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            log.success(`Get all reviews - Status: ${allReviewsResponse.status}`);
            if (allReviewsResponse.data && allReviewsResponse.data.length !== undefined) {
                log.info(`Total reviews in system: ${allReviewsResponse.data.length}`);
            }
        } catch (error) {
            log.error(`Get all reviews - ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
            }
        }
    }

    // Test 14: Get All Users (Admin Only)
    if (adminToken) {
        log.section('Admin - Get All Users');
        try {
            const allUsersResponse = await axios.get(`${BASE_URL}/api/users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            log.success(`Get all users - Status: ${allUsersResponse.status}`);
            if (allUsersResponse.data && allUsersResponse.data.length !== undefined) {
                log.info(`Total users in system: ${allUsersResponse.data.length}`);
            }
        } catch (error) {
            log.error(`Get all users - ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
            }
        }
    }

    console.log('\n✅ Testing complete!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Regular user endpoints: Tested ✓`);
    console.log(`   - Admin endpoints: ${adminToken ? 'Tested ✓' : 'Skipped (admin login failed)'}`);
    console.log('');
}

// Run tests
runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
});
