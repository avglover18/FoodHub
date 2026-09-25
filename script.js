// ---- FOOD DATA ----
const foods = [
  { id: 1, name: "Momo", cuisine: "Nepali", price: 150, emoji: "🥟" },
  { id: 2, name: "Dal Bhat", cuisine: "Nepali", price: 200, emoji: "🍛" },
  { id: 3, name: "Sel Roti", cuisine: "Nepali", price: 80, emoji: "🍩" },
  { id: 4, name: "Butter Chicken", cuisine: "Indian", price: 320, emoji: "🍗" },
  { id: 5, name: "Paneer Tikka", cuisine: "Indian", price: 280, emoji: "🧀" },
  { id: 6, name: "Naan", cuisine: "Indian", price: 60, emoji: "🫓" },
  { id: 7, name: "Chow Mein", cuisine: "Chinese", price: 220, emoji: "🍜" },
  { id: 8, name: "Fried Rice", cuisine: "Chinese", price: 200, emoji: "🍚" },
  { id: 9, name: "Spring Rolls", cuisine: "Chinese", price: 150, emoji: "🥢" },
  { id: 10, name: "Margherita Pizza", cuisine: "Italian", price: 450, emoji: "🍕" },
  { id: 11, name: "Spaghetti", cuisine: "Italian", price: 380, emoji: "🍝" },
  { id: 12, name: "Cheeseburger", cuisine: "Fast Food", price: 250, emoji: "🍔" },
  { id: 13, name: "French Fries", cuisine: "Fast Food", price: 120, emoji: "🍟" },
];

const cuisines = ["All", "Nepali", "Indian", "Chinese", "Italian", "Fast Food"];

// ---- STATE ----
let cart = {};       // { foodId: quantity }
let menuQty = {};    // temporary quantity picker on each card
let activeCuisine = "All";

// ---- RENDER CUISINE TABS ----
function renderTabs() {
  const tabsEl = document.getElementById("cuisine-tabs");
  tabsEl.innerHTML = cuisines.map(c => `
    <button class="tab-btn ${c === activeCuisine ? 'active' : ''}" onclick="filterCuisine('${c}')">
      ${c}
    </button>
  `).join("");
}

function filterCuisine(c) {
  activeCuisine = c;
  renderTabs();
  renderMenu();
}

// ---- RENDER MENU ----
function renderMenu() {
  const grid = document.getElementById("menu-grid");
  const list = activeCuisine === "All" ? foods : foods.filter(f => f.cuisine === activeCuisine);

  grid.innerHTML = list.map(food => {
    if (!menuQty[food.id]) menuQty[food.id] = 1;
    return `
      <div class="food-card">
        <div class="food-emoji">${food.emoji}</div>
        <div class="food-name">${food.name}</div>
        <div class="food-cuisine">${food.cuisine}</div>
        <div class="food-price">Rs. ${food.price}</div>
        <div class="qty-control">
          <button onclick="changeMenuQty(${food.id}, -1)">-</button>
          <span>${menuQty[food.id]}</span>
          <button onclick="changeMenuQty(${food.id}, 1)">+</button>
        </div>
        <button class="add-btn" onclick="addToCart(${food.id})">Add to Cart</button>
      </div>
    `;
  }).join("");
}

function changeMenuQty(id, delta) {
  menuQty[id] = Math.max(1, (menuQty[id] || 1) + delta);
  renderMenu();
}

// ---- CART LOGIC ----
function addToCart(id) {
  const qty = menuQty[id] || 1;
  cart[id] = (cart[id] || 0) + qty;
  menuQty[id] = 1;
  renderMenu();
  updateCartUI();
}

function changeCartQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateCartUI();
}

function removeFromCart(id) {
  delete cart[id];
  updateCartUI();
}

function getCartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const food = foods.find(f => f.id == id);
    return sum + food.price * qty;
  }, 0);
}

function updateCartUI() {
  const itemsEl = document.getElementById("cart-items");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    itemsEl.innerHTML = `<p style="text-align:center;color:#999;margin-top:30px;">Your cart is empty</p>`;
  } else {
    itemsEl.innerHTML = entries.map(([id, qty]) => {
      const food = foods.find(f => f.id == id);
      return `
        <div class="cart-item">
          <div>
            <div class="cart-item-name">${food.emoji} ${food.name}</div>
            <div class="cart-item-sub">Rs. ${food.price} x ${qty}</div>
          </div>
          <div class="qty-control">
            <button onclick="changeCartQty(${id}, -1)">-</button>
            <span>${qty}</span>
            <button onclick="changeCartQty(${id}, 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${id})">✖</button>
        </div>
      `;
    }).join("");
  }

  const total = getCartTotal();
  document.getElementById("cart-total").innerText = `Rs. ${total}`;
  document.getElementById("cart-count").innerText =
    entries.reduce((sum, [, qty]) => sum + qty, 0);
}

// ---- CART SIDEBAR TOGGLE ----
function toggleCart() {
  document.getElementById("cart-sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("show");
}

// ---- CHECKOUT ----
function openCheckout() {
  if (Object.keys(cart).length === 0) {
    alert("Your cart is empty!");
    return;
  }
  document.getElementById("modal-total").innerText = `Rs. ${getCartTotal()}`;
  document.getElementById("checkout-modal").classList.add("show");
}

function closeCheckout() {
  document.getElementById("checkout-modal").classList.remove("show");
}

document.getElementById("checkout-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("cust-name").value;
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const total = getCartTotal();

  // ---- PAYMENT HANDLING ----
  // NOTE: eSewa and PayPal need real merchant/API integration on a backend server.
  // This is a front-end simulation showing where that integration would go.
  if (payment === "esewa") {
    simulatePaymentRedirect("eSewa", () => finishOrder(name, "eSewa", total));
  } else if (payment === "paypal") {
    simulatePaymentRedirect("PayPal", () => finishOrder(name, "PayPal", total));
  } else {
    finishOrder(name, "Cash on Delivery", total);
  }
});

function simulatePaymentRedirect(gateway, callback) {
  // In a real app, you would redirect to the gateway's payment page
  // or call your backend to create a payment session, e.g.:
  // window.location.href = "/api/pay/esewa?amount=" + total;
  alert(`Redirecting to ${gateway} for payment of Rs. ${getCartTotal()}...`);
  setTimeout(callback, 800);
}

function finishOrder(name, method, total) {
  closeCheckout();
  document.getElementById("confirm-text").innerText =
    `Thank you, ${name}! Your order of Rs. ${total} via ${method} has been placed.`;
  document.getElementById("confirm-modal").classList.add("show");

  cart = {};
  updateCartUI();
  document.getElementById("checkout-form").reset();
}

function closeConfirm() {
  document.getElementById("confirm-modal").classList.remove("show");
}

// ---- INIT ----
renderTabs();
renderMenu();
updateCartUI();