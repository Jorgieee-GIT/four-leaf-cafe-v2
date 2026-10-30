const id = new URLSearchParams(window.location.search).get("id");
const product = FLC.findProduct(id);
const detail = document.getElementById("productDetail");

if (!product) {
    detail.innerHTML = `
        <div class="empty-state">
            <h1 class="page-title">Item not found</h1>
            <a class="btn btn-primary" href="menu.html">Back to menu</a>
        </div>`;
    document.getElementById("similarSection").hidden = true;
} else {
    document.getElementById("productImg").src = FLC.imgSrc(product.img);
    document.getElementById("productImg").alt = product.name;
    document.getElementById("productName").textContent = product.name;
    document.getElementById("productDesc").textContent = product.desc;
    document.getElementById("productPrice").textContent = FLC.money(product.price);

    const qtyInput = document.getElementById("qtyInput");
    const total = document.getElementById("totalAmount");
    let qty = 1;

    const update = () => { qtyInput.value = qty; total.textContent = FLC.money(qty * product.price); };
    document.getElementById("qtyDown").addEventListener("click", () => { if (qty > 1) { qty--; update(); } });
    document.getElementById("qtyUp").addEventListener("click", () => { qty++; update(); });
    qtyInput.addEventListener("input", () => {
        const v = parseInt(qtyInput.value, 10);
        if (!isNaN(v) && v > 0) { qty = v; update(); }
    });
    qtyInput.addEventListener("blur", update);

    document.getElementById("addToCartBtn").addEventListener("click", () => {
        FLC.cart.add(product.id, qty);
        FLC.toast(`${qty} x ${product.name} added to cart!`);
    });

    
    const others = FLC.getProducts().filter(p => p.id !== product.id);
    const same = others.filter(p => p.category.some(c => c !== "best-seller" && product.category.includes(c)));
    const similar = same.concat(others.filter(p => !same.includes(p))).slice(0, 4);
    document.getElementById("similarProductsGrid").innerHTML = similar.map(p => `
        <a class="similar-card" href="item.html?id=${encodeURIComponent(p.id)}">
            <img src="${FLC.imgSrc(p.img)}" alt="${FLC.escapeHtml(p.name)}" loading="lazy">
            <div><strong>${FLC.escapeHtml(p.name)}</strong><span>${FLC.money(p.price)}</span></div>
        </a>`).join("");
    update();
}
