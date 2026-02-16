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

    const routeMap = {
        "#/": "home-page",
        "#/register": "register-page",
        "#/verify-email": "verify-email-page",
        "#/login": "login-page",
        "#/profile": "profile-page",
        "#/employees": "employees-page",
        "#/departments": "departments-page",
        "#/accounts": "accounts-page",
        "#/request": "request-page",
    };

    const pageId = routeMap[hash];

    if (pageId) {
        document.getElementById(pageId).classList.add("active");
    }

    // Redirects non-user away
    const protectedRoutes = ["#/profile", "#/requests"];
    if (!currentUser && protectedRoutes.includes(hash)){
        navigateTo("#/login");
    }

    // Admin Pages
    const adminRoutes = ["#/employees", "#/accoutns", "#/departments"];
    if (currentUser && currentUser.role !== "admin" && adminRoutes.includes(hash)) {
        navigateTo("#/");
    }

    window.addEventListener("hashchange", handleRouting);

    if(!window.location.hash) {
        window.location.hash = "#/";
    }

    handleRouting();
}