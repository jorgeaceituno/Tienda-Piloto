// ============================================================
// AUTENTICACIÓN SEGURA
// Contraseña almacenada como hash SHA-256 (no en texto plano)
// Para cambiar la contraseña, generá el nuevo hash en:
// https://emn178.github.io/online-tools/sha256.html
// y reemplazá el valor de ADMIN_PASS_HASH abajo.
// Contraseña actual: tienda123
// ============================================================
const ADMIN_PASS_HASH = "bc09903a75a3cb59eb581499f980185a601510204b2487b5a0b2e8ded82ffe9a";
const MAX_INTENTOS = 3;
const BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos

let isLoggedIn = sessionStorage.getItem("adminLogado") === "true";

if (isLoggedIn) {
    document.getElementById('login-overlay').style.display = 'none';
}

async function hashTexto(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

window.checkAdminPass = async function() {
    // Verificar si está bloqueado
    const bloqueadoHasta = parseInt(localStorage.getItem("adminBloqueadoHasta") || "0");
    if (Date.now() < bloqueadoHasta) {
        const min = Math.ceil((bloqueadoHasta - Date.now()) / 60000);
        alert(`🔒 Demasiados intentos fallidos. Intentá de nuevo en ${min} minuto(s).`);
        return;
    }

    const pass = document.getElementById('admin-pass-input').value;
    const hash = await hashTexto(pass);

    if (hash === ADMIN_PASS_HASH) {
        sessionStorage.setItem("adminLogado", "true");
        localStorage.removeItem("adminIntentos");
        localStorage.removeItem("adminBloqueadoHasta");
        document.getElementById('login-overlay').style.display = 'none';
    } else {
        let intentos = parseInt(localStorage.getItem("adminIntentos") || "0") + 1;
        localStorage.setItem("adminIntentos", intentos);

        const restantes = MAX_INTENTOS - intentos;
        if (restantes <= 0) {
            localStorage.setItem("adminBloqueadoHasta", Date.now() + BLOQUEO_MS);
            localStorage.removeItem("adminIntentos");
            alert("🔒 Demasiados intentos. Panel bloqueado por 5 minutos.");
        } else {
            alert(`❌ Contraseña incorrecta. Te quedan ${restantes} intento(s).`);
        }
    }
};

// Permitir Enter en el campo de contraseña
document.addEventListener('DOMContentLoaded', () => {
    const passInput = document.getElementById('admin-pass-input');
    if (passInput) {
        passInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') window.checkAdminPass();
        });
    }
});

// Init Supabase
const supabaseUrl = 'https://qcjzppndhbtseddprvyl.supabase.co';
const supabaseKey = 'sb_publishable_L1yKNMrWaiM-pKCzyUuxyA_9Zbwo4vg';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

let localProducts = [];
let base64ImageString = "";

// Image Upload with Canvas compression
function previewImage(event) {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height = height * (MAX_WIDTH / width);
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            base64ImageString = canvas.toDataURL('image/jpeg', 0.85); 
            
            const preview = document.getElementById('img-preview');
            preview.src = base64ImageString;
            preview.style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderAdminProducts() {
    const container = document.getElementById('admin-product-list');
    container.innerHTML = '';
    document.getElementById('product-count').textContent = `${localProducts.length} productos`;

    [...localProducts].reverse().forEach(prod => { // Mostramos recientes arriba
        container.innerHTML += `
            <div style="display:flex; gap:1rem; align-items:center; padding:1rem; border:1px solid #eee; border-radius:8px; background:#fcfcfc;">
                <img src="${prod.img}" alt="${prod.title}" style="width:70px; height:70px; object-fit:cover; border-radius:6px; background:#e0e0e0;">
                <div style="flex:1;">
                    <h4 style="margin:0 0 0.25rem 0;">${prod.title}</h4>
                    <span style="color:var(--primary-color); font-weight:bold;">HNL ${prod.price.toLocaleString('es-HN', {minimumFractionDigits:2})}</span>
                    <br><small style="color:var(--text-muted); text-transform:capitalize;">${prod.category}</small>
                </div>
                <div style="display:flex; flex-direction:column; align-items:center; background:#fff; border:1px solid #ddd; border-radius:6px; padding:0.5rem;">
                    <small style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">Inventario</small>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <button class="btn btn-outline" style="padding:0.2rem 0.5rem; font-size:1rem; height:auto; line-height:1;" onclick="updateStock(${prod.id}, -1)">-</button>
                        <span style="font-weight:bold; font-size:1.1rem; min-width:1rem; text-align:center;" id="stock-${prod.id}">${prod.cantidad !== undefined ? prod.cantidad : 0}</span>
                        <button class="btn btn-outline" style="padding:0.2rem 0.5rem; font-size:1rem; height:auto; line-height:1;" onclick="updateStock(${prod.id}, 1)">+</button>
                    </div>
                </div>
                <div style="display:flex; gap:0.5rem; flex-direction:column;">
                    <button class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.9rem;" onclick="editProduct(${prod.id})">Editar</button>
                    <button class="btn" style="background:#e53e3e; color:white; border-color:#e53e3e; padding:0.4rem 0.8rem; font-size:0.9rem;" onclick="deleteProduct(${prod.id})">Borrar</button>
                </div>
            </div>
        `;
    });
}

async function fetchAdminProducts() {
    const { data, error } = await supabaseClient
        .from('productos')
        .select('*')
        .order('id', { ascending: true });
        
    if (error) {
        console.error("Error fetching products:", error);
    } else if (data) {
        localProducts = data.map(p => ({
            ...p,
            desc: p.description
        }));
    }
    renderAdminProducts();
}

// Form Submission (Add/Edit)
const form = document.getElementById('admin-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Mostramos estado de carga
    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.textContent = "Guardando en PostgreSQL...";
    btnSubmit.disabled = true;
    
    const editId = document.getElementById('edit-id').value;
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const priceStr = document.getElementById('price').value.replace(/,/g, '');
    const price = parseFloat(priceStr);
    const desc = document.getElementById('desc').value;
    const cantidad = parseInt(document.getElementById('cantidad').value) || 0;
    
    const productData = {
        title: title,
        category: category,
        price: price,
        description: desc,
        cantidad: cantidad
    };
    
    let isEditing = editId !== "";
    let finalImage = base64ImageString;

    if (isEditing) {
        if (finalImage !== "") {
            productData.img = finalImage;
        }
        const { error } = await supabaseClient
            .from('productos')
            .update(productData)
            .eq('id', editId);
            
        if(error) alert("Error al actualizar: " + error.message);
    } else {
        if(finalImage === "") {
            finalImage = "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400"; // Fallback
        }
        productData.img = finalImage;
        const { error } = await supabaseClient
            .from('productos')
            .insert([productData]);
            
        if(error) alert("Error al insertar: " + error.message);
    }

    resetForm();
    await fetchAdminProducts();
    
    btnSubmit.textContent = "Guardar Cambios";
    btnSubmit.disabled = false;
    alert(isEditing ? "¡Producto actualizado en PostgreSQL!" : "¡Producto creado en PostgreSQL!");
});

window.deleteProduct = async (id) => {
    if(confirm("🛑 ¿Estás seguro de que deseas borrar este producto permanentemente de PostgreSQL?")) {
        const { error } = await supabaseClient
            .from('productos')
            .delete()
            .eq('id', id);
            
        if(error) {
            alert("Error al borrar: " + error.message);
            return;
        }
        
        // Remove from local cart if someone added it prior to deletion
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(i => i.productId !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        await fetchAdminProducts();
    }
};

window.editProduct = (id) => {
    const prod = localProducts.find(p => p.id === id);
    if(!prod) return;

    document.getElementById('edit-id').value = prod.id;
    document.getElementById('title').value = prod.title;
    document.getElementById('category').value = prod.category;
    document.getElementById('price').value = prod.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('cantidad').value = prod.cantidad !== undefined ? prod.cantidad : 1;
    document.getElementById('desc').value = prod.desc;
    
    document.getElementById('form-title').textContent = "Editar Producto ID: " + prod.id;
    document.getElementById('cancel-edit').style.display = 'flex';
    
    const preview = document.getElementById('img-preview');
    preview.src = prod.img;
    preview.style.display = 'block';
    
    base64ImageString = ""; 
    document.getElementById('image').value = "";

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.getElementById('cancel-edit').addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    document.getElementById('edit-id').value = "";
    document.getElementById('form-title').textContent = "Agregar Producto";
    document.getElementById('cancel-edit').style.display = 'none';
    document.getElementById('img-preview').style.display = 'none';
    base64ImageString = "";
}

window.updateStock = async (id, change) => {
    const prod = localProducts.find(p => p.id === id);
    if (!prod) return;
    
    const currentStock = prod.cantidad !== undefined ? prod.cantidad : 0;
    const newStock = Math.max(0, currentStock + change);
    
    if (currentStock === newStock) return; 
    
    prod.cantidad = newStock;
    document.getElementById(`stock-${id}`).textContent = newStock;
    
    const { error } = await supabaseClient
        .from('productos')
        .update({ cantidad: newStock })
        .eq('id', id);
        
    if (error) {
        alert("Error al actualizar inventario: " + error.message);
        prod.cantidad = currentStock;
        document.getElementById(`stock-${id}`).textContent = currentStock;
    }
};

// Kickoff
fetchAdminProducts();

// ============================================================
// MÓDULO DE RESPALDOS
// ============================================================

function exportarJSON() {
    if (localProducts.length === 0) {
        alert("No hay productos para respaldar.");
        return;
    }

    const respaldo = {
        fecha: new Date().toISOString(),
        total_productos: localProducts.length,
        productos: localProducts.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price: p.price,
            description: p.description || p.desc,
            cantidad: p.cantidad,
            img: p.img
        }))
    };

    const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fechaStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `respaldo-tienda-${fechaStr}.json`;
    a.click();
    URL.revokeObjectURL(url);

    localStorage.setItem("ultimoRespaldo", new Date().toLocaleString('es-HN'));
    actualizarFechaRespaldo();
}

function exportarCSV() {
    if (localProducts.length === 0) {
        alert("No hay productos para respaldar.");
        return;
    }

    const encabezados = ["id", "title", "category", "price", "description", "cantidad"];
    const filas = localProducts.map(p => [
        p.id,
        `"${(p.title || "").replace(/"/g, '""')}"`,
        p.category,
        p.price,
        `"${((p.description || p.desc || "")).replace(/"/g, '""')}"`,
        p.cantidad !== undefined ? p.cantidad : 0
    ]);

    const csv = [encabezados.join(","), ...filas.map(f => f.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fechaStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `respaldo-tienda-${fechaStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    localStorage.setItem("ultimoRespaldo", new Date().toLocaleString('es-HN'));
    actualizarFechaRespaldo();
}

function actualizarFechaRespaldo() {
    const el = document.getElementById('ultimo-respaldo');
    if (el) {
        const fecha = localStorage.getItem("ultimoRespaldo");
        el.textContent = fecha ? `Último respaldo: ${fecha}` : "Sin respaldos registrados en este navegador";
    }
}
