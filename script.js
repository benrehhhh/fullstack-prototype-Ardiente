// ==============================
// Phase 2: Client- Side Routing
// ==============================

let currentUser = null;

function navigateTo(hash){
    window.location.hash=hash;
}

function handleRouting(){
    let hash = window.location.hash || "#/";

    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

    switch(hash)
    {
        case '#/login':
            document.getElementById('login-page').classList.add('active');
            break;
        case '#/register':
            document.getElementById('register-page').classList.add('active');
            break;
        case '#/verify-email':
            document.getElementById("verify-email-page").classList.add("active");
            break;
        case '#/profile':
            document.getElementById('profile-page').classList.add('active');
            break;
        case '#/employees':
            document.getElementById('employees-page').classList.add('active');
            break;
        case '#/departments':
            document.getElementById('departments-page').classList.add('active');
            break;
        case '#/accounts':
            document.getElementById('accounts-page').classList.add('active');
            break;    
        case '#/request':
            document.getElementById('request-page').classList.add('active');
            break;
        default:
            document.getElementById('home-page').classList.add('active');
    }


    // Redirects non-user away
    const protectedRoutes = ["#/profile", "#/requests"];
    if (!currentUser && protectedRoutes.includes(hash)){
        navigateTo("#/login");
    }

    // Admin Pages
    const adminRoutes = ["#/employees", "#/accounts", "#/departments"];
    if (currentUser && currentUser.role !== "admin" && adminRoutes.includes(hash)) {
        navigateTo("#/");
    }
}

    window.addEventListener("hashchange", handleRouting);

    if(!window.location.hash) {
        window.location.hash = "#/";
    }

    handleRouting();

// ==============================
// Phase 3: Authentication System
// ==============================

window.db = {
    accounts: []
}

document.getElementById("register-form").addEventListener("submit", function (e){
    e.preventDefault();

    const first = document.getElementById("reg-firstname").value.trim();
    const last = document.getElementById("reg-lastname").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    const existing = window.db.accounts.find(acc => acc.email === email);
    if(existing){
        alert("Email already exists.");
        return;
    }

    window.db.accounts.push({
            firstName: first,
            lastName: last,
            email: email,
            password: password,
            verified: false,
            role: "user"
    });

    localStorage.setItem("unverified_email", email);
    navigateTo("#/verify-email");
});