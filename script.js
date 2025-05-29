const DRINKS = {
  coffee: ["아메리카노", "바닐라라떼", "카라멜마끼야또", "카페모카"],
  ade: ["청포도", "레몬", "자몽"]
};
const STATUSES = ["주문접수", "만드는중", "픽업요망", "주문완료"];
const orderList = document.getElementById('order-list');
const drinkType = document.getElementById('drink-type');
const drinkSelect = document.getElementById('drink');
const tempBox = document.getElementById('temp-box');
const errorDiv = document.getElementById('order-error');

// 주문 내역 로컬스토리지
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
refreshDrinkOptions();
renderOrders();

drinkType.addEventListener('change', refreshDrinkOptions);

function refreshDrinkOptions() {
  drinkSelect.innerHTML = '';
  const type = drinkType.value;
  DRINKS[type].forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    drinkSelect.appendChild(opt);
  });
  // 온도 선택 박스 노출 조절
  if (type === "coffee") {
    tempBox.innerHTML = `
      <label><input type="radio" name="temp" value="Hot" checked /> Hot</label>
      <label><input type="radio" name="temp" value="Ice" /> Ice</label>
    `;
  } else {
    tempBox.innerHTML = `<span>Ice</span>`;
  }
}

function todayString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function orderDrink() {
  errorDiv.textContent = "";
  const name = document.getElementById('name').value.trim();
  const type = drinkType.value;
  const drink = drinkSelect.value;
  const temp = (type === "coffee")
    ? document.querySelector('input[name="temp"]:checked').value
    : "Ice";

  if (!name) {
    errorDiv.textContent = "이름을 입력해주세요!";
    return;
  }
  const already = orders.find(
    o => o.name === name && o.date === todayString()
  );
  if (already) {
    errorDiv.textContent = "죄송합니다. 하루에 한 잔만 주문 가능합니다.";
    return;
  }
  const newOrder = {
    id: Date.now(),
    name, type, drink, temp,
    status: STATUSES[0],
    date: todayString()
  };
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
  document.getElementById('name').value = "";
}

function changeStatus(id) {
  orders = orders.map(order => {
    if (order.id !== id) return order;
    const idx = STATUSES.indexOf(order.status);
    if (idx < STATUSES.length - 1) {
      return { ...order, status: STATUSES[idx + 1] };
    }
    return order;
  });
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrders();
}

function renderOrders() {
  orderList.innerHTML = "";
  orders
    .filter(o => o.date === todayString())
    .forEach(order => {
      const li = document.createElement('li');
      li.innerHTML = `
        <b>${order.name}</b>: ${order.drink} (${order.temp})<br>
        상태: <b>${order.status}</b>
        ${order.status !== "주문완료" ? 
          `<button class="status-btn" onclick="changeStatus(${order.id})">상태 변경</button>` 
          : ""}
      `;
      orderList.appendChild(li);
    });
}
