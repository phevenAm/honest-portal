import { Provider } from "react-redux";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { AuthProvider } from "./context/AuthContext";
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
