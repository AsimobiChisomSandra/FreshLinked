(async () => {
  const base = 'http://localhost:5000/api';
  const sleep = (t) => new Promise((r) => setTimeout(r, t));
  try {
    const runId = Date.now();
    console.log('Registering farmer...');
    let res = await fetch(`${base}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'QA Farmer', email: `qa.farmer+${runId}@example.com`, password: 'farmerpass', role: 'farmer', phone: '08011111111', location: 'Agbor' }),
    });
    console.log('farmer register', res.status);
    try { console.log(await res.json()); } catch {}

    console.log('Logging in farmer...');
    res = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `qa.farmer+${runId}@example.com`, password: 'farmerpass' }) });
    const farmerLogin = await res.json();
    console.log('farmer login', res.status, farmerLogin.message || '');
    const farmerToken = farmerLogin.token;

    console.log('Creating product as farmer...');
    res = await fetch(`${base}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + farmerToken }, body: JSON.stringify({ name: `E2E Test Product ${runId}`, price: 500, quantity: 10, harvestDate: new Date().toISOString(), category: 'Vegetables', unit: 'unit' }) });
    const prod = await res.json();
    if (res.status !== 201) {
      console.error('create product failed:', res.status, prod);
    } else {
      console.log('create product', res.status, prod._id || prod.id || 'no-id');
    }
    const productId = prod._id || prod.id;

    console.log('Registering buyer...');
    res = await fetch(`${base}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'QA Buyer E2E', email: `qa.buyer.e2e+${runId}@example.com`, password: 'buyerpass', role: 'buyer', phone: '08022222222', location: 'Agbor' }) });
    console.log('buyer register', res.status);

    console.log('Logging in buyer...');
    res = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `qa.buyer.e2e+${runId}@example.com`, password: 'buyerpass' }) });
    const buyerLogin = await res.json();
    const buyerToken = buyerLogin.token;
    console.log('buyer login', res.status);

    console.log('Creating order as buyer...');
    res = await fetch(`${base}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + buyerToken }, body: JSON.stringify({ items: [{ productId, quantity: 2 }], deliveryAddress: 'Agbor' }) });
    const order = await res.json();
    console.log('create order', res.status, order._id || order.id || order.error || order);
    const orderId = order._id || order.id;

    if (!orderId) {
      console.error('Order creation failed, aborting E2E.');
      process.exit(1);
    }

    console.log('Farmer fetching orders...');
    res = await fetch(`${base}/orders`, { method: 'GET', headers: { Authorization: 'Bearer ' + farmerToken } });
    const ordersForFarmer = await res.json();
    console.log('farmer orders', res.status, (ordersForFarmer && ordersForFarmer.length) || 0);

    console.log('Farmer updating order status to confirmed...');
    res = await fetch(`${base}/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + farmerToken }, body: JSON.stringify({ status: 'confirmed' }) });
    console.log('update status', res.status, await res.json());

    console.log('Farmer updating order status to out_for_delivery...');
    res = await fetch(`${base}/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + farmerToken }, body: JSON.stringify({ status: 'out_for_delivery' }) });
    console.log('update status', res.status, await res.json());

    console.log('Farmer updating order status to delivered...');
    res = await fetch(`${base}/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + farmerToken }, body: JSON.stringify({ status: 'delivered' }) });
    console.log('update status', res.status, await res.json());

    console.log('E2E test finished successfully.');
  } catch (err) {
    console.error('E2E failure', err);
    process.exit(1);
  }
})();
