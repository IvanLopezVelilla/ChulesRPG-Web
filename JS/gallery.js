document.addEventListener("DOMContentLoaded", ()=>{

    //STATE
    const state={

        currentPage: 1,
        assetsPerPage: 25,
        currentSort: "most_voted"

    };

    //Top bar
    if(isUserLogged()) updateLoggedUser();

    //Search bar
    let searchTimeout;

    document.getElementById("gallery-search").addEventListener("input", function(){

        clearTimeout(searchTimeout);

        searchTimeout=setTimeout(() => {

            state.currentPage=1;
            updateGallery(state);

        }, 250);

    });

    //Sort
    document.getElementById("gallery-sort").addEventListener("change", function(){

        state.currentPage=1;
        state.currentSort=this.value;

        updateGallery(state);

    });

    //Categories
    //All categories button
    const allButton=document.querySelector('[data-category="all"]');

    allButton.addEventListener("click", ()=>{

        document.querySelectorAll(".filter-btn")
            .forEach(btn=>btn.classList.remove("active"));

        allButton.classList.add("active");

        state.currentPage=1;

        updateGallery(state);

    });

    showCategories(state);

    //Initial load
    updateGallery(state);

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


//Returns all categories from the db
function getCategories(){

    let xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET", "Ajax/getCategories.php", false);
    xmlhttp.send();

    if(xmlhttp.status==200){

        return JSON.parse(xmlhttp.responseText);

    }

    return [];

}


//Returns an user, finds it by id
function getUserById(users_id){

    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", "Ajax/getUserById.php?users_id=" + users_id, false);
    xmlhttp.send();

    if(xmlhttp.status == 200){

        let response = JSON.parse(xmlhttp.responseText);

        if(response.success){

            return response;

        }

    }

    return null;

}


//Returns the main image path of an asset
function getAssetImage(assets_Id){

    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open("GET", "Ajax/getAssetImage.php?assets_id=" + assets_Id, false);
    xmlhttp.send();

    if(xmlhttp.status == 200){

        let response = JSON.parse(xmlhttp.responseText);

        if(response.success){

            return response.image.image;

        }

    }

    return null;

}


//Sorts all the assets acording to filters
function getSortedAssets(sort, page, limit, category, search){

    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open(

        "GET",

        "Ajax/getSortedAssets.php?" +
        "sort=" + encodeURIComponent(sort) +
        "&page=" + page +
        "&limit=" + limit +
        "&category=" + encodeURIComponent(category) +
        "&search=" + encodeURIComponent(search),

        false

    );

    xmlhttp.send();

    if(xmlhttp.status == 200){

        return JSON.parse(xmlhttp.responseText);

    }

    return {

        data: [],
        total: 0

    };

}


//DISPLAY
//Adds a new asset card
function createAssetCard(asset){

    //Grid
    const grid=document.querySelector(".asset-grid");

    //Link
    const link=document.createElement("a");
    link.href="asset.html?id=" + asset.assets_id;
    link.classList.add("asset-card-link");

    //Card
    const card=document.createElement("article");
    card.classList.add("asset-card");
    card.setAttribute("tabindex", "0");

    //Thumb
    const thumb=document.createElement("div");
    thumb.classList.add("asset-thumb");

    //Thumb inner
    const thumbInner=document.createElement("div");
    thumbInner.classList.add("asset-thumb-inner");

    //Image
    const img=document.createElement("img");
    img.classList.add("asset-image");

    //Get image from php
    const imagePath=getAssetImage(asset.assets_id);

    if(imagePath){

        img.src=imagePath;

    } else {

        img.src="Images/no-image.png";

    }

    img.alt=asset.name;

    thumbInner.appendChild(img);

    //Overlay
    const overlay=document.createElement("div");
    overlay.classList.add("asset-overlay");

    const overlayIcon=document.createElement("span");
    overlayIcon.classList.add("asset-overlay-icon");
    overlayIcon.textContent="🔍";

    const overlayText=document.createElement("span");
    overlayText.classList.add("asset-overlay-text");
    overlayText.textContent="PREVIEW";

    overlay.appendChild(overlayIcon);
    overlay.appendChild(overlayText);

    //Info
    const info=document.createElement("div");
    info.classList.add("asset-info");

    //Name
    const name=document.createElement("p");
    name.classList.add("asset-name");
    name.textContent=asset.name;

    //Category
    const category=document.createElement("p");
    category.classList.add("asset-category");
    category.textContent=asset.category_name;

    //Meta
    const meta=document.createElement("div");
    meta.classList.add("asset-meta");

    //User
    const user=document.createElement("span");
    user.classList.add("asset-user");
    user.textContent="@" + getUserById(asset.author).user.name;

    //Votes
    const votes=document.createElement("span");
    votes.classList.add("asset-votes");
    votes.textContent="▲ " + asset.votes;

    //Append meta
    meta.appendChild(user);
    meta.appendChild(votes);

    //Append info
    info.appendChild(name);
    info.appendChild(category);
    info.appendChild(meta);

    //Append thumb
    thumb.appendChild(thumbInner);
    thumb.appendChild(overlay);

    //Append card
    card.appendChild(thumb);
    card.appendChild(info);

    //Card inside link
    link.appendChild(card);

    //Append to grid
    grid.appendChild(link);

}

//Updates the gallery assets display
function updateGallery(state){

    const activeButton=document.querySelector(".filter-btn.active");

    const category=activeButton && activeButton.dataset.category ? activeButton.dataset.category:"all";

    const search=document.getElementById("gallery-search").value;

    const assets=getSortedAssets(

        state.currentSort,
        state.currentPage,
        state.assetsPerPage,
        category,
        search

    );

    //Grid
    const grid=document.querySelector(".asset-grid");
    grid.innerHTML="";

    assets.data.forEach(asset => {

        createAssetCard(asset);

    });

    updateResultsCount(assets.data.length);
    updatePagination(state, assets.total);

}

//Updates gallery pagination
function updatePagination(state, totalAssets){

    const pagination=document.querySelector(".gallery-pagination");

    pagination.innerHTML = "";

    const totalPages=Math.max(1, Math.ceil(totalAssets / state.assetsPerPage));

    //PREV
    const prev=document.createElement("button");

    prev.classList.add("page-btn");
    prev.textContent="◀ PREV";

    if(state.currentPage == 1){

        prev.disabled = true;

    }

    prev.addEventListener("click", ()=>{

        if(state.currentPage > 1){

            state.currentPage--;
            updateGallery(state);

        }

    });

    pagination.appendChild(prev);

    //FIRST 3 PAGES
    const visiblePages = Math.min(3, totalPages);

    for(let i=1; i<=visiblePages; i++){

        const button=document.createElement("button");

        button.classList.add("page-btn");

        if(i == state.currentPage){

            button.classList.add("page-active");

        }

        button.textContent=i;

        button.addEventListener("click", ()=>{

            state.currentPage=i;
            updateGallery(state);

        });

        pagination.appendChild(button);

    }

    //DOTS + LAST PAGE
    if(totalPages > 3){

        const dots=document.createElement("span");

        dots.classList.add("page-dots");
        dots.textContent="···";

        pagination.appendChild(dots);

        const last=document.createElement("button");

        last.classList.add("page-btn");

        if(state.currentPage == totalPages){

            last.classList.add("page-active");

        }

        last.textContent=totalPages;

        last.addEventListener("click", ()=>{

            state.currentPage=totalPages;
            updateGallery(state);

        });

        pagination.appendChild(last);

    }

    //NEXT
    const next=document.createElement("button");

    next.classList.add("page-btn");
    next.textContent="NEXT ▶";

    if(state.currentPage == totalPages){

        next.disabled = true;

    }

    next.addEventListener("click", ()=>{

        if(state.currentPage < totalPages){

            state.currentPage++;
            updateGallery(state);

        }

    });

    pagination.appendChild(next);

}

//Updates the asset count
function updateResultsCount(total){

    document.querySelector(".results-count").innerHTML=`Showing <strong>${total}</strong> assets`;

}

//Shows all categories, takes filtering into account
function showCategories(state){

    let categories=getCategories();

    let filters=document.querySelector(".gallery-filters");

    categories.forEach(category => {

        let button=document.createElement("button");

        button.classList.add("filter-btn");

        button.textContent=category.name;

        button.dataset.category=category.categories_id;

        button.addEventListener("click", ()=>{

            document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            state.currentPage = 1;

            updateGallery(state);

        });

        filters.appendChild(button);

    });

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

