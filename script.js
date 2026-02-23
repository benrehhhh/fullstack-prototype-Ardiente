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
        case '#/requests':
            document.getElementById('requests-page').classList.add('active');
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

    if(hash === "#/verify-email")
    {
        renderVerifyEmail();
    }

    if(hash === "#/profile")
    {
        renderProfile();
    }
}



// ==============================
// Phase 3: Authentication System
// ==============================


// =================
//  REGISTER FORM
// =================
document.getElementById("register-form").addEventListener("submit", function (e){
    e.preventDefault();

    const first = document.getElementById("reg-firstname").value.trim();
    const last = document.getElementById("reg-lastname").value.trim();
    const email = document.getElementById("reg-email").value.trim().toLowerCase();
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

    saveToStorage();
    localStorage.setItem("unverified_email", email);
    navigateTo("#/verify-email");
});

// =====================
//  EMAIL VERIFICATION
// =====================
function renderVerifyEmail()
{
    const email = localStorage.getItem("unverified_email");
    document.getElementById("verify-msg").textContent = "Verification sent to " + email;
}

document.getElementById("verify-btn").addEventListener("click", function(){
    const email = localStorage.getItem("unverified_email");
    const acc = window.db.accounts.find(a => a.email === email);

    if (acc)
    {
        acc.verified = true;
        saveToStorage();
        localStorage.removeItem("unverified_email");
        navigateTo("#/login");
    }
});


// ===================
//  PROFILE PAGE
// ===================
function renderProfile()
{
    document.getElementById("profile-name").innerText = currentUser.firstName + " " + currentUser.lastName;
    document.getElementById("profile-email").innerText = currentUser.email;
    document.getElementById("profile-role").innerText = currentUser.role;

    document.getElementById("edit-profile").addEventListener("click", function(){
        alert("Edit profile coming soon.");
    });
}

// ==================
//   LOGIN FORM
// ==================
document.getElementById("login-form").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value.trim();

    const acc = window.db.accounts.find(a => a.email === email && a.password === password);

    if(!acc)
    {
        alert("Account Does not Exist. Please try again.");
        return;
    }

    if(acc.verified !== true)
    {
        alert("Invalid Credentials or Email Not Verified.");
        return;
    }

    localStorage.setItem("auth_token", email);
    setAuthState(true, acc);
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
        document.body.classList.remove("is-admin");
        if(isAuth && user.role === "admin")
        {
            document.body.classList.add("is-admin");
        }
    }
    else
    {
        document.body.classList.remove("authenticated", "is-admin");
        document.body.classList.add("not-authenticated");
    }
}


// ================
//     Logout
// ================

document.querySelector("a[href='#/logout']").addEventListener("click", function(){
        localStorage.removeItem("auth_token");
        setAuthState(false);
        navigateTo("#/");
    });

// =============================================
//  Phase 4: Data Persistence with localStorage
// =============================================
const STORAGE_KEY = "ipt_demo_v1"

function loadFromStorage() {
    let saved = localStorage.getItem(STORAGE_KEY);
    try 
    {
        if(saved)
        {
            window.db = JSON.parse(saved);
            return;
        }
    }
    catch (e)
    {
        console.warn("Storage invalid, resetting...");
    }

    window.db = {
        accounts: [
            {
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                password: "Password123!",
                verified: true,
                role: "admin"
            }
        ],
        departments: [
            {name: "Engineering", description: ""},
            {name: "HR", description: ""},
        ],
        requests: [],
        employees: []
    };
}

function saveToStorage()
{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

loadFromStorage();

window.addEventListener("hashchange", handleRouting);

if(!window.location.hash) {
    window.location.hash = "#/";
}

handleRouting();