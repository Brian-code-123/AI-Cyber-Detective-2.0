import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import MatrixBackground from "./components/layout/MatrixBackground.jsx";
import Chatbot from "./components/ui/Chatbot.jsx";

// Pages (lazy-loaded for performance)
import { lazy, Suspense } from "react";
import SpinnerOverlay from "./components/ui/SpinnerOverlay.jsx";

const Dashboard       = lazy(() => import("./pages/Dashboard.jsx"));
const PhoneInspector  = lazy(() => import("./pages/PhoneInspector.jsx"));
const UrlScanner      = lazy(() => import("./pages/UrlScanner.jsx"));
const ImageForensics  = lazy(() => import("./pages/ImageForensics.jsx"));
const ContentVerifier = lazy(() => import("./pages/ContentVerifier.jsx"));
const PasswordChecker = lazy(() => import("./pages/PasswordChecker.jsx"));
const EmailAnalyzer   = lazy(() => import("./pages/EmailAnalyzer.jsx"));
const WifiScanner     = lazy(() => import("./pages/WifiScanner.jsx"));
const QrScanner       = lazy(() => import("./pages/QrScanner.jsx"));
const StoryMode       = lazy(() => import("./pages/StoryMode.jsx"));
const GameMode        = lazy(() => import("./pages/GameMode.jsx"));

function App() {
  return (
    <>
      <MatrixBackground />
      <Navbar />
      <main className="page-main">
        <Suspense fallback={<SpinnerOverlay />}>
          <Routes>
            <Route path="/"                  element={<Dashboard />} />
            <Route path="/phone"             element={<PhoneInspector />} />
            <Route path="/url"               element={<UrlScanner />} />
            <Route path="/image-forensics"   element={<ImageForensics />} />
            <Route path="/content-verifier"  element={<ContentVerifier />} />
            <Route path="/password"          element={<PasswordChecker />} />
            <Route path="/email"             element={<EmailAnalyzer />} />
            <Route path="/wifi"              element={<WifiScanner />} />
            <Route path="/qr"               element={<QrScanner />} />
            <Route path="/story"             element={<StoryMode />} />
            <Route path="/game"              element={<GameMode />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}

export default App;
