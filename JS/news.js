document.addEventListener("DOMContentLoaded", ()=>{

    //Top bar
    if(isUserLogged()) updateLoggedUser();

    //Load news from db
    loadNews();

    //Delete news button
    let deleteBtn=document.getElementById("news-delete-btn");

    if(deleteBtn){

        deleteBtn.addEventListener("click", deleteNews);

    }

    //Collapse admin news form
    const newsToggleBtn=document.getElementById("news-admin-toggle");
    const newsFormBody=document.getElementById("news-admin-form-body");

    if(newsToggleBtn && newsFormBody){

        newsToggleBtn.addEventListener("click", ()=>{

            newsFormBody.classList.toggle("collapsed");

            if(newsFormBody.classList.contains("collapsed")){

                newsToggleBtn.textContent="▼ EXPAND";

            }else{

                newsToggleBtn.textContent="▲ COLLAPSE";

            }

        });

    }


    //Create news button
    let createNewsBtn=document.getElementById("news-submit-btn");

    if(createNewsBtn){

        createNewsBtn.addEventListener("click", createNews);

    }

    //Logout button
    let logoutBtn=document.getElementById("nav-logout-btn");

    if(logoutBtn){

        logoutBtn.addEventListener("click", logout);

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



//Loads news
function loadNews(){

    let xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){

        if(this.readyState==4){

            if(this.status==200){

                let response=JSON.parse(this.responseText);

                if(response.success){

                    let currentNewsId=getNewsIdFromUrl();

                    let container=document.getElementById("news-grid");
                    container.innerHTML="";

                    response.news.forEach(news=>{

                        displayNews(news);

                    });

                    if(currentNewsId){

                        let news=response.news.find(n=>n.news_id==currentNewsId);

                        if(news){

                            displayOpenNews(news);
                            updateDeleteButton();

                        }else{

                            showError(404, "News not found");

                        }

                    }else{

                        document.getElementById("news-open-section").setAttribute("hidden", "");

                    }

                }

            }else{

                showError(500, "Internal server error");

            }

        }

    };

    xmlhttp.open("GET", "Ajax/getNews.php", true);
    xmlhttp.send();

}


//Creates a new news
function createNews(){

    if(!isUserLogged()){

        showError(401, "You must be logged in");
        return;

    }

    if(getLoggedUser().admin!=1){

        showError(403, "Admin access required");
        return;

    }

    let title=document.getElementById("news-title-input").value.trim();
    let textContent=document.getElementById("news-body-input").value.trim();

    if(title==""){

        showError(400, "Title is required");
        return;

    }

    if(textContent==""){

        showError(400, "Content is required");
        return;

    }

    let data={

        title:title,
        textContent:textContent

    };

    let formData=new FormData();
    formData.append("data", JSON.stringify(data));
    let xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function(){

        if(this.readyState==4){

            if(this.status==200){

                let response=JSON.parse(this.responseText);

                if(response.success){

                    showSuccess(200, "News created successfully");

                    document.getElementById("news-title-input").value="";
                    document.getElementById("news-body-input").value="";

                }else{

                    showError(response.code, response.message);

                }

            }else{

                showError(500, "Internal server error");

            }

        }

    };

    xmlhttp.open("POST", "Ajax/createNews.php", true);
    xmlhttp.send(formData);

}


//Deletes current news
function deleteNews(){

    if(!isUserLogged()){

        showError(401, "You must be logged in");
        return;

    }

    if(getLoggedUser().admin!=1){

        showError(403, "Admin access required");
        return;

    }

    let newsId=getNewsIdFromUrl();

    if(!newsId){

        showError(400, "Invalid news id");
        return;

    }

    let formData=new FormData();

    formData.append("id", newsId);

    let xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function(){

        if(this.readyState==4){

            if(this.status==200){

                let response=JSON.parse(this.responseText);

                if(response.success){

                    showSuccess(200, "News deleted successfully");

                    setTimeout(()=>{

                        window.location.href="news.html";

                    }, 1200);

                }else{

                    showError(response.code, response.message);

                }

            }else{

                showError(500, "Internal server error");

            }

        }

    };

    xmlhttp.open("POST", "Ajax/deleteNews.php", true);

    xmlhttp.send(formData);

}


//Returns current news id from url
function getNewsIdFromUrl(){

    let params=new URLSearchParams(window.location.search);

    return params.get("id");

}


//Displays one full new
function displayOpenNews(news){

    document.getElementById("news-open-section").removeAttribute("hidden");

    document.getElementById("news-open-title").textContent=news.title;
    document.getElementById("news-open-date").textContent=formatDate(news.date);

    let body=document.getElementById("news-open-body");

    body.innerHTML="";

    let paragraphs=news.textContent.split("\n");

    paragraphs.forEach(p=>{

        if(p.trim()!=""){

            body.innerHTML+=`<p>${escapeHtml(p)}</p>`;

        }

    });

}


//Formats short date
function formatShortDate(dateString){

    let date=new Date(dateString);

    let day=String(date.getDate()).padStart(2, "0");
    let month=String(date.getMonth()+1).padStart(2, "0");
    let year=String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;

}


//Shows delete button for admins
function updateDeleteButton(){

    let deleteBtn=document.getElementById("news-delete-btn");

    if(!deleteBtn) return;

    if(isUserLogged() && getLoggedUser().admin==1){

        deleteBtn.removeAttribute("hidden");

    }else{

        deleteBtn.setAttribute("hidden", "");

    }

}



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
        if(getLoggedUser().admin==1) showNewNewsForm();

    }else{

        showTopbarLogin();

    }

}


//Logs the current user out
function logout(){

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){
            
            showTopbarLogin();
            hideNewNewsForm();
            showSuccess(201, "User was logged out");

        }

    }

    xmlhttp.open("GET", "Ajax/logout.php", true);
    xmlhttp.send();

}



//DISPLAY
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

//Formats mysql datetime
function formatDate(dateString){

    let date=new Date(dateString);

    let day=String(date.getDate()).padStart(2, "0");
    let month=String(date.getMonth()+1).padStart(2, "0");
    let year=date.getFullYear();

    return `${day} / ${month} / ${year}`;

}

//Limits text length
function truncateNewsText(text){

    const maxChars=260;

    if(text.length<=maxChars){

        return text;

    }

    return text.substring(0, maxChars-3) + "...";

}

//Prevents html injection
function escapeHtml(text){

    let div=document.createElement("div");

    div.textContent=text;

    return div.innerHTML;

}

//Shows admin news form
function showNewNewsForm(){

    document.querySelector(".news-admin-form-wrap").removeAttribute("hidden");

}

//Hides admin news form
function hideNewNewsForm(){

    document.querySelector(".news-admin-form-wrap").setAttribute("hidden", "");

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