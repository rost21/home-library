import express from 'express';
import { v4 as uuid } from 'uuid';
import cors from 'cors';
import dayjs from 'dayjs';
import { STATUSES, defaultBook } from './constants';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));

app.set('view engine', 'pug');
app.set('views', './views');

let books = [];

app.get('/', (req, res) => {
  res.render('main', { nowDate: dayjs().format('YYYY-MM-DD') });
});

app.get('/getBooks', (req, res) => {
  console.log('/getBooks')
  return res.status(200).json(books);
});

app.post('/addBook', (req, res) => {
  console.log('/addBook');
  const { name, author, publishedDate } = req.body;
  const newBook = {
    ...defaultBook,
    id: uuid(),
    name,
    author,
    publishedDate,
  }

  books.push(newBook)
  return res.sendStatus(200);
});

app.delete('/deleteBook', (req, res) => {
  console.log('/deleteBook');
  const { id } = req.body;
  const changedBooks = books.filter(book => book.id !== id);
  books = changedBooks;

  res.status(200).json(books);
});

app.patch('/grantBook', (req, res) => {
  console.log('/grantBook');
  const { id, grantedUser, grantedDate, returnDate } = req.body;
  const changedBooks = books.map(book => {
    if (book.id === id) {
      return { ...book, status: STATUSES["NOT AVAILABLE"], grantedUser, grantedDate, returnDate };
    }
    return { ...book };
  });

  books = changedBooks;
  return res.status(200).json(books);
});

app.patch('/returnBook', (req, res) => {
  console.log('/returnBook');
  const { id } = req.body;
  const changedBooks = books.map(book => {
    if (book.id === id) {
      return { ...book, status: STATUSES.AVAILABLE, grantedUser: null, grantedDate: null, returnDate: null };
    }
    return { ...book };
  });

  books = changedBooks;
  return res.status(200).json(books);
});

app.post('/filterBook', (req, res) => {
  console.log('/filterBook');
  const { status, sort } = req.body;
  
  if (!status && !sort) {
    return res.status(200).json(books);
  }

  if (status === STATUSES.EXPIRED) {    
    const filtered = books.filter(book => book.status === STATUSES["NOT AVAILABLE"] && dayjs().isAfter(dayjs(book.returnDate, 'YYYY-MM-DD').add(1, 'day')));
    return res.status(200).json(filtered);
  }

  const changedBooks = books.filter(book => book.status === status).sort((a, b) => {
    if (sort === 'asc') return dayjs(a.returnDate).isAfter(b.returnDate);
    return dayjs(a.returnDate).isBefore(b.returnDate);
  });
  
  return res.status(200).json(changedBooks);
});

app.get('/getSingleBook/:id', (req, res) => {
  console.log('/getSingleBook');
  const { id } = req.params;

  const book = books.find(book => book.id === id);
  return res.status(200).json(book);
});

app.patch('/updateBook/:id', (req, res) => {
  console.log('/updateBook')
  const { id } = req.params;
  const { name, author, publishedDate, returnDate } = req.body;

  const changedBooks = books.map(book => {
    if (book.id === id) {
      return { ...book, name, author, publishedDate, returnDate };
    }
    return { ...book };
  });

  books = changedBooks;
  return res.status(200).json(books);
});

const port = 3001;

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
