import React, { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import BarChart from './components/Barchart';

const App = () => {
  const [month, setMonth] = useState('2022-03');

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
  };

  return (
    <div>
      <h1>Transactions Dashboard</h1>
      <select value={month} onChange={handleMonthChange}>
        {['2022-01', '2022-02', '2022-03', '2022-04', '2022-05', '2022-06', '2022-07', '2022-08', '2022-09', '2022-10', '2022-11', '2022-12'].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <Statistics month={month} />
      <TransactionsTable month={month} />
      <BarChart month={month} />
    </div>
  );
};

export default App;