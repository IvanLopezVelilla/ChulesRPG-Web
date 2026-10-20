document.addEventListener("DOMContentLoaded", ()=>{

    //Top bar
    if(isUserLogged()) updateLoggedUser();


    //Collapse new changelog form button
    const collapseBtn=document.getElementById("cl-admin-toggle");
    const formBody=document.getElementById("cl-admin-form-body");

    if (collapseBtn && formBody) {

        collapseBtn.addEventListener("click", () => {

            formBody.classList.toggle("collapsed");

            // Change button text
            if(formBody.classList.contains("collapsed")){

                collapseBtn.textContent="▼ EXPAND";

            }else{

                collapseBtn.textContent="▲ COLLAPSE";

            }

        });

    }

    //Add changelog change row button
    const addChangeBtn=document.getElementById("cl-add-change-btn");

    if(addChangeBtn){

        addChangeBtn.addEventListener("click", addChangeRow);

    }

    //Remove default change row button
    setupRemoveButtons();

    //Publish changelog button
    const publishBtn=document.getElementById("cl-submit-btn");

    if(publishBtn){

        publishBtn.addEventListener("click", publishChangelogPreview);

    }

    //Changelogs
    loadChangelogs();

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


//CHANGELOG FORM
//Adds a new change row to the changelog form
function addChangeRow(){

    const changesList=document.getElementById("cl-form-changes-list");

    const row=document.createElement("div");
    row.classList.add("cl-form-change-row");

    row.innerHTML=`

        <div class="select-wrap cl-change-type-wrap">
            <select class="cl-change-type-select">
                <option value="added">ADD</option>
                <option value="changed">CHG</option>
                <option value="fixed">FIX</option>
                <option value="removed">REM</option>
            </select>
            <span class="select-arrow">▼</span>
        </div>

        <input 
            type="text" 
            class="cl-change-input" 
            placeholder="Describe this change..." 
        />

        <button 
            class="btn btn-outline-red cl-remove-change-btn" 
            type="button"
        >
            ✖
        </button>

    `;

    changesList.appendChild(row);

    //Enable remove button for this row
    const removeBtn=row.querySelector(".cl-remove-change-btn");

    removeBtn.addEventListener("click", ()=>{

    const allRows=document.querySelectorAll(".cl-form-change-row");

    if(allRows.length<=1){

        showError(400, "At least one change row is required");
        return;

    }

    row.remove();

});

}


//Adds remove functionality to all current remove buttons
function setupRemoveButtons(){

    const removeButtons=document.querySelectorAll(".cl-remove-change-btn");

    removeButtons.forEach((btn)=>{

        btn.addEventListener("click", ()=>{

            const row=btn.closest(".cl-form-change-row");

            if(!row) return;

            //Prevent deleting the last remaining row
            const allRows=document.querySelectorAll(".cl-form-change-row");

            if(allRows.length<=1){

                showError(400, "At least one change row is required");
                return;

            }

            row.remove();

        });

    });

}


//Collects all form data and prints it to console
function publishChangelogPreview(){

    const name=document.getElementById("cl-name").value.trim();
    const build=document.getElementById("cl-build").value.trim();
    const type=document.getElementById("cl-type").value;

    const rows=document.querySelectorAll(".cl-form-change-row");

    const changes=[];

    rows.forEach((row)=>{

        const changeType=row.querySelector(".cl-change-type-select").value;
        const changeText=row.querySelector(".cl-change-input").value.trim();

        if(changeText==="") return;

        changes.push({
            type:changeType,
            text:changeText
        });

    });

    if(!name || !build || !type){
        showError(400, "Missing required changelog fields");
        return;
    }

    if(changes.length===0){
        showError(400, "You must add at least one change");
        return;
    }

    const changelogData={
        name,
        build,
        type,
        changes
    };

    insertChangelog(changelogData);
}


//Loads all changelogs and their changes from the db
function loadChangelogs(){

    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET", "Ajax/getChangelogs.php", true);

    xmlhttp.onreadystatechange=function(){

        if(this.readyState===4){

            if(this.status===200){

                try{

                    const res=JSON.parse(this.responseText);

                    if(res.success){
                        renderChangelogs(res.data);
                    }else{
                        showError(res.code || 500, res.message || "Error loading changelogs");
                    }

                }catch(e){
                    showError(500, "Invalid server response");
                }

            }else{
                showError(this.status, "Request failed");
            }

        }

    };

    xmlhttp.send();

}


//Sends a changelog object to ajax to insert in db
function insertChangelog(data){

    let formData=new FormData();
    formData.append("data", JSON.stringify(data));

    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST", "Ajax/createChangelog.php", true);

    xmlhttp.onreadystatechange=function(){

        if(this.readyState===4){

            if(this.status===200){

                try{

                    const res=JSON.parse(this.responseText);

                    if(res.success){
                        showSuccess(200, "Changelog published successfully");
                    }else{
                        showError(res.code || 500, res.message || "Error");
                    }

                }catch(e){
                    showError(500, "Invalid server response");
                }

            }else{
                showError(this.status, "Request failed");
            }
        }
    };

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
        if(getLoggedUser().admin==1) showNewChangelogForm();

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
            hideNewChangelogForm();
            showSuccess(201, "User was logged out");

        }

    }

    xmlhttp.open("GET", "Ajax/logout.php", true);
    xmlhttp.send();

}



//DISPLAY
//Creates the changelog display
function renderChangelogs(data){

    const timeline=document.querySelector(".cl-timeline");
    timeline.innerHTML="";

    data.forEach(log=>{

        const entry=document.createElement("div");
        entry.classList.add("cl-entry");

        const date=new Date(log.date);
        const formattedDate=
            String(date.getDate()).padStart(2,"0") + " / " +
            String(date.getMonth()+1).padStart(2,"0") + " / " +
            date.getFullYear();

        let changesHTML="";

        log.changes.forEach(ch=>{

            let cls="";

            if(ch.type==="added") cls="cl-added";
            if(ch.type==="changed") cls="cl-changed";
            if(ch.type==="fixed") cls="cl-fixed";
            if(ch.type==="removed") cls="cl-removed";

            const tag=ch.type.toUpperCase().slice(0,3);

            changesHTML+=`
                <div class="cl-change ${cls}">
                    <span class="cl-change-tag">${tag}</span>
                    <span class="cl-change-text">${ch.textContent}</span>
                </div>
            `;

        });

        entry.innerHTML=`

            <div class="cl-entry-header">
                <div class="cl-version-badge">
                    <span class="cl-version">${log.build}</span>
                    <span class="cl-tag cl-tag-${log.type}">${log.type.toUpperCase()}</span>
                </div>

                <div class="cl-entry-meta">
                    <span class="cl-date">${formattedDate}</span>
                    <span class="cl-entry-title">${log.name}</span>
                </div>
            </div>

            <div class="cl-entry-body">
                <div class="cl-changes">
                    ${changesHTML}
                </div>
            </div>

        `;

        timeline.appendChild(entry);

    });

}

//Shows the new changelog form
function showNewChangelogForm(){

    document.getElementById("admin-form-wrap").removeAttribute('hidden');

}

//Hides the new changelog form
function hideNewChangelogForm(){

    document.getElementById("admin-form-wrap").setAttribute('hidden', '');

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