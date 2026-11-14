/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AdminPage } from './pages/AdminPage';
import { UserConsolePage } from './pages/UserConsolePage';
import { StrategyGuidePage } from './pages/StrategyGuidePage';

const AppContent: React.FC = () => {
  const { activeView } = useShop();

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#162E27] flex flex-col font-sans selection:bg-[#C99E69] selection:text-white">
      <Header />
      
      <main className="flex-1">
        {activeView === 'home' && <HomePage />}
        {activeView === 'shop' && <ShopPage />}
        {activeView === 'product-detail' && <ProductDetailPage />}
        {activeView === 'checkout' && <CheckoutPage />}
        {activeView === 'about' && <AboutPage />}
        {activeView === 'contact' && <ContactPage />}
        {activeView === 'faq' && <FAQPage />}
        {activeView === 'tracking' && <OrderTrackingPage />}
        {activeView === 'admin' && <AdminPage />}
        {activeView === 'user-console' && <UserConsolePage />}
        {activeView === 'strategy-guide' && <StrategyGuidePage />}
      </main>

      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <Toast />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <AppContent />
      </ShopProvider>
    </AuthProvider>
  );
}
