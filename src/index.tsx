import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.tsx";
import About from "./pages/About.tsx";
import Student from "./pages/Student.tsx";
import Tutor from "./pages/Tutor.tsx";
import NoPage from "./pages/NoPage.tsx";
//import Login from "./pages/Login.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<About />} />
          <Route path="student" element={<Student />} />
          <Route path="tutor" element={<Tutor />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

