document.addEventListener("DOMContentLoaded", ()=>{
    
    //Top bar
    //Check if user is registered
    if(isUserLogged()) updateLoggedUser();

    
    //Load asset images
    loadTopAssets();

    //Load news
    loadNews();


    //Logout button
    let logoutBtn=document.getElementById("nav-logout-btn");
    if(logoutBtn){

        logoutBtn.addEventListener("click", logout);

    }

    //Login button
    let loginBtn=document.getElementById("loginBtn");
    if(loginBtn){

        loginBtn.addEventListener("click", login);

    }   

    //Register button
    let registerBtn=document.getElementById("registerBtn");
    if(registerBtn){

        registerBtn.addEventListener("click", register);

    } 


    //Success message popup
    document.getElementById('success-close').addEventListener('click', () => {
        document.getElementById('success-overlay').setAttribute('hidden', '');
    });

    document.getElementById('success-dismiss').addEventListener('click', () => {
        document.getElementById('success-overlay').setAttribute('hidden', '');
    });

    //Error message popup
    document.getElementById('error-close').addEventListener('click', () => {
        document.getElementById('error-overlay').setAttribute('hidden', '');
    });
    
    document.getElementById('error-dismiss').addEventListener('click', () => {
        document.getElementById('error-overlay').setAttribute('hidden', '');
    });


});


//Checks if the current user has logged in
function isUserLogged(){

    let xmlhttp=new XMLHttpRequest();

    xmlhttp.open("GET", "Ajax/checkLoggedUser.php", false);
    xmlhttp.send();

    if(xmlhttp.status==200){

        let response=JSON.parse(xmlhttp.responseText);
        return response.logged;

    }

    return false;
}


//Gets all the data from a logged user
function getLoggedUser(){

    let xmlhttp=new XMLHttpRequest();

    xmlhttp.open("GET", "Ajax/checkLoggedUser.php", false);
    xmlhttp.send();

    if(xmlhttp.status==200){
        return JSON.parse(xmlhttp.responseText);
    }

    return null;
}


//Updates the web for a logged user
function updateLoggedUser(){

    if(isUserLogged()){

        showLogout();

    }else{

        showTopbarLogin();

    }

}


//Checks the user credentials and registers if right
function register(){

    let name=document.getElementById("reg-name").value;
    let pass=document.getElementById("reg-pass").value;
    let email=document.getElementById("reg-email").value;

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){

            switch(this.responseText){

                //Succesful register
                case "1":

                    showSuccess(200, "User registered successfully");
                    showLogout();

                break;

                //Name error
                //Not valid name
               case "-1":

                    showError(-1, "This is not a valid name");

                break;

                //No name
                case "-2":

                    showError(-2, "Please, insert a name");
                    
                break;

                //Name already in use
                case "-3":

                    showError(-3, "This name is already in use");

                break;


                //Password error
                //No password
                case "-4":

                    showError(-4, "Please, insert a password");

                break;

                //Not valid password
                case "-5":
                    
                    showError(-5, "This password is not valid");

                break;


                //Email
                //No email
                case "-6":

                    showError(-6, "Please, insert an email");

                break;

                //Not valid email
                case "-7":

                    showError(-7, "This is not a valid email");

                break;

                //Email already in use
                case "-8":

                    showError(-8, "This email is already in use");

                break;


                //Unknown error
                default:

                     showError(0, "Unknown error, please try again");                

                break;

            }

        }

    }

    xmlhttp.open("GET", "Ajax/register.php?name="+encodeURIComponent(name)+"&pass="+encodeURIComponent(pass)+"&email="+encodeURIComponent(email), true);
    xmlhttp.send();

}


//Checks user credentials and logins if right
function login(){

    let name=document.getElementById("login-name").value;
    let pass=document.getElementById("login-pass").value;

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){
            
            switch(this.responseText){

                //Succesful login
                case "1":

                    showSuccess(200, "User logged in successfully");
                    showLogout();

                break;


                //Name error
                //Not valid name
                case "-1":

                    showError(-1, "This is not a valid name");

                break;

                //No name
                case "-2":

                    showError(-2, "Please, insert a name");

                break;


                //Password error
                //No password
                case "-3":

                    showError(-4, "Please, insert a password");

                break;

                //Wrong password
                case "-4":

                    showError(-9, "This password is wrong");

                break;

                //Not found error
                case "-5":

                    showError(-10, "This user is not registered");

                break;

                //Unknown error
                default:

                    showError(0, "Unknown error, please try again");                    

                break;

            }

        }

    }

    xmlhttp.open("GET", "Ajax/login.php?name="+name+"&pass="+pass, true);
    xmlhttp.send();

}


//Logs the current user out
function logout(){

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){
            
            showTopbarLogin();
            showSuccess(201, "User was logged out");

        }

    }

    xmlhttp.open("GET", "Ajax/logout.php", true);
    xmlhttp.send();

}


//Loads the 5 most voted assets
function loadTopAssets(){

    let xmlhttp=new XMLHttpRequest();

    xmlhttp.open("GET", "Ajax/getTopAssets.php", true);

    xmlhttp.onreadystatechange=function(){

        if(this.readyState==4 && this.status==200){

            const response=JSON.parse(this.responseText);

            if(response.success){

                displayTopAssets(response.assets);

            }

        }

    };

    xmlhttp.send();

}


//Loads news
function loadNews(){

    let xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function(){

        if(this.readyState==4){

            if(this.status==200){

                let response=JSON.parse(this.responseText);

                if(response.success){

                    let newsGrid=document.getElementById("news-grid");

                    newsGrid.innerHTML="";

                    response.news.slice(0, 3).forEach(news => {

                        displayNews(news);

                    });

                }

            }else{

                showError(500, "Internal server error");

            }

        }

    };

    xmlhttp.open("GET", "Ajax/getNews.php", true);

    xmlhttp.send();

}


//Returns current news id from url
function getNewsIdFromUrl(){

    let params=new URLSearchParams(window.location.search);

    return params.get("id");

}


//Formats a date
function formatDate(dateString){

    let date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

}


//Cuts long news text
function truncateNewsText(text, maxLength = 120){

    if(!text) return "";

    if(text.length <= maxLength) return text;

    return text.substring(0, maxLength) + "...";

}


//Prevents HTML injection
function escapeHtml(text){

    if(!text) return "";

    let div = document.createElement("div");
    div.textContent = text;

    return div.innerHTML;

}



//DISPLAY
//Shows the top 5 most voted assets
function displayTopAssets(assets){

    const row=document.getElementById("top-assets-row");
    row.innerHTML="";

    assets.forEach(asset => {

        row.innerHTML+=`
            <a href="asset.html?id=${asset.assets_id}" class="thumb">
                <img src="${asset.image.image}" alt="${asset.name}">
            </a>
        `;

    });

}

//Displays one news card
function displayNews(news){

    let newsGrid=document.getElementById("news-grid");
    let formattedDate=formatDate(news.date);
    let shortText=truncateNewsText(news.textContent);
    let html=`

        <a href="news.html?id=${news.news_id}" class="news-card-link">

            <article class="news-card">

                <h3 class="news-card-title">
                    ${escapeHtml(news.title)}
                </h3>

                <p class="news-card-excerpt">
                    ${escapeHtml(shortText)}
                </p>

                <div class="news-card-footer">

                    <span class="news-card-date">
                        ${formattedDate}
                    </span>

                    <span class="news-card-read">
                        READ MORE →
                    </span>

                </div>

            </article>

        </a>

    `;

    newsGrid.insertAdjacentHTML("beforeend", html);

}

//Shows a success popup
function showSuccess(code, message){

    document.getElementById('success-code').textContent=code ;
    document.getElementById('success-message').textContent=message;
    document.getElementById('success-overlay').removeAttribute('hidden');

}

//Shows an error popup
function showError(code, message){

    document.getElementById('error-code').textContent=code;
    document.getElementById('error-message').textContent=message;
    document.getElementById('error-overlay').removeAttribute('hidden');

}

//Shows topbar login and register buttons, hiddens logout button
function showTopbarLogin(){

    document.getElementById('nav-login-btn').removeAttribute('hidden');
    document.getElementById('nav-register-btn').removeAttribute('hidden');
    document.getElementById('nav-logout-btn').setAttribute('hidden', '');
    document.getElementById('nav-admin-btn').setAttribute('hidden', '');
    document.getElementById("loggedUsername").textContent="";

}

//Shows logout button, hiddens topbar login and register buttons
function showLogout(){

    document.getElementById('nav-login-btn').setAttribute('hidden', '');
    document.getElementById('nav-register-btn').setAttribute('hidden', '');
    document.getElementById('nav-logout-btn').removeAttribute('hidden');
    if(getLoggedUser().admin==1) document.getElementById('nav-admin-btn').removeAttribute('hidden');
    document.getElementById("loggedUsername").textContent=getLoggedUser().name;

}

