const cartBox = document.getElementById("checkoutCart");
const checkbox = document.getElementById("sameBilling");
const ids = prefix => ["First", "Last", "Address1", "City", "Province", "Zip"].map(s => document.getElementById(prefix + s));
const shippingFields = ids("ship");
const billingFields = ids("bill");
const modal = document.getElementById("paymentModal");

const lines = () => FLC.cart.get().map(i => ({ ...i, product: FLC.findProduct(i.id) })).filter(l => l.product);

function renderCart() {
    const items = lines();
    if (!items.length) {
        cartBox.innerHTML = `
            <div class="empty-state">
                <img src="${FLC.ROOT}assets/images/ui/empty-cart.webp" alt="Empty cart">
                <h2>Your cart is empty, Coffee na!</h2>
                <a class="btn btn-primary" href="menu.html">Menu</a>
            </div>`;
    } else {
        cartBox.innerHTML = items.map(({ id, qty, product: p }) => `
            <div class="cart-item" data-id="${FLC.escapeHtml(id)}">
                <div class="cart-item-info">
                    <img src="${FLC.imgSrc(p.img)}" alt="${FLC.escapeHtml(p.name)}">
                    <div><h3>${FLC.escapeHtml(p.name)}</h3><p>${FLC.money(p.price)}</p></div>
                </div>
                <div class="quantity-control">
                    <button type="button" class="minus" aria-label="Decrease quantity">−</button>
                    <span class="quantity">${qty}</span>
                    <button type="button" class="plus" aria-label="Increase quantity">+</button>
                </div>
            </div>`).join("");
    }
    const subtotal = items.reduce((s, l) => s + l.product.price * l.qty, 0);
    document.getElementById("itemsTotal").textContent = subtotal.toFixed(2);
    document.getElementById("shippingFee").textContent = items.length ? FLC.SHIPPING_FEE.toFixed(2) : "0.00";
    document.getElementById("grandTotal").textContent = (items.length ? subtotal + FLC.SHIPPING_FEE : 0).toFixed(2);
}

cartBox.addEventListener("click", e => {
    const btn = e.target.closest(".plus, .minus");
    if (!btn) return;
    const row = btn.closest(".cart-item");
    const line = lines().find(l => l.id === row.dataset.id);
    if (btn.classList.contains("plus")) FLC.cart.setQty(line.id, line.qty + 1);
    else if (line.qty > 1) FLC.cart.setQty(line.id, line.qty - 1);
    else if (confirm(`Remove "${line.product.name}" from cart?`)) { FLC.cart.remove(line.id); FLC.toast("Item removed."); }
    renderCart();
});

checkbox.addEventListener("change", () => {
    shippingFields.forEach((f, i) => {
        billingFields[i].disabled = checkbox.checked;
        billingFields[i].value = checkbox.checked ? f.value : "";
    });
});
shippingFields.forEach((f, i) => f.addEventListener("input", () => { if (checkbox.checked) billingFields[i].value = f.value; }));

document.getElementById("openModal").addEventListener("click", () => {
    const fields = shippingFields.concat(checkbox.checked ? [] : billingFields);
    let valid = true;
    fields.forEach(f => { const ok = f.value.trim() !== ""; f.classList.toggle("invalid", !ok); valid = valid && ok; });
    if (!valid) return FLC.toast("Please fill in all required fields.");
    if (!lines().length) return FLC.toast("Your cart is empty!");
    modal.classList.add("show");
});

const closeModal = () => modal.classList.remove("show");
document.getElementById("closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

document.getElementById("paymentForm").addEventListener("submit", e => {
    e.preventDefault();
    const items = lines();
    if (!items.length) return closeModal();
    const subtotal = items.reduce((sum, l) => sum + l.product.price * l.qty, 0);
    const person = FLC.session.get() || {};
    const order = {
        id: "F4-" + Date.now().toString().slice(-8),
        email: person.email || "",
        name: (shippingFields[0].value + " " + shippingFields[1].value).trim(),
        address: `${shippingFields[2].value}, ${shippingFields[3].value}, ${shippingFields[4].value} ${shippingFields[5].value}`,
        items: items.map(l => ({ id: l.id, name: l.product.name, price: l.product.price, qty: l.qty, img: /^data:/.test(l.product.img) ? "" : l.product.img })),
        subtotal,
        shipping: FLC.SHIPPING_FEE,
        total: subtotal + FLC.SHIPPING_FEE,
        createdAt: new Date().toISOString()
    };
    FLC.orders.add(order);
    FLC.cart.clear();
    window.location.href = "receipt.html?id=" + encodeURIComponent(order.id);
});

renderCart();
