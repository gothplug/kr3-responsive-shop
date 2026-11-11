// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

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
