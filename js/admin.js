const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const confirmModal = document.getElementById("confirmModal");
const editIndexInput = document.getElementById("editIndex");

let products = JSON.parse(localStorage.getItem(FLC.KEY.custom)) || [];
let selectedDeleteIndex = null;

const persist = () => localStorage.setItem(FLC.KEY.custom, JSON.stringify(products));

function renderProducts() {
    if (!products.length) {
        productList.innerHTML = `<p class="admin-empty">No custom products yet. Items you add here appear on the menu page.</p>`;
        return;
    }
    productList.innerHTML = products.map((p, i) => `
        <div class="admin-product-card">
            <img src="${FLC.imgSrc(p.image)}" alt="${FLC.escapeHtml(p.name)}">
            <div class="card-content">
                <h3>${FLC.escapeHtml(p.name)}</h3>
                <p>${FLC.escapeHtml(p.description)}</p>
                <p class="price">${FLC.money(p.price)}</p>
            </div>
            <div class="admin-product-actions">
                <button type="button" class="btn btn-outline btn-sm edit-btn" data-index="${i}">Edit</button>
                <button type="button" class="btn btn-danger btn-sm danger-btn" data-index="${i}">Delete</button>
            </div>
        </div>`).join("");
}

productForm.addEventListener("submit", e => {
    e.preventDefault();
    const editIndex = editIndexInput.value;
    const file = document.getElementById("image").files[0];

    const save = image => {
        const product = {
            id: editIndex !== "" ? products[editIndex].id : "custom-" + Date.now(),
            name: document.getElementById("name").value.trim(),
            description: document.getElementById("description").value.trim(),
            price: document.getElementById("price").value,
            category: document.getElementById("category").value,
            image
        };
        const updating = editIndex !== "";
        updating ? (products[editIndex] = product) : products.push(product);
        try { persist(); } catch { FLC.toast("Storage is full - try a smaller image."); return; }
        productForm.reset();
        editIndexInput.value = "";
        renderProducts();
        renderStats();
        FLC.toast(updating ? "Product updated successfully!" : "Product added successfully!");
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = ev => save(ev.target.result);
        reader.readAsDataURL(file);
    } else {
        save(editIndex !== "" ? products[editIndex].image : "");
    }
});

productList.addEventListener("click", e => {
    const edit = e.target.closest(".edit-btn");
    const del = e.target.closest(".danger-btn");
    if (edit) {
        const index = parseInt(edit.dataset.index, 10);
        const p = products[index];
        document.getElementById("name").value = p.name;
        document.getElementById("description").value = p.description;
        document.getElementById("price").value = p.price;
        document.getElementById("category").value = p.category;
        editIndexInput.value = index;
        productForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (del) { selectedDeleteIndex = parseInt(del.dataset.index, 10); confirmModal.classList.add("show"); }
});

function closeModal() { confirmModal.classList.remove("show"); selectedDeleteIndex = null; }

document.getElementById("confirmYes").addEventListener("click", () => {
    if (selectedDeleteIndex !== null) {
        products.splice(selectedDeleteIndex, 1);
        persist();
        renderProducts();
        renderStats();
        FLC.toast("Product deleted successfully!");
    }
    closeModal();
});
document.getElementById("confirmNo").addEventListener("click", closeModal);
confirmModal.addEventListener("click", e => { if (e.target === confirmModal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

renderProducts();

const orderRows = document.getElementById("orderRows");
const orderCount = document.getElementById("orderCount");
const orderModal = document.getElementById("orderModal");
const orderDetail = document.getElementById("orderDetail");

function renderStats() {
    const all = FLC.orders.all();
    document.getElementById("statItems").textContent = FLC.getProducts().length;
    document.getElementById("statOrders").textContent = all.length;
    document.getElementById("statRevenue").textContent = FLC.money(all.reduce((sum, o) => sum + o.total, 0));
}

function renderOrders() {
    const all = FLC.orders.all().slice().reverse();
    orderCount.textContent = all.length;
    orderRows.innerHTML = all.length ? all.map(o => `
        <tr>
            <td><strong>${FLC.escapeHtml(o.id)}</strong></td>
            <td>${FLC.formatDate(o.createdAt)}</td>
            <td>${FLC.escapeHtml(o.name)}<br><small>${FLC.escapeHtml(o.email)}</small></td>
            <td>${o.items.map(i => `${i.qty} x ${FLC.escapeHtml(i.name)}`).join(", ")}</td>
            <td>${FLC.money(o.total)}</td>
            <td><button type="button" class="btn btn-outline btn-sm view-order" data-id="${FLC.escapeHtml(o.id)}">View</button></td>
        </tr>`).join("") : `<tr><td colspan="6" class="admin-empty-cell">No orders yet.</td></tr>`;
    renderStats();
}

orderRows.addEventListener("click", e => {
    const btn = e.target.closest(".view-order");
    const o = btn && FLC.orders.get(btn.dataset.id);
    if (!o) return;
    orderDetail.innerHTML = `
        <h2>${FLC.escapeHtml(o.id)}</h2>
        <dl>
            <div><dt>Date</dt><dd>${FLC.formatDate(o.createdAt)}</dd></div>
            <div><dt>Customer</dt><dd>${FLC.escapeHtml(o.name)} (${FLC.escapeHtml(o.email)})</dd></div>
            <div><dt>Delivery address</dt><dd>${FLC.escapeHtml(o.address)}</dd></div>
        </dl>
        <ul>${o.items.map(i => `<li><span>${i.qty} x ${FLC.escapeHtml(i.name)}</span><strong>${FLC.money(i.qty * i.price)}</strong></li>`).join("")}</ul>
        <p class="detail-total"><span>Total (incl. shipping)</span><span>${FLC.money(o.total)}</span></p>`;
    orderModal.classList.add("show");
});

const closeOrderModal = () => orderModal.classList.remove("show");
document.getElementById("closeOrderModal").addEventListener("click", closeOrderModal);
orderModal.addEventListener("click", e => { if (e.target === orderModal) closeOrderModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeOrderModal(); });

renderOrders();
