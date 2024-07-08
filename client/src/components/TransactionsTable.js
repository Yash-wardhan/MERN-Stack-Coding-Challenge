import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = ({ month }) => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [month, search, page]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/transactions`, {
        params: { month, search, page, perPage: 10 },
      });

      // Debug logs
      console.log('API Response:', response.data);

      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={handleSearchChange}
      />
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Sold</th>
            <th>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.sold ? 'Yes' : 'No'}</td>
              <td>{transaction.dateOfSale}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
        <span>{page} / {totalPages}</span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default TransactionsTable;
