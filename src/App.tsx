import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NewCrate from "./pages/NewCrate";
import './App.css'

function App() {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path="/new-crate" element={<NewCrate/>} />
        </Routes>
    )
}

export default App
