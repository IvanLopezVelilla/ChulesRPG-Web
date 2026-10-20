document.addEventListener("DOMContentLoaded", ()=>{

    //Top bar
    if(isUserLogged()) updateLoggedUser();

    //Load messages
    loadMessages();

    //Realtime messages refresh
    setInterval(loadMessages, 1000);

    //Send message button
    document.getElementById("forum-send-btn").addEventListener("click", sendMessage);

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


//Loads all forum messages from database
function loadMessages(){

    let xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function(){

        if(this.readyState==4){

            if(this.status==200){

                const response=JSON.parse(this.responseText);

                if(response.success){

                    //Avoid unnecessary rerenders
                    const currentMessages=document.querySelectorAll(".forum-msg").length;

                    if(currentMessages!=response.messages.length){

                        renderMessages(response.messages);

                    }

                }else{

                    showError(response.code, response.message);

                }

            }else{

                showError(500, "Could not load forum messages");

            }

        }

    };

    xmlhttp.open("GET", "Ajax/getMessages.php", true);
    xmlhttp.send();

}


//Sends a new forum message
function sendMessage(){

    const input=document.getElementById("msg-input");

    const message=input.value.trim();

    //Validation
    if(message==""){

        showError(400, "Message cannot be empty");
        return;

    }

    if(message.length>500){

        showError(400, "Message is too long");
        return;

    }

    let formData=new FormData();

    formData.append("message", message);

    let xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function(){

        if(this.readyState==4){

            if(this.status==200){

                const response=JSON.parse(this.responseText);

                if(response.success){

                    input.value="";

                    loadMessages();

                }else{

                    showError(response.code, response.message);

                }

            }else{

                showError(500, "Could not send message");

            }

        }

    };

    xmlhttp.open("POST", "Ajax/sendMessage.php", true);
    xmlhttp.send(formData);

}


//Deletes a forum message
function deleteMessage(messageId){

    let formData=new FormData();

    formData.append("messageId", messageId);

    let xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function(){

        if(this.readyState==4){

            if(this.status==200){

                const response=JSON.parse(this.responseText);

                if(response.success){

                    loadMessages();

                }else{

                    showError(response.code, response.message);

                }

            }else{

                showError(500, "Could not delete message");

            }

        }

    };

    xmlhttp.open("POST", "Ajax/deleteMessage.php", true);
    xmlhttp.send(formData);

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
        hideLoginWarning();

    }else{

        showTopbarLogin();
        showLoginWarning();

    }

}


//Logs the current user out
function logout(){

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){
            
            showTopbarLogin();
            showLoginWarning();
            showSuccess(201, "User was logged out");

        }

    }

    xmlhttp.open("GET", "Ajax/logout.php", true);
    xmlhttp.send();

}



//DISPLAY
//Creates a forum message HTML element from a message object
function createMessageElement(message){

    const article=document.createElement("article");
    article.classList.add("forum-msg");

    //Admin badge
    let adminBadge="";

    if(message.admin==1){

        adminBadge=`
            <span class="msg-badge admin-badge">ADMIN</span>
        `;

    }

    article.innerHTML=`
    
        <div class="msg-meta">

            <span class="msg-author">◈ ${escapeHtml(message.authorName)}</span>

            ${adminBadge}

            <span class="msg-date">${formatMessageDate(message.date)}</span>

        </div>

        <p class="msg-body">
            ${escapeHtml(message.message)}
        </p>

    `;

    //Delete button
    if(isUserLogged() && getLoggedUser().admin==1){

        let deleteButton=document.createElement("button");

        deleteButton.classList.add("msg-delete-btn");

        deleteButton.textContent="✖";

        deleteButton.addEventListener("click", ()=>{

            deleteMessage(message.messages_id);

        });

        article.querySelector(".msg-meta").appendChild(deleteButton);

    }

    return article;

}

//Formats SQL datetime into forum style date
function formatMessageDate(dateString){

    const date=new Date(dateString);

    const day=String(date.getDate()).padStart(2, '0');
    const month=String(date.getMonth()+1).padStart(2, '0');
    const year=date.getFullYear();

    const hours=String(date.getHours()).padStart(2, '0');
    const minutes=String(date.getMinutes()).padStart(2, '0');

    return `${day} / ${month} / ${year} · ${hours}:${minutes}`;

}

//Prevents HTML injection
function escapeHtml(text){

    const div=document.createElement("div");
    div.textContent=text;
    return div.innerHTML;

}

//Renders all forum messages
function renderMessages(messages){

    const container=document.getElementById("forum-feed-messages");

    container.innerHTML="";

    messages.forEach(message => {

        container.appendChild(createMessageElement(message));

    });

    document.getElementById("msg-count").textContent=messages.length;

}

//Shows the warning message for the user to login and hides the message box
function showLoginWarning(){

    document.getElementById("compose-login-warning").removeAttribute('hidden');
    document.getElementById("compose-form").setAttribute('hidden', '');

}

//Hides the warning message for the user to login and shows the message box
function hideLoginWarning(){

    document.getElementById("compose-login-warning").setAttribute('hidden', '');
    document.getElementById("compose-form").removeAttribute('hidden');

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