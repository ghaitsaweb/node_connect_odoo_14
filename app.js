const xmlrpc = require('xmlrpc');

// Konfigurasi koneksi Odoo
const url = 'http://localhost';
const port = 8015;
const db = '18_08_2024';
const username = 'admin';
const password = 'xxxx';

// Buat client XML-RPC untuk objek umum dan objek
const common = xmlrpc.createClient({ url: `${url}:${port}/xmlrpc/2/common` });
const object = xmlrpc.createClient({ url: `${url}:${port}/xmlrpc/2/object` });

// Otentikasi ke Odoo
common.methodCall('authenticate', [db, username, password, {}], (err, uid) => {
    if (err) {
        console.error('Error during authentication:', err);
        return;
    }

    console.log('Authenticated with user ID:', uid);

    // CRUD operations
    createCustomer(uid);
    createSaleOrder(uid);  // Create sale order
});

// Create customer
function createCustomer(uid) {
    const params = [
        db,
        uid,
        password,
        'res.partner',
        'create',
        [{
            name: 'New Customer',
            email: 'new.customer@example.com',
            phone: '1234567890',
        }]
    ];

    object.methodCall('execute_kw', params, (err, result) => {
        if (err) {
            console.error('Error creating customer:', err);
            return;
        }

        console.log('Customer created with ID:', result);
        // Pass the new customer ID to createSaleOrder function
        createSaleOrder(uid, result);
    });
}

// Create sale order
function createSaleOrder(uid) {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');  // Format date as 'YYYY-MM-DD HH:MM:SS'

    const params = [
        db,
        uid,
        password,
        'sale.order',
        'create',
        [{
            partner_id: 267326,  // Customer created earlier
            date_order: formattedDate,  // Correctly formatted date
        }]
    ];

    object.methodCall('execute_kw', params, (err, saleOrderId) => {
        if (err) {
            console.error('Error creating sale order:', err);
            return;
        }

        console.log('Sale order created with ID:', saleOrderId);
        // After sale order is created, create sale order line
        createSaleOrderLine(uid, saleOrderId);
    });
}


// Create sale order line
function createSaleOrderLine(uid, saleOrderId) {
    const params = [
        db,
        uid,
        password,
        'sale.order.line',
        'create',
        [{
            order_id: saleOrderId,  // The sale order created earlier
            product_id: 516170,       // Replace with the actual product ID
            product_uom_qty: 1,     // Quantity
            price_unit: 100.0,      // Price per unit
        }]
    ];

    object.methodCall('execute_kw', params, (err, result) => {
        if (err) {
            console.error('Error creating sale order line:', err);
            return;
        }

        console.log('Sale order line created with ID:', result);
    });
}
