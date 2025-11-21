import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { ThemeProvider } from "next-themes";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Deliveries from "./pages/Deliveries";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import RestaurantSettings from "./pages/RestaurantSettings";
import Users from "./pages/Users";
import PDV from "./pages/PDV";
import Reports from "./pages/Reports";
import Customization from "./pages/Customization";
import TrackOrder from "./pages/TrackOrder";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster 
          richColors 
          position="bottom-right" 
          duration={4000}
        />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/track-order/:orderId" element={<TrackOrder />} />

              <Route element={<PrivateRoute />}>
                <Route element={
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                  >
                    <DashboardLayout />
                  </ThemeProvider>
                }>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/deliveries" element={<Deliveries />} />
                  <Route path="/settings" element={<RestaurantSettings />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/pdv" element={<PDV />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/customization" element={<Customization />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
