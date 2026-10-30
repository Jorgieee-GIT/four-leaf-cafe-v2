const grid = document.getElementById("productGrid");
const chips = document.querySelectorAll(".chip");
const searchInput = document.getElementById("searchInput");
const products = FLC.getProducts();
let currentCategory = "all";

function cardHtml(p) {
    const url = `item.html?id=${encodeURIComponent(p.id)}`;
    const name = FLC.escapeHtml(p.name);
    return `
        <article class="product-card" data-id="${FLC.escapeHtml(p.id)}">
            <a class="product-link" href="${url}">
                <div class="product-media"><img src="${FLC.imgSrc(p.img)}" alt="${name}" loading="lazy"></div>
                <div class="product-body">
                    <h3>${name}</h3>
                    <p>${FLC.escapeHtml(p.desc)}</p>
                </div>
            </a>
            <div class="product-foot">
                <span class="price">${FLC.money(p.price)}</span>
                <button type="button" class="btn btn-primary btn-sm add-to-cart" aria-label="Add ${name} to cart">+ Add</button>
            </div>
        </article>`;
}

function render() {
    const q = searchInput.value.trim().toLowerCase();
    const list = products.filter(p => (currentCategory === "all" || p.category.includes(currentCategory)) && p.name.toLowerCase().includes(q));
    grid.innerHTML = list.length ? list.map(cardHtml).join("") : `
        <div class="no-results">
            <h3>No items found...</h3>
            <p>We couldn't find what you're looking for.</p>
            <p><strong>Customize your coffee instead?</strong></p>
        </div>`;
}

chips.forEach(chip => chip.addEventListener("click", () => {
    chips.forEach(c => { c.classList.remove("active"); c.setAttribute("aria-pressed", "false"); });
    chip.classList.add("active");
    chip.setAttribute("aria-pressed", "true");
    currentCategory = chip.dataset.filter;
    render();
}));
searchInput.addEventListener("input", render);

grid.addEventListener("click", e => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;
    const id = btn.closest(".product-card").dataset.id;
    FLC.cart.add(id, 1);
    FLC.toast(FLC.findProduct(id).name + " added to cart!");
});

render();
