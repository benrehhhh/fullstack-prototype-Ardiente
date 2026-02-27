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

    if(hash === "#/accounts")
    {
       renderAccountList();
    }

    if(hash === "#/departments")
    {
        renderDepartmentTable();
    }

    if(hash === "#/employees")
    {
        loadDepartmentOptions();
        renderEmployeesTable();
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
const STORAGE_KEY = "ipt_demo_v1";

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    try
    {
        if(data)
        {
            window.db = JSON.parse(data);
            return;
        }
    }
    catch (e)
    {
        console.warn("Storage invalid, resetting...");
    }

    window.db = {
        accounts: JSON.parse (localStorage.getItem("db_accounts")) ||
        [
            {
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
                password: "Password123!",
                verified: true,
                role: "admin"
            }
        ],
        departments: JSON.parse(localStorage.getItem("db_departments")) ||
        [
            {id: 1, name: "Engineering", description: ""},
            {id: 2, name: "HR", description: ""},
        ],
        requests: [],
        employees: JSON.parse(localStorage.getItem("db_employees")) || []
    };
}


// ===============================
//  Phase 6: Admin Features (CRUD)
// ===============================
function renderAccountList()
{
    const tbody = document.querySelector("#accounts-table tbody");
    tbody.innerHTML = "";

    window.db.accounts.forEach((acc, i) => {

        tbody.innerHTML += `
            <tr>
                <td>${acc.firstName} ${acc.lastName}</td>
                <td>${acc.email}</td>
                <td>${acc.role}</td>
                <td>${acc.verified ? "✔" : "—"}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick = "editAccount(${i})">Edit</button>
                    <button class="btn btn-sm btn-outline-warning" onclick = "resetPassword(${i})">Reset Password</button>
                    <button class="btn btn-sm btn-outline-danger" onclick = "deleteAccount(${i})">Delete</button>
                </td> 
            </tr>
        `;
    });
}

    document.getElementById("add-account-btn").addEventListener("click", () => {
    showAccountForm();
});


function showAccountForm(mode = "add", acc = null, index = null)
{
    window.editingAccount = mode === "edit" ? index : null;

    const firstInput = document.getElementById("firstname");
    const lastInput = document.getElementById("lastname");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const roleSelect = document.getElementById("role"); 
    const verifiedCheckbox = document.getElementById("checkbox");

    if (mode === "add")
    {
        firstInput.value = "";
        lastInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
        roleSelect.value = "user";
        verifiedCheckbox.checked = false;
    }

    if (mode === "edit" && acc)
    {
        firstInput.value = acc.firstName;
        lastInput.value = acc.lastName;
        emailInput.value = acc.email;
        passwordInput.value = "";
        roleSelect.value = acc.role.toLowerCase();
        verifiedCheckbox.checked = acc.verified;
    }
}

document.querySelector("#accounts-page .btn-primary").addEventListener("click", saveAccount);


function saveAccount()
{
    const first = document.getElementById("firstname").value.trim();
    const last = document.getElementById("lastname").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;
    const verified = document.getElementById("checkbox").checked;

    if (!first || !last || !email || (password && password.length < 6))
    {
        alert("Complete all fields");
        return;
    }


    if(window.editingAccount === null)
    {
        window.db.accounts.push({
            firstName: first,
            lastName: last,
            email: email,
            password: password || "Password123!",
            verified: verified,
            role: role
        });
    } 
    else 
    {
        window.db.accounts[window.editingAccount] = {
            firstName: first,
            lastName: last,
            email: email,
            password: password ? password : window.db.accounts[window.editingAccount].password,
            verified: verified,
            role: role
        };
    }

    saveToStorage();
    renderAccountList();
}

function editAccount(index)
{
    const acc = window.db.accounts[index];
    showAccountForm("edit", acc, index);
}

function resetPassword(index)
{
    const newPW = prompt("Enter new password (min 6 chars):");
    if (!newPW || newPW.length < 6)
    {
        return alert("Invalid Password!");
    }

    window.db.accounts[index].password = newPW;
    saveToStorage();
    alert("Password updated!");
}

function deleteAccount(index)
{
    const acc = window.db.accounts[index];
    if(acc.email === currentUser.email)
    {
        alert("You cannot delete your own account,");
        return;
    }

    if(!confirm("Are you sure you want to delete this account?"))
        return;

    window.db.accounts.splice(index, 1);
    saveToStorage();
    renderAccountList();
}


function renderDepartmentTable()
{
    const tbody = document.querySelector("#departments-table tbody");
    tbody.innerHTML = "";

    window.db.departments.forEach((dept, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${dept.name}</td>
                <td>${dept.description}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editDepartment(${i})">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteDepartment(${i})">Delete</button>
                </td>
            </tr>
        `;
    });

}

document.getElementById("add-department-btn").addEventListener("click", () =>{
editingDeptIndex = null;
document.getElementById("dept-form-title").textContent = "Add Department";

document.getElementById("dept-name").value = "";
document.getElementById("dept-desc").value = "";

document.getElementById("department-form").style.display = "block";
});

let editingDeptIndex = null;

function editDepartment(i)
{
    editingDeptIndex = i;
    const dept = window.db.departments[i];

    document.getElementById("dept-form-title").textContent = "Edit Department";

    document.getElementById("dept-name").value = dept.name;
    document.getElementById("dept-desc").value = dept.description;

    document.getElementById("department-form").style.display = "block";
}


document.getElementById("save-department-btn").addEventListener("click", () => {
    const name = document.getElementById("dept-name").value.trim();
    const desc = document.getElementById("dept-desc").value.trim();

    if(!name)
    {
        alert("Department name is required.");
        return;
    }

    if(editingDeptIndex === null)
    {
        window.db.departments.push({
            id: Date.now(),
            name,
            description: desc
        });
    }
    else
    {
        window.db.departments[editingDeptIndex].name = name;
        window.db.departments[editingDeptIndex].description = desc;
    }

    saveToStorage();
    renderDepartmentTable();

    document.getElementById("department-form").style.display = "none";
});

function deleteDepartment(i)
{
    if(!confirm("Are you sure you want to delete this department?"))
        return;
    
    window.db.departments.splice(i, 1);
    saveToStorage();
    renderDepartmentTable();
}

function loadDepartmentOptions()
{
    const select = document.getElementById("emp-department");
    select.innerHTML = "";

    window.db.departments.forEach(dept => {
        const option = document.createElement("option");
        option.value = dept.id;
        option.textContent = dept.name;
        select.appendChild(option);
    });
}

function renderEmployeesTable()
{
    const tbody = document.querySelector("#employees-table tbody");
    tbody.innerHTML = "";

    window.db.employees.forEach((emp, i) => {
        const dept = window.db.departments.find(d => d.id === emp.deptId);
    
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${emp.employeeId}</td>
            <td>${emp.name}</td>
            <td>${emp.position}</td>
            <td>${dept ? dept.name : "N/A"}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary"onclick="editEmployee(${i})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${i})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function addEmployee()
{
    const name = document.getElementById("emp-name").value.trim();
    const email = document.getElementById("emp-email").value.trim().toLowerCase();
    const position = document.getElementById("emp-position").value.trim();
    const department = Number(document.getElementById("emp-department").value);
    const hireDate = document.getElementById("hire-date").value;

    if(!name || !email || !position || !department || !hireDate)
    {
        alert("Please fill in all fields.");
        return;
    }

    window.db.employees.push({
        name,
        employeeId: Date.now(),
        userEmail: email,
        position,
        deptId: department,
        hireDate
    });
    
    saveToStorage();
    renderEmployeesTable();

    document.getElementById("employee-form").style.display = "none";
}
document.getElementById("emp-save-btn").onclick = addEmployee;

let editingEmpIndex = null;

function editEmployee(i)
{
    editingEmpIndex = i;
    const emp = window.db.employees[i];

    loadDepartmentOptions();

    document.getElementById("emp-form-title").textContent = "Edit Employee";

    document.getElementById("emp-name").value = emp.name;
    document.getElementById("emp-email").value = emp.userEmail;
    document.getElementById("emp-position").value = emp.position;
    document.getElementById("emp-department").value = emp.deptId;
    document.getElementById("hire-date").value = emp.hireDate;

    document.getElementById("employee-form").style.display = "block";
    document.getElementById("emp-save-btn").onclick = updateEmployee;
}


function updateEmployee()
{
    const emp = window.db.employees[editingEmpIndex];

    emp.name = document.getElementById("emp-name").value.trim();
    emp.userEmail = document.getElementById("emp-email").value.trim().toLowerCase();
    emp.position = document.getElementById("emp-position").value.trim();
    emp.deptId = Number(document.getElementById("emp-department").value);
    emp.hireDate = document.getElementById("hire-date").value;

    saveToStorage();
    renderEmployeesTable();

    document.getElementById("employee-form").style.display = "none";
    document.getElementById("emp-save-btn").onclick = addEmployee;
    document.getElementById("emp-form-title").textContent = "Add Employee";
}

function deleteEmployee(i)
{
    if(!confirm("Are you sure you want to delete this employee?"))
        return;

    window.db.employees.splice(i, 1);
    saveToStorage();
    renderEmployeesTable();
}

function saveToStorage()
{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
    localStorage.setItem("db_accounts", JSON.stringify(window.db.accounts));
    localStorage.setItem("db_departments", JSON.stringify(window.db.departments));
    localStorage.setItem("db_employees", JSON.stringify(window.db.employees));
}

loadFromStorage();

window.addEventListener("hashchange", handleRouting);

if(!window.location.hash) {
    window.location.hash = "#/";
}

handleRouting();