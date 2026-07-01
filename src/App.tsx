import { Provider } from "react-redux";

import { AuthProvider } from "./context/AuthContext";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import AppRoutes from "./routes/Router";
import { store } from "./store/index";

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Provider store={store}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Provider>
    </LocalizationProvider>
  );
}
