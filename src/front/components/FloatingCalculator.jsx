import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // <--- NUEVO
import { Calculator, X, Delete } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FloatingCalculator() {
    const [isOpen, setIsOpen] = useState(false);

    // Estados de la calculadora
    const [display, setDisplay] = useState("0");
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [pendingOperator, setPendingOperator] = useState(null);
    const [value, setValue] = useState(null);

    // --- LÓGICA MATEMÁTICA ---
    const calculate = (rightOperand, pendingOperator) => {
        let newResult = value;
        const secondOperand = parseFloat(rightOperand);

        switch (pendingOperator) {
            case "+": newResult += secondOperand; break;
            case "-": newResult -= secondOperand; break;
            case "*": newResult *= secondOperand; break;
            case "/": if (secondOperand !== 0) newResult /= secondOperand; break;
        }
        return newResult;
    };

    const handleDigit = (digit) => {
        if (waitingForOperand) {
            setDisplay(String(digit));
            setWaitingForOperand(false);
        } else {
            setDisplay(display === "0" ? String(digit) : display + digit);
        }
    };

    const handleOperator = (nextOperator) => {
        const inputValue = parseFloat(display);
        if (value === null) {
            setValue(inputValue);
        } else if (pendingOperator) {
            const currentValue = value || 0;
            const newValue = calculate(display, pendingOperator);
            setValue(newValue);
            setDisplay(String(newValue));
        }
        setWaitingForOperand(true);
        setPendingOperator(nextOperator);
    };

    const handleEqual = () => {
        if (!pendingOperator || !value) return;
        const newValue = calculate(display, pendingOperator);
        setDisplay(String(newValue));
        setValue(null);
        setPendingOperator(null);
        setWaitingForOperand(true);
    };

    const clear = () => {
        setDisplay("0");
        setValue(null);
        setPendingOperator(null);
        setWaitingForOperand(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">

            {/* --- VENTANA DE LA CALCULADORA (Estilo Widget) --- */}
            {/* Usamos clases condicionales para la animación de apertura/cierre tipo WhatsApp */}
            <div
                className={cn(
                    "mb-4 w-72 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-300 ease-out origin-bottom-right",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-90 translate-y-10 pointer-events-none h-0"
                )}
            >


                {/* Pantalla LCD */}
                <div className="bg-slate-900 p-4 text-right border-b border-slate-700">
                    <div className="text-xs text-slate-400 min-h-[1.5rem] font-mono">
                        {value} {pendingOperator}
                    </div>
                    <div className="text-4xl font-mono font-bold text-green-400 tracking-widest truncate">
                        {display}
                    </div>
                </div>

                {/* Botonera */}
                <div className="grid grid-cols-4 gap-px bg-slate-200 p-px">
                    <CalcBtn onClick={clear} className="col-span-1 bg-red-50 text-red-600 font-bold">C</CalcBtn>
                    <CalcBtn onClick={() => setDisplay(display.slice(0, -1) || "0")}><Delete size={18} /></CalcBtn>
                    <CalcBtn onClick={() => handleOperator("/")} className="text-blue-700 bg-blue-50">÷</CalcBtn>
                    <CalcBtn onClick={() => handleOperator("*")} className="text-blue-700 bg-blue-50">×</CalcBtn>

                    <CalcBtn onClick={() => handleDigit(7)}>7</CalcBtn>
                    <CalcBtn onClick={() => handleDigit(8)}>8</CalcBtn>
                    <CalcBtn onClick={() => handleDigit(9)}>9</CalcBtn>
                    <CalcBtn onClick={() => handleOperator("-")} className="text-violet-700 bg-blue-50">-</CalcBtn>

                    <CalcBtn onClick={() => handleDigit(4)}>4</CalcBtn>
                    <CalcBtn onClick={() => handleDigit(5)}>5</CalcBtn>
                    <CalcBtn onClick={() => handleDigit(6)}>6</CalcBtn>
                    <CalcBtn onClick={() => handleOperator("+")} className="text-violet-700 bg-blue-50">+</CalcBtn>

                    <CalcBtn onClick={() => handleDigit(1)}>1</CalcBtn>
                    <CalcBtn onClick={() => handleDigit(2)}>2</CalcBtn>
                    <CalcBtn onClick={() => handleDigit(3)}>3</CalcBtn>
                    <CalcBtn onClick={handleEqual} className="row-span-2 bg-blue-600 text-white hover:bg-blue-700 text-xl">=</CalcBtn>

                    <CalcBtn onClick={() => handleDigit(0)} className="col-span-2">0</CalcBtn>
                    <CalcBtn onClick={() => !display.includes(".") && setDisplay(display + ".")}>.</CalcBtn>
                </div>
            </div>

            {/* --- BOTÓN FLOTANTE (Trigger) --- */}
            {/* Este es el botón redondo que siempre se ve */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                // AGREGAMOS style={{ borderRadius: '50%' }} PARA FORZAR EL CÍRCULO
                style={{ borderRadius: '50%' }}
                className={cn(
                    // 1. Cambiamos el ring a azul (focus:ring-blue-300)
                    "flex h-14 w-14 items-center justify-center !rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300",

                    // 2. Cambiamos el fondo a azul (bg-blue-600)
                    isOpen ? "bg-slate-800 text-white rotate-90" : "bg-blue-600 text-white"
                )}
                aria-label="Abrir calculadora"
            >
                {isOpen ? <X size={28} /> : <Calculator size={28} />}
            </button>
        </div>
    );
}

// Subcomponente de botón para limpiar código
function CalcBtn({ children, onClick, className }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex h-14  items-center justify-center bg-white text-lg font-medium text-slate-700 transition-colors hover:bg-slate-100 active:bg-slate-200",
                className
            )}
        >
            {children}
        </button>
    );
}