(async () => {
  try {
    // Ensure test user exists (register — safe to call even if duplicate may respond with conflict)
    try {
      const reg = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'QA Buyer', email: 'qa.buyer@example.com', password: 'password123', role: 'buyer', phone: '08000000000', location: 'Agbor, Delta State', shoppingInterest: 'Vegetables' }),
      });
      console.log('register status', reg.status);
      try { console.log(await reg.json()); } catch {}
    } catch (e) {
      // ignore
    }

    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'qa.buyer@example.com', password: 'password123' }),
    });

    console.log('login status', loginRes.status);
    const loginJson = await loginRes.json();
    console.log('login body', loginJson);

    const token = loginJson.token;

    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: [{ productId: '1', quantity: 1, unitPrice: 2500 }], deliveryAddress: 'Agbor, Delta State' }),
    });

    console.log('order status', orderRes.status);
    const orderJson = await orderRes.json();
    console.log('order body', orderJson);
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
})();
