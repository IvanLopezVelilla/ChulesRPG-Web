<?php
require_once("models.php");


function login($db){

    //Name
    //No name
    if(strlen($_GET["name"])<1){

        return -2;

    }

    //Not valid name
    if(strlen($_GET["name"])>30){

        return -1;

    }

    //User not found
    if($db->getUserIdByName($_GET["name"])==null){

        return -5;

    }


    //Password
    //No password
    if(strlen($_GET["pass"])<1){

        return -3;

    }

    //Wrong password
    if(!$db->checkPassword($db->getUserIdByName($_GET["name"]), $_GET["pass"])){

        return -4;

    }


    //Valid credentials
    saveLoggedUser($db, $_GET["name"]);
    return 1;

}

echo login($db);


?>