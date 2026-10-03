// ============================================
// API
// ============================================

const API_URL =
    "https://galeria-multimedia-1.onrender.com/multimedia";


// ============================================
// VARIABLES
// ============================================

let elementosGlobales = [];

let editando = null;

let colaActual = [];

let indiceActual = -1;

let aleatorio = false;

let repetir = false;

let playlistActual = null;


// ============================================
// ELEMENTOS DEL REPRODUCTOR
// ============================================

const audioPlayer =
    document.getElementById("audioPlayer");

const progressBar =
    document.getElementById("progressBar");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const mainPlay =
    document.getElementById("mainPlay");


// ============================================
// GUARDAR CANCIÓN
// ============================================

async function guardar() {

    const titulo =
        document.getElementById("titulo").value.trim();

    const descripcion =
        document.getElementById("descripcion").value.trim();

    const imagen =
        document.getElementById("imagen").files[0];

    const audio =
        document.getElementById("audio").files[0];


    if (!titulo) {

        mostrarMensaje(
            "⚠️ Escribe un título.",
            "error"
        );

        return;
    }


    if (!audio && !editando) {

        mostrarMensaje(
            "⚠️ Selecciona un audio.",
            "error"
        );

        return;
    }


    const datos = new FormData();

    datos.append("titulo", titulo);

    datos.append("descripcion", descripcion);


    if (imagen) {
        datos.append("imagen", imagen);
    }


    if (audio) {
        datos.append("audio", audio);
    }


    let url = API_URL;

    let metodo = "POST";


    if (editando) {

        url =
            `${API_URL}/${editando}`;

        metodo = "PUT";
    }


    try {

        mostrarMensaje(
            "⏳ Guardando canción...",
            "loading"
        );


        const respuesta =
            await fetch(url, {
                method: metodo,
                body: datos
            });


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.error ||
                "Error al guardar"
            );

        }


        mostrarMensaje(
            editando
                ? "✅ Canción actualizada"
                : "✅ Canción guardada correctamente",
            "success"
        );


        editando = null;


        document.getElementById(
            "botonGuardar"
        ).innerText =
            "💾 Guardar canción";


        limpiarFormulario();


        await mostrar();

    }

    catch (error) {

        console.error(error);

        mostrarMensaje(
            "❌ " + error.message,
            "error"
        );

    }

}



// ============================================
// MOSTRAR CANCIONES
// ============================================

async function mostrar() {

    try {

        const respuesta =
            await fetch(API_URL);


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo conectar con Render"
            );

        }


        const datos =
            await respuesta.json();


        elementosGlobales =
            datos;


        renderizarCanciones(datos);


        mostrarPlaylists();

        actualizarPlaylistAbierta();

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "lista"
        ).innerHTML = `

            <div class="error-message">

                ❌ No se pudieron cargar
                las canciones.

            </div>

        `;

    }

}



// ============================================
// RENDERIZAR CANCIONES
// ============================================

function renderizarCanciones(canciones) {

    const lista =
        document.getElementById("lista");


    lista.innerHTML = "";


    if (!canciones.length) {

        lista.innerHTML = `

            <div class="empty-message">

                🎵 Todavía no tienes canciones.

            </div>

        `;

        return;
    }


    canciones.forEach(e => {

        const portada =
            e.imagenUrl ||
            "https://placehold.co/500x500/181818/1ed760?text=🎵";


        const card =
            document.createElement("article");

        card.className = "music-card";


        card.innerHTML = `

            <div class="cover-container">

                <img
                    class="music-cover"
                    src="${portada}"
                    crossorigin="anonymous"
                >

                ${
                    e.audioUrl
                    ?

                    `<button class="card-play">
                        ▶
                    </button>`

                    :

                    ""
                }

            </div>


            <h3>
                ${escapeHTML(e.titulo)}
            </h3>


            <p>
                ${escapeHTML(
                    e.descripcion ||
                    "Sin descripción"
                )}
            </p>


            <div class="card-actions">

                <button class="playlist-add">
                    ➕ Playlist
                </button>

                <button class="edit-button">
                    ✏️
                </button>

                <button class="delete-button">
                    🗑️
                </button>

            </div>

        `;


        // REPRODUCIR

        if (e.audioUrl) {

            card
                .querySelector(".card-play")
                .addEventListener(
                    "click",
                    () => {

                        reproducirCancion(
                            e._id
                        );

                    }
                );

        }


        // PLAYLIST

        card
            .querySelector(".playlist-add")
            .addEventListener(
                "click",
                () => {

                    agregarACualquierPlaylist(
                        e._id
                    );

                }
            );


        // EDITAR

        card
            .querySelector(".edit-button")
            .addEventListener(
                "click",
                () => {

                    editar(
                        e._id,
                        e.titulo,
                        e.descripcion || ""
                    );

                }
            );


        // ELIMINAR

        card
            .querySelector(".delete-button")
            .addEventListener(
                "click",
                () => {

                    eliminar(e._id);

                }
            );


        lista.appendChild(card);

    });

}



// ============================================
// REPRODUCIR CANCIÓN
// ============================================

function reproducirCancion(id) {

    const cancion =
        elementosGlobales.find(
            e => e._id === id
        );


    if (!cancion || !cancion.audioUrl) {
        return;
    }


    // Si no hay playlist activa,
    // usamos todas las canciones.

    if (!playlistActual) {

        colaActual =
            elementosGlobales.filter(
                e => e.audioUrl
            );

    }


    const indice =
        colaActual.findIndex(
            e => e._id === id
        );


    if (indice !== -1) {

        indiceActual = indice;

    }
    else {

        colaActual =
            [cancion];

        indiceActual = 0;

    }


    cargarCancion(
        cancion
    );

}



// ============================================
// CARGAR CANCIÓN EN REPRODUCTOR
// ============================================

function cargarCancion(cancion) {

    if (!cancion || !cancion.audioUrl) {
        return;
    }


    audioPlayer.src =
        cancion.audioUrl;


    audioPlayer.load();


    document.getElementById(
        "tituloReproductor"
    ).innerText =
        cancion.titulo;


    document.getElementById(
        "artistaReproductor"
    ).innerText =
        "MiGalería";


    const portada =
        cancion.imagenUrl ||
        "https://placehold.co/500x500/181818/1ed760?text=🎵";


    document.getElementById(
        "portadaReproductor"
    ).innerHTML = `

        <img
            src="${portada}"
            crossorigin="anonymous"
        >

    `;


    cambiarFondoDinamico(
        portada
    );


    audioPlayer.play()
        .then(() => {

            mainPlay.innerText = "⏸";

        })
        .catch(error => {

            console.log(
                "Reproducción pendiente:",
                error
            );

        });

}



// ============================================
// PLAY / PAUSA
// ============================================

function togglePlay() {

    if (!audioPlayer.src) {

        if (colaActual.length) {

            reproducirCancion(
                colaActual[0]._id
            );

        }

        return;
    }


    if (audioPlayer.paused) {

        audioPlayer.play();

        mainPlay.innerText =
            "⏸";

    }
    else {

        audioPlayer.pause();

        mainPlay.innerText =
            "▶";

    }

}



// ============================================
// CUANDO CAMBIA PLAY / PAUSA
// ============================================

audioPlayer.addEventListener(
    "play",
    () => {

        mainPlay.innerText =
            "⏸";

    }
);


audioPlayer.addEventListener(
    "pause",
    () => {

        mainPlay.innerText =
            "▶";

    }
);



// ============================================
// BARRA DE PROGRESO
// ============================================

audioPlayer.addEventListener(
    "loadedmetadata",
    () => {

        progressBar.max =
            audioPlayer.duration;

        duration.innerText =
            formatoTiempo(
                audioPlayer.duration
            );

    }
);


audioPlayer.addEventListener(
    "timeupdate",
    () => {

        progressBar.value =
            audioPlayer.currentTime;


        currentTime.innerText =
            formatoTiempo(
                audioPlayer.currentTime
            );

    }
);


function cambiarTiempo() {

    audioPlayer.currentTime =
        progressBar.value;

}



// ============================================
// VOLUMEN
// ============================================

function cambiarVolumen() {

    audioPlayer.volume =
        document.getElementById(
            "volumeControl"
        ).value;

}



// ============================================
// SIGUIENTE
// ============================================

function cancionSiguiente() {

    if (!colaActual.length) {
        return;
    }


    if (aleatorio) {

        let nuevoIndice;


        do {

            nuevoIndice =
                Math.floor(
                    Math.random() *
                    colaActual.length
                );

        }
        while (
            colaActual.length > 1 &&
            nuevoIndice === indiceActual
        );


        indiceActual =
            nuevoIndice;

    }
    else {

        indiceActual++;


        if (
            indiceActual >=
            colaActual.length
        ) {

            indiceActual = 0;

        }

    }


    cargarCancion(
        colaActual[indiceActual]
    );

}



// ============================================
// ANTERIOR
// ============================================

function cancionAnterior() {

    if (!colaActual.length) {
        return;
    }


    if (
        audioPlayer.currentTime > 5
    ) {

        audioPlayer.currentTime =
            0;

        return;

    }


    indiceActual--;


    if (indiceActual < 0) {

        indiceActual =
            colaActual.length - 1;

    }


    cargarCancion(
        colaActual[indiceActual]
    );

}



// ============================================
// AL TERMINAR CANCIÓN
// ============================================

audioPlayer.addEventListener(
    "ended",
    () => {

        if (repetir) {

            audioPlayer.currentTime = 0;

            audioPlayer.play();

            return;

        }


        cancionSiguiente();

    }
);



// ============================================
// ALEATORIO
// ============================================

function activarAleatorio() {

    aleatorio =
        !aleatorio;


    const boton =
        document.getElementById(
            "shuffleButton"
        );


    boton.classList.toggle(
        "active-control",
        aleatorio
    );

}



// ============================================
// REPETIR
// ============================================

function activarRepetir() {

    repetir =
        !repetir;


    const boton =
        document.getElementById(
            "repeatButton"
        );


    boton.classList.toggle(
        "active-control",
        repetir
    );

}



// ============================================
// FORMATO DE TIEMPO
// ============================================

function formatoTiempo(segundos) {

    if (!isFinite(segundos)) {
        return "0:00";
    }


    const minutos =
        Math.floor(
            segundos / 60
        );


    const segundosRestantes =
        Math.floor(
            segundos % 60
        );


    return `${minutos}:${String(
        segundosRestantes
    ).padStart(2, "0")}`;

}



// ============================================
// CARRUSEL
// ============================================

function moverCarrusel(direccion) {

    const carrusel =
        document.getElementById(
            "lista"
        );


    carrusel.scrollBy({

        left:
            direccion * 500,

        behavior:
            "smooth"

    });

}



// ============================================
// BUSCADOR
// ============================================

function buscarCanciones() {

    const texto =
        document
            .getElementById("buscador")
            .value
            .toLowerCase()
            .trim();


    if (!texto) {

        renderizarCanciones(
            elementosGlobales
        );

        return;

    }


    const filtradas =
        elementosGlobales.filter(
            e =>

                e.titulo
                    .toLowerCase()
                    .includes(texto)

                ||

                (
                    e.descripcion ||
                    ""
                )
                    .toLowerCase()
                    .includes(texto)
        );


    renderizarCanciones(
        filtradas
    );

}



// ============================================
// EDITAR
// ============================================

function editar(
    id,
    titulo,
    descripcion
) {

    document.getElementById(
        "titulo"
    ).value =
        titulo;


    document.getElementById(
        "descripcion"
    ).value =
        descripcion;


    editando =
        id;


    document.getElementById(
        "botonGuardar"
    ).innerText =
        "✏️ Actualizar canción";


    irSubir();

}



// ============================================
// ELIMINAR
// ============================================

async function eliminar(id) {

    const confirmar =
        confirm(
            "¿Seguro que quieres eliminar esta canción?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!respuesta.ok) {
            throw new Error(
                "No se pudo eliminar"
            );
        }


        await mostrar();

    }

    catch (error) {

        console.error(error);

        alert(
            "❌ Error al eliminar"
        );

    }

}



// ============================================
// PLAYLISTS - LOCALSTORAGE
// ============================================

function obtenerPlaylists() {

    return JSON.parse(
        localStorage.getItem(
            "misPlaylists"
        )
    ) || [];

}


function guardarPlaylists(playlists) {

    localStorage.setItem(
        "misPlaylists",
        JSON.stringify(playlists)
    );

}



// ============================================
// CREAR PLAYLIST
// ============================================

function crearPlaylist() {

    document
        .getElementById(
            "playlistModal"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "nombrePlaylist"
        )
        .focus();

}


function cerrarModal() {

    document
        .getElementById(
            "playlistModal"
        )
        .classList.add(
            "hidden"
        );

}



// ============================================
// GUARDAR PLAYLIST
// ============================================

function guardarPlaylist() {

    const nombre =
        document
            .getElementById(
                "nombrePlaylist"
            )
            .value
            .trim();


    if (!nombre) {

        alert(
            "Escribe un nombre."
        );

        return;

    }


    const playlists =
        obtenerPlaylists();


    playlists.push({

        id:
            Date.now(),

        nombre:
            nombre,

        canciones:
            []

    });


    guardarPlaylists(
        playlists
    );


    document
        .getElementById(
            "nombrePlaylist"
        )
        .value =
        "";


    cerrarModal();


    mostrarPlaylists();

}



// ============================================
// MOSTRAR PLAYLISTS
// ============================================

function mostrarPlaylists() {

    const contenedor =
        document.getElementById(
            "listaPlaylists"
        );


    const playlists =
        obtenerPlaylists();


    contenedor.innerHTML = "";


    if (!playlists.length) {

        contenedor.innerHTML = `

            <div class="empty-message">

                📚 Todavía no tienes playlists.

            </div>

        `;

        return;

    }


    playlists.forEach(
        playlist => {

            const canciones =
                playlist.canciones
                    .map(id =>
                        elementosGlobales.find(
                            e => e._id === id
                        )
                    )
                    .filter(Boolean);


            const primeraCancion =
                canciones.find(
                    e => e.imagenUrl
                );


            const portada =
                primeraCancion
                    ? primeraCancion.imagenUrl
                    : "https://placehold.co/400x400/181818/1ed760?text=🎧";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "playlist-card";


            card.innerHTML = `

                <div class="playlist-cover">

                    <img
                        src="${portada}"
                    >

                    <button class="playlist-play">
                        ▶
                    </button>

                </div>


                <h3>
                    ${escapeHTML(
                        playlist.nombre
                    )}
                </h3>


                <p>
                    ${canciones.length}
                    canciones
                </p>

            `;


            card.addEventListener(
                "click",
                () => {

                    abrirPlaylist(
                        playlist.id
                    );

                }
            );


            card
                .querySelector(
                    ".playlist-play"
                )
                .addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        reproducirPlaylist(
                            playlist.id
                        );

                    }
                );


            contenedor.appendChild(
                card
            );

        }
    );

}



// ============================================
// ABRIR PLAYLIST
// ============================================

function abrirPlaylist(id) {

    const playlists =
        obtenerPlaylists();


    const playlist =
        playlists.find(
            p => p.id === id
        );


    if (!playlist) {
        return;
    }


    playlistActual =
        playlist.id;


    const canciones =
        playlist.canciones
            .map(id =>
                elementosGlobales.find(
                    e => e._id === id
                )
            )
            .filter(
                e => e && e.audioUrl
            );


    colaActual =
        canciones;


    indiceActual = -1;


    const portada =
        canciones.find(
            e => e.imagenUrl
        );


    document.getElementById(
        "playlistTitle"
    ).innerText =
        playlist.nombre;


    document.getElementById(
        "playlistCount"
    ).innerText =
        `${canciones.length} canciones`;


    document.getElementById(
        "playlistCover"
    ).innerHTML = `

        <img
            src="${
                portada
                    ? portada.imagenUrl
                    : "https://placehold.co/400x400/181818/1ed760?text=🎧"
            }"
        >

    `;


    const contenedor =
        document.getElementById(
            "playlistSongs"
        );


    contenedor.innerHTML = "";


    if (!canciones.length) {

        contenedor.innerHTML = `

            <div class="empty-playlist">

                <h3>
                    Esta playlist está vacía
                </h3>

                <p>
                    Agrega canciones desde tu colección.
                </p>

            </div>

        `;

    }


    canciones.forEach(
        (cancion, index) => {

            const fila =
                document.createElement(
                    "div"
                );


            fila.className =
                "playlist-song";


            fila.innerHTML = `

                <div class="playlist-number">
                    ${index + 1}
                </div>


                <img
                    src="${
                        cancion.imagenUrl ||
                        "https://placehold.co/60x60/181818/1ed760?text=🎵"
                    }"
                >


                <div class="playlist-song-info">

                    <strong>
                        ${escapeHTML(
                            cancion.titulo
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            cancion.descripcion ||
                            "MiGalería"
                        )}
                    </span>

                </div>


                <button class="playlist-song-play">
                    ▶
                </button>

            `;


            fila
                .querySelector(
                    ".playlist-song-play"
                )
                .addEventListener(
                    "click",
                    () => {

                        indiceActual =
                            index;

                        cargarCancion(
                            colaActual[
                                indiceActual
                            ]
                        );

                    }
                );


            contenedor.appendChild(
                fila
            );

        }
    );


    document
        .getElementById(
            "playlistView"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "playlistView"
        )
        .scrollIntoView({
            behavior: "smooth"
        });

}



// ============================================
// REPRODUCIR PLAYLIST
// ============================================

function reproducirPlaylist(id) {

    const playlists =
        obtenerPlaylists();


    const playlist =
        playlists.find(
            p => p.id === id
        );


    if (!playlist) {
        return;
    }


    playlistActual =
        playlist.id;


    colaActual =
        playlist.canciones
            .map(id =>
                elementosGlobales.find(
                    e => e._id === id
                )
            )
            .filter(
                e => e && e.audioUrl
            );


    if (!colaActual.length) {

        alert(
            "Esta playlist no tiene canciones."
        );

        return;

    }


    indiceActual = 0;


    if (aleatorio) {

        indiceActual =
            Math.floor(
                Math.random() *
                colaActual.length
            );

    }


    cargarCancion(
        colaActual[indiceActual]
    );

}



// ============================================
// REPRODUCIR PLAYLIST ACTUAL
// ============================================

function reproducirPlaylistActual() {

    if (!playlistActual) {
        return;
    }


    reproducirPlaylist(
        playlistActual
    );

}



// ============================================
// PLAYLIST ALEATORIA
// ============================================

function reproducirPlaylistAleatoria() {

    aleatorio = true;


    document
        .getElementById(
            "shuffleButton"
        )
        .classList.add(
            "active-control"
        );


    reproducirPlaylist(
        playlistActual
    );

}



// ============================================
// CERRAR PLAYLIST
// ============================================

function cerrarPlaylist() {

    document
        .getElementById(
            "playlistView"
        )
        .classList.add(
            "hidden"
        );


    playlistActual =
        null;


    colaActual =
        elementosGlobales.filter(
            e => e.audioUrl
        );


    indiceActual = -1;

}



// ============================================
// ACTUALIZAR PLAYLIST ABIERTA
// ============================================

function actualizarPlaylistAbierta() {

    if (!playlistActual) {
        return;
    }


    const playlist =
        obtenerPlaylists().find(
            p => p.id === playlistActual
        );


    if (playlist) {

        abrirPlaylist(
            playlist.id
        );

    }

}



// ============================================
// AGREGAR CANCIÓN A PLAYLIST
// ============================================

function agregarACualquierPlaylist(id) {

    const playlists =
        obtenerPlaylists();


    if (!playlists.length) {

        alert(
            "Primero crea una playlist."
        );


        crearPlaylist();

        return;

    }


    let opciones = "";


    playlists.forEach(
        (playlist, index) => {

            opciones +=
                `${index + 1}. ${playlist.nombre}\n`;

        }
    );


    const seleccion =
        prompt(
            "¿A qué playlist quieres agregarla?\n\n" +
            opciones +
            "\nEscribe el número:"
        );


    const numero =
        parseInt(
            seleccion
        );


    if (
        !numero ||
        numero < 1 ||
        numero > playlists.length
    ) {

        return;

    }


    const playlist =
        playlists[
            numero - 1
        ];


    if (
        !playlist.canciones.includes(id)
    ) {

        playlist.canciones.push(id);

    }


    guardarPlaylists(
        playlists
    );


    mostrarPlaylists();


    if (
        playlistActual === playlist.id
    ) {

        abrirPlaylist(
            playlist.id
        );

    }


    alert(
        "🎵 Canción agregada a " +
        playlist.nombre
    );

}



// ============================================
// FONDO DINÁMICO
// ============================================

function cambiarFondoDinamico(url) {

    const imagen =
        new Image();


    imagen.crossOrigin =
        "Anonymous";


    imagen.src =
        url;


    imagen.onload =
        () => {

            try {

                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.width = 50;
                canvas.height = 50;


                const ctx =
                    canvas.getContext(
                        "2d"
                    );


                ctx.drawImage(
                    imagen,
                    0,
                    0,
                    50,
                    50
                );


                const datos =
                    ctx.getImageData(
                        0,
                        0,
                        50,
                        50
                    ).data;


                let r = 0;
                let g = 0;
                let b = 0;

                let cantidad = 0;


                for (
                    let i = 0;
                    i < datos.length;
                    i += 4
                ) {

                    r += datos[i];
                    g += datos[i + 1];
                    b += datos[i + 2];

                    cantidad++;

                }


                r =
                    Math.floor(
                        r / cantidad
                    );

                g =
                    Math.floor(
                        g / cantidad
                    );

                b =
                    Math.floor(
                        b / cantidad
                    );


                document.body.style.setProperty(
                    "--dynamic-color",
                    `rgb(${r},${g},${b})`
                );

            }

            catch (error) {

                console.log(
                    "No se pudo obtener el color",
                    error
                );

            }

        };

}



// ============================================
// NAVEGACIÓN
// ============================================

function irInicio() {

    document
        .getElementById("inicio")
        .scrollIntoView({
            behavior: "smooth"
        });

}


function irCanciones() {

    document
        .getElementById("canciones")
        .scrollIntoView({
            behavior: "smooth"
        });

}


function irPlaylists() {

    document
        .getElementById("playlists")
        .scrollIntoView({
            behavior: "smooth"
        });

}


function irSubir() {

    document
        .getElementById("subir")
        .scrollIntoView({
            behavior: "smooth"
        });

}



// ============================================
// LIMPIAR
// ============================================

function limpiar() {

    limpiarFormulario();

}


function limpiarFormulario() {

    document.getElementById(
        "titulo"
    ).value = "";


    document.getElementById(
        "descripcion"
    ).value = "";


    document.getElementById(
        "imagen"
    ).value = "";


    document.getElementById(
        "audio"
    ).value = "";


    editando = null;


    document.getElementById(
        "botonGuardar"
    ).innerText =
        "💾 Guardar canción";

}



// ============================================
// MENSAJES
// ============================================

function mostrarMensaje(
    texto,
    tipo
) {

    const mensaje =
        document.getElementById(
            "mensaje"
        );


    mensaje.innerText =
        texto;


    if (tipo === "success") {

        mensaje.style.color =
            "#1ed760";

    }
    else if (tipo === "error") {

        mensaje.style.color =
            "#ff6b6b";

    }
    else {

        mensaje.style.color =
            "#aaa";

    }

}



// ============================================
// ESCAPAR HTML
// ============================================

function escapeHTML(text) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}



// ============================================
// INICIO
// ============================================

mostrar();

mostrarPlaylists();