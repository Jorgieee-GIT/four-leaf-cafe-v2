const list = document.getElementById("orderList");
const me = FLC.session.get();
const mine = me ? FLC.orders.forUser(me.email) : [];

if (!mine.length) {
    list.innerHTML = `
        <div class="empty-state panel">
            <img src="${FLC.ROOT}assets/images/ui/empty-cart.webp" alt="">
            <h2>No orders yet</h2>
            <a class="btn btn-primary" href="menu.html">Browse the menu</a>
        </div>`;
} else {
    list.innerHTML = mine.map(o => {
        const count = o.items.reduce((sum, i) => sum + i.qty, 0);
        const names = o.items.map(i => `${i.qty} x ${FLC.escapeHtml(i.name)}`).join(", ");
        return `
            <article class="order-card">
                <div class="order-card-main">
                    <h3>${FLC.escapeHtml(o.id)}</h3>
                    <p class="order-date">${FLC.formatDate(o.createdAt)}</p>
                    <p class="order-items">${names}</p>
                </div>
                <div class="order-card-side">
                    <span class="order-count">${count} item${count === 1 ? "" : "s"}</span>
                    <strong>${FLC.money(o.total)}</strong>
                    <a class="btn btn-outline btn-sm" href="receipt.html?id=${encodeURIComponent(o.id)}">View receipt</a>
                </div>
            </article>`;
    }).join("");
}
