<?php

require_once("models.php");

header("Content-Type: application/json");

if(isset($_SESSION["loggedUser"])){

    echo json_encode([
        "logged"=>true,
        "users_id"=>$_SESSION["loggedUser"]["users_id"],
        "name"=>$_SESSION["loggedUser"]["name"],
        "email"=>$_SESSION["loggedUser"]["email"],
        "admin"=>$_SESSION["loggedUser"]["admin"]
    ]);

}else{

    echo json_encode([
        "logged"=>false
    ]);

}

?>