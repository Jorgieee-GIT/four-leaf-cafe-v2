const loginForm = document.getElementById("loginForm");
const signUpForm = document.getElementById("signUpForm");

function showMessage(el, text, type, after) {
    el.textContent = text;
    el.className = "message " + type;
    el.style.display = "block";
    setTimeout(() => { el.style.display = "none"; if (after) after(); }, after ? 1500 : 3000);
}

document.querySelectorAll("[data-switch]").forEach(link => link.addEventListener("click", e => {
    e.preventDefault();
    const toSignUp = link.dataset.switch === "signup";
    loginForm.hidden = toSignUp;
    signUpForm.hidden = !toSignUp;
}));

loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const user = FLC.users.authenticate(email, password);

    if (!user) return showMessage(document.getElementById("message"), "Invalid email or password!", "error");
    FLC.session.set(user.role, user.email, user.name);
    window.location.href = FLC.pageUrl(user.role === "admin" ? "admin" : "menu");
});

signUpForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("signUpName").value.trim();
    const email = document.getElementById("signUpEmail").value.trim();
    const password = document.getElementById("signUpPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const msg = document.getElementById("signUpMessage");

    if (!name || !email || !password) return showMessage(msg, "Please fill in all fields.", "error");
    if (password !== confirmPassword) return showMessage(msg, "Passwords do not match!", "error");
    const result = FLC.users.register(name, email, password);
    if (!result.ok) return showMessage(msg, result.message, "error");
    showMessage(msg, "Account created successfully!", "success", () => {
        FLC.session.set("user", email, name);
        window.location.href = FLC.pageUrl("menu");
    });
});

document.querySelectorAll(".toggle-password").forEach(btn => btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.textContent = show ? "Hide" : "Show";
}));
