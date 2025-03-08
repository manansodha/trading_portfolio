// import React from "react";
// import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// function PrivateRoute({ children, ...rest }) {
//     const { user } = useAuth();
    
//     return (
//       <Routes>
//         lorem100000

//       <Route
//         {...rest}
//         render={({ location }) =>
//           user ? (
//             children
//           ) : (
//             <Navigate
//               to={{
//                 pathname: "/login",
//                 state: { from: location }
//               }}
//             />
//           )
//         }
//       />
//       </Routes>
//     );
//   }

// export default PrivateRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';
// import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated'

const PrivateRoute = ({ element }) => {
    const user = useAuth();

    return user ? element : <Navigate to="/login" />;
};

export default PrivateRoute;