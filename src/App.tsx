import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NewCrate from "./pages/NewCrate";
import Crate from "./pages/Crate";
import './App.css'

function App() {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path="/new-crate" element={<NewCrate/>} />
            <Route path="/crate/:key" element={<Crate />} />
        </Routes>
    )
}

export default App
