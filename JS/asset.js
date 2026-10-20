document.addEventListener("DOMContentLoaded", ()=>{
    
    //Top bar
    //Check if user is registered
    if(isUserLogged()) updateLoggedUser();

    //Get asset
    const assets_id=new URLSearchParams(window.location.search).get("id");
    if(assets_id) loadAsset(assets_id);

    //Vote asset button
    const voteBtn = document.getElementById("asset-vote-btn");

    if(voteBtn && assets_id){

        voteBtn.addEventListener("click", ()=>{

            toggleVoteAsset(assets_id);

        });

    }

    //Delete asset button
    const deleteBtn=document.getElementById("asset-delete-btn");

    if(deleteBtn && assets_id){

        deleteBtn.addEventListener("click", ()=>{

            deleteAsset(assets_id);

        });

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


//Returns current asset
function loadAsset(assetId){

    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open(
        "GET",
        "Ajax/getAssetById.php?id=" + assetId,
        true
    );

    xmlhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){

            const response = JSON.parse(this.responseText);

            if(response.success){

                displayAsset(response.asset);

            }else{

                showError(404, "Asset not found");

            }

        }

    };

    xmlhttp.send();

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


//Updates the web for a logged user
function updateLoggedUser(){

    if(isUserLogged()){

        showLogout();
        if(getLoggedUser().admin==1) document.getElementById("asset-admin-actions").removeAttribute("hidden");

    }else{

        showTopbarLogin();

    }

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


//Deletes current asset
function deleteAsset(assetId){

    if(!confirm("Are you sure you want to delete this asset?")){

        return;

    }

    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open(
        "GET",
        "Ajax/deleteAsset.php?id=" + assetId,
        true
    );

    xmlhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){

            const response=JSON.parse(this.responseText);

            if(response.success){

                showSuccess(200, "Asset deleted");

                setTimeout(() => {

                    window.location.href="gallery.html";

                }, 1000);

            }else{

                showError(500, response.message);

            }

        }

    };

    xmlhttp.send();

}


//Checks if current user voted an asset
function hasUserVoted(assetId){

    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open(
        "GET",
        "Ajax/checkAssetVote.php?id=" + assetId,
        false
    );

    xmlhttp.send();

    if(xmlhttp.status==200){

        const response=JSON.parse(xmlhttp.responseText);

        if(response.success){

            return response.voted;

        }

    }

    return false;

}


//Toggles vote on current asset
function toggleVoteAsset(assetId){

    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open(
        "GET",
        "Ajax/toggleVoteAsset.php?id=" + assetId,
        true
    );

    xmlhttp.onreadystatechange = function(){

        if(this.readyState==4 && this.status==200){

            const response=JSON.parse(this.responseText);

            if(response.success){

                const votesElement=document.getElementById("asset-votes");
                const voteBtn=document.getElementById("asset-vote-btn");
                let currentVotes=parseInt(votesElement.textContent);

                //VOTED
                if(response.voted){

                    votesElement.textContent=currentVotes + 1;
                    voteBtn.textContent="✓ VOTED";
                    document.getElementById("asset-status-badge").removeAttribute("hidden");
                    showSuccess(200, "Vote added");

                }

                //UNVOTED
                else{

                    votesElement.textContent=Math.max(0, currentVotes - 1);
                    voteBtn.textContent="★ VOTE THIS ASSET";
                    document.getElementById("asset-status-badge").setAttribute("hidden", '');
                    showSuccess(200, "Vote removed");

                }

            }else{

                showError(400, response.message);

            }

        }

    };

    xmlhttp.send();

}


//DISPLAY
//Renders all data from current asset
function displayAsset(asset){

    //Path name
    document.getElementById("asset-breadcrumb-name").textContent=asset.name;

    //Images — setup carousel
    const images = asset.images;
    let currentIndex = 0;

    const imgEl       = document.getElementById("asset-main-image");
    const placeholder = document.getElementById("asset-img-placeholder");
    const prevBtn     = document.getElementById("img-prev-btn");
    const nextBtn     = document.getElementById("img-next-btn");

    function showImage(index) {
        imgEl.src = images[index].image;
        placeholder.setAttribute('hidden', '');
        // Hide buttons if only one image
        prevBtn.style.display = images.length <= 1 ? 'none' : '';
        nextBtn.style.display = images.length <= 1 ? 'none' : '';
    }

    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    });

    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    });

    showImage(currentIndex);

    //Asset id
    document.getElementById("asset-id").textContent="#" + asset.assets_id;

    //Category
    document.getElementById("asset-category").textContent=asset.category_name;

    //Voted
    if(hasUserVoted(asset.assets_id)) document.getElementById("asset-status-badge").removeAttribute("hidden");

    //Name
    document.getElementById("asset-name").textContent=asset.name;

    //Votes
    document.getElementById("asset-votes").textContent=asset.votes;

    //Date
    document.getElementById("asset-date").textContent=asset.date.split(' ', 1);

    //Author
    document.getElementById("asset-author").textContent=asset.author_name;

    //Category
    document.getElementById("asset-category-full").textContent=asset.category_name;

    //Vote button
    const voteBtn=document.getElementById("asset-vote-btn");
    if(hasUserVoted(asset.assets_id)){

        voteBtn.textContent="✓ VOTED";

    }else{

        voteBtn.textContent="★ VOTE THIS ASSET";

    }


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
    document.getElementById("asset-admin-actions").setAttribute("hidden", '');

}

//Shows logout button, hiddens topbar login and register buttons
function showLogout(){

    document.getElementById('nav-login-btn').setAttribute('hidden', '');
    document.getElementById('nav-register-btn').setAttribute('hidden', '');
    document.getElementById('nav-logout-btn').removeAttribute('hidden');
    if(getLoggedUser().admin==1) document.getElementById('nav-admin-btn').removeAttribute('hidden');
    document.getElementById("loggedUsername").textContent=getLoggedUser().name;

}