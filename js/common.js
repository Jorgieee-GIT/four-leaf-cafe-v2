const FLC = (() => {
    const ROOT = document.body.dataset.root || "";
    const KEY = { cart: "flc_cart", session: "flc_session", custom: "products", users: "flc_users", orders: "flc_orders" };
    const SHIPPING_FEE = 30;
    const DEMO_USERS = [
        { name: "Admin", email: "admin@gmail.com", password: "admin123", role: "admin" },
        { name: "Demo Customer", email: "user@gmail.com", password: "user123", role: "user" }
    ];

    const money = n => "₱" + Number(n).toFixed(2);
    const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const read = (store, key, fallback) => { try { return JSON.parse(store.getItem(key)) ?? fallback; } catch { return fallback; } };
    const imgSrc = file => (!file ? ROOT + "assets/images/brand/logo.webp" : /^(data:|https?:)/.test(file) ? file : ROOT + "assets/images/products/" + file);
    const pageUrl = name => ROOT + (name === "index" ? "index.html" : "pages/" + name + ".html");
    const formatDate = iso => new Date(iso).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

    function getProducts() {
        const custom = read(localStorage, KEY.custom, []).map((p, i) => ({
            id: p.id || "custom-" + i,
            name: p.name,
            price: Number(p.price) || 0,
            img: p.image || "",
            desc: p.description || "",
            category: [p.category]
        }));
        return window.FLC_PRODUCTS.concat(custom);
    }
    const findProduct = id => getProducts().find(p => p.id === id);

    const cart = {
        get: () => read(localStorage, KEY.cart, []),
        save(items) { localStorage.setItem(KEY.cart, JSON.stringify(items)); updateCartCount(); },
        count: () => cart.get().reduce((sum, i) => sum + i.qty, 0),
        add(id, qty = 1) {
            const items = cart.get();
            const line = items.find(i => i.id === id);
            line ? (line.qty += qty) : items.push({ id, qty });
            cart.save(items);
        },
        setQty(id, qty) { cart.save(cart.get().map(i => (i.id === id ? { ...i, qty } : i))); },
        remove(id) { cart.save(cart.get().filter(i => i.id !== id)); },
        clear() { cart.save([]); }
    };
    function updateCartCount() { document.querySelectorAll("[data-cart-count]").forEach(el => (el.textContent = cart.count())); }

    const users = {
        all: () => read(localStorage, KEY.users, []),
        find: email => DEMO_USERS.concat(users.all().map(u => ({ ...u, role: "user" }))).find(u => u.email.toLowerCase() === String(email).toLowerCase()),
        authenticate(email, password) {
            const user = users.find(email);
            return user && user.password === password ? user : null;
        },
        register(name, email, password) {
            if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };
            if (users.find(email)) return { ok: false, message: "This email is already registered." };
            const list = users.all();
            list.push({ name, email, password });
            localStorage.setItem(KEY.users, JSON.stringify(list));
            return { ok: true };
        }
    };

    const orders = {
        all: () => read(localStorage, KEY.orders, []),
        get: id => orders.all().find(o => o.id === id),
        forUser: email => orders.all().filter(o => o.email.toLowerCase() === String(email).toLowerCase()).reverse(),
        add(order) {
            const list = orders.all();
            list.push(order);
            localStorage.setItem(KEY.orders, JSON.stringify(list));
        }
    };

    const session = {
        get: () => read(sessionStorage, KEY.session, null),
        set: (role, email, name) => sessionStorage.setItem(KEY.session, JSON.stringify({ role, email, name })),
        clear: () => sessionStorage.removeItem(KEY.session)
    };
    function guard() {
        const need = document.body.dataset.require;
        if (!need) return;
        const s = session.get();
        if (!s) return window.location.replace(pageUrl("index"));
        if (need === "admin" && s.role !== "admin") window.location.replace(pageUrl("menu"));
        if (need === "user" && s.role === "admin") window.location.replace(pageUrl("admin"));
    }

    let toastEl, toastTimer;
    function toast(message) {
        if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
        toastEl.textContent = message;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
    }

    function initHeader() {
        const toggle = document.querySelector(".nav-toggle");
        const nav = document.getElementById("siteNav");
        if (toggle && nav) toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("open")));
        document.querySelectorAll("[data-logout]").forEach(link => link.addEventListener("click", e => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) { session.clear(); window.location.href = pageUrl("index"); }
        }));
        updateCartCount();
    }

    guard();
    initHeader();
    return { ROOT, SHIPPING_FEE, money, escapeHtml, imgSrc, pageUrl, formatDate, getProducts, findProduct, cart, users, orders, session, toast, KEY };
})();
