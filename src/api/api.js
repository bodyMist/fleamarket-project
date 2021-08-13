import axios from "axios";
import api from "../key";

const getBooksList = () => {
  return axios.get(`${api.url}/books`);
};

const deleteBook = ({ bookId }) => {
  return axios.delete(`${api.url}/admin/books/${bookId}`);
};

const addNewBooks = ({ data }) => {
  return axios.post(`${api.url}/admin/books`, data);
};

const modifyBook = ({ bookId, data }) => {
  return axios.put(`${api.url}/admin/books/${bookId}`, data);
};

const getBookListapi = async (bookId) => {
  return await axios.get(`${api.url}/books/${bookId}/stocks`);
};

const addBookListapi = async (bookId, body) => {
  return await axios.post(`${api.url}/admin/books/${bookId}/Stocks`, body);
};

const delBookListapi = async (bookId, delBookId, body) => {
  return await axios.delete(
    `${api.url}/admin/books/${bookId}/stocks/${delBookId}`,
    body
  );
};

export {
  getBooksList,
  deleteBook,
  addNewBooks,
  modifyBook,
  getBookListapi,
  addBookListapi,
  delBookListapi,
};
