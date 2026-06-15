import { Provider } from "react-redux";

import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/Router";
import { store } from "./store/index";

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Provider>
  );
}
