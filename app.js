const API_URL = "https://galeria-multimedia-1.onrender.com/multimedia";



document
.getElementById("formulario")
.addEventListener("submit", async(e)=>{


e.preventDefault();



const datos = new FormData();



datos.append(
"titulo",
document.getElementById("titulo").value
);



datos.append(
"descripcion",
document.getElementById("descripcion").value
);



const imagen =
document.getElementById("imagen").files[0];


const audio =
document.getElementById("audio").files[0];



if(imagen){

datos.append("imagen", imagen);

}



if(audio){

datos.append("audio", audio);

}





try{


const respuesta = await fetch(API_URL,{

method:"POST",

body:datos

});



const resultado = await respuesta.json();



console.log(resultado);



alert("Elemento guardado correctamente 🚀");



document
.getElementById("formulario")
.reset();



mostrarMultimedia();



}catch(error){


console.log(error);

alert("Error al guardar");


}



});







async function mostrarMultimedia(){


try{


const respuesta = await fetch(API_URL);


const datos = await respuesta.json();



const lista =
document.getElementById("lista");



lista.innerHTML="";



datos.forEach(elemento=>{



lista.innerHTML += `


<div>


<h3>${elemento.titulo}</h3>


<p>${elemento.descripcion}</p>



<img 
src="${elemento.imagenUrl}"
width="200"
>



<br>



${elemento.audioUrl ?

`
<audio controls>

<source src="${elemento.audioUrl}">

</audio>
`
:

""
}




</div>



`;



});



}catch(error){

console.log(error);

}


}





mostrarMultimedia();