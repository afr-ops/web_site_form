<?php
if(isset( $_POST['name']))
$name = $_POST['name'];

if(isset( $_POST['email']))
$email = $_POST['email'];

if(isset( $_POST['message']))
$message = $_POST['message'];

if(isset( $_POST['telephone']))
$telephone = $_POST['telephone'];


$subject = "Web Service - Hogar Emanuel";


if ($name === ''){
echo "El nombre no puede estar vacio.";
die();
}
if ($telephone === ''){
echo "El teléfono no puede estar vacio.";
die();
}

if ($email === ''){
echo "El mail no puede estar vacio.";
die();

} else {
if (!filter_var($email, FILTER_VALIDATE_EMAIL)){
echo "El formato del email es invalido.";
die();
}
}


$content= "Nombre: $name \n Email : $email \n Teléfono : $telephone \n Mensaje : $message" ;
$recipient = "contacto@hogar-emanuel.com";
$mailheader = "*Web Service - Hogar Emanuel* \n Nueva consulta desde el formulario de contacto";
mail($recipient,  $subject, $content, $mailheader ) or die("Error!");
echo "Email sent!";
// REdirect to
header("Location:index.html");
?>