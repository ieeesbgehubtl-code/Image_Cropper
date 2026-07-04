import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "./layouts/AppLayout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Settings } from "./pages/Settings";
import { History } from "./pages/History";
export default function App() {
  const [page, setPage] = useState("home");
  return (
    <AppLayout page={page} setPage={setPage}>
      {page === "home" && <Home />}
      {page === "about" && <About />}
      {page === "settings" && <Settings />}
      {page === "history" && <History />}
      <Toaster position="top-right" />
    </AppLayout>
  );
}
