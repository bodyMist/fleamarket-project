import axios from 'axios';
import key from '../key';

const getBooksList = ()=> {
    return axios.get(`${key}/books`);
}

const deleteBook = ({bookId}) => {
    return axios.delete(`${key}/admin/books/${bookId}`);
}

const addNewBooks = ({data}) => {
    return axios.post(`${key}/admin/books`, data);
}

const modifyBook = ({bookId, data}) => {
    return axios.put(`${key}/admin/books/${bookId}`, data);
}



export {getBooksList, deleteBook, addNewBooks, modifyBook};