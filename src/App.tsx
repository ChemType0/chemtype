import React, { useState, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { TeX } from './components/TeX';
import { exportAsImage, exportAsHTML } from './utils/exportUtils';
import './App.css';

// 分子式示例
const MOLECULAR_FORMULAS = [
  { id: 'h2so4', label: 'H₂SO₄', formula: 'H2SO4' },
  { id: 'h2o', label: 'H₂O', formula: 'H2O' },
  { id: 'nacl', label: 'NaCl', formula: 'NaCl' },
  { id: 'caco3', label: 'CaCO₃', formula: 'CaCO3' },
  { id: 'hcl', label: 'HCl', formula: 'HCl' },
  { id: 'naoh', label: 'NaOH', formula: 'NaOH' },
  { id: 'kmno4', label: 'KMnO₄', formula: 'KMnO4' },
  { id: 'agno3', label: 'AgNO₃', formula: 'AgNO3' },
  { id: 'ch4', label: 'CH₄', formula: 'CH4' },
  { id: 'co2', label: 'CO₂', formula: 'CO2' },
  { id: 'nh3', label: 'NH₃', formula: 'NH3' },
  { id: 'c6h12o6', label: 'C₆H₁₂O₆', formula: 'C6H12O6' }
];

// 反应方程式示例
const REACTION_FORMULAS = [
  { id: 'sulfuric-reaction', label: '硫酸铜反应', formula: 'H2SO4 + Cu -> CuSO4 + SO2 + H2O' },
  { id: 'hydrogen-burn', label: '氢气燃烧', formula: '2H2 + O2 -> 2H2O' },
  { id: 'lime-water', label: '石灰水反应', formula: 'Ca(OH)2 + CO2 -> CaCO3 + H2O' },
  { id: 'iron-displacement', label: '铁置换铜', formula: 'Fe + CuSO4 -> FeSO4 + Cu' },
  { id: 'sodium-water', label: '钠与水反应', formula: '2Na + 2H2O -> 2NaOH + H2' },
  { id: 'kclo3-heat', label: '氯酸钾加热', formula: '2KClO3 ->[MnO2] 2KCl + 3O2' },
  { id: 'h2o2-catalyst', label: '双氧水分解', formula: '2H2O2 ->[MnO2] 2H2O + O2' },
  { id: 'ammonia-synthesis', label: '氨气合成', formula: 'N2 + 3H2 <=>[催化剂][高温高压] 2NH3' },
  { id: 'so2-oxidation', label: '二氧化硫氧化', formula: '2SO2 + O2 <=>[V2O5][450°C] 2SO3' },
  { id: 'methane-burn', label: '甲烷燃烧', formula: 'CH4 + 2O2 ->[点燃] CO2 + 2H2O' },
  { id: 'copper-nitric', label: '铜与硝酸', formula: 'Cu + 4HNO3 -> Cu(NO3)2 + 2NO2 + 2H2O' },
  { id: 'calcium-carbonate', label: '碳酸钙分解', formula: 'CaCO3 ->[加热] CaO + CO2' }
];

// 导出格式选项
const EXPORT_FORMATS = [
  { id: 'html', label: '复制 HTML' },
  { id: 'image', label: '复制 图片' }
];

// 输入组件
const FormulaInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="input-section">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入化学式，如：H2SO4 + Cu -> CuSO4 + SO2 + H2O"
        className="formula-input"
      />
    </div>
  );
};

// 预设按钮组件
const PresetButtons: React.FC<{
  onSelect: (formula: string) => void;
}> = ({ onSelect }) => {
  return (
    <div className="preset-buttons">
      <h3>快速测试：</h3>
      
      {/* 分子式按钮 */}
      <div className="formula-section">
        <h4>分子式：</h4>
        <div className="button-grid molecular">
          {MOLECULAR_FORMULAS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.formula)}
              className="preset-btn molecular-btn"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 反应方程式按钮 */}
      <div className="formula-section">
        <h4>反应方程式：</h4>
        <div className="button-grid reaction">
          {REACTION_FORMULAS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.formula)}
              className="preset-btn reaction-btn"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 公式预览组件
const FormulaPreview: React.FC<{
  formula: string;
}> = ({ formula }) => {
  if (!formula) {
    return (
      <div className="placeholder">输入化学式以查看预览</div>
    );
  }

  return (
    <TeX block>
      {`\\ce{${formula}}`}
    </TeX>
  );
};

// 导出按钮组件
const ExportButtons: React.FC<{
  onExport: (format: string) => void;
}> = ({ onExport }) => {
  return (
    <div className="export-section">
      {EXPORT_FORMATS.map((format) => (
        <button
          key={format.id}
          onClick={() => onExport(format.id)}
          className="export-btn"
        >
          {format.label}
        </button>
      ))}
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  const [formula, setFormula] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFormulaChange = (newFormula: string) => {
    setFormula(newFormula);
  };

  const handlePresetSelect = (presetFormula: string) => {
    setFormula(presetFormula);
  };

  const handleExport = async (format: string) => {
    if (!formula) {
      setExportMessage('请先输入化学式');
      setTimeout(() => setExportMessage(''), 3000);
      return;
    }

    setIsExporting(true);
    setExportMessage('');
    
    try {
      switch (format) {
        case 'image':
          if (previewRef.current) {
            // 直接使用页面中的公式元素进行截图
            await exportAsImage(previewRef.current);
            setExportMessage('✅ 图片已复制到剪贴板！');
          }
          break;
        case 'html':
          await exportAsHTML(formula);
          setExportMessage('✅ HTML和纯文本已复制到剪贴板！');
          break;
        default:
          console.log(`导出为 ${format} 格式`);
      }
    } catch (error) {
      console.error('导出失败:', error);
      setExportMessage('❌ 导出失败，请重试');
    } finally {
      setIsExporting(false);
      // 3秒后清除消息
      setTimeout(() => setExportMessage(''), 3000);
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* 左侧快速测试区域 */}
        <PresetButtons onSelect={handlePresetSelect} />

        {/* 右侧主要内容区域 */}
        <div className="main-content">
          <h1>化学公式编辑器</h1>
          
          <FormulaInput 
            value={formula}
            onChange={handleFormulaChange}
          />

          <div className="preview-section" ref={previewRef}>
            <FormulaPreview formula={formula} />
          </div>

          <ExportButtons onExport={handleExport} />
          
          {/* 导出状态显示 */}
          {isExporting && (
            <div className="export-loading">
              正在导出...
            </div>
          )}
          
          {exportMessage && (
            <div className={`export-message ${exportMessage.includes('❌') ? 'error' : 'success'}`}>
              {exportMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;