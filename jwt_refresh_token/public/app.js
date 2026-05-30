let accessToken = "";




// ----------------------------
// REGISTER
// ----------------------------

async function register() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;



    const response = await fetch(
        "http://localhost:5000/register",
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })
        }
    );


    const data = await response.json();

    alert(data.message);
}






// ----------------------------
// LOGIN
// ----------------------------

async function login() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;



    const response = await fetch(
        "http://localhost:5000/login",
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                username,
                password
            })
        }
    );



    const data = await response.json();

    accessToken = data.accessToken;



    // SAVE ACCESS TOKEN
    localStorage.setItem(
        "accessToken",
        accessToken
    );



    // REDIRECT ADMIN PAGE
    window.location.href = "/admin.html";
}







// ----------------------------
// LOAD ADMIN PAGE
// ----------------------------

async function loadAdminPage() {

    accessToken =
        localStorage.getItem("accessToken");



    let response = await fetch(
        "http://localhost:5000/admin",
        {

            headers: {
                Authorization:
                    `Bearer ${accessToken}`
            }
        }
    );



    // ACCESS TOKEN EXPIRED
    if (response.status === 403) {

        console.log("Access Token Expired");



        // CALL REFRESH ROUTE
        const refreshResponse = await fetch(
            "http://localhost:5000/refresh",
            {

                method: "POST",

                credentials: "include"
            }
        );




        // REFRESH TOKEN EXPIRED
        if (refreshResponse.status === 403) {

            alert("Login Again");

            localStorage.removeItem("accessToken");

            window.location.href = "/login.html";

            return;
        }




        const refreshData =
            await refreshResponse.json();




        // NEW ACCESS TOKEN
        accessToken =
            refreshData.accessToken;



        // SAVE NEW TOKEN
        localStorage.setItem(
            "accessToken",
            accessToken
        );



        console.log("New Access Token Generated");



        // REDIRECT AGAIN
        window.location.href = "/admin.html";

        return;
    }




    const data = await response.json();

    document.getElementById("result")
        .innerHTML = data.message;
}







// ----------------------------
// LOGOUT
// ----------------------------

async function logout() {

    await fetch(
        "http://localhost:5000/logout",
        {

            method: "POST",

            credentials: "include"
        }
    );



    localStorage.removeItem("accessToken");

    window.location.href = "/login.html";
}

// ----------------------------
// AUTO LOAD ADMIN PAGE
// ----------------------------

if (
    window.location.pathname === "/admin.html"
) {

    loadAdminPage();
}