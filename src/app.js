document.addEventListener('DOMContentLoaded', () => {
    const portfolioGrid = document.getElementById('portfolio-grid');
    const RUTA_JSON = './src/portfolio.json';

    cargarProyectos();

    async function cargarProyectos() {
        try {
            const response = await fetch(RUTA_JSON);

            if (!response.ok) {
                throw new Error(`El servidor respondió con estado ${response.status}`);
            }

            const proyectos = await response.json();

            if (!Array.isArray(proyectos) || proyectos.length === 0) {
                mostrarMensaje('Todavía no hay proyectos cargados.');
                return;
            }

            renderizarProyectos(proyectos);

        } catch (error) {
            console.error('Hubo un problema al cargar el portfolio:', error);
            mostrarError(error);
        }
    }

    function renderizarProyectos(proyectos) {
        // Limpiamos el contenedor ("Cargando...")
        portfolioGrid.innerHTML = '';

        const fragment = document.createDocumentFragment();

        proyectos.forEach(proyecto => {
            fragment.appendChild(crearTarjeta(proyecto));
        });

        portfolioGrid.appendChild(fragment);
    }

    function crearTarjeta(proyecto) {
        const {
            id = '',
            cliente = 'Proyecto sin nombre',
            servicio = '',
            desafio = '',
            solucion = '',
            impacto = ''
        } = proyecto;

        const card = document.createElement('div');
        card.classList.add('card');

        card.dataset.id = id;
        card.dataset.cliente = cliente;

        card.appendChild(crearElemento('h3', cliente));

        if (servicio) {
            card.appendChild(crearElemento('span', servicio, 'etiqueta'));
        }

        agregarBloque(card, 'El Desafío:', desafio);
        agregarBloque(card, 'La Solución:', solucion);
        agregarBloque(card, 'El Impacto:', impacto, true);

        return card;
    }
    function agregarBloque(card, titulo, texto, destacado = false) {
        if (!texto) return;
        card.appendChild(crearElemento('h4', titulo));

        const parrafo = document.createElement('p');
        if (destacado) {
            const strong = document.createElement('strong');
            strong.textContent = texto;
            parrafo.appendChild(strong);
        } else {
            parrafo.textContent = texto;
        }
        card.appendChild(parrafo);
    }

    function crearElemento(tag, texto, className) {
        const el = document.createElement(tag);
        el.textContent = texto;
        if (className) el.classList.add(className);
        return el;
    }

    function mostrarMensaje(texto) {
        portfolioGrid.innerHTML = `<p id="cargando">${texto}</p>`;
    }

    function mostrarError(error) {
        const esErrorDeRed = error instanceof TypeError;
        const detalle = esErrorDeRed
            ? 'Esto suele pasar cuando el archivo se abre directamente desde el explorador (file://) en vez de un servidor local. Probá con la extensión "Live Server" de VS Code, o corriendo <code>npx serve</code> en la carpeta del proyecto.'
            : `Detalle técnico: ${error.message}`;

        portfolioGrid.innerHTML = `
      <div class="error-portfolio">
        <p><strong>No se pudieron cargar los proyectos.</strong></p>
        <p>${detalle}</p>
      </div>
    `;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('form-contacto');
    const status = document.getElementById('form-status');
    const btnSubmit = document.getElementById('btn-submit');

    const inputs = {
        nombre: document.getElementById('nombre'),
        email: document.getElementById('email'),
        mensaje: document.getElementById('mensaje')
    };

    const errores = {
        nombre: document.getElementById('error-nombre'),
        email: document.getElementById('error-email'),
        mensaje: document.getElementById('error-mensaje')
    };

    const validarEmail = (correo) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    const limpiarErrores = () => {
        Object.values(inputs).forEach(input => input.classList.remove('input-invalido'));
        Object.values(errores).forEach(span => span.style.display = 'none');
        status.style.display = 'none';
    };

    const mostrarError = (campo, texto) => {
        inputs[campo].classList.add('input-invalido');
        errores[campo].innerText = texto;
        errores[campo].style.display = 'block';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        limpiarErrores();

        let esValido = true;

        if (inputs.nombre.value.trim().length < 3) {
            mostrarError('nombre', 'El nombre debe tener al menos 3 caracteres.');
            esValido = false;
        }

        if (!validarEmail(inputs.email.value.trim())) {
            mostrarError('email', 'Ingresá un correo electrónico válido.');
            esValido = false;
        }

        if (inputs.mensaje.value.trim().length < 10) {
            mostrarError('mensaje', 'El mensaje es muy corto (mínimo 10 caracteres).');
            esValido = false;
        }

        if (!esValido) return;

        const data = new FormData(form);
        btnSubmit.innerText = 'Enviando...';
        btnSubmit.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                status.innerText = "¡Mensaje enviado! A la brevedad me pongo en contacto.";
                status.style.color = "var(--sage-500)";
                status.style.display = "block";
                form.reset();
            } else {
                throw new Error();
            }
        } catch (error) {
            status.innerText = "Hubo un error. Revisá tu conexión e intentá nuevamente.";
            status.style.color = "var(--clay-400)";
            status.style.display = "block";
        } finally {
            btnSubmit.innerText = 'Enviar Mensaje';
            btnSubmit.disabled = false;
        }
    });
});

document.addEventListener('click', (e) => {
    const btnCerrar = e.target.closest('.modal-cerrar');
    const overlayExistente = document.querySelector('.modal-overlay');

    // Cerrar: click en la ❌ o click en el fondo oscuro (fuera de la card)
    if (btnCerrar || (overlayExistente && e.target === overlayExistente)) {
        cerrarModal();
        return;
    }

    // Si ya hay un modal abierto, no abrir otro
    if (overlayExistente) return;

    const card = e.target.closest('#portfolio-grid .card');
    if (!card) return;

    abrirModal(card);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
});

function abrirModal(card) {
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    const modal = document.createElement('div');
    modal.classList.add('modal-card');

    const btnCerrar = document.createElement('button');
    btnCerrar.classList.add('modal-cerrar');
    btnCerrar.setAttribute('aria-label', 'Cerrar');
    btnCerrar.innerHTML = '&times;';

    const imagen = document.createElement('img');
    imagen.classList.add('modal-imagen');
    imagen.src = `./src/img/${card.dataset.id}.png`;
    imagen.alt = `Imagen del proyecto ${card.dataset.cliente}`;
    imagen.onerror = () => imagen.remove();

    // NUEVO: Evento para hacer la imagen "pantalla completa" (ocultar detalles)
    imagen.addEventListener('click', () => {
        modal.classList.toggle('solo-imagen');
    });

    const contenido = document.createElement('div');
    contenido.classList.add('modal-contenido');
    contenido.innerHTML = card.innerHTML;

    // CAMBIO IMPORTANTE: Agregamos primero el 'contenido' y luego la 'imagen' 
    // para que el texto quede a la izquierda y la foto a la derecha.
    modal.append(btnCerrar, contenido, imagen);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.classList.add('modal-abierto');

    // Animación fluida
    requestAnimationFrame(() => overlay.classList.add('modal-overlay--visible'));
}

function cerrarModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (!overlay) return;

    overlay.classList.remove('modal-overlay--visible');
    document.body.classList.remove('modal-abierto');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}