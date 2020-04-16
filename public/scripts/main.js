let
  modalAddBook, modalGrantBook, bookName, bookAuthor, publishedDate,
  grantedUserFirstname, grantedUserLastname, grantedBookDate, returnBookDate,
  grantedBookId, filterStatus, filterSort, modalSingleBook = null;

document.addEventListener("DOMContentLoaded", () => { 
  modalAddBook = document.querySelector(".modal-window-add-book");
  modalGrantBook = document.querySelector(".modal-window-grant-book");
  bookName = document.getElementById('input-book-name');
  bookAuthor = document.getElementById('input-book-author');
  publishedDate = document.getElementById('input-book-date');
  grantedUserFirstname = document.getElementById('input-grant-user-firstname');
  grantedUserLastname = document.getElementById('input-grant-user-lastname');
  grantedBookDate = document.getElementById('input-grant-granted-date');
  returnBookDate = document.getElementById('input-grant-return-date');
  filterStatus = document.getElementById('filter-status');
  filterSort = document.getElementById('filter-sort');
  modalSingleBook = document.querySelector('.modal-window-single-book');
});

const openModalAddBook = () => {
  modalAddBook.style.display = "block";
}

const closeModalAddBook = () => {
  modalAddBook.style.display = "none";
}

window.onclick = (event) => {
  if (event.target === modalAddBook) {
    modalAddBook.style.display = "none";
  }
  if (event.target === modalGrantBook) {
    modalGrantBook.style.display = "none";
  }
  if (event.target === modalSingleBook) {
    modalSingleBook.style.display = "none";
  }
}

const openModalGrantBook = (id) => {
  grantedBookId = id;
  modalGrantBook.style.display = "block";
}

const closeModalGrantBook = () => {
  modalGrantBook.style.display = "none";
}

const openModalSingleBook = () => {
  modalSingleBook.style.display = "block";
}

const closeModalSingleBook = () => {
  modalSingleBook.style.display = "none";
}

const renderBooks = (books) => {
  if (!books.length) {
    return;
  }

  const blockContent = document.querySelector(".block-content");
  while (blockContent.firstChild) {
      blockContent.removeChild(blockContent.firstChild);
  }

  books.forEach(item =>  {
    const [first, ...rest] = item.status;
    const status = first.toUpperCase().concat(rest.join('').toLowerCase());
    const { firstname, lastname } = item.grantedUser || {};
    const html = new DOMParser().parseFromString(`
        <div class="block-item" id="${item.id}">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 16px; font-weight: bold; cursor: pointer" onclick="openSingleBook('${item.id}')">&#9432;</span>
                <span style="color: red; font-size: 30px; font-weight: bold; cursor: pointer" onclick="deleteBook('${item.id}')">&times;</span>
              </div>
              <span style="word-break: break-all; display: flex;">Name: ${item.name}</span>
              <span style="word-break: break-all; display: flex;">Author: ${item.author}</span>
              <span style="word-break: break-all; display: flex;">Published date: ${dayjs(item.publishedDate).format('MMM DD YYYY')}</span>
              <span style="word-break: break-all; display: flex;">Status: ${status}</span>
              ${item.status !== 'AVAILABLE' ? `
                <span style="word-break: break-all; display: flex;">Granted user: ${firstname} ${lastname}</span>
                <span style="word-break: break-all; display: flex;">Returned date: ${item.returnDate}</span>
              ` : ''}
            </div>
            ${item.status === 'AVAILABLE' ?
              `<button onclick="openModalGrantBook('${item.id}');">Grant this book</button>` :
              `<button onclick="returnBook('${item.id}')">Return book</button>`
            }
        </div>`,"text/html").body.firstChild;

        blockContent.appendChild(html);
  });
}

const loadBooks = () => {
  const request = new XMLHttpRequest();
  request.open("GET", "/getBooks", false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send();
  
  if (request.status !== 200) {
    alert(request.status + ': '+ request.statusText);
    return;
  }

  const books = JSON.parse(request.response);
  renderBooks(books);
}

const addBook = () => {
  const { value: name } = bookName;
  const { value: author } = bookAuthor;
  const { value: date } = publishedDate;

  if (!name || !author || !date) {
    alert('Define all fields')
    return;
  }
  const book = JSON.stringify({ name, author, date });
  const request = new XMLHttpRequest();
  request.open("POST", "/addBook", false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(book);

  if (request.status !== 200) {
    alert(request.status + ': '+ request.statusText);
    return;
  }

  closeModalAddBook();
  loadBooks();
}

const deleteBook = (id) => {
  const request = new XMLHttpRequest();
  request.open("DELETE", "/deleteBook", false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({ id }));

  if (request.status !== 200) {
    alert(request.status + ': '+ request.statusText);
    return;
  }

  const books = JSON.parse(request.response);
  closeModalSingleBook();
  renderBooks(books);
}

const grantBook = () => {
  const { value: firstname } = grantedUserFirstname;
  const { value: lastname } = grantedUserLastname;
  const { value: grantedDate } = grantedBookDate;
  const { value: returnDate } = returnBookDate;

  if (!firstname || !lastname || !grantedDate || !returnDate) {
    alert('Define all fields')
    return;
  }
  const grantedBook = JSON.stringify({ id: grantedBookId, grantedUser: { firstname, lastname }, grantedDate, returnDate });

  const request = new XMLHttpRequest();
  request.open("PATCH", "/grantBook", false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(grantedBook);

  grantedBookId = null;

  if (request.status !== 200) {
    alert(request.status + ': '+ request.statusText);
    return;
  }

  const books = JSON.parse(request.response);

  closeModalGrantBook();
  renderBooks(books);
}

const returnBook = (id) => {
  const request = new XMLHttpRequest();
  request.open("PATCH", "/returnBook", false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({ id }));

  if (request.status !== 200) {
    alert(request.status + ': '+ request.statusText);
    return;
  }

  const books = JSON.parse(request.response);
  renderBooks(books);
}

const applyFilters = () => {
  const { value: status } = filterStatus;
  const { value: sort } = filterSort;

  const request = new XMLHttpRequest();
  request.open("POST", "/filterBook", false);
  request.setRequestHeader("Content-Type", "application/json");
  let payload;
  if (status === 'EXPIRED') {
    payload = { status };
  } else {
    payload = { status, sort };
  }
  request.send(JSON.stringify(payload));

  if (request.status !== 200) {
    alert(request.status + ': '+ request.statusText);
    return;
  }

  const books = JSON.parse(request.response);
  renderBooks(books);
}

const resetFilters = () => {
  const request = new XMLHttpRequest();
  request.open("POST", "/filterBook", false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({ status: '', sort: '' }));

  if (request.status !== 200) {
    alert(request.status + ': '+ request.statusText);
    return;
  }

  const books = JSON.parse(request.response);
  renderBooks(books);
}

const openSingleBook = (id) => {
  const request = new XMLHttpRequest();
  request.open("GET", `/getSingleBook/${id}`, false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send();

  if (request.status !== 200) {
    alert(request.status + ': '+ request.statusText);
    return;
  }

  const book = JSON.parse(request.response);
  if (!book) {
    return;
  }

  const { id: bookId, name, author, publishedDate, status: rawStatus, returnDate, grantedUser } = book;
  const [first, ...rest] = rawStatus;
  const status = first.toUpperCase().concat(rest.join('').toLowerCase());
  const { firstname, lastname } = grantedUser || {};

  const blockContent = document.querySelector(".modal-body.modal-single-book");
  
  while (blockContent.firstChild) {
      blockContent.removeChild(blockContent.firstChild);
  }
  openModalSingleBook();
  const html = new DOMParser().parseFromString(`
    <div class="block-item" id="${bookId}" style="max-width: none;">
        <div style="display: flex; justify-content: flex-end; align-items: center;">
          <button onclick="deleteBook('${bookId}')">Delete book</button>
        </div>
        <input id="edit-input-title" class="edit-input" value="${name}" />
        <input id="edit-input-author" class="edit-input" value="${author}" />
        <div>
          <span class="edit-input">Published date: </span>
          <input id="edit-input-publishedDate" class="edit-input" type="date" value="${dayjs(publishedDate).format('YYYY-MM-DD')}" style="max-width: max-content;" />
        </div>
        
        <span class="edit-input">${status}</span>
        
        ${rawStatus !== 'AVAILABLE' ? `
          <span class="edit-input">Granted user: ${firstname} ${lastname}</span>
          <div>
            <span class="edit-input">Returned date: </span>
            <input id="edit-input-returnDate" class="edit-input" type="date" value="${dayjs(returnDate).format('YYYY-MM-DD')}" style="max-width: max-content;" />
          </div>
        ` : ''}
      <button style="width: 10%; align-self: center;" onclick="saveChanges('${bookId}')">Save</button>
    </div>`,"text/html").body.firstChild;

  blockContent.appendChild(html);
}

const saveChanges = (id) => {
  const editName = document.getElementById('edit-input-title');
  const editAuthor = document.getElementById('edit-input-author');
  const editPublishedDate = document.getElementById('edit-input-publishedDate');
  const editReturnDate = document.getElementById('edit-input-returnDate');

  const { value: name } = editName;
  const { value: author } = editAuthor;
  const { value: publishedDate } = editPublishedDate;
  const { value: returnDate } = editReturnDate || {};

  const request = new XMLHttpRequest();
  request.open("PATCH", `/updateBook/${id}`, false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({ name, author, publishedDate, returnDate }));

  if (request.status !== 200) {
    alert(request.status + ': '+ request.statusText);
    return;
  }

  const books = JSON.parse(request.response);
  if (!books) {
    return;
  }

  closeModalSingleBook();
  renderBooks(books);
}