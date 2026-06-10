

import { Provider } from "react-redux";
import { store } from "./store/index";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from './routes/Router';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Provider>
  );
}
