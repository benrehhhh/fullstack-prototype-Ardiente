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
    accounts: JSON.parse(localStorage.getItem("db_accounts")) || []
};

function saveToStorage(){
    localStorage.setItem("db_accounts", JSON.stringify(window.db.accounts));
}


// =================
//  REGISTER FORM
// =================
document.getElementById("register-form").addEventListener("submit", function (e){
    e.preventDefault();

    const first = document.getElementById("reg-firstname").value.trim();
    const last = document.getElementById("reg-lastname").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    if(password.length <6)
    {
        alert("Password must be at least 6 characters.");
        return;
    }

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

// =====================
//  EMAIL VERIFICATION
// =====================

document.getElementById("simulate-verfication").addEventListener("click", function(){
    const email = localStorage.getItem("unverified_email");
    if (!email)
    {
        alert("No unverified email found.");
        return;
    }

    const targetAccount = window.db.accounts.find(acc => acc.email === email);
    if (targetAccount){
        targetAccount.verified = true;
        saveToStorage();
        alert("Email Verified! Please Login.");
        navigateTo("#/login");
    }
});


// ==================
//   LOGIN FORM
// ==================
document.getElementById("login-form").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("log-email").value.trim();
    const password = document.getElementById("log-password").value.trim();

    const account = window.db.accounts.find(acc => acc.email === email && acc.password === password);

    if(!account)
    {
        alert("Email or password incorrect.");
        return;
    }

    if(!account.verified)
    {
        alert("Email not verified. Please verify first. ");
        return;
    }

    localStorage.setItem("auth_token", email);
    setAuthState(true, account);
    navigateTo("#/profile");
});

// =================================
//  Authentication State Management
// =================================

function setAuthState(isAuth, user = null){
    currentUser = isAuth ? user : null;

    if(isAuth)
    {
        document.body.classList.add("authenticated");
        document.body.classList.remove("not-authenticated");
        if(user.role === "admin"){
            document.body.classList.add("is-admin");
        }
    }
    else
    {
        document.body.classList.remove("authenticated", "is-admin");
        document.body.classList.add("not-authenticated");
    }
}

window.addEventListener("load", function(){
    const email = localStorage.getItem("auth_token");
    if(email)
    {
        const account = window.db.accounts.find(acc => acc.email === email);
        if(account){
            setAuthState(true, account);
        }
    }

});

// ================
//     Logout
// ================

document.querySelector("a[href='#/logout']").forEach(btn => {
    btn.addEventListener("click", function(e){
        e.preventDefault();
        localStorage.removeItem("auth_token");
        setAuthState(false);
        navigateTo("#/");
    });
});