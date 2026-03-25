# Trading Portfolio Manager
[![My Skills](https://skillicons.dev/icons?i=js,nodejs,react,postgres,mysql,vercel)](https://skillicons.dev)

A full-stack web application that allows users to securely upload[^1], manage and analyze their stock trading and dividend data. 
This platform supports multiple user accounts, visualizes stock performance, calculates metrics like profit/loss and XIRR and allows manual trade entry. 
Admins can also apply corporate actions like stock splits, bonuses and renames across the system.
The [frontend](https://trading-management-app.vercel.app/) is deployed on Vercel and the backend is deployed on Render.
[^1]: Currently, uploads are supported only for [Zerodha](https://zerodha.com/) trade history and dividend history.
---

## Features

### User Features
- Register/Login with secure credentials.
- Upload trade and dividend history via Excel/CSV.
- Manually add new trades or dividends.
- View portfolio dashboard:
  - Active holdings with quantity, average cost, total cost, and P&L.
  - Real-time data integration via Yahoo Finance.
- Explore stock detail page:
  - Full trade and dividend history.
  - XIRR (Extended Internal Rate of Return) calculation.
  - Tabs for technical/fundamental data, historical chart, and performance.

### Admin Features
- Manage corporate actions:
  - Stock renames.
  - Stock splits and bonus issues.
- Admin dashboard to apply these changes across all user portfolios.
- View adjustment logs and dynamically apply adjustments on login.

---

## Tech Stack

### Frontend
- **React.js** (with Material UI)
- React Router
- Axios

### Backend
- **Node.js** + **Express.js**
- JWT Authentication
- REST APIs for all core features

### Database
- **PostgreSQL** / MySQL (configurable)
- Sequelize ORM

### Data Sources
- Yahoo Finance API for latest stock data
- Excel/CSV file parsing (for user uploads)

---

## Setup Instructions

### 1. Clone the Repository

```
git clone https://github.com/manansodha/trading_portfolio.git
cd trading_portfolio
```

### 2. Setup Backend (Node.js)
```
cd backend
npm install
cp .env.example .env 
npm run dev
```

### 3. Setup Frontend (React)
```
cd ../frontend
npm install
npm start
```
---

## Future Updates
- Multi-factor Authentication
- Live Account Manangement Support
- Tax reporting module
- Portfolio optimization tool using ML (Markowitz & RL based)
- Mobile responsive enhancements


## Acknowledgements
1. Yahoo Finance for market data
2. Material UI for React UI components

>[!IMPORTANT]
>This is a software **only** for management of trades and organising all the open and closed trades of the users in Indian Equity Market.
>This website does not pose as a stock trading software and is not affiliated with any traders or regulatory authorities.




