let cart = [];

function selectService(category, levelIndex, paymentType) {
  const service = SERVICES_DATA[category];
  const level = service.levels[levelIndex];
  const price = level.prices[paymentType];
  
  if (price === 0) return; // No disponible para este tipo
  
  // Quitar la selección anterior de esta misma categoría
  cart = cart.filter(item => item.category !== category);
  
  cart.push({
    category,
    categoryTitle: service.title,
    levelName: level.name,
    levelIndex,
    paymentType,
    price
  });
  
  updateCalculatorUI();
}

function removeService(category) {
  cart = cart.filter(item => item.category !== category);
  updateCalculatorUI();
}

function getPaymentTypeText(type) {
  switch(type) {
    case 'unique': return 'Pago Único';
    case 'monthly': return 'Suscripción Mensual';
    case 'annual': return 'Suscripción Anual';
    default: return type;
  }
}

function formatCurrency(amount) {
  if (amount === 0) return "No disponible";
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);
}

function updateCalculatorUI() {
  const cartContainer = document.getElementById('selected-services-list');
  const totalUniqueEl = document.getElementById('total-unique');
  const totalMonthlyEl = document.getElementById('total-monthly');
  const totalAnnualEl = document.getElementById('total-annual');
  
  if (!cartContainer) return;
  
  cartContainer.innerHTML = '';
  
  let totalUnique = 0;
  let totalMonthly = 0;
  let totalAnnual = 0;
  
  if (cart.length === 0) {
    cartContainer.innerHTML = '<div class="empty-cart-message">No has seleccionado ningún servicio aún. ¡Elige tus servicios arriba!</div>';
  } else {
    cart.forEach(item => {
      if (item.paymentType === 'unique') totalUnique += item.price;
      if (item.paymentType === 'monthly') totalMonthly += item.price;
      if (item.paymentType === 'annual') totalAnnual += item.price;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item-card fade-in';
      itemEl.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.categoryTitle}</h4>
          <p>${item.levelName} - <strong>${getPaymentTypeText(item.paymentType)}</strong></p>
        </div>
        <div class="cart-item-actions">
          <span class="cart-item-price">${formatCurrency(item.price)}</span>
          <button class="btn-remove" onclick="removeService('${item.category}')" title="Eliminar servicio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;
      cartContainer.appendChild(itemEl);
    });
  }
  
  totalUniqueEl.textContent = formatCurrency(totalUnique);
  totalMonthlyEl.textContent = totalMonthly > 0 ? `${formatCurrency(totalMonthly)}/mes` : "$0";
  totalAnnualEl.textContent = totalAnnual > 0 ? `${formatCurrency(totalAnnual)}/año` : "$0";
  
  // Actualizar estados visuales de los botones de selección en la grilla de servicios
  document.querySelectorAll('.btn-select-plan').forEach(btn => {
    const cat = btn.dataset.category;
    const idx = parseInt(btn.dataset.index);
    const pType = btn.dataset.payment;
    
    const isSelected = cart.some(item => item.category === cat && item.levelIndex === idx && item.paymentType === pType);
    
    if (isSelected) {
      btn.classList.add('selected');
      btn.textContent = 'Seleccionado';
    } else {
      btn.classList.remove('selected');
      btn.textContent = 'Seleccionar';
    }
  });
}

// Inicializar la carga de la página
document.addEventListener('DOMContentLoaded', () => {
  renderServicesGrid('landing');
  
  // Agregar listeners a las pestañas de navegación de servicios
  const tabs = document.querySelectorAll('.service-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderServicesGrid(tab.dataset.category);
    });
  });
  
  // Manejo del formulario de contacto
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const message = document.getElementById('form-message').value;
      
      let selectedServicesSummary = "";
      if (cart.length > 0) {
        selectedServicesSummary = "\n\nServicios Cotizados:\n" + cart.map(item => `- ${item.categoryTitle} (${item.levelName}): ${getPaymentTypeText(item.paymentType)} - ${formatCurrency(item.price)}`).join('\n');
      }
      
      const mailtoUri = `mailto:contacto@superalphamarket.com?subject=Cotización de Servicios - ${name}&body=${encodeURIComponent("Hola Super Alpha Market,\n\nMi nombre es " + name + ".\n\n" + message + selectedServicesSummary + "\n\nMi correo de contacto: " + email)}`;
      window.location.href = mailtoUri;
    });
  }
});

function renderServicesGrid(category) {
  const container = document.getElementById('services-grid-container');
  if (!container) return;
  
  const data = SERVICES_DATA[category];
  container.innerHTML = '';
  
  // Agregar una animación de desvanecimiento
  container.classList.remove('fade-in');
  void container.offsetWidth; // Trigger reflow
  container.classList.add('fade-in');
  
  data.levels.forEach((level, idx) => {
    const card = document.createElement('div');
    card.className = 'service-level-card';
    
    // Crear la lista de características
    const featuresList = level.features.map(f => `<li><svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>${f}</li>`).join('');
    
    // Crear opciones de precios y sus botones correspondientes
    let pricingHTML = '';
    
    if (level.prices.unique > 0) {
      const isSelected = cart.some(item => item.category === category && item.levelIndex === idx && item.paymentType === 'unique');
      pricingHTML += `
        <div class="price-row">
          <div class="price-info">
            <span class="price-label">Pago Único</span>
            <span class="price-value">${formatCurrency(level.prices.unique)}</span>
          </div>
          <button class="btn-select-plan ${isSelected ? 'selected' : ''}" 
                  data-category="${category}" data-index="${idx}" data-payment="unique"
                  onclick="selectService('${category}', ${idx}, 'unique')">
            ${isSelected ? 'Seleccionado' : 'Seleccionar'}
          </button>
        </div>
      `;
    }
    
    if (level.prices.monthly > 0) {
      const isSelected = cart.some(item => item.category === category && item.levelIndex === idx && item.paymentType === 'monthly');
      pricingHTML += `
        <div class="price-row">
          <div class="price-info">
            <span class="price-label">Suscripción Mensual</span>
            <span class="price-value">${formatCurrency(level.prices.monthly)}<span class="price-freq">/mes</span></span>
          </div>
          <button class="btn-select-plan ${isSelected ? 'selected' : ''}" 
                  data-category="${category}" data-index="${idx}" data-payment="monthly"
                  onclick="selectService('${category}', ${idx}, 'monthly')">
            ${isSelected ? 'Seleccionado' : 'Seleccionar'}
          </button>
        </div>
      `;
    }
    
    if (level.prices.annual > 0) {
      const isSelected = cart.some(item => item.category === category && item.levelIndex === idx && item.paymentType === 'annual');
      pricingHTML += `
        <div class="price-row">
          <div class="price-info">
            <span class="price-label">Suscripción Anual</span>
            <span class="price-value">${formatCurrency(level.prices.annual)}<span class="price-freq">/año</span></span>
          </div>
          <button class="btn-select-plan ${isSelected ? 'selected' : ''}" 
                  data-category="${category}" data-index="${idx}" data-payment="annual"
                  onclick="selectService('${category}', ${idx}, 'annual')">
            ${isSelected ? 'Seleccionado' : 'Seleccionar'}
          </button>
        </div>
      `;
    }
    
    card.innerHTML = `
      <div class="card-header">
        <h3>${level.name}</h3>
      </div>
      <div class="card-body">
        <ul class="features-list">
          ${featuresList}
        </ul>
      </div>
      <div class="card-footer">
        <div class="pricing-options-container">
          ${pricingHTML}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
