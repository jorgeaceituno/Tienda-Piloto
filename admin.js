// Check Authentication FIRST
const ADMIN_USER = "admin";
const ADMIN_PASS = "tienda123";

let isLoggedIn = sessionStorage.getItem("adminLogado") === "true";
if (!isLoggedIn) {
    const user = prompt("🔒 Ingrese su usuario (admin):");
    const pass = prompt("🔑 Ingrese su contraseña (tienda123):");
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        sessionStorage.setItem("adminLogado", "true");
        alert("✅ Bienvenido al administrador.");
    } else {
        alert("❌ Credenciales incorrectas.");
        window.location.href = "index.html"; // Expulsar
    }
}

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
    const price = parseFloat(document.getElementById('price').value);
    const desc = document.getElementById('desc').value;
    
    const productData = {
        title: title,
        category: category,
        price: price,
        description: desc
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
    document.getElementById('price').value = prod.price;
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

// Kickoff
fetchAdminProducts();
