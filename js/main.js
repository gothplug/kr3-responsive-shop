// Скрипт подключён на всех страницах с атрибутом defer:
// он выполняется после разбора HTML, поэтому элементы уже есть на странице.
// Каждый блок сначала проверяет, есть ли нужные элементы на текущей странице.

// ===============================
// 1. Мобильное меню
// ===============================

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.getElementById('site-nav');

// С этой ширины меню всегда открыто (то же значение, что в responsive.css)
const desktopQuery = window.matchMedia('(min-width: 1024px)');

function setMenuOpen(isOpen) {
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.querySelector('.menu-toggle__text').textContent = isOpen ? 'Закрыть' : 'Меню';
  siteNav.classList.toggle('site-nav--open', isOpen);
}

if (menuToggle && siteNav) {
  // Открытие и закрытие по кнопке
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);

    // При открытии переводим фокус на первый пункт меню
    if (!isOpen) {
      siteNav.querySelector('a').focus();
    }
  });

  // Закрытие по Esc с возвратом фокуса на кнопку
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && siteNav.classList.contains('site-nav--open')) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  // Если окно растянули до desktop, сбрасываем состояние мобильного меню
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) {
      setMenuOpen(false);
    }
  });
}

// ===============================
// 2. Модальное окно заявки (главная страница)
// ===============================

// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

if (orderDialog) {
  // Получаем все кнопки заказа в карточках товаров.
  const orderButtons = document.querySelectorAll('.product-card__button--order');

  // Получаем кнопку закрытия модального окна.
  const closeDialogButton = document.getElementById('close-order-dialog');

  // Получаем скрытое поле, в которое будет записан выбранный товар.
  const selectedProductInput = document.getElementById('selected-product');

  // Получаем элемент, в котором отображается выбранный товар.
  const selectedProductName = document.getElementById('selected-product-name');

  // Получаем первое поле формы, чтобы поставить в него фокус.
  const firstFormField = document.getElementById('order-name');

  // Перебираем все кнопки «Заказать».
  orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      // Получаем название товара из data-атрибута.
      const productName = button.dataset.product;

      // Записываем название товара в скрытое поле формы.
      selectedProductInput.value = productName;

      // Показываем название товара в модальном окне.
      selectedProductName.textContent = productName;

      // Открываем модальное окно.
      orderDialog.showModal();

      // Ставим фокус в первое поле формы.
      firstFormField.focus();
    });
  });

  // Закрываем модальное окно по кнопке закрытия.
  closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
  });

  // Закрываем модальное окно по клику вне его области.
  orderDialog.addEventListener('click', (event) => {
    const dialogBox = orderDialog.getBoundingClientRect();

    const isInside =
      event.clientX >= dialogBox.left &&
      event.clientX <= dialogBox.right &&
      event.clientY >= dialogBox.top &&
      event.clientY <= dialogBox.bottom;

    if (!isInside) {
      orderDialog.close();
    }
  });

  // Получаем форму заявки.
  const orderForm = document.getElementById('order-form');

  // Получаем сообщение об успешной отправке.
  const successMessage = document.getElementById('success-message');

  // Обрабатываем отправку формы.
  orderForm.addEventListener('submit', (event) => {
    // Отменяем стандартную отправку формы,
    // потому что backend пока не подключён.
    event.preventDefault();

    // Сбрасываем предыдущие признаки ошибок.
    const formElements = Array.from(orderForm.elements);

    formElements.forEach((element) => {
      if (element.willValidate) {
        element.removeAttribute('aria-invalid');
      }
    });

    // Проверяем встроенные HTML-ограничения формы.
    if (!orderForm.checkValidity()) {
      formElements.forEach((element) => {
        if (element.willValidate && !element.checkValidity()) {
          element.setAttribute('aria-invalid', 'true');
        }
      });

      // Показываем стандартные сообщения браузера.
      orderForm.reportValidity();
      return;
    }

    // Показываем сообщение об успешной отправке.
    successMessage.hidden = false;

    // Очищаем форму.
    orderForm.reset();

    // Сбрасываем название выбранного товара.
    selectedProductName.textContent = 'не выбран';

    // Закрываем модальное окно.
    orderDialog.close();
  });
}

// ===============================
// 3. Фильтр каталога
// ===============================

const filtersBlock = document.querySelector('.catalog-filters');
const filtersToggle = document.querySelector('.catalog-filters__toggle');
const filtersForm = document.getElementById('filters-form');

// 3.1. Кнопка «Показать фильтры» (видна на экранах уже 1024px)
function setFiltersOpen(isOpen) {
  filtersToggle.setAttribute('aria-expanded', String(isOpen));
  filtersToggle.textContent = isOpen ? 'Скрыть фильтры' : 'Показать фильтры';
  filtersBlock.classList.toggle('catalog-filters--open', isOpen);
}

if (filtersBlock && filtersToggle) {
  filtersToggle.addEventListener('click', () => {
    const isOpen = filtersToggle.getAttribute('aria-expanded') === 'true';
    setFiltersOpen(!isOpen);
  });
}

// 3.2. Отбор карточек по категории и цене
if (filtersForm) {
  const cards = Array.from(document.querySelectorAll('.catalog-products .product-card'));
  const status = document.getElementById('catalog-status');
  const emptyMessage = document.getElementById('catalog-empty');

  function applyFilters() {
    const formData = new FormData(filtersForm);

    // Отмеченные категории; «Все товары» или пустой выбор — без ограничения
    const categories = formData.getAll('category').filter((value) => value !== 'all');
    const priceFrom = Number(formData.get('price-from')) || 0;
    const priceTo = Number(formData.get('price-to')) || Infinity;

    let visibleCount = 0;

    cards.forEach((card) => {
      const price = Number(card.dataset.price);
      const tags = card.dataset.tags.split(' ');

      const matchesCategory = categories.length === 0 || categories.some((category) => tags.includes(category));
      const matchesPrice = price >= priceFrom && price <= priceTo;
      const isVisible = matchesCategory && matchesPrice;

      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    // role="status" — экранный диктор зачитает новое число без перевода фокуса
    status.textContent = `Показано товаров: ${visibleCount} из ${cards.length}`;
    emptyMessage.hidden = visibleCount > 0;
  }

  // Список обновляется сразу при изменении любого поля
  filtersForm.addEventListener('input', applyFilters);

  // «Применить»: на телефоне закрываем панель и переходим к результатам
  filtersForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();

    if (filtersToggle && !desktopQuery.matches) {
      setFiltersOpen(false);
      status.setAttribute('tabindex', '-1');
      status.focus();
    }
  });

  // «Сбросить»: значения полей очищаются уже после события reset,
  // поэтому пересчитываем список следующей задачей
  filtersForm.addEventListener('reset', () => {
    setTimeout(applyFilters, 0);
  });
}

// ===============================
// 4. Формы на страницах заявки и контактов
// ===============================

// У таких форм есть атрибут data-validate, а в data-success — id сообщения об успехе
document.querySelectorAll('form[data-validate]').forEach((form) => {
  const successMessage = document.getElementById(form.dataset.success);

  form.addEventListener('submit', (event) => {
    // backend не подключён — отправку только имитируем
    event.preventDefault();

    const fields = Array.from(form.elements).filter((element) => element.willValidate);
    fields.forEach((field) => field.removeAttribute('aria-invalid'));

    const invalidFields = fields.filter((field) => !field.checkValidity());

    if (invalidFields.length > 0) {
      // aria-invalid — красная рамка в CSS и сигнал «ошибка» для экранного диктора
      invalidFields.forEach((field) => field.setAttribute('aria-invalid', 'true'));
      successMessage.hidden = true;

      // Фокус на первое ошибочное поле и стандартная подсказка браузера
      invalidFields[0].focus();
      invalidFields[0].reportValidity();
      return;
    }

    successMessage.hidden = false;
    form.reset();
  });

  // Как только поле исправлено, снимаем отметку об ошибке
  form.addEventListener('input', (event) => {
    if (event.target.checkValidity()) {
      event.target.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('reset', () => {
    form.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
  });
});
