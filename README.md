[index.html](https://github.com/user-attachments/files/26665218/index.html)
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dreamery SaaS</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 font-sans">

<!-- AUTH -->
<div id="auth" class="flex items-center justify-center h-screen">
  <div class="bg-white p-8 rounded-2xl shadow w-80">
    <h2 class="text-2xl font-bold mb-4 text-center">Dreamery SaaS</h2>
    <input id="email" placeholder="Email" class="border p-2 mb-3 w-full" />
    <input id="password" type="password" placeholder="Password" class="border p-2 mb-3 w-full" />
    <button onclick="login()" class="bg-black text-white w-full py-2 rounded mb-2">Đăng nhập</button>
    <button onclick="register()" class="border w-full py-2 rounded">Đăng ký</button>
  </div>
</div>

<!-- DASHBOARD -->
<div id="app" class="hidden flex h-screen">

  <!-- SIDEBAR -->
  <aside class="w-64 bg-black text-white p-6">
    <h2 class="text-xl font-bold mb-6">Dreamery</h2>
    <ul class="space-y-3">
      <li>Dashboard</li>
      <li>Lịch hẹn</li>
      <li>Khách hàng</li>
    </ul>
  </aside>

  <!-- MAIN -->
  <main class="flex-1 p-6 overflow-y-auto">

    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>

    <!-- STATS -->
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white p-4 rounded shadow">
        <p class="text-gray-500">Khách hôm nay</p>
        <h2 id="totalCustomers" class="text-2xl font-bold">0</h2>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <p class="text-gray-500">Doanh thu</p>
        <h2 class="text-2xl font-bold">--</h2>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <p class="text-gray-500">Quay lại</p>
        <h2 class="text-2xl font-bold">--</h2>
      </div>
    </div>

    <!-- BOOKING FORM -->
    <div class="bg-white p-4 rounded shadow mb-6">
      <h2 class="font-bold mb-2">Thêm lịch</h2>
      <input id="name" placeholder="Tên" class="border p-2 mr-2" />
      <input id="phone" placeholder="SĐT" class="border p-2 mr-2" />
      <select id="service" class="border p-2 mr-2">
        <option>Massage thư giãn</option>
        <option>Massage chuyên sâu</option>
      </select>
      <input id="time" type="time" class="border p-2 mr-2" />
      <button onclick="addBooking()" class="bg-black text-white px-4 py-2">Thêm</button>
    </div>

    <!-- TABLE -->
    <div class="bg-white p-4 rounded shadow">
      <h2 class="font-bold mb-2">Lịch hẹn</h2>
      <div id="bookings"></div>
    </div>

  </main>
</div>

<script>
let shop_id = null;
const API = "http://localhost:3000";

async function register() {
  await fetch(API + '/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Shop",
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });
  alert('Đăng ký thành công');
}

async function login() {
  const res = await fetch(API + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });

  const data = await res.json();
  shop_id = data.id;

  document.getElementById('auth').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  loadBookings();
}

async function loadBookings() {
  const res = await fetch(`${API}/bookings/${shop_id}`);
  const data = await res.json();

  document.getElementById('totalCustomers').innerText = data.length;

  document.getElementById('bookings').innerHTML = data.map(b => `
    <div class="border-b py-2">
      ${b.name} - ${b.service} - ${b.time}
    </div>
  `).join('');
}

async function addBooking() {
  await fetch(API + '/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shop_id,
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      service: document.getElementById('service').value,
      time: document.getElementById('time').value
    })
  });

  loadBookings();
}
</script>

</body>
</html>
