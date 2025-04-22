import React, { useState, useEffect, useCallback } from 'react';

// --- Data Definitions ---

// Converter Data
type Unit = { name: string; symbol: string; factor?: number }; // Factor relative to a base unit (optional for temp)
type ConversionCategory = {
  name: string;
  baseUnit: string;
  units: Unit[];
};

const conversions: ConversionCategory[] = [
  {
    name: 'Weight',
    baseUnit: 'kg',
    units: [
      { name: 'Kilogram', symbol: 'kg', factor: 1 },
      { name: 'Gram', symbol: 'g', factor: 1000 },
      { name: 'Milligram', symbol: 'mg', factor: 1000000 },
      { name: 'Pound', symbol: 'lb', factor: 2.20462 },
      { name: 'Ounce', symbol: 'oz', factor: 35.274 },
      { name: 'Metric Ton', symbol: 't', factor: 0.001 },
    ],
  },
  {
    name: 'Length',
    baseUnit: 'm',
    units: [
      { name: 'Meter', symbol: 'm', factor: 1 },
      { name: 'Kilometer', symbol: 'km', factor: 0.001 },
      { name: 'Centimeter', symbol: 'cm', factor: 100 },
      { name: 'Millimeter', symbol: 'mm', factor: 1000 },
      { name: 'Inch', symbol: 'in', factor: 39.3701 },
      { name: 'Foot', symbol: 'ft', factor: 3.28084 },
      { name: 'Yard', symbol: 'yd', factor: 1.09361 },
      { name: 'Mile', symbol: 'mi', factor: 0.000621371 },
    ],
  },
  {
    name: 'Temperature',
    baseUnit: 'C', // Arbitrary base for structure, logic is custom
    units: [
      { name: 'Celsius', symbol: '°C' },
      { name: 'Fahrenheit', symbol: '°F' },
      { name: 'Kelvin', symbol: 'K' },
    ],
  },
  {
    name: 'Time',
    baseUnit: 's',
    units: [
      { name: 'Second', symbol: 's', factor: 1 },
      { name: 'Millisecond', symbol: 'ms', factor: 1000 },
      { name: 'Minute', symbol: 'min', factor: 1 / 60 },
      { name: 'Hour', symbol: 'hr', factor: 1 / 3600 },
      { name: 'Day', symbol: 'day', factor: 1 / 86400 },
      { name: 'Week', symbol: 'week', factor: 1 / 604800 },
    ],
  },
   {
    name: 'Area',
    baseUnit: 'm²',
    units: [
      { name: 'Square Meter', symbol: 'm²', factor: 1 },
      { name: 'Square Kilometer', symbol: 'km²', factor: 1e-6 },
      { name: 'Square Centimeter', symbol: 'cm²', factor: 10000 },
      { name: 'Square Millimeter', symbol: 'mm²', factor: 1e6 },
      { name: 'Square Inch', symbol: 'in²', factor: 1550.0031 },
      { name: 'Square Foot', symbol: 'ft²', factor: 10.7639 },
      { name: 'Acre', symbol: 'acre', factor: 0.000247105},
      { name: 'Hectare', symbol: 'ha', factor: 0.0001},
    ],
  },
   {
    name: 'Volume',
    baseUnit: 'm³',
    units: [
      { name: 'Cubic Meter', symbol: 'm³', factor: 1 },
      { name: 'Cubic Kilometer', symbol: 'km³', factor: 1e-9 },
      { name: 'Cubic Centimeter', symbol: 'cm³', factor: 1e6 },
      { name: 'Liter', symbol: 'L', factor: 1000 },
      { name: 'Milliliter', symbol: 'mL', factor: 1e6 },
      { name: 'US Gallon', symbol: 'gal', factor: 264.172 },
      { name: 'US Quart', symbol: 'qt', factor: 1056.69 },
      { name: 'US Pint', symbol: 'pt', factor: 2113.38 },
      { name: 'US Cup', symbol: 'cup', factor: 4166.67 },
      { name: 'US Fluid Ounce', symbol: 'fl oz', factor: 33814 },
      { name: 'Cubic Inch', symbol: 'in³', factor: 61023.7 },
      { name: 'Cubic Foot', symbol: 'ft³', factor: 35.3147 },
    ],
  },
  // NOTE: Currency conversion requires an external API for real-time rates.
  // Adding placeholder structure but no actual conversion logic.
  {
      name: 'Currency (Placeholder)',
      baseUnit: 'USD',
      units: [
          { name: 'US Dollar', symbol: 'USD', factor: 1 },
          { name: 'Euro', symbol: 'EUR', factor: 0.93 }, // Example fixed rate
          { name: 'British Pound', symbol: 'GBP', factor: 0.80 }, // Example fixed rate
          { name: 'Japanese Yen', symbol: 'JPY', factor: 157.0 }, // Example fixed rate
          { name: 'Indian Rupee', symbol: 'INR', factor: 83.5 }, // Example fixed rate
      ]
  }
];

// Constants Data
type Constant = {
  name: string;
  symbol: string;
  value: string;
  unit: string;
};

const scientificConstants: Constant[] = [
  { name: 'Speed of Light in Vacuum', symbol: 'c', value: '299792458', unit: 'm/s' },
  { name: 'Planck Constant', symbol: 'h', value: '6.62607015e-34', unit: 'J·s' },
  { name: 'Reduced Planck Constant', symbol: 'ħ', value: '1.054571817e-34', unit: 'J·s' },
  { name: 'Boltzmann Constant', symbol: 'k', value: '1.380649e-23', unit: 'J/K' },
  { name: 'Elementary Charge', symbol: 'e', value: '1.602176634e-19', unit: 'C' },
  { name: 'Avogadro Constant', symbol: 'N_A', value: '6.02214076e23', unit: 'mol⁻¹' },
  { name: 'Gravitational Constant', symbol: 'G', value: '6.67430e-11', unit: 'N·m²/kg²' },
  { name: 'Rydberg Constant', symbol: 'R∞', value: '10973731.568160', unit: 'm⁻¹' },
  { name: 'Molar Gas Constant', symbol: 'R', value: '8.314462618', unit: 'J/(mol·K)' },
  { name: 'Faraday Constant', symbol: 'F', value: '96485.33212', unit: 'C/mol' },
  { name: 'Stefan-Boltzmann Constant', symbol: 'σ', value: '5.670374419e-8', unit: 'W/(m²·K⁴)' },
  { name: 'Electron Mass', symbol: 'mₑ', value: '9.1093837015e-31', unit: 'kg' },
  { name: 'Proton Mass', symbol: 'mₚ', value: '1.67262192369e-27', unit: 'kg' },
  { name: 'Neutron Mass', symbol: 'mₙ', value: '1.67492749804e-27', unit: 'kg' },
  { name: 'Fine-Structure Constant', symbol: 'α', value: '7.2973525693e-3', unit: '(dimensionless)' },
  { name: 'Vacuum Permittivity', symbol: 'ε₀', value: '8.8541878128e-12', unit: 'F/m' },
  { name: 'Vacuum Permeability', symbol: 'μ₀', value: '1.25663706212e-6', unit: 'N/A²' },
];


// --- Helper Functions ---
const formatNumber = (num: number | string): string => {
    // Attempt to format numbers nicely, keeping scientific notation if present
    if (typeof num === 'string') {
        // If it looks like scientific notation, keep it as is or format slightly
         if (num.toLowerCase().includes('e')) {
             try {
                const n = parseFloat(num);
                if (!isNaN(n)) return n.toExponential(6); // Adjust precision as needed
             } catch (e) {}
             return num; // Return original string if parsing fails
         }
    }
    try {
        const number = Number(num);
        if (isNaN(number)) return 'Error';
        // Basic formatting for large/small numbers, could be more sophisticated
        if (Math.abs(number) > 1e9 || (Math.abs(number) < 1e-6 && Math.abs(number) > 0)) {
             return number.toExponential(6);
        }
        return number.toLocaleString(undefined, { maximumFractionDigits: 10 });
    } catch (e) {
        return 'Error';
    }
};


// --- Main Component ---
const CalcuadApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'converter' | 'constants'>('calculator');

  // Calculator State
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcExpression, setCalcExpression] = useState<string>('');

  // Converter State
  const [convCategory, setConvCategory] = useState<string>(conversions[0].name);
  const [convFromUnit, setConvFromUnit] = useState<string>(conversions[0].units[0].symbol);
  const [convToUnit, setConvToUnit] = useState<string>(conversions[0].units[1].symbol);
  const [convInputValue, setConvInputValue] = useState<string>('1');
  const [convOutputValue, setConvOutputValue] = useState<string>('');

  // Constants State
  const [copiedConstant, setCopiedConstant] = useState<string | null>(null);


  // --- Calculator Logic ---
  const handleCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalcDisplay('0');
      setCalcExpression('');
    } else if (value === '⌫') {
      setCalcExpression((prev) => prev.slice(0, -1));
       setCalcDisplay((prev) => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (value === '=') {
      try {
        // SECURITY WARNING: eval() is dangerous in real applications.
        // This is a simplified example. Use a math expression parser library for production.
        // Basic sanitization attempt:
        const sanitizedExpression = calcExpression.replace(/[^-()\d/*+.]/g, '');
        const result = eval(sanitizedExpression);
        if (result === Infinity || isNaN(result)) {
            setCalcDisplay('Error');
        } else {
            const formattedResult = formatNumber(result);
            setCalcDisplay(formattedResult);
            setCalcExpression(String(result)); // Use result for further calculation
        }
      } catch (error) {
        setCalcDisplay('Error');
        setCalcExpression('');
      }
    } else {
        // Prevent leading zeros and multiple operators
        setCalcExpression((prev) => {
            const newExpression = prev + value;
             // Update display mirroring expression for basic calc
             setCalcDisplay(newExpression === '' ? '0' : newExpression);
            return newExpression;
        });
         // If display was 0 or Error, replace it, otherwise append
        // setCalcDisplay((prev) => (prev === '0' || prev === 'Error' ? value : prev + value));
    }
  };

  // --- Converter Logic ---
  const performConversion = useCallback(() => {
    const category = conversions.find(c => c.name === convCategory);
    if (!category) return;

    const from = category.units.find(u => u.symbol === convFromUnit);
    const to = category.units.find(u => u.symbol === convToUnit);
    const inputVal = parseFloat(convInputValue);

    if (!from || !to || isNaN(inputVal)) {
      setConvOutputValue('');
      return;
    }

    // Handle Temperature Separately
    if (category.name === 'Temperature') {
      let result: number;
      if (from.symbol === '°C') {
        if (to.symbol === '°F') result = (inputVal * 9/5) + 32;
        else if (to.symbol === 'K') result = inputVal + 273.15;
        else result = inputVal; // C to C
      } else if (from.symbol === '°F') {
        if (to.symbol === '°C') result = (inputVal - 32) * 5/9;
        else if (to.symbol === 'K') result = (inputVal - 32) * 5/9 + 273.15;
        else result = inputVal; // F to F
      } else { // From Kelvin
        if (to.symbol === '°C') result = inputVal - 273.15;
        else if (to.symbol === '°F') result = (inputVal - 273.15) * 9/5 + 32;
        else result = inputVal; // K to K
      }
      setConvOutputValue(formatNumber(result));
      return;
    }

     // Handle Placeholder Currency (no actual conversion)
    if (category.name === 'Currency (Placeholder)') {
        if (from.factor && to.factor) {
             const result = inputVal * (to.factor / from.factor);
             setConvOutputValue(formatNumber(result));
        } else {
             setConvOutputValue('N/A'); // Indicate fixed rate example
        }
        return;
    }

    // Standard Conversion using factors relative to base unit
    if (from.factor && to.factor) {
      const valueInBaseUnit = inputVal / from.factor;
      const result = valueInBaseUnit * to.factor;
      setConvOutputValue(formatNumber(result));
    } else {
        setConvOutputValue(''); // Should not happen for non-temp/non-currency if data is correct
    }

  }, [convCategory, convFromUnit, convToUnit, convInputValue]);

  useEffect(() => {
    performConversion();
  }, [performConversion]);

  // Reset units when category changes
  useEffect(() => {
    const category = conversions.find(c => c.name === convCategory);
    if (category && category.units.length > 1) {
      setConvFromUnit(category.units[0].symbol);
      setConvToUnit(category.units[1].symbol);
      setConvInputValue('1'); // Reset input value
    } else if (category && category.units.length === 1) {
      setConvFromUnit(category.units[0].symbol);
      setConvToUnit(category.units[0].symbol);
       setConvInputValue('1');
    }
  }, [convCategory]);


  // --- Constants Logic ---
  const handleCopyConstant = (value: string, symbol: string) => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopiedConstant(symbol);
        setTimeout(() => setCopiedConstant(null), 1500); // Reset after 1.5s
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        // Optionally show an error message to the user
      });
  };


  // --- Render Helper ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <CalculatorTab display={calcDisplay} onInput={handleCalculatorInput} />;
      case 'converter':
        return (
          <ConverterTab
            category={convCategory}
            setCategory={setConvCategory}
            fromUnit={convFromUnit}
            setFromUnit={setConvFromUnit}
            toUnit={convToUnit}
            setToUnit={setConvToUnit}
            inputValue={convInputValue}
            setInputValue={setConvInputValue}
            outputValue={convOutputValue}
          />
        );
      case 'constants':
        return <ConstantsTab copiedSymbol={copiedConstant} onCopy={handleCopyConstant} />;
      default:
        return null;
    }
  };

  // --- Styles ---
  const tabBaseStyle = "py-2 px-4 rounded-t-lg transition-colors duration-200 ease-in-out font-semibold";
  const tabActiveStyle = "bg-gray-700 text-cyan-400 shadow-inner";
  const tabInactiveStyle = "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-cyan-300";
  const inputStyle = "w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-right text-2xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500";
  const selectStyle = "w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none"; // Added appearance-none for custom arrow
   const buttonStyle = "bg-gray-800 text-cyan-300 hover:bg-gray-700 active:bg-gray-600 rounded-lg p-4 text-xl font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 shadow-md";
   const operatorButtonStyle = "bg-purple-700 text-purple-100 hover:bg-purple-600 active:bg-purple-500 rounded-lg p-4 text-xl font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-md";
   const equalsButtonStyle = "bg-cyan-600 text-cyan-100 hover:bg-cyan-500 active:bg-cyan-400 rounded-lg p-4 text-xl font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 shadow-md col-span-2";
   const clearButtonStyle = "bg-red-700 text-red-100 hover:bg-red-600 active:bg-red-500 rounded-lg p-4 text-xl font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-md";


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200 p-4">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-cyan-400 text-center font-mono">Calcuad</h1>
      </header>

      <main className="flex-grow flex flex-col bg-gray-800 bg-opacity-50 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Tabs */}
        <nav className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`${tabBaseStyle} ${activeTab === 'calculator' ? tabActiveStyle : tabInactiveStyle}`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`${tabBaseStyle} ${activeTab === 'converter' ? tabActiveStyle : tabInactiveStyle}`}
          >
            Converter
          </button>
          <button
            onClick={() => setActiveTab('constants')}
            className={`${tabBaseStyle} ${activeTab === 'constants' ? tabActiveStyle : tabInactiveStyle}`}
          >
            Constants
          </button>
        </nav>

        {/* Tab Content */}
        <div className="flex-grow p-6 overflow-y-auto">
          {renderTabContent()}
        </div>
      </main>

      <footer className="mt-4 text-center text-sm text-gray-500">
        Developed by <span className="font-semibold text-purple-400">rantu aka Quadra</span>
      </footer>
    </div>
  );
};


// --- Sub-Components for Tabs ---

interface CalculatorTabProps {
  display: string;
  onInput: (value: string) => void;
}

const CalculatorTab: React.FC<CalculatorTabProps> = ({ display, onInput }) => {
   const buttonStyle = "bg-gray-800 text-cyan-300 hover:bg-gray-700 active:bg-gray-600 rounded-lg p-4 sm:p-5 text-xl sm:text-2xl font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 shadow-md";
   const operatorButtonStyle = "bg-purple-700 text-purple-100 hover:bg-purple-600 active:bg-purple-500 rounded-lg p-4 sm:p-5 text-xl sm:text-2xl font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-md";
   const equalsButtonStyle = "bg-cyan-600 text-cyan-100 hover:bg-cyan-500 active:bg-cyan-400 rounded-lg p-4 sm:p-5 text-xl sm:text-2xl font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 shadow-md col-span-2";
   const clearButtonStyle = "bg-red-700 text-red-100 hover:bg-red-600 active:bg-red-500 rounded-lg p-4 sm:p-5 text-xl sm:text-2xl font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-md";
   const displayStyle = "w-full p-4 mb-4 bg-gray-900 border border-gray-700 rounded-md text-right text-3xl sm:text-4xl text-white font-mono break-all h-20 flex items-center justify-end";

  const buttons = [
    'C', '⌫', '%', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '='
  ];

   const getButtonStyle = (btn: string): string => {
        if (['/', '*', '-', '+', '%'].includes(btn)) return operatorButtonStyle;
        if (btn === '=') return equalsButtonStyle;
        if (btn === 'C' || btn === '⌫') return clearButtonStyle;
        return buttonStyle;
    }

  return (
    <div className="flex flex-col h-full">
       <div className={displayStyle}>
            {display}
       </div>
      <div className="grid grid-cols-4 gap-2 flex-grow">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => onInput(btn)}
            className={`${getButtonStyle(btn)} ${btn === '0' ? 'col-span-1' : ''} ${btn === '=' ? 'col-span-2' : ''}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

interface ConverterTabProps {
  category: string;
  setCategory: (cat: string) => void;
  fromUnit: string;
  setFromUnit: (unit: string) => void;
  toUnit: string;
  setToUnit: (unit: string) => void;
  inputValue: string;
  setInputValue: (val: string) => void;
  outputValue: string;
}

const ConverterTab: React.FC<ConverterTabProps> = ({
  category, setCategory, fromUnit, setFromUnit, toUnit, setToUnit,
  inputValue, setInputValue, outputValue
}) => {
  const currentCategoryData = conversions.find(c => c.name === category);
  const selectStyle = "w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none custom-select"; // Added appearance-none and custom class
  const inputStyle = "w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500";

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <label htmlFor="conv-category" className="block text-sm font-medium text-cyan-300 mb-1">Category</label>
         <div className="relative">
            <select
            id="conv-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectStyle}
            >
            {conversions.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        {/* From Unit */}
        <div>
          <label htmlFor="conv-from-unit" className="block text-sm font-medium text-cyan-300 mb-1">From</label>
           <div className="relative">
                <select
                id="conv-from-unit"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className={selectStyle}
                disabled={!currentCategoryData}
                >
                {currentCategoryData?.units.map(unit => (
                    <option key={unit.symbol} value={unit.symbol}>{unit.name} ({unit.symbol})</option>
                ))}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`${inputStyle} mt-2`}
            placeholder="Enter value"
          />
        </div>

        {/* To Unit */}
        <div>
          <label htmlFor="conv-to-unit" className="block text-sm font-medium text-cyan-300 mb-1">To</label>
          <div className="relative">
            <select
              id="conv-to-unit"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className={selectStyle}
              disabled={!currentCategoryData}
            >
              {currentCategoryData?.units.map(unit => (
                <option key={unit.symbol} value={unit.symbol}>{unit.name} ({unit.symbol})</option>
              ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
             </div>
          </div>
          <div className={`${inputStyle} mt-2 bg-gray-800 border-gray-700 min-h-[3.5rem] flex items-center`}>
            {outputValue || <span className="text-gray-500">Result</span>}
          </div>
        </div>
      </div>
        {/* Add custom select arrow style if needed */}
        <style jsx>{`
            .custom-select {
                background-image: none; /* Remove default arrow */
                 padding-right: 2.5rem; /* Make space for custom arrow */
            }
        `}</style>
    </div>
  );
};


interface ConstantsTabProps {
    copiedSymbol: string | null;
    onCopy: (value: string, symbol: string) => void;
}

const ConstantsTab: React.FC<ConstantsTabProps> = ({ copiedSymbol, onCopy }) => {
  const copyButtonStyle = "ml-4 px-3 py-1 text-xs rounded bg-cyan-700 hover:bg-cyan-600 text-cyan-100 transition duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-cyan-400";
  const copiedButtonStyle = "ml-4 px-3 py-1 text-xs rounded bg-green-600 text-green-100 transition duration-150 ease-in-out";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-cyan-400 mb-4">Scientific Constants</h2>
      <ul className="space-y-3">
        {scientificConstants.map((c) => (
          <li key={c.symbol} className="p-3 bg-gray-700 rounded-lg border border-gray-600 flex justify-between items-center">
            <div>
              <span className="font-semibold text-purple-300">{c.name} ({c.symbol})</span>
              <p className="text-sm text-gray-300 font-mono">{c.value} <span className="text-gray-400">{c.unit}</span></p>
            </div>
            <button
              onClick={() => onCopy(c.value, c.symbol)}
               className={copiedSymbol === c.symbol ? copiedButtonStyle : copyButtonStyle}
            >
              {copiedSymbol === c.symbol ? 'Copied!' : 'Copy'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};


export default CalcuadApp;