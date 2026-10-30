const box = document.getElementById("receipt");
const order = FLC.orders.get(new URLSearchParams(window.location.search).get("id"));
const me = FLC.session.get();
const allowed = order && me && order.email.toLowerCase() === me.email.toLowerCase();

if (!allowed) {
    box.innerHTML = `
        <div class="empty-state">
            <h1 class="page-title">Order not found</h1>
            <a class="btn btn-primary" href="menu.html">Back to menu</a>
        </div>`;
} else {
    const rows = order.items.map(i => `
        <div class="receipt-row">
            <img src="${FLC.imgSrc(i.img)}" alt="${FLC.escapeHtml(i.name)}">
            <div class="receipt-row-name"><strong>${FLC.escapeHtml(i.name)}</strong><span>${i.qty} x ${FLC.money(i.price)}</span></div>
            <strong>${FLC.money(i.qty * i.price)}</strong>
        </div>`).join("");

    box.innerHTML = `
        <div class="receipt-head">
            <div class="receipt-check" aria-hidden="true">&#10003;</div>
            <h1>Thank you for your order!</h1>
            <p>Your payment was successful. Keep this receipt for your records.</p>
        </div>
        <dl class="receipt-meta">
            <div><dt>Order number</dt><dd>${FLC.escapeHtml(order.id)}</dd></div>
            <div><dt>Date</dt><dd>${FLC.formatDate(order.createdAt)}</dd></div>
            <div><dt>Name</dt><dd>${FLC.escapeHtml(order.name)}</dd></div>
            <div><dt>Delivery address</dt><dd>${FLC.escapeHtml(order.address)}</dd></div>
        </dl>
        <div class="receipt-items">${rows}</div>
        <div class="receipt-totals">
            <p><span>Items</span><span>${FLC.money(order.subtotal)}</span></p>
            <p><span>Shipping Fee</span><span>${FLC.money(order.shipping)}</span></p>
            <p class="grand"><span>Total</span><span>${FLC.money(order.total)}</span></p>
        </div>
        <div class="receipt-actions">
            <a class="btn btn-primary" href="menu.html">Order again</a>
            <a class="btn btn-outline" href="orders.html">My orders</a>
            <button type="button" class="btn btn-outline" id="printBtn">Print receipt</button>
        </div>`;
    document.getElementById("printBtn").addEventListener("click", () => window.print());
}
