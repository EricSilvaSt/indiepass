import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { RequireAuth } from "@/components/RequireAuth";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import Index from "./pages/Index";
import EventPage from "./pages/EventPage";
import Checkout from "./pages/Checkout";
import MyTickets from "./pages/MyTickets";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import HelpCenter from "./pages/HelpCenter";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Dashboard from "./pages/producer/Dashboard";
import ProducerProfile from "./pages/producer/ProducerProfile";
import CreateEvent from "./pages/producer/CreateEvent";
import CheckIn from "./pages/producer/CheckIn";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <StoreProvider>
            <Header />
            <main className="min-h-screen pb-24 sm:pb-0">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/entrar" element={<Auth />} />
                <Route path="/evento/:id" element={<EventPage />} />
                <Route path="/checkout/:reservationId" element={<Checkout />} />
                <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/meus-ingressos" element={<RequireAuth><MyTickets /></RequireAuth>} />
                <Route path="/ajuda" element={<HelpCenter />} />
                <Route path="/termos" element={<TermsOfUse />} />
                <Route path="/privacidade" element={<PrivacyPolicy />} />
                <Route path="/produtor" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/produtor/perfil" element={<RequireAuth><ProducerProfile /></RequireAuth>} />
                <Route path="/produtor/novo-evento" element={<RequireAuth><CreateEvent /></RequireAuth>} />
                <Route path="/produtor/check-in" element={<RequireAuth><CheckIn /></RequireAuth>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <CookieBanner />
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
