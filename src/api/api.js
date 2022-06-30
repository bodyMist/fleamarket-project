import axios from "axios";
import api from "../key";

// enroll
const getBooksList = () => {
  return axios.get(`${api}/books`);
};

const deleteBook = ({ bookId }) => {
  return axios.delete(`${api}/admin/books/${bookId}`);
};

const addNewBooks = ({ data }) => {
  return axios.post(`${api}/admin/books`, data);
};

const modifyBook = ({ bookId, data }) => {
  return axios.put(`${api}/admin/books/${bookId}`, data);
};

// bookList
const getBookListapi = async (bookId) => {
  return await axios.get(`${api}/books/${bookId}/stocks`);
};

const addBookListapi = async (bookId, body) => {
  return await axios.post(`${api}/admin/books/${bookId}/Stocks`, body);
};

const delBookListapi = async (bookId, delBookId, body) => {
  return await axios.delete(
    `${api}/admin/books/${bookId}/stocks/${delBookId}`,
    body
  );
};

// RsvList
const getUserListapi = async (bookId) => {
  return await axios.get(`${api}/books/${bookId}/reservations`);
};

const modiUsersListapi = async (id, body) => {
  return await axios.put(`${api}/admin/reservations/${id}`, body);
};

const cancelUsersListapi = async (bookId, id) => {
  return await axios.delete(`${api}/admin/books/${bookId}/reservations/${id}`);
};

export {
  getBooksList,
  deleteBook,
  addNewBooks,
  modifyBook,
  getBookListapi,
  addBookListapi,
  delBookListapi,
  getUserListapi,
  modiUsersListapi,
  cancelUsersListapi,
};
