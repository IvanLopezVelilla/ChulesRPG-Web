document.addEventListener("DOMContentLoaded", ()=>{

    //Top bar
    //Check if user is registered
    if(isUserLogged()) updateLoggedUser();


    //Logout button
    let logoutBtn=document.getElementById("nav-logout-btn");
    if(logoutBtn){

        logoutBtn.addEventListener("click", logout);

    }

    //Image
    prepareImageUploads();

    //Categories
    showCategories();
    document.getElementById("asset-category").addEventListener("change", checkCategory);

    //Submit asset button
    document.getElementById("uploadSubmitBtn").addEventListener('click', submitAsset);

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


//FORM
//Submit the form and shows the response
function submitAsset(){

    const name=document.getElementById('asset-name').value.trim();
    const category=document.getElementById('asset-category').value;

    const formData=new FormData();

    formData.append('name', name);
    formData.append('category', category);

    // Detect skill
    const categorySelect=document.getElementById("asset-category");
    const categoryText=categorySelect.options[categorySelect.selectedIndex].textContent.trim().toLowerCase();
    const isSkill=categoryText.includes("skill");
    const isEnemy=parseInt(category)===2;

    //Skill
    if(isSkill){

        const skillValue=document.getElementById("skill-value").value;
        const skillMana=document.getElementById("skill-mana-cost").value;
        const skillType=document.getElementById("skill-type").value;
        const skillDescription=document.getElementById("skill-description").value.trim();

        // Convert type to int
        let skillTypeValue=0;

        switch(skillType){

            case "damage":
                skillTypeValue=0;
            break;

            case "heal":
                skillTypeValue=1;
            break;

            case "defense":
                skillTypeValue=2;
            break;

        }

        formData.append("skillValue", skillValue);
        formData.append("skillManaCost", skillMana);
        formData.append("skillType", skillTypeValue);
        formData.append("skillDescription", skillDescription);

    }

    //Enemy
    if(isEnemy){

        const enemyLevel=document.getElementById("enemy-level").value;
        const enemyLife=document.getElementById("enemy-life").value;
        const enemyMana=document.getElementById("enemy-mana").value;
        const enemyAttack=document.getElementById("enemy-attack").value;
        const enemyDefense=document.getElementById("enemy-defense").value;
        const enemySpeed=document.getElementById("enemy-speed").value;
        const enemyExp=document.getElementById("enemy-exp").value;
        const enemyMoney=document.getElementById("enemy-money").value;

        formData.append("enemyLevel", enemyLevel);
        formData.append("enemyLife", enemyLife);
        formData.append("enemyMana", enemyMana);
        formData.append("enemyAttack", enemyAttack);
        formData.append("enemyDefense", enemyDefense);
        formData.append("enemySpeed", enemySpeed);
        formData.append("enemyExp", enemyExp);
        formData.append("enemyMoney", enemyMoney);

    }

    //Single image (skill)
    if(category==3){

        const images=document.getElementById('asset-images').files;

        for(let i=0;i<images.length;i++){

            formData.append('images[]', images[i]);

        }

    }else{

        //Spritesheet
        const spriteInputs=document.querySelectorAll('.sd-file-input');

        spriteInputs.forEach(input => {

            if(input.files.length > 0){

                formData.append('images[]', input.files[0]);

            }

        });

    }

    //Request
    let xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){

        if(this.readyState==4){

            if(this.status!=200){

                showError(500, "Server error");
                return;

            }

            try{

                let response=JSON.parse(this.responseText);

                if(response.success){

                    showSuccess(200, "Asset uploaded successfully");

                }else{

                    showError(500, response.message);

                }

            }catch(e){

                console.error("Invalid JSON:", this.responseText);
                showError(500, "Invalid server response");

            }

        }

    };

    xmlhttp.open("POST", "Ajax/submitAsset.php", true);
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
        showForm();

    }else{

        showTopbarLogin();
        hideForm();

    }

}


//Logs the current user out
function logout(){

    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){

        if(this.readyState == 4 && this.status == 200){
            
            showTopbarLogin();
            hideForm();
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


//DISPLAY
//Hides the login warning and shows the form
function showForm(){

    document.getElementById("upload-form-wrap").removeAttribute('hidden');
    document.getElementById("upload-login-warning").setAttribute('hidden', '');

}

//Shows the login warning and hides the form
function hideForm(){

    document.getElementById("upload-login-warning").removeAttribute('hidden');
    document.getElementById("upload-form-wrap").setAttribute('hidden', '');

}

//Checks the selected category to change the upload display
function checkCategory(){

    const select=document.getElementById("asset-category");
    const categoria=parseInt(select.value);

    const isSkill=categoria===3;
    const isEnemy=categoria===2;

    document.getElementById("skill-fields-wrap").hidden=!isSkill;
    document.getElementById("enemy-fields-wrap").hidden=!isEnemy;

    // Upload type
    if(isSkill){

        showSingularUpload();

    }else{

        showMultipleUpload();

    }

}

//Shows a single file upload
function showSingularUpload(){

    document.getElementById("upload-single-wrap").removeAttribute("hidden");
    document.getElementById("upload-directions-wrap").setAttribute("hidden", '');

}

//Shows a multiple files upload
function showMultipleUpload(){

    document.getElementById("upload-directions-wrap").removeAttribute("hidden");
    document.getElementById("upload-single-wrap").setAttribute("hidden", '');

}

//Show all categories
function showCategories(){

    let categories=getCategories();
    let select=document.getElementById('asset-category');
    categories.forEach(cat => {

        let option=document.createElement('option');
        option.value=cat.categories_id;
        option.textContent=cat.name;
        select.appendChild(option);

    });

}

//Adds image upload logic for display purposes
function prepareImageUploads(){

    const dropZone=document.getElementById('file-drop-zone');
    const fileInput=document.getElementById('asset-images');
    const preview=document.getElementById('image-preview');
    const placeholder=document.getElementById('drop-placeholder');

    //Clear image
    function clearImage() {

        fileInput.value='';
        preview.src='';
        preview.setAttribute('hidden', '');
        placeholder.removeAttribute('hidden');
        dropZone.classList.remove('has-image');
        const btn = document.getElementById('remove-image-btn');
        if (btn) btn.remove();

    }

    fileInput.addEventListener('change', function() {
        const file=this.files[0];
        if (!file) return;

        const reader=new FileReader();
        reader.onload=function(e) {

            preview.src = e.target.result;
            preview.removeAttribute('hidden');
            placeholder.setAttribute('hidden', '');

            dropZone.classList.add('has-image');

            if (!document.getElementById('remove-image-btn')) {
                const removeBtn=document.createElement('button');
                removeBtn.id='remove-image-btn';
                removeBtn.className='btn btn-outline-red remove-image-btn';
                removeBtn.textContent='✖ REMOVE';
                removeBtn.addEventListener('click', clearImage);
                dropZone.appendChild(removeBtn);
            }
        };
        reader.readAsDataURL(file);
    });

    //Spritesheet previews
    const spriteInputs=document.querySelectorAll('.sd-file-input');

    spriteInputs.forEach(input => {

        input.addEventListener('change', function(){

            const file=this.files[0];
            if(!file) return;

            //Current slot
            const slot=this.closest('.sd-slot');

            //Preview image
            const preview=slot.querySelector('.sd-preview');

            //Plus icon
            const plus=slot.querySelector('.sd-plus');

            const reader=new FileReader();

            reader.onload=function(e){

                preview.src=e.target.result;
                preview.removeAttribute('hidden');

                plus.style.display='none';
                slot.classList.add('has-image');

            };

            reader.readAsDataURL(file);

        });

    });

}

//Shows a success popup
function showSuccess(code, message){

    document.getElementById('success-code').textContent=code;
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