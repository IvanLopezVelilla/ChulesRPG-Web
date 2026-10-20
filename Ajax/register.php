<?php
require_once("models.php");


function register($db){

    //Name
    //No name
    if(strlen($_GET["name"])<1){

        return -2;

    }

    //Not valid name
    if(strlen($_GET["name"])>30){

        return -1;

    }

    //Name already in use
    if($db->getUserIdByName($_GET["name"])!=null){

        return -3;

    }


    //Password
    //No password
    if(strlen($_GET["pass"])<1){

        return -4;

    }

    //Not valid password
    if(strlen($_GET["pass"])>30){

        return -5;

    }


    //Email
    //No email
    if(strlen($_GET["email"])<1){

        return -6;

    }

    //Not valid email
    if(!filter_var($_GET["email"], FILTER_VALIDATE_EMAIL)){

        return -7;

    }

    //Email already in use
    if($db->getUserIdByEmail($_GET["email"])!=null){

        return -8;

    }


    //Valid credentials, register the user
    $hash=password_hash($_GET["pass"], PASSWORD_DEFAULT);
    $db->insertUser($_GET["name"], $_GET["email"], $hash);

    saveLoggedUser($db, $_GET["name"]);
    return 1;

}

echo register($db);

?>