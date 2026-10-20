<?php
require_once("models.php");

header('Content-Type: application/json');


function checkForm($db){

    //NAME
    if(!isset($_POST["name"]) || strlen(trim($_POST["name"])) < 1){

        return json_encode([
            "success"=>false,
            "message"=>"Please, insert a name"
        ]);

    }

    //INVALID NAME
    if(strlen($_POST["name"]) > 200){

        return json_encode([
            "success"=>false,
            "message"=>"This name is not valid"
        ]);

    }

    //CATEGORY
    if(!isset($_POST["category"]) || $_POST["category"] == ""){

        return json_encode([
            "success"=>false,
            "message"=>"Please, select a category"
        ]);

    }

    //FILES
    if(
        !isset($_FILES['images']) ||
        count($_FILES['images']['name']) <= 0
    ){

        return json_encode([
            "success"=>false,
            "message"=>"Please, upload images"
        ]);

    }

    //CHECK ALL FILES
    for($i = 0; $i < count($_FILES['images']['name']); $i++){

        //UPLOAD ERROR
        if($_FILES['images']['error'][$i] !== 0){

            return json_encode([
                "success"=>false,
                "message"=>"Error uploading image"
            ]);

        }

        //EMPTY TMP
        if(
            !isset($_FILES['images']['tmp_name'][$i]) ||
            $_FILES['images']['tmp_name'][$i] == ""
        ){

            return json_encode([
                "success"=>false,
                "message"=>"Invalid uploaded image"
            ]);

        }

        //FILE SIZE MAX 5MB
        if($_FILES['images']['size'][$i] > 5 * 1024 * 1024){

            return json_encode([
                "success"=>false,
                "message"=>"Image too large (max 5MB)"
            ]);

        }

        //ORIGINAL NAME
        $originalName = $_FILES['images']['name'][$i];

        //EXTENSION
        $extension = strtolower(
            pathinfo($originalName, PATHINFO_EXTENSION)
        );

        //ONLY PNG
        if($extension !== "png"){

            return json_encode([
                "success"=>false,
                "message"=>"Only .png images are allowed"
            ]);

        }

        //REAL MIME TYPE
        $mimeType = mime_content_type(
            $_FILES['images']['tmp_name'][$i]
        );

        if($mimeType !== "image/png"){

            return json_encode([
                "success"=>false,
                "message"=>"Invalid PNG image"
            ]);

        }

    }

    //SKILL
    if($_POST["category"] == 3){

        //1 IMAGE
        if(count($_FILES['images']['name']) != 1){

            return json_encode([
                "success"=>false,
                "message"=>"Please, upload 1 image"
            ]);

        }

        //VALUE
        if(
            !isset($_POST["skillValue"]) ||
            trim($_POST["skillValue"]) === ""
        ){

            return json_encode([
                "success"=>false,
                "message"=>"Please, insert skill value"
            ]);

        }

        //MANA COST
        if(
            !isset($_POST["skillManaCost"]) ||
            trim($_POST["skillManaCost"]) === ""
        ){

            return json_encode([
                "success"=>false,
                "message"=>"Please, insert mana cost"
            ]);

        }

        //SKILL TYPE
        if(
            !isset($_POST["skillType"]) ||
            $_POST["skillType"] === ""
        ){

            return json_encode([
                "success"=>false,
                "message"=>"Please, select a skill type"
            ]);

        }

    }

    //ENEMY
    else if($_POST["category"] == 2){

        //8 IMAGES
        if(count($_FILES['images']['name']) != 8){

            return json_encode([
                "success"=>false,
                "message"=>"Please, upload all 8 images"
            ]);

        }

        //LIFE
        if(
            !isset($_POST["enemyLife"]) ||
            trim($_POST["enemyLife"]) === ""
        ){

            return json_encode([
                "success"=>false,
                "message"=>"Please, insert enemy life"
            ]);

        }

        //ATTACK
        if(
            !isset($_POST["enemyAttack"]) ||
            trim($_POST["enemyAttack"]) === ""
        ){

            return json_encode([
                "success"=>false,
                "message"=>"Please, insert enemy attack"
            ]);

        }

        //DEFENSE
        if(
            !isset($_POST["enemyDefense"]) ||
            trim($_POST["enemyDefense"]) === ""
        ){

            return json_encode([
                "success"=>false,
                "message"=>"Please, insert enemy defense"
            ]);

        }

        //SPEED
        if(
            !isset($_POST["enemySpeed"]) ||
            trim($_POST["enemySpeed"]) === ""
        ){

            return json_encode([
                "success"=>false,
                "message"=>"Please, insert enemy speed"
            ]);

        }

    }

    //NORMAL ASSET
    else{

        //8 IMAGES
        if(count($_FILES['images']['name']) != 8){

            return json_encode([
                "success"=>false,
                "message"=>"Please, upload all 8 images"
            ]);

        }

    }

    return false;

}


//UPLOADS THE ASSET TO THE DATABASE
function uploadAsset($db){

    $name = trim($_POST['name']);
    $category = (int)$_POST['category'];
    $userId = $_SESSION["loggedUser"]["users_id"];

    //DEFAULT VALUES
    $value = 0;
    $cost = 0;
    $description = "";
    $type = 0;

    $life = 0;
    $attack = 0;
    $defense = 0;
    $speed = 0;

    //SKILL VALUES
    if($category == 3){

        $value = (int)$_POST["skillValue"];
        $cost = (int)$_POST["skillManaCost"];
        $description = trim($_POST["skillDescription"] ?? "");
        $type = (int)$_POST["skillType"];

    }

    //ENEMY VALUES
    if($category == 2){

        $life = (int)$_POST["enemyLife"];
        $attack = (int)$_POST["enemyAttack"];
        $defense = (int)$_POST["enemyDefense"];
        $speed = (int)$_POST["enemySpeed"];
        $description = trim($_POST["enemyDescription"] ?? "");

    }

    //CREATE UPLOADS FOLDER
    if(!file_exists("../Uploads")){

        mkdir("../Uploads", 0777, true);

    }

    //UPLOAD ASSET TO DB
    $assetId = $db->insertAsset(

        $name,
        $category,
        $userId,
        $value,
        $cost,
        $description,
        $type,
        $life,
        $attack,
        $defense,
        $speed

    );

    //ERROR CREATING ASSET
    if(!$assetId){

        return json_encode([
            "success"=>false,
            "message"=>"Error creating asset"
        ]);

    }

    //UPLOADED FILES
    $uploadedFiles = [];

    //UPLOAD IMAGES
    for($i = 0; $i < count($_FILES['images']['name']); $i++){

        //ORIGINAL DATA
        $originalName = $_FILES['images']['name'][$i];
        $tmpName = $_FILES['images']['tmp_name'][$i];

        //EXTENSION
        $extension = strtolower(
            pathinfo($originalName, PATHINFO_EXTENSION)
        );

        //UNIQUE NAME
        $newFileName = time() . "_" . $i . "." . $extension;

        //SERVER PATH
        $serverPath = "../Uploads/" . $newFileName;

        //DB PATH
        $dbPath = "Uploads/" . $newFileName;

        //MOVE FILE
        if(!move_uploaded_file($tmpName, $serverPath)){

            //DELETE UPLOADED FILES
            foreach($uploadedFiles as $file){

                if(file_exists($file)){

                    unlink($file);

                }

            }

            //DELETE ASSET
            $db->deleteAsset($assetId);

            return json_encode([
                "success"=>false,
                "message"=>"Error moving uploaded file"
            ]);

        }

        chmod($serverPath, 0644);

        $uploadedFiles[] = $serverPath;

        //SAVE FILE IN DB
        $result = $db->insertFile(
            $newFileName,
            $dbPath,
            $assetId
        );

        if(!$result){

            //DELETE FILES
            foreach($uploadedFiles as $file){

                if(file_exists($file)){

                    unlink($file);

                }

            }

            //DELETE ASSET
            $db->deleteAsset($assetId);

            return json_encode([
                "success"=>false,
                "message"=>"Error saving file in database"
            ]);

        }

    }

    return json_encode([
        "success"=>true,
        "message"=>"Asset uploaded successfully"
    ]);

}


//MAIN
if(isset($_SESSION["loggedUser"])){

    $check = checkForm($db);

    if($check){

        echo $check;

    }else{

        echo uploadAsset($db);

    }

}else{

    echo json_encode([
        "success"=>false,
        "message"=>"Please, login"
    ]);

}
?>