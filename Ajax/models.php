<?php
session_start();
require_once("../db.php");

//Create database connection
$db=new db("localhost",3306,"chulesrpg","cacahuet","changeme69");


//Global functions
function saveLoggedUser($db, $name){

    $user=$db->getUser($db->getUserIdByName($name));

    $_SESSION["loggedUser"]=[

        "users_id"=>$user["users_id"],
        "name"=>$user["name"],
        "email"=>$user["email"],
        "admin"=>$user["admin"]

    ];

}


?>
