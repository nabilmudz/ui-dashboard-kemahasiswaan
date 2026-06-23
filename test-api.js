const baseUrl = "https://dashboard-kemahasiswaan.andiputraw.my.id";

async function testApi() {
  console.log("=== Testing Backend API ===");
  
  // 1. Health check
  try {
    const res = await fetch(`${baseUrl}/health`);
    console.log(`\n1. GET /health -> Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response text: ${text.slice(0, 300)}`);
  } catch (err) {
    console.error("Health check failed:", err.message);
  }

  // 2. Token Login
  try {
    const payload = {
      nim: "123456789",
      password: "wrongpassword"
    };
    const res = await fetch(`${baseUrl}/auth/sso/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log(`\n2. POST /auth/sso/token (Invalid credentials) -> Status: ${res.status}`);
    console.log(`Cookies:`, res.headers.get('set-cookie'));
    const text = await res.text();
    console.log(`Response body:`, text);
  } catch (err) {
    console.error("Login request failed:", err.message);
  }
}

testApi();
